import type { PageServerLoad } from './$types';
import { escapePbFilterValue } from '$lib/server/pb-filter';
import { listCustomerShipmentSummaries } from '$lib/server/customer-shipments';

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      stats: {
        activeShipments: 0,
        pendingBookings: 0,
        completedShipments: 0
      },
      recentShipments: [],
      upcomingBookings: []
    };
  }

  const safeUserId = escapePbFilterValue(locals.user.id);

  const bookingResult = await locals.pb.collection('bookings').getList(1, 200, {
    filter: `user = "${safeUserId}"`,
    sort: '-created'
  });

  const allBookings = bookingResult.items;
  const shipments = await listCustomerShipmentSummaries(locals, locals.user.id);

  const pendingBookings = allBookings.filter((booking) => {
    const status = typeof booking.status === 'string' ? booking.status : '';
    return status === 'draft' || status === 'pending_payment' || status === 'payment_failed' || status === 'confirmed';
  }).length;

  const completedShipments = shipments.filter((shipment) => shipment.status === 'delivered').length;
  const activeShipments = shipments.filter(
    (shipment) => shipment.status !== 'delivered' && shipment.status !== 'canceled' && shipment.status !== 'cancelled'
  ).length;

  const recentShipments = shipments.slice(0, 5);

  const upcomingBookings = allBookings
    .filter((booking) => {
      const status = typeof booking.status === 'string' ? booking.status : '';
      return status !== 'canceled' && status !== 'cancelled';
    })
    .map((booking) => ({
      id: String(booking.id),
      destination: typeof booking.destination === 'string' ? booking.destination : '',
      scheduled_date: typeof booking.scheduled_date === 'string' ? booking.scheduled_date : '',
      status: typeof booking.status === 'string' ? booking.status : 'pending',
      total_cost: toNumber(booking.total_cost, 0)
    }))
    .slice(0, 5);

  return {
    stats: {
      activeShipments,
      pendingBookings,
      completedShipments
    },
    recentShipments,
    upcomingBookings
  };
};
