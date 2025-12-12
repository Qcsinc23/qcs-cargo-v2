import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/pocketbase';

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const destination = url.searchParams.get('destination') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');

    // Build filter
    let filter = '';
    const filterParts = [];

    if (search) {
      filterParts.push(`(tracking_number ~ "${search}" || user.name ~ "${search}" || user.email ~ "${search}")`);
    }

    if (status !== 'all') {
      filterParts.push(`status = "${status}"`);
    }

    if (destination !== 'all') {
      filterParts.push(`destination ~ "${destination}"`);
    }

    if (filterParts.length > 0) {
      filter = filterParts.join(' && ');
    }

    // Fetch shipments
    const shipmentsList = await pb.collection('shipments').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'user,booking,package'
    });

    // Format shipments for frontend
    const formattedShipments = shipmentsList.items.map(shipment => ({
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

    return json({
      shipments: formattedShipments,
      totalItems: shipmentsList.totalItems,
      totalPages: shipmentsList.totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Shipments fetch error:', error);
    return json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
};

// Update shipment status
export const PATCH: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { shipmentId, status, note, photos, exceptionReason } = await request.json();

    if (!shipmentId) {
      return json({ error: 'Shipment ID required' }, { status: 400 });
    }

    // Get current shipment to update status history
    const currentShipment = await pb.collection('shipments').getOne(shipmentId);
    const statusHistory = currentShipment.status_history || [];

    // Add new status to history
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      updated_by: locals.user.id,
      note: note || ''
    });

    const updateData: any = {
      status,
      status_history: statusHistory
    };

    if (note) updateData.notes = note;
    if (exceptionReason) updateData.exception_reason = exceptionReason;

    // Handle delivered timestamp
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const updatedShipment = await pb.collection('shipments').update(shipmentId, updateData);

    // Log activity
    await pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Updated shipment ${currentShipment.tracking_number} status to ${status}`,
      resource_type: 'shipment',
      resource_id: shipmentId,
      metadata: { status, note }
    });

    return json({ success: true, shipment: updatedShipment });
  } catch (error) {
    console.error('Shipment update error:', error);
    return json({ error: 'Failed to update shipment' }, { status: 500 });
  }
};

// Add note to shipment
export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { shipmentId, note } = await request.json();

    if (!shipmentId || !note) {
      return json({ error: 'Shipment ID and note required' }, { status: 400 });
    }

    // Get current shipment
    const currentShipment = await pb.collection('shipments').getOne(shipmentId);

    // Append note to existing notes
    const existingNotes = currentShipment.notes || '';
    const newNote = `${existingNotes ? existingNotes + '\n\n' : ''}[${new Date().toLocaleDateString()} - ${locals.user.name}]: ${note}`;

    const updatedShipment = await pb.collection('shipments').update(shipmentId, {
      notes: newNote
    });

    return json({ success: true, shipment: updatedShipment });
  } catch (error) {
    console.error('Add note error:', error);
    return json({ error: 'Failed to add note' }, { status: 500 });
  }
};