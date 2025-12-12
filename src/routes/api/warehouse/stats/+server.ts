import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { WarehouseStats } from '$lib/types/warehouse';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Helper to get count by status and date range
    const getCountByStatus = async (status: string, startDate?: Date) => {
      let filter = `status = "${status}"`;
      if (startDate) {
        filter += ` && received_at >= "${startDate.toISOString()}"`;
      }

      return locals.pb.collection('warehouse_packages').getList(1, 1, {
        filter,
        fields: 'id'
      }).then(res => res.totalItems).catch(() => 0);
    };

    // Get counts for today
    const todayReceived = await getCountByStatus('received', today);
    const todayVerified = await getCountByStatus('verified', today);
    const todayStaged = await getCountByStatus('staged', today);
    const todayShipped = await getCountByStatus('shipped', today);
    const todayExceptions = await getCountByStatus('exception', today);

    // Get counts for week
    const weekReceived = await getCountByStatus('received', weekStart);
    const weekVerified = await getCountByStatus('verified', weekStart);
    const weekStaged = await getCountByStatus('staged', weekStart);
    const weekShipped = await getCountByStatus('shipped', weekStart);
    const weekExceptions = await getCountByStatus('exception', weekStart);

    // Get counts for month
    const monthReceived = await getCountByStatus('received', monthStart);
    const monthVerified = await getCountByStatus('verified', monthStart);
    const monthStaged = await getCountByStatus('staged', monthStart);
    const monthShipped = await getCountByStatus('shipped', monthStart);
    const monthExceptions = await getCountByStatus('exception', monthStart);

    // Get pending counts
    const pendingToVerify = await locals.pb.collection('warehouse_packages').getFullList({
      filter: 'status = "received"',
      fields: 'id'
    }).then(items => items.length).catch(() => 0);

    const pendingToStage = await locals.pb.collection('warehouse_packages').getFullList({
      filter: 'status = "verified"',
      fields: 'id'
    }).then(items => items.length).catch(() => 0);

    const pendingToShip = await locals.pb.collection('warehouse_packages').getFullList({
      filter: 'status = "staged"',
      fields: 'id'
    }).then(items => items.length).catch(() => 0);

    const pendingExceptions = await locals.pb.collection('warehouse_packages').getFullList({
      filter: 'status = "exception"',
      fields: 'id'
    }).then(items => items.length).catch(() => 0);

    const stats: WarehouseStats = {
      today: {
        received: todayReceived,
        verified: todayVerified,
        staged: todayStaged,
        shipped: todayShipped,
        exceptions: todayExceptions
      },
      week: {
        received: weekReceived,
        verified: weekVerified,
        staged: weekStaged,
        shipped: weekShipped,
        exceptions: weekExceptions
      },
      month: {
        received: monthReceived,
        verified: monthVerified,
        staged: monthStaged,
        shipped: monthShipped,
        exceptions: monthExceptions
      },
      pending: {
        toVerify: pendingToVerify,
        toStage: pendingToStage,
        toShip: pendingToShip,
        exceptions: pendingExceptions
      }
    };

    return json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    console.error('[warehouse_stats] Error', err);
    throw error(500, { message: 'Failed to fetch warehouse stats' });
  }
};