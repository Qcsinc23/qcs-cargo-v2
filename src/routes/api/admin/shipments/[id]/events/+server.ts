import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Validation schema for tracking events
const trackingEventSchema = z.object({
  event_type: z.enum([
    'pickup',
    'in_transit',
    'customs_clearance',
    'out_for_delivery',
    'delivery_attempt',
    'delivered',
    'exception',
    'returned',
    'delayed',
    'facility_arrival',
    'facility_departure'
  ]),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  estimated_delivery: z.string().datetime().optional(),
  photos: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  notify_customer: z.boolean().default(true)
});

export const POST: RequestHandler = async ({ params, request, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const { id } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = trackingEventSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));

      throw error(400, {
        message: 'Validation error',
        errors
      });
    }

    const eventData = validationResult.data;

    // Get current shipment
    const shipment = await locals.pb.collection('shipments').getOne(id, {
      expand: 'user'
    });

    // Create event entry
    const eventEntry = {
      event_id: crypto.randomUUID(),
      event_type: eventData.event_type,
      location: eventData.location.trim(),
      description: eventData.description || null,
      notes: eventData.notes || null,
      timestamp: eventData.timestamp || new Date().toISOString(),
      created_by: locals.user.id,
      metadata: eventData.metadata || {}
    };

    // Parse existing status history or create new array
    const statusHistory = Array.isArray(shipment.status_history)
      ? [...shipment.status_history, eventEntry]
      : [eventEntry];

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status_history: statusHistory,
      current_location: eventData.location.trim()
    };

    // Update estimated delivery if provided
    if (eventData.estimated_delivery) {
      updateData.estimated_delivery = eventData.estimated_delivery;
    }

    // Add photos if provided
    if (eventData.photos && eventData.photos.length > 0) {
      updateData.photos = [
        ...(shipment.photos || []),
        ...eventData.photos
      ];
    }

    // Update notes if provided
    if (eventData.notes) {
      updateData.notes = eventData.notes;
    }

    // Update shipment status based on event type
    const statusMap: Record<string, string> = {
      pickup: 'received',
      in_transit: 'in_transit',
      customs_clearance: 'customs',
      out_for_delivery: 'out_for_delivery',
      delivery_attempt: 'exception',
      delivered: 'delivered',
      exception: 'exception',
      returned: 'returned',
      delayed: 'in_transit',
      facility_arrival: 'processing',
      facility_departure: 'in_transit'
    };

    if (statusMap[eventData.event_type]) {
      updateData.status = statusMap[eventData.event_type];

      // Set delivered_at timestamp if delivered
      if (eventData.event_type === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    const updatedShipment = await locals.pb.collection('shipments').update(id, updateData);

    console.log('[admin_add_tracking_event]', {
      correlationId,
      adminId: locals.user.id,
      shipmentId: id,
      trackingNumber: shipment.tracking_number,
      eventType: eventData.event_type,
      location: eventData.location
    });

    // Log admin action
    try {
      await locals.pb.collection('activity_logs').create({
        user: locals.user.id,
        action: 'shipment.event_add',
        resource_type: 'shipments',
        resource_id: id,
        metadata: {
          event_id: eventEntry.event_id,
          event_type: eventData.event_type,
          location: eventData.location,
          notes: eventData.notes
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (logErr) {
      console.error('[admin_add_tracking_event] Failed to log action:', logErr);
    }

    // Send notification email if requested
    if (eventData.notify_customer && shipment.expand?.user) {
      const user = shipment.expand.user;

      try {
        // Import email function
        const { sendTrackingEventEmail } = await import('$lib/server/email');

        await sendTrackingEventEmail(user.email, user.name || 'Customer', {
          trackingNumber: shipment.tracking_number,
          eventType: eventData.event_type,
          eventDescription: eventData.description || eventEntry.event_type,
          location: eventData.location,
          notes: eventData.notes,
          estimatedDelivery: eventData.estimated_delivery
        });

        console.log('[admin_add_tracking_event] Email sent', {
          correlationId,
          shipmentId: id,
          email: user.email
        });
      } catch (emailErr) {
        console.error('[admin_add_tracking_event] Failed to send email:', emailErr);
        // Non-fatal
      }
    }

    return json({
      success: true,
      data: {
        shipment: updatedShipment,
        event: eventEntry
      }
    });

  } catch (err) {
    console.error('[admin_add_tracking_event] Error', {
      correlationId,
      shipmentId: id,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to add tracking event' });
  }
};

// GET endpoint to retrieve all tracking events for a shipment
export const GET: RequestHandler = async ({ params, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const { id } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    // Get shipment with history
    const shipment = await locals.pb.collection('shipments').getOne(id);

    // Extract and format events from status history
    const events = [];

    if (shipment.status_history && Array.isArray(shipment.status_history)) {
      shipment.status_history.forEach((event: any) => {
        events.push({
          eventId: event.event_id || null,
          eventType: event.event_type || event.status,
          status: event.status || null,
          location: event.location,
          description: event.description || null,
          notes: event.notes || null,
          timestamp: event.timestamp,
          createdBy: event.created_by || event.updated_by || null,
          metadata: event.metadata || {}
        });
      });
    }

    // Sort by timestamp (most recent first)
    events.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return json({
      success: true,
      data: {
        trackingNumber: shipment.tracking_number,
        currentStatus: shipment.status,
        currentLocation: shipment.current_location,
        estimatedDelivery: shipment.estimated_delivery,
        deliveredAt: shipment.delivered_at,
        events
      }
    });

  } catch (err) {
    console.error('[admin_get_tracking_events] Error', {
      correlationId,
      shipmentId: id,
      error: err
    });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to retrieve tracking events' });
  }
};