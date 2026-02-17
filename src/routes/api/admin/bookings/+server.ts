import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { escapePbFilterValue, sanitizePocketBaseId, sanitizeSearchTerm } from '$lib/server/pb-filter';
import { isAdminOrStaff } from '$lib/server/authz';

const VALID_BOOKING_STATUSES = new Set([
  'draft',
  'pending_payment',
  'confirmed',
  'payment_failed',
  'in_progress',
  'completed',
  'canceled'
]);

const VALID_PAYMENT_STATUSES = new Set([
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
  'canceled'
]);

const UpdateBookingSchema = z.object({
  bookingId: z.string().min(1).max(64),
  status: z.string().optional(),
  paymentStatus: z.string().optional()
});

const CancelBookingSchema = z.object({
  bookingId: z.string().min(1).max(64)
});

function normalizeBookingStatus(status: string): string {
  return status === 'cancelled' ? 'canceled' : status;
}

async function countBookings(locals: App.Locals, filter: string): Promise<number> {
  return locals.pb
    .collection('bookings')
    .getList(1, 1, { filter, fields: 'id' })
    .then((res) => res.totalItems)
    .catch(() => 0);
}

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const search = sanitizeSearchTerm(url.searchParams.get('search') || '');
    const requestedStatus = normalizeBookingStatus((url.searchParams.get('status') || 'all').trim());
    const status = requestedStatus === 'all' || VALID_BOOKING_STATUSES.has(requestedStatus) ? requestedStatus : 'all';
    const dateFilter = (url.searchParams.get('date') || 'all').trim();
    const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 10;

    const filterParts: string[] = [];

    if (search) {
      filterParts.push(
        `(id ~ "${search}" || user.name ~ "${search}" || user.email ~ "${search}")`
      );
    }

    if (status !== 'all') {
      filterParts.push(`status = "${escapePbFilterValue(status)}"`);
    }

    if (dateFilter === 'today' || dateFilter === 'upcoming') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      if (dateFilter === 'today') {
        filterParts.push(
          `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`
        );
      } else {
        filterParts.push(`scheduled_date >= "${startOfDay.toISOString()}"`);
      }
    }

    const filter = filterParts.join(' && ');

    const bookingsList = await locals.pb.collection('bookings').getList(page, perPage, {
      ...(filter ? { filter } : {}),
      sort: '-created',
      expand: 'user,recipient'
    });

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [todayCount, pendingCount, failedPaymentCount] = await Promise.all([
      countBookings(
        locals,
        `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`
      ),
      countBookings(locals, 'status = "pending_payment"'),
      countBookings(locals, 'status = "payment_failed"')
    ]);

    const formattedBookings = bookingsList.items.map((booking) => ({
      id: booking.id,
      customer: booking.expand?.user?.name || 'Unknown',
      customerId: booking.user,
      email: booking.expand?.user?.email || '',
      scheduledDate: booking.scheduled_date,
      timeSlot: booking.time_slot,
      destination: booking.destination,
      packages: booking.package_count,
      status: normalizeBookingStatus(String(booking.status || 'draft')),
      amount: booking.total_cost,
      paymentStatus: booking.payment_status || 'pending',
      serviceType: booking.service_type
    }));

    const payload = {
      bookings: formattedBookings,
      totalItems: bookingsList.totalItems,
      totalPages: bookingsList.totalPages,
      currentPage: page,
      stats: {
        today: todayCount,
        pending: pendingCount,
        paymentFailed: failedPaymentCount
      }
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    return json({ status: 'error', message: 'Failed to fetch bookings' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = UpdateBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const normalizedBookingId = sanitizePocketBaseId(parsed.data.bookingId);
    if (!normalizedBookingId) {
      return json({ status: 'error', message: 'Invalid booking ID' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (parsed.data.status) {
      const normalizedStatus = normalizeBookingStatus(parsed.data.status);
      if (!VALID_BOOKING_STATUSES.has(normalizedStatus)) {
        return json({ status: 'error', message: 'Invalid booking status' }, { status: 400 });
      }
      updateData.status = normalizedStatus;
    }

    if (parsed.data.paymentStatus) {
      const normalizedPaymentStatus = normalizeBookingStatus(parsed.data.paymentStatus);
      if (!VALID_PAYMENT_STATUSES.has(normalizedPaymentStatus)) {
        return json({ status: 'error', message: 'Invalid payment status' }, { status: 400 });
      }
      updateData.payment_status = normalizedPaymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return json({ status: 'error', message: 'No valid fields to update' }, { status: 400 });
    }

    const updatedBooking = await locals.pb.collection('bookings').update(normalizedBookingId, updateData);

    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Updated booking ${normalizedBookingId} status`,
      resource_type: 'booking',
      resource_id: normalizedBookingId,
      metadata: updateData
    }).catch((logErr) => {
      console.warn('Failed to log booking update activity', logErr);
    });

    return json({
      status: 'success',
      data: { booking: updatedBooking },
      success: true,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Booking update error:', err);
    return json({ status: 'error', message: 'Failed to update booking' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = CancelBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const bookingId = sanitizePocketBaseId(parsed.data.bookingId);
    if (!bookingId) {
      return json({ status: 'error', message: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await locals.pb.collection('bookings').getOne(bookingId, {
      fields: 'id,payment_status'
    });

    const nextPaymentStatus =
      booking.payment_status === 'paid' || booking.payment_status === 'refunded'
        ? booking.payment_status
        : 'canceled';

    const canceledBooking = await locals.pb.collection('bookings').update(bookingId, {
      status: 'canceled',
      payment_status: nextPaymentStatus
    });

    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Canceled booking ${bookingId}`,
      resource_type: 'booking',
      resource_id: bookingId
    }).catch((logErr) => {
      console.warn('Failed to log booking cancellation activity', logErr);
    });

    return json({
      status: 'success',
      data: { booking: canceledBooking },
      success: true,
      booking: canceledBooking
    });
  } catch (err) {
    console.error('Booking cancellation error:', err);
    return json({ status: 'error', message: 'Failed to cancel booking' }, { status: 500 });
  }
};
