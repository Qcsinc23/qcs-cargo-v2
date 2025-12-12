import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/pocketbase';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Ensure user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's bookings
    const todayBookings = await pb.collection('bookings').getList(1, 50, {
      filter: `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`,
      sort: '-created',
      expand: 'user,recipient'
    });

    // Get pending bookings (awaiting approval)
    const pendingBookings = await pb.collection('bookings').getFullList({
      filter: 'status = "confirmed" && payment_status = "pending"',
      expand: 'user,recipient'
    });

    // Get active shipments
    const activeShipments = await pb.collection('shipments').getFullList({
      filter: 'status != "delivered" && status != "returned" && status != "exception"',
      sort: '-created',
      expand: 'user,booking,package'
    });

    // Get recent shipments
    const recentShipments = await pb.collection('shipments').getList(1, 10, {
      sort: '-created',
      expand: 'user,booking,package'
    });

    // Get active customers (customers with bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomers = await pb.collection('users').getList(1, 1, {
      filter: `role = "customer" && created >= "${thirtyDaysAgo.toISOString()}"`
    });

    // Get MTD revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const paidInvoices = await pb.collection('invoices').getFullList({
      filter: `status = "paid" && paid_at >= "${firstDayOfMonth.toISOString()}"`
    });

    const revenueMTD = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Get recent activity logs
    const recentActivity = await pb.collection('activity_logs').getList(1, 20, {
      sort: '-created',
      expand: 'user'
    });

    return json({
      kpis: {
        activeShipments: activeShipments.length,
        pendingBookings: pendingBookings.length,
        activeCustomers: activeCustomers.totalItems,
        revenueMTD: revenueMTD
      },
      todayBookings: todayBookings.items,
      pendingActions: pendingBookings.map(booking => ({
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
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}