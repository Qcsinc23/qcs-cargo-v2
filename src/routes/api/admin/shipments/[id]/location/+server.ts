import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const { id } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const { location, notes, notifyCustomer = true } = body;

    if (!location || location.trim().length === 0) {
      throw error(400, { message: 'Location is required' });
    }

    // Get current shipment
    const shipment = await locals.pb.collection('shipments').getOne(id, {
      expand: 'user'
    });

    // Update shipment location
    const updateData: Record<string, unknown> = {
      current_location: location.trim()
    };

    // Add notes if provided
    if (notes && notes.trim().length > 0) {
      updateData.notes = notes.trim();
    }

    const updatedShipment = await locals.pb.collection('shipments').update(id, updateData);

    console.log('[admin_update_shipment_location]', {
      correlationId,
      adminId: locals.user.id,
      shipmentId: id,
      oldLocation: shipment.current_location,
      newLocation: location,
      trackingNumber: shipment.tracking_number
    });

    // Log admin action
    try {
      await locals.pb.collection('activity_logs').create({
        user: locals.user.id,
        action: 'shipment.location_update',
        resource_type: 'shipments',
        resource_id: id,
        metadata: {
          old_location: shipment.current_location,
          new_location: location,
          notes
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (logErr) {
      console.error('[admin_update_shipment_location] Failed to log action:', logErr);
    }

    // Send notification email if requested and user exists
    if (notifyCustomer && shipment.expand?.user) {
      const user = shipment.expand.user;

      try {
        // Import email function
        const { sendLocationUpdateEmail } = await import('$lib/server/email');

        await sendLocationUpdateEmail(user.email, user.name || 'Customer', {
          trackingNumber: shipment.tracking_number,
          status: shipment.status,
          location: location.trim(),
          notes: notes?.trim() || null
        });

        console.log('[admin_update_shipment_location] Email sent', {
          correlationId,
          shipmentId: id,
          email: user.email
        });
      } catch (emailErr) {
        console.error('[admin_update_shipment_location] Failed to send email:', emailErr);
        // Non-fatal
      }
    }

    return json({
      success: true,
      data: updatedShipment
    });

  } catch (err) {
    console.error('[admin_update_shipment_location] Error', {
      correlationId,
      shipmentId: id,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to update shipment location' });
  }
};

// GET endpoint to retrieve location history
export const GET: RequestHandler = async ({ params, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const { id } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    // Get shipment with history
    const shipment = await locals.pb.collection('shipments').getOne(id, {
      expand: 'user'
    });

    // Extract location updates from status history
    const locationHistory = [];

    if (shipment.status_history && Array.isArray(shipment.status_history)) {
      shipment.status_history.forEach((event: any) => {
        if (event.location) {
          locationHistory.push({
            timestamp: event.timestamp,
            location: event.location,
            status: event.status,
            notes: event.notes || null,
            updatedBy: event.updated_by || null
          });
        }
      });
    }

    // Add current location if not already in history
    if (shipment.current_location) {
      const hasCurrentLocation = locationHistory.some(
        h => h.location === shipment.current_location
      );

      if (!hasCurrentLocation) {
        locationHistory.push({
          timestamp: shipment.updated,
          location: shipment.current_location,
          status: shipment.status,
          notes: shipment.notes || null,
          updatedBy: null
        });
      }
    }

    // Sort by timestamp (most recent first)
    locationHistory.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return json({
      success: true,
      data: {
        currentLocation: shipment.current_location,
        history: locationHistory
      }
    });

  } catch (err) {
    console.error('[admin_get_shipment_location_history] Error', {
      correlationId,
      shipmentId: id,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to retrieve location history' });
  }
};