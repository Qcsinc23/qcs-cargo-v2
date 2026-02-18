import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAdminOrStaff } from '$lib/server/authz';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';
import { cancelPaymentIntent } from '$lib/server/stripe';

const PACKAGE_PAGE_SIZE = 100;

async function listBookingPackages(locals: App.Locals, bookingId: string) {
  const packages: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const packagePage = await locals.pb.collection('packages').getList(page, PACKAGE_PAGE_SIZE, {
      filter: `booking = "${escapePbFilterValue(bookingId)}"`,
      sort: 'created'
    });

    packages.push(...packagePage.items);
    totalPages = packagePage.totalPages;
    page += 1;
  }

  return packages;
}

async function isBookingOwner(locals: App.Locals, bookingUserId: string): Promise<boolean> {
  if (!locals.user) return false;
  if (bookingUserId === locals.user.id) return true;

  const currentEmail = String(locals.user.email || '').trim().toLowerCase();
  if (!currentEmail) return false;

  const ownerId = sanitizePocketBaseId(bookingUserId);
  if (!ownerId) return false;

  try {
    const owner = await locals.pb.collection('users').getOne(ownerId, { fields: 'id,email' });
    return String(owner.email || '').trim().toLowerCase() === currentEmail;
  } catch {
    return false;
  }
}

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid booking ID' });
  }

  try {
    const booking = await locals.pb.collection('bookings').getOne(id, {
      expand: 'recipient,user'
    });

    // Verify user owns this booking (unless admin/staff)
    const isAdmin = isAdminOrStaff(locals.user);
    const ownsBooking = await isBookingOwner(locals, booking.user);
    if (!ownsBooking && !isAdmin) {
      throw error(403, { message: 'Access denied' });
    }

    // Get associated packages
    const packages = await listBookingPackages(locals, id);

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

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid booking ID' });
  }

  try {
    // Verify user owns this booking
    const existingBooking = await locals.pb.collection('bookings').getOne(id);
    
    const isAdmin = isAdminOrStaff(locals.user);
    const ownsBooking = await isBookingOwner(locals, existingBooking.user);
    if (!ownsBooking && !isAdmin) {
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

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid booking ID' });
  }

  try {
    const booking = await locals.pb.collection('bookings').getOne(id);
    
    const isAdmin = isAdminOrStaff(locals.user);
    const ownsBooking = await isBookingOwner(locals, booking.user);
    if (!ownsBooking && !isAdmin) {
      throw error(403, { message: 'Access denied' });
    }

    // Only allow cancellation of pending bookings
    if (!['draft', 'pending_payment'].includes(booking.status) && !isAdmin) {
      throw error(400, { message: 'Only pending bookings can be canceled' });
    }

    const paymentStatus = String(booking.payment_status || 'pending');
    const paymentIntentId =
      typeof booking.payment_intent_id === 'string' ? booking.payment_intent_id.trim() : '';
    const isSettledPayment = paymentStatus === 'paid' || paymentStatus === 'refunded';
    const nextPaymentStatus = isSettledPayment ? paymentStatus : 'canceled';

    if (paymentIntentId && !isSettledPayment) {
      try {
        await cancelPaymentIntent(paymentIntentId);
      } catch (cancelErr) {
        // Stripe intent cancellation is best-effort; booking cancellation should still succeed.
        console.warn('[cancel_booking] Failed to cancel Stripe payment intent', {
          bookingId: id,
          paymentIntentId,
          error: cancelErr instanceof Error ? cancelErr.message : String(cancelErr)
        });
      }
    }

    // Soft delete - mark as canceled
    await locals.pb.collection('bookings').update(id, {
      status: 'canceled',
      payment_status: nextPaymentStatus
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





