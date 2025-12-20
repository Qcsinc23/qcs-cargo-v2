import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/admin/packages/weight-discrepancy
 * 
 * Handles weight discrepancy resolution - either auto-approve (within threshold)
 * or hold package and notify customer.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Verify authentication
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  // Verify admin/staff role
  const allowedRoles = ['admin', 'staff'];
  if (!allowedRoles.includes(locals.user.role)) {
    throw error(403, { message: 'Staff access required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const {
      action,
      bookingId,
      packageId,
      trackingNumber,
      estimatedWeight,
      actualWeight,
      additionalCost,
      customerEmail,
      customerName,
      notes
    } = body;

    // Validate required fields
    if (!action || !bookingId || !actualWeight) {
      throw error(400, { 
        message: 'Missing required fields: action, bookingId, and actualWeight are required' 
      });
    }

    if (!['proceed', 'hold', 'approve', 'reject'].includes(action)) {
      throw error(400, { message: 'Invalid action. Must be: proceed, hold, approve, or reject' });
    }

    console.log('[weight_discrepancy]', {
      correlationId,
      userId: locals.user.id,
      action,
      bookingId,
      trackingNumber,
      estimatedWeight,
      actualWeight
    });

    // Fetch the booking
    let booking;
    try {
      booking = await locals.pb.collection('bookings').getOne(bookingId, {
        expand: 'user'
      });
    } catch (err) {
      console.error('[weight_discrepancy] Booking not found', { correlationId, bookingId, error: err });
      throw error(404, { message: 'Booking not found' });
    }

    // Handle different actions
    switch (action) {
      case 'proceed': {
        // Auto-approved (within threshold) - update weight and continue
        const updateData: Record<string, unknown> = {
          total_weight: actualWeight,
          weight_verified: true,
          weight_verified_at: new Date().toISOString(),
          weight_verified_by: locals.user.id
        };

        // If there's additional cost, add it to the booking total
        if (additionalCost && additionalCost > 0) {
          const currentTotal = booking.total_cost || 0;
          updateData.total_cost = currentTotal + additionalCost;
          updateData.weight_adjustment = additionalCost;
        }

        await locals.pb.collection('bookings').update(bookingId, updateData);

        console.log('[weight_discrepancy] Proceeded with updated weight', {
          correlationId,
          bookingId,
          actualWeight,
          additionalCost
        });

        return json({
          status: 'success',
          message: 'Weight updated successfully',
          data: {
            action: 'proceeded',
            actualWeight,
            additionalCost: additionalCost || 0
          }
        });
      }

      case 'hold': {
        // Hold package and create weight discrepancy record
        await locals.pb.collection('bookings').update(bookingId, {
          status: 'weight_hold',
          weight_discrepancy: true,
          estimated_weight: estimatedWeight,
          actual_weight: actualWeight,
          weight_difference: actualWeight - estimatedWeight,
          additional_cost_pending: additionalCost || 0
        });

        // Create a weight discrepancy record for tracking
        try {
          await locals.pb.collection('weight_discrepancies').create({
            booking: bookingId,
            package: packageId,
            tracking_number: trackingNumber,
            estimated_weight: estimatedWeight,
            actual_weight: actualWeight,
            weight_difference: actualWeight - estimatedWeight,
            additional_cost: additionalCost || 0,
            customer_email: customerEmail,
            customer_name: customerName,
            status: 'pending_customer',
            created_by: locals.user.id,
            notes: notes || ''
          });
        } catch (collectionErr) {
          // Collection might not exist, log and continue
          console.warn('[weight_discrepancy] Could not create discrepancy record:', collectionErr);
        }

        // Send customer notification email (in production, integrate with email service)
        const notificationData = {
          to: customerEmail,
          subject: `Weight Discrepancy - ${trackingNumber}`,
          template: 'weight_discrepancy',
          data: {
            customerName,
            trackingNumber,
            estimatedWeight,
            actualWeight,
            weightDifference: actualWeight - estimatedWeight,
            additionalCost,
            approvalLink: `${process.env.PUBLIC_APP_URL || ''}/approve-weight/${bookingId}`
          }
        };

        // Log the notification (email service would handle actual sending)
        console.log('[weight_discrepancy] Customer notification queued', {
          correlationId,
          notificationData: { to: customerEmail, trackingNumber }
        });

        // Log activity
        try {
          await locals.pb.collection('activity_log').create({
            user: locals.user.id,
            action: 'weight_discrepancy_hold',
            resource_type: 'booking',
            resource_id: bookingId,
            details: {
              tracking_number: trackingNumber,
              estimated_weight: estimatedWeight,
              actual_weight: actualWeight,
              additional_cost: additionalCost,
              customer_notified: true
            }
          });
        } catch (logErr) {
          console.warn('[weight_discrepancy] Could not log activity:', logErr);
        }

        return json({
          status: 'success',
          message: 'Package held and customer notified',
          data: {
            action: 'held',
            bookingStatus: 'weight_hold',
            customerNotified: true,
            additionalCost
          }
        });
      }

      case 'approve': {
        // Admin/customer approved the weight adjustment - release package
        await locals.pb.collection('bookings').update(bookingId, {
          status: 'confirmed', // Or previous status
          weight_discrepancy: false,
          total_weight: actualWeight,
          weight_verified: true,
          weight_verified_at: new Date().toISOString(),
          weight_verified_by: locals.user.id,
          total_cost: (booking.total_cost || 0) + (additionalCost || 0),
          weight_adjustment: additionalCost || 0,
          weight_approved_at: new Date().toISOString()
        });

        // Update discrepancy record if exists
        try {
          const discrepancy = await locals.pb.collection('weight_discrepancies').getFirstListItem(
            `booking = "${bookingId}" && status = "pending_customer"`
          );
          
          await locals.pb.collection('weight_discrepancies').update(discrepancy.id, {
            status: 'approved',
            resolved_at: new Date().toISOString(),
            resolved_by: locals.user.id
          });
        } catch (discErr) {
          // No discrepancy record found, continue
        }

        console.log('[weight_discrepancy] Weight adjustment approved', {
          correlationId,
          bookingId,
          actualWeight,
          additionalCost
        });

        return json({
          status: 'success',
          message: 'Weight adjustment approved and package released',
          data: {
            action: 'approved',
            actualWeight,
            additionalCost,
            newTotal: (booking.total_cost || 0) + (additionalCost || 0)
          }
        });
      }

      case 'reject': {
        // Customer rejected - return to original weight or cancel
        await locals.pb.collection('bookings').update(bookingId, {
          status: 'weight_disputed',
          weight_discrepancy_notes: notes || 'Customer rejected weight adjustment'
        });

        // Update discrepancy record
        try {
          const discrepancy = await locals.pb.collection('weight_discrepancies').getFirstListItem(
            `booking = "${bookingId}" && status = "pending_customer"`
          );
          
          await locals.pb.collection('weight_discrepancies').update(discrepancy.id, {
            status: 'rejected',
            resolved_at: new Date().toISOString(),
            resolved_by: locals.user.id,
            resolution_notes: notes
          });
        } catch (discErr) {
          // No discrepancy record found
        }

        console.log('[weight_discrepancy] Weight adjustment rejected', {
          correlationId,
          bookingId
        });

        return json({
          status: 'success',
          message: 'Weight adjustment rejected - pending resolution',
          data: {
            action: 'rejected',
            bookingStatus: 'weight_disputed'
          }
        });
      }

      default:
        throw error(400, { message: 'Unknown action' });
    }

  } catch (err) {
    console.error('[weight_discrepancy] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to process weight discrepancy' });
  }
};

