import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const { id } = params;

  try {
    const booking = await locals.pb.collection('bookings').getOne(id, {
      expand: 'recipient,user'
    });

    // Verify user owns this booking (unless admin/staff)
    const isAdmin = locals.user.role === 'admin' || locals.user.role === 'staff';
    if (booking.user !== locals.user.id && !isAdmin) {
      throw error(403, { message: 'Access denied' });
    }

    // Get associated packages
    const packages = await locals.pb.collection('packages').getFullList({
      filter: `booking = "${id}"`,
      sort: 'created'
    });

    return json({
      status: 'success',
      data: {
        booking,
        packages
      }
    });
  } catch (err) {
    console.error('[get_booking] Error', err);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to fetch booking' });
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const { id } = params;

  try {
    // Verify user owns this booking
    const existingBooking = await locals.pb.collection('bookings').getOne(id);
    
    const isAdmin = locals.user.role === 'admin' || locals.user.role === 'staff';
    if (existingBooking.user !== locals.user.id && !isAdmin) {
      throw error(403, { message: 'Access denied' });
    }

    // Only allow modifications within 24 hours of creation (for customers)
    if (!isAdmin) {
      const createdAt = new Date(existingBooking.created);
      const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation > 24) {
        throw error(400, { message: 'Booking can only be modified within 24 hours of creation' });
      }

      // Only allow modifying certain fields
      if (existingBooking.status !== 'pending_payment' && existingBooking.status !== 'confirmed') {
        throw error(400, { message: 'Booking cannot be modified in current status' });
      }
    }

    const body = await request.json();
    const allowedFields = isAdmin 
      ? ['scheduled_date', 'time_slot', 'status', 'payment_status', 'special_instructions', 'notes']
      : ['scheduled_date', 'time_slot', 'special_instructions'];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw error(400, { message: 'No valid fields to update' });
    }

    const updatedBooking = await locals.pb.collection('bookings').update(id, updateData);

    console.log('[update_booking]', {
      userId: locals.user.id,
      bookingId: id,
      fields: Object.keys(updateData)
    });

    return json({
      status: 'success',
      data: updatedBooking
    });
  } catch (err) {
    console.error('[update_booking] Error', err);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to update booking' });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const { id } = params;

  try {
    const booking = await locals.pb.collection('bookings').getOne(id);
    
    const isAdmin = locals.user.role === 'admin' || locals.user.role === 'staff';
    if (booking.user !== locals.user.id && !isAdmin) {
      throw error(403, { message: 'Access denied' });
    }

    // Only allow cancellation of pending bookings
    if (!['draft', 'pending_payment'].includes(booking.status) && !isAdmin) {
      throw error(400, { message: 'Only pending bookings can be canceled' });
    }

    // Soft delete - mark as canceled
    await locals.pb.collection('bookings').update(id, {
      status: 'canceled',
      payment_status: booking.payment_status === 'pending' ? 'canceled' : booking.payment_status
    });

    console.log('[cancel_booking]', {
      userId: locals.user.id,
      bookingId: id
    });

    return json({
      status: 'success',
      message: 'Booking canceled'
    });
  } catch (err) {
    console.error('[cancel_booking] Error', err);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to cancel booking' });
  }
};









