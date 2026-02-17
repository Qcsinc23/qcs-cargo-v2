import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasRole } from '$lib/server/authz';

async function countByFilter(
  locals: App.Locals,
  collection: string,
  filter: string
): Promise<number> {
  return locals.pb
    .collection(collection)
    .getList(1, 1, { filter, fields: 'id' })
    .then((res) => res.totalItems)
    .catch(() => 0);
}

async function sumInvoiceAmounts(locals: App.Locals, filter: string): Promise<number> {
  let page = 1;
  let totalPages = 1;
  let total = 0;

  while (page <= totalPages) {
    const invoicePage = await locals.pb.collection('invoices').getList(page, 200, {
      filter,
      fields: 'amount'
    });

    for (const invoice of invoicePage.items) {
      total += Number(invoice.amount || 0);
    }

    totalPages = invoicePage.totalPages;
    page += 1;
  }

  return total;
}

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Ensure user is admin
    if (!locals.user || !hasRole(locals.user, ['admin'])) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayBookings, pendingBookings, activeShipments, recentShipments, activeCustomers, revenueMTD, recentActivity] = await Promise.all([
      // Get today's bookings
      locals.pb.collection('bookings').getList(1, 50, {
        filter: `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`,
        sort: '-created',
        expand: 'user,recipient'
      }),
      // Get pending bookings for action cards
      locals.pb.collection('bookings').getList(1, 20, {
        filter: 'status = "confirmed" && payment_status = "pending"',
        sort: '-created',
        expand: 'user,recipient'
      }),
      // Count active shipments
      countByFilter(locals, 'shipments', 'status != "delivered" && status != "returned" && status != "exception"'),
      // Get recent shipments
      locals.pb.collection('shipments').getList(1, 10, {
        sort: '-created',
        expand: 'user,booking,package'
      }),
      // "Active customers" currently represented as customers created in the last 30 days
      locals.pb.collection('users').getList(1, 1, {
        filter: `role = "customer" && created >= "${thirtyDaysAgo.toISOString()}"`
      }),
      // Get MTD revenue without loading all invoice fields
      sumInvoiceAmounts(locals, `status = "paid" && paid_at >= "${firstDayOfMonth.toISOString()}"`),
      // Get recent activity logs
      locals.pb.collection('activity_logs').getList(1, 20, {
        sort: '-created',
        expand: 'user'
      })
    ]);

    const payload = {
      kpis: {
        activeShipments,
        pendingBookings: pendingBookings.totalItems,
        activeCustomers: activeCustomers.totalItems,
        revenueMTD
      },
      todayBookings: todayBookings.items,
      pendingActions: pendingBookings.items.map((booking) => ({
        id: booking.id,
        type: 'booking',
        message: `New booking from ${booking.expand?.user?.name || 'Unknown'} awaiting confirmation`,
        time: formatTimeAgo(new Date(booking.created)),
        urgent: true,
        bookingId: booking.id
      })),
      recentShipments: recentShipments.items.map(shipment => ({
        id: shipment.tracking_number,
        customer: shipment.expand?.user?.name || 'Unknown',
        destination: shipment.destination,
        weight: shipment.weight ? `${shipment.weight} lbs` : 'Unknown',
        status: shipment.status
      })),
      todaySchedule: todayBookings.items.map(booking => ({
        time: booking.time_slot,
        customer: booking.expand?.user?.name || 'Unknown',
        type: 'Drop-off',
        packages: booking.package_count || 0
      })),
      recentActivity: recentActivity.items
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return json({ status: 'error', message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
