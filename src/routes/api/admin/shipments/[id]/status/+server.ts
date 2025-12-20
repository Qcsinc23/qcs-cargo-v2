import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendStatusUpdateEmail } from '$lib/server/email';
import { sendShipmentStatusUpdate } from '$lib/server/notifications';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const { id } = params;
  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const { status, location, notes, notifyCustomer = true } = body;

    if (!status) {
      throw error(400, { message: 'Status is required' });
    }

    const validStatuses = ['received', 'processing', 'in_transit', 'customs', 'out_for_delivery', 'delivered', 'exception', 'returned'];
    if (!validStatuses.includes(status)) {
      throw error(400, { message: 'Invalid status' });
    }

    // Get current shipment
    const shipment = await locals.pb.collection('shipments').getOne(id, {
      expand: 'user'
    });

    // Build status history entry
    const historyEntry = {
      status,
      location: location || shipment.current_location,
      timestamp: new Date().toISOString(),
      updated_by: locals.user.id,
      notes: notes || null
    };

    // Parse existing history or create new array
    const statusHistory = Array.isArray(shipment.status_history) 
      ? [...shipment.status_history, historyEntry]
      : [historyEntry];

    // Prepare update data
    const updateData: Record<string, unknown> = {
      status,
      status_history: statusHistory,
      current_location: location || shipment.current_location
    };

    // Set delivered_at if status is delivered
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // Set exception reason if status is exception
    if (status === 'exception' && notes) {
      updateData.exception_reason = notes;
    }

    const updatedShipment = await locals.pb.collection('shipments').update(id, updateData);

    console.log('[admin_update_shipment_status]', {
      correlationId,
      adminId: locals.user.id,
      shipmentId: id,
      oldStatus: shipment.status,
      newStatus: status
    });

    // Log admin action
    try {
      await locals.pb.collection('activity_logs').create({
        user: locals.user.id,
        action: 'shipment.status_update',
        resource_type: 'shipments',
        resource_id: id,
        metadata: {
          old_status: shipment.status,
          new_status: status,
          location,
          notes
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (logErr) {
      console.error('[admin_update_shipment_status] Failed to log action:', logErr);
    }

    // Send notifications (email and SMS) if requested
    if (notifyCustomer && shipment.expand?.user) {
      const user = shipment.expand.user;
      const statusDescriptions: Record<string, string> = {
        received: 'Package Received at Warehouse',
        processing: 'Package Being Processed',
        in_transit: 'Package In Transit',
        customs: 'Package at Customs',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Package Delivered',
        exception: 'Delivery Exception',
        returned: 'Package Returned'
      };

      try {
        // Send both email and SMS notifications
        await sendShipmentStatusUpdate(user.id, {
          name: user.name || 'Customer',
          email: user.email,
          phone: user.phone,
          trackingNumber: shipment.tracking_number,
          status,
          statusDescription: statusDescriptions[status] || status,
          location: location || shipment.current_location,
          estimatedDelivery: shipment.estimated_delivery
        });

        console.log('[admin_update_shipment_status] Notifications sent', {
          correlationId,
          shipmentId: id,
          email: user.email,
          phone: user.phone,
          status
        });
      } catch (notificationErr) {
        console.error('[admin_update_shipment_status] Failed to send notifications:', notificationErr);
        // Non-fatal
      }
    }

    return json({
      status: 'success',
      data: updatedShipment
    });
  } catch (err) {
    console.error('[admin_update_shipment_status] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to update shipment status' });
  }
};









