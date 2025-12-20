import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/admin/packages/receive
 * 
 * Receives a package scan from warehouse staff.
 * Supports both online and offline (queued) submissions.
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
      bookingId,
      trackingNumber,
      actualWeight,
      length,
      width,
      height,
      dimWeight,
      billableWeight,
      condition,
      notes,
      scannedAt,
      scannedBy,
      offlineScanId
    } = body;

    // Validate required fields
    if (!bookingId || !trackingNumber || !actualWeight) {
      throw error(400, { 
        message: 'Missing required fields: bookingId, trackingNumber, and actualWeight are required' 
      });
    }

    // Validate weight is positive
    if (actualWeight <= 0) {
      throw error(400, { message: 'Weight must be greater than 0' });
    }

    console.log('[receive_package]', {
      correlationId,
      userId: locals.user.id,
      bookingId,
      trackingNumber,
      offlineScanId
    });

    // Verify booking exists and belongs to the day's schedule
    let booking;
    try {
      booking = await locals.pb.collection('bookings').getOne(bookingId);
    } catch (err) {
      console.error('[receive_package] Booking not found', { correlationId, bookingId, error: err });
      throw error(404, { message: 'Booking not found' });
    }

    // Check if booking status allows receiving
    const receivableStatuses = ['confirmed', 'checked_in', 'in_progress'];
    if (!receivableStatuses.includes(booking.status)) {
      throw error(400, { 
        message: `Cannot receive packages for booking in '${booking.status}' status` 
      });
    }

    // Check for duplicate tracking number (idempotency for offline sync)
    try {
      const existing = await locals.pb.collection('packages').getFirstListItem(
        `tracking_number = "${trackingNumber}"`
      );
      
      // If found and this is an offline sync retry, return success
      if (existing && offlineScanId) {
        console.log('[receive_package] Duplicate detected (offline retry)', { 
          correlationId, 
          trackingNumber,
          offlineScanId 
        });
        
        return json({
          status: 'success',
          message: 'Package already received',
          data: {
            packageId: existing.id,
            trackingNumber: existing.tracking_number,
            duplicate: true
          }
        });
      }
      
      // If not an offline retry, this is an error
      if (existing) {
        throw error(409, { message: `Package with tracking number ${trackingNumber} already exists` });
      }
    } catch (err: unknown) {
      // 404 means no duplicate - continue with creation
      if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
        // Good - no duplicate found
      } else if (err && typeof err === 'object' && 'status' in err) {
        throw err; // Re-throw HTTP errors
      }
      // Other errors (like connection issues) - log but continue
    }

    // Create the package record
    const calculatedDimWeight = length && width && height 
      ? (length * width * height) / 166 
      : dimWeight || null;
    
    const calculatedBillableWeight = billableWeight || (
      actualWeight && calculatedDimWeight 
        ? Math.max(actualWeight, calculatedDimWeight)
        : actualWeight
    );

    const packageData = {
      booking: bookingId,
      tracking_number: trackingNumber,
      weight: actualWeight,
      length: length || null,
      width: width || null,
      height: height || null,
      dim_weight: calculatedDimWeight,
      billable_weight: calculatedBillableWeight,
      // Map condition to a note if damaged
      special_instructions: condition === 'damaged' 
        ? `[DAMAGED] ${notes || 'Package received in damaged condition'}`
        : condition === 'missing_contents'
          ? `[MISSING CONTENTS] ${notes || 'Package appears to be missing contents'}`
          : notes || ''
    };

    const createdPackage = await locals.pb.collection('packages').create(packageData);

    console.log('[receive_package] Package created', {
      correlationId,
      packageId: createdPackage.id,
      trackingNumber,
      bookingId,
      actualWeight,
      billableWeight: calculatedBillableWeight
    });

    // Update booking status if this is the first package
    if (booking.status === 'confirmed') {
      await locals.pb.collection('bookings').update(bookingId, {
        status: 'checked_in'
      });
      
      console.log('[receive_package] Booking status updated to checked_in', {
        correlationId,
        bookingId
      });
    }

    // Log activity
    try {
      await locals.pb.collection('activity_log').create({
        user: locals.user.id,
        action: 'package_received',
        resource_type: 'package',
        resource_id: createdPackage.id,
        details: {
          booking_id: bookingId,
          tracking_number: trackingNumber,
          weight: actualWeight,
          billable_weight: calculatedBillableWeight,
          condition,
          offline_scan_id: offlineScanId,
          scanned_at: scannedAt || new Date().toISOString()
        }
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('[receive_package] Failed to log activity', { correlationId, error: logError });
    }

    return json({
      status: 'success',
      message: 'Package received successfully',
      data: {
        packageId: createdPackage.id,
        trackingNumber: createdPackage.tracking_number,
        actualWeight,
        dimWeight: calculatedDimWeight,
        billableWeight: calculatedBillableWeight,
        bookingStatus: booking.status === 'confirmed' ? 'checked_in' : booking.status
      }
    });

  } catch (err) {
    console.error('[receive_package] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to receive package' });
  }
};