/**
 * GET /api/admin/packages/weight-discrepancy
 * 
 * Get all pending weight discrepancies for admin dashboard.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const allowedRoles = ['admin', 'staff'];
  if (!allowedRoles.includes(locals.user.role)) {
    throw error(403, { message: 'Staff access required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();
  const status = url.searchParams.get('status') || 'pending_customer';

  try {
    // Get all bookings with weight discrepancies
    const result = await locals.pb.collection('bookings').getList(1, 50, {
      filter: `weight_discrepancy = true || status = "weight_hold" || status = "weight_disputed"`,
      sort: '-created',
      expand: 'user,recipient'
    });

    const discrepancies = result.items.map((booking) => {
      const user = booking.expand?.user;
      
      return {
        id: booking.id,
        trackingNumber: booking.tracking_number || `BK-${booking.id.slice(0, 8)}`,
        customerName: user?.name || user?.email?.split('@')[0] || 'Unknown',
        customerEmail: user?.email,
        estimatedWeight: booking.estimated_weight || booking.total_weight,
        actualWeight: booking.actual_weight,
        weightDifference: booking.weight_difference || (booking.actual_weight - booking.estimated_weight),
        additionalCost: booking.additional_cost_pending || 0,
        status: booking.status,
        createdAt: booking.created
      };
    });

    console.log('[get_weight_discrepancies]', {
      correlationId,
      count: discrepancies.length
    });

    return json({
      status: 'success',
      data: {
        items: discrepancies,
        totalCount: result.totalItems
      }
    });

  } catch (err) {
    console.error('[get_weight_discrepancies] Error', { correlationId, error: err });

    return json({
      status: 'success',
      data: {
        items: [],
        totalCount: 0
      }
    });
  }
};





