import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { hasRole } from '$lib/server/authz';
import { escapePbFilterValue, sanitizePocketBaseId, sanitizeSearchTerm } from '$lib/server/pb-filter';

const SHIPMENT_STATUSES = new Set([
  'pending',
  'received',
  'processing',
  'in_transit',
  'customs',
  'out_for_delivery',
  'delivered',
  'returned',
  'exception',
  'canceled'
]);

const UpdateShipmentSchema = z.object({
  shipmentId: z.string().min(1).max(64),
  status: z.string().min(1).max(64),
  note: z.string().max(2000).optional().nullable(),
  photos: z.unknown().optional(),
  exceptionReason: z.string().max(500).optional().nullable()
});

const AddShipmentNoteSchema = z.object({
  shipmentId: z.string().min(1).max(64),
  note: z.string().min(1).max(2000)
});

function normalizeShipmentStatus(status: string): string {
  return status.trim().toLowerCase() === 'cancelled' ? 'canceled' : status.trim().toLowerCase();
}

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // Ensure user is admin
    if (!locals.user || !hasRole(locals.user, ['admin'])) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const search = sanitizeSearchTerm(url.searchParams.get('search') || '');
    const rawStatus = normalizeShipmentStatus(url.searchParams.get('status') || 'all');
    const status = rawStatus === 'all' || SHIPMENT_STATUSES.has(rawStatus) ? rawStatus : 'all';
    const destination = sanitizeSearchTerm(url.searchParams.get('destination') || '', 60);
    const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 10;

    const filterParts: string[] = [];

    if (search) {
      filterParts.push(
        `(tracking_number ~ "${search}" || user.name ~ "${search}" || user.email ~ "${search}")`
      );
    }

    if (status !== 'all') {
      filterParts.push(`status = "${escapePbFilterValue(status)}"`);
    }

    if (destination) {
      filterParts.push(`destination ~ "${destination}"`);
    }

    const filter = filterParts.join(' && ');

    // Fetch shipments
    const shipmentsList = await locals.pb.collection('shipments').getList(page, perPage, {
      ...(filter ? { filter } : {}),
      sort: '-created',
      expand: 'user,booking,package'
    });

    // Format shipments for frontend
    const formattedShipments = shipmentsList.items.map((shipment) => ({
      id: shipment.tracking_number,
      shipmentId: shipment.id,
      customer: shipment.expand?.user?.name || 'Unknown',
      customerId: shipment.user,
      destination: shipment.destination,
      weight: shipment.actual_weight || shipment.weight,
      packages: shipment.expand?.package ? 1 : 0, // This would need to be updated based on actual package count
      status: shipment.status,
      created: shipment.created,
      amount: shipment.expand?.booking?.total_cost || 0,
      currentLocation: shipment.current_location,
      estimatedDelivery: shipment.estimated_delivery,
      notes: shipment.notes,
      photos: shipment.photos,
      exceptionReason: shipment.exception_reason
    }));

    const payload = {
      shipments: formattedShipments,
      totalItems: shipmentsList.totalItems,
      totalPages: shipmentsList.totalPages,
      currentPage: page
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Shipments fetch error:', err);
    return json({ status: 'error', message: 'Failed to fetch shipments' }, { status: 500 });
  }
};

// Update shipment status
export const PATCH: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || !hasRole(locals.user, ['admin'])) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = UpdateShipmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const shipmentId = sanitizePocketBaseId(parsed.data.shipmentId);
    if (!shipmentId) {
      return json({ status: 'error', message: 'Invalid shipment ID' }, { status: 400 });
    }

    const status = normalizeShipmentStatus(parsed.data.status);
    if (!SHIPMENT_STATUSES.has(status)) {
      return json({ status: 'error', message: 'Invalid shipment status' }, { status: 400 });
    }

    // Get current shipment to update status history
    const currentShipment = await locals.pb.collection('shipments').getOne(shipmentId);
    const statusHistory = Array.isArray(currentShipment.status_history) ? [...currentShipment.status_history] : [];
    const note = typeof parsed.data.note === 'string' ? parsed.data.note.trim() : '';
    const exceptionReason =
      typeof parsed.data.exceptionReason === 'string' ? parsed.data.exceptionReason.trim() : '';

    // Add new status to history
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updated_by: locals.user.id,
      note
    });

    const updateData: Record<string, unknown> = {
      status,
      status_history: statusHistory
    };

    if (note) updateData.notes = note;
    if (exceptionReason) updateData.exception_reason = exceptionReason;
    if (parsed.data.photos !== undefined) updateData.photos = parsed.data.photos;

    // Handle delivered timestamp
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const updatedShipment = await locals.pb.collection('shipments').update(shipmentId, updateData);

    // Log activity
    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Updated shipment ${currentShipment.tracking_number} status to ${status}`,
      resource_type: 'shipment',
      resource_id: shipmentId,
      metadata: { status, note }
    }).catch((logErr) => {
      console.warn('Failed to log shipment status update activity', logErr);
    });

    return json({
      status: 'success',
      data: { shipment: updatedShipment },
      success: true,
      shipment: updatedShipment
    });
  } catch (err) {
    console.error('Shipment update error:', err);
    return json({ status: 'error', message: 'Failed to update shipment' }, { status: 500 });
  }
};

// Add note to shipment
export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || !hasRole(locals.user, ['admin'])) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = AddShipmentNoteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const shipmentId = sanitizePocketBaseId(parsed.data.shipmentId);
    if (!shipmentId) {
      return json({ status: 'error', message: 'Invalid shipment ID' }, { status: 400 });
    }

    // Get current shipment
    const currentShipment = await locals.pb.collection('shipments').getOne(shipmentId);
    const authorName =
      typeof locals.user.name === 'string' && locals.user.name.trim().length > 0
        ? locals.user.name.trim()
        : 'Admin';

    // Append note to existing notes
    const existingNotes = currentShipment.notes || '';
    const newNote = `${existingNotes ? `${existingNotes}\n\n` : ''}[${new Date().toISOString()} - ${authorName}]: ${parsed.data.note.trim()}`;

    const updatedShipment = await locals.pb.collection('shipments').update(shipmentId, {
      notes: newNote
    });

    return json({
      status: 'success',
      data: { shipment: updatedShipment },
      success: true,
      shipment: updatedShipment
    });
  } catch (err) {
    console.error('Add note error:', err);
    return json({ status: 'error', message: 'Failed to add note' }, { status: 500 });
  }
};
