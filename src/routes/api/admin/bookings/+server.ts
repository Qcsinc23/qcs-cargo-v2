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
    const dateFilter = url.searchParams.get('date') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');

    // Build filter
    let filter = '';
    const filterParts = [];

    if (search) {
      filterParts.push(`(id ~ "${search}" || user.name ~ "${search}" || user.email ~ "${search}")`);
    }

    if (status !== 'all') {
      filterParts.push(`status = "${status}"`);
    }

    if (dateFilter === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      filterParts.push(`scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`);
    }

    if (dateFilter === 'upcoming') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      filterParts.push(`scheduled_date >= "${startOfDay.toISOString()}"`);
    }

    if (filterParts.length > 0) {
      filter = filterParts.join(' && ');
    }

    // Fetch bookings
    const bookingsList = await pb.collection('bookings').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'user,recipient'
    });

    // Get stats
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [todayBookings, pendingBookings, failedPayments] = await Promise.all([
      pb.collection('bookings').getFullList({
        filter: `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`
      }),
      pb.collection('bookings').getFullList({
        filter: 'status = "pending"'
      }),
      pb.collection('bookings').getFullList({
        filter: 'status = "payment_failed"'
      })
    ]);

    // Format bookings for frontend
    const formattedBookings = bookingsList.items.map(booking => ({
      id: booking.id,
      customer: booking.expand?.user?.name || 'Unknown',
      customerId: booking.user,
      email: booking.expand?.user?.email || '',
      scheduledDate: booking.scheduled_date,
      timeSlot: booking.time_slot,
      destination: booking.destination,
      packages: booking.package_count,
      status: booking.status,
      amount: booking.total_cost,
      paymentStatus: booking.payment_status || 'pending',
      serviceType: booking.service_type
    }));

    return json({
      bookings: formattedBookings,
      totalItems: bookingsList.totalItems,
      totalPages: bookingsList.totalPages,
      currentPage: page,
      stats: {
        today: todayBookings.length,
        pending: pendingBookings.length,
        paymentFailed: failedPayments.length
      }
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
};

// Update booking status
export const PATCH: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bookingId, status, paymentStatus } = await request.json();

    if (!bookingId) {
      return json({ error: 'Booking ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;

    const updatedBooking = await pb.collection('bookings').update(bookingId, updateData);

    // Log activity
    await pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Updated booking ${bookingId} status to ${status || paymentStatus}`,
      resource_type: 'booking',
      resource_id: bookingId,
      metadata: updateData
    });

    return json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Booking update error:', error);
    return json({ error: 'Failed to update booking' }, { status: 500 });
  }
};

// Cancel booking
export const DELETE: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Update status to cancelled
    const cancelledBooking = await pb.collection('bookings').update(bookingId, {
      status: 'cancelled'
    });

    // Log activity
    await pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Cancelled booking ${bookingId}`,
      resource_type: 'booking',
      resource_id: bookingId
    });

    return json({ success: true, booking: cancelledBooking });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    return json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
};