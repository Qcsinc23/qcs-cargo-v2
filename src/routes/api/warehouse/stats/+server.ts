import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { WarehouseStats } from '$lib/types/warehouse';
import { isAdminOrStaff } from '$lib/server/authz';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }
  if (!isAdminOrStaff(locals.user)) {
    throw error(403, { message: 'Admin or staff role required' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const countByFilter = async (filter: string) =>
      locals.pb
        .collection('warehouse_packages')
        .getList(1, 1, { filter, fields: 'id' })
        .then((res) => res.totalItems)
        .catch(() => 0);

    const statusFilters = {
      todayReceived: `status = "received" && received_at >= "${today.toISOString()}"`,
      todayVerified: `status = "verified" && received_at >= "${today.toISOString()}"`,
      todayStaged: `status = "staged" && received_at >= "${today.toISOString()}"`,
      todayShipped: `status = "shipped" && received_at >= "${today.toISOString()}"`,
      todayExceptions: `status = "exception" && received_at >= "${today.toISOString()}"`,
      weekReceived: `status = "received" && received_at >= "${weekStart.toISOString()}"`,
      weekVerified: `status = "verified" && received_at >= "${weekStart.toISOString()}"`,
      weekStaged: `status = "staged" && received_at >= "${weekStart.toISOString()}"`,
      weekShipped: `status = "shipped" && received_at >= "${weekStart.toISOString()}"`,
      weekExceptions: `status = "exception" && received_at >= "${weekStart.toISOString()}"`,
      monthReceived: `status = "received" && received_at >= "${monthStart.toISOString()}"`,
      monthVerified: `status = "verified" && received_at >= "${monthStart.toISOString()}"`,
      monthStaged: `status = "staged" && received_at >= "${monthStart.toISOString()}"`,
      monthShipped: `status = "shipped" && received_at >= "${monthStart.toISOString()}"`,
      monthExceptions: `status = "exception" && received_at >= "${monthStart.toISOString()}"`,
      pendingToVerify: 'status = "received"',
      pendingToStage: 'status = "verified"',
      pendingToShip: 'status = "staged"',
      pendingExceptions: 'status = "exception"'
    } as const;

    const [
      todayReceived,
      todayVerified,
      todayStaged,
      todayShipped,
      todayExceptions,
      weekReceived,
      weekVerified,
      weekStaged,
      weekShipped,
      weekExceptions,
      monthReceived,
      monthVerified,
      monthStaged,
      monthShipped,
      monthExceptions,
      pendingToVerify,
      pendingToStage,
      pendingToShip,
      pendingExceptions
    ] = await Promise.all(Object.values(statusFilters).map((filter) => countByFilter(filter)));

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
