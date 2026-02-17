import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const bookingId = params.id;

  try {
    // Fetch booking details
    const booking = await locals.pb.collection('bookings').getOne(bookingId, {
      expand: 'recipient,packages'
    });

    // Verify the booking belongs to the current user
    if (booking.user !== locals.user.id) {
      throw error(403, { message: 'Access denied' });
    }

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      throw redirect(302, `/dashboard/bookings/${bookingId}/confirmation`);
    }

    // Check if booking is in a payable state
    if (booking.status !== 'pending_payment' && booking.payment_status !== 'failed') {
      throw error(400, { message: 'This booking cannot be paid for' });
    }

    return {
      booking: {
        id: booking.id,
        service_type: booking.service_type,
        destination: booking.destination,
        scheduled_date: booking.scheduled_date,
        time_slot: booking.time_slot,
        subtotal: booking.subtotal,
        discount: booking.discount,
        insurance_cost: booking.insurance_cost,
        total_cost: booking.total_cost,
        status: booking.status,
        payment_status: booking.payment_status,
        expand: booking.expand
      }
    };
  } catch (err) {
    console.error('[Payment Page Load Error]', err);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to load booking details' });
  }
};
