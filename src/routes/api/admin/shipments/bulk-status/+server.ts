import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, locals }) => {
  // Require admin/staff role
  if (!locals.user || !['admin', 'staff'].includes(locals.user.role)) {
    throw error(403, { message: 'Admin access required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const { shipmentIds, status, location, notes, notifyCustomers = false } = body;

    if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      throw error(400, { message: 'Shipment IDs are required' });
    }

    if (!status) {
      throw error(400, { message: 'Status is required' });
    }

    const validStatuses = ['received', 'processing', 'in_transit', 'customs', 'out_for_delivery', 'delivered', 'exception', 'returned'];
    if (!validStatuses.includes(status)) {
      throw error(400, { message: 'Invalid status' });
    }

    console.log('[admin_bulk_update_status]', {
      correlationId,
      adminId: locals.user.id,
      shipmentCount: shipmentIds.length,
      newStatus: status
    });

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    // Process each shipment
    for (const shipmentId of shipmentIds) {
      try {
        const shipment = await locals.pb.collection('shipments').getOne(shipmentId);

        const historyEntry = {
          status,
          location: location || shipment.current_location,
          timestamp: new Date().toISOString(),
          updated_by: locals.user.id,
          notes: notes || 'Bulk status update'
        };

        const statusHistory = Array.isArray(shipment.status_history)
          ? [...shipment.status_history, historyEntry]
          : [historyEntry];

        const updateData: Record<string, unknown> = {
          status,
          status_history: statusHistory,
          current_location: location || shipment.current_location
        };

        if (status === 'delivered') {
          updateData.delivered_at = new Date().toISOString();
        }

        await locals.pb.collection('shipments').update(shipmentId, updateData);
        results.success.push(shipmentId);
      } catch (err) {
        results.failed.push({
          id: shipmentId,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Log bulk action
    try {
      await locals.pb.collection('activity_logs').create({
        user: locals.user.id,
        action: 'bulk.status_update',
        resource_type: 'shipments',
        resource_id: '',
        metadata: {
          shipment_ids: shipmentIds,
          new_status: status,
          success_count: results.success.length,
          failed_count: results.failed.length,
          notify_customers: notifyCustomers
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (logErr) {
      console.error('[admin_bulk_update_status] Failed to log action:', logErr);
    }

    console.log('[admin_bulk_update_status] Complete', {
      correlationId,
      successCount: results.success.length,
      failedCount: results.failed.length
    });

    return json({
      status: 'success',
      data: results
    });
  } catch (err) {
    console.error('[admin_bulk_update_status] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to update shipments' });
  }
};









