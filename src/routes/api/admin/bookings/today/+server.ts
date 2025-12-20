import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/admin/bookings/today
 * 
 * Returns today's scheduled bookings for warehouse receiving.
 */
export const GET: RequestHandler = async ({ locals }) => {
  // Verify authentication
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  // Verify admin/staff role
  const allowedRoles = ['admin', 'staff'];
  if (!allowedRoles.includes(locals.user.role)) {
    throw error(403, { message: 'Staff access required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log('[get_today_bookings]', {
      correlationId,
      userId: locals.user.id,
      dateRange: { from: todayStr, to: tomorrowStr }
    });

    // Fetch bookings for today
    const result = await locals.pb.collection('bookings').getList(1, 50, {
      filter: `scheduled_date >= "${todayStr}" && scheduled_date < "${tomorrowStr}"`,
      sort: 'time_slot',
      expand: 'user,recipient'
    });

    // Transform to simpler format for frontend
    const bookings = result.items.map((booking) => {
      const user = booking.expand?.user;
      const recipient = booking.expand?.recipient;
      
      return {
        id: booking.id,
        customer: user?.name || user?.email?.split('@')[0] || 'Unknown',
        time: formatTimeSlot(booking.time_slot),
        packages: booking.package_count || 1,
        status: mapStatus(booking.status),
        destination: capitalizeFirst(booking.destination),
        recipientName: recipient?.name,
        totalWeight: booking.total_weight,
        totalCost: booking.total_cost
      };
    });

    console.log('[get_today_bookings] Found bookings', {
      correlationId,
      count: bookings.length
    });

    return json({
      status: 'success',
      data: {
        items: bookings,
        date: todayStr,
        totalCount: result.totalItems
      }
    });

  } catch (err) {
    console.error('[get_today_bookings] Error', { correlationId, error: err });

    // Return empty array rather than error for offline compatibility
    return json({
      status: 'success',
      data: {
        items: [],
        date: new Date().toISOString().split('T')[0],
        totalCount: 0,
        error: 'Could not fetch bookings'
      }
    });
  }
};

/**
 * Format time slot to human-readable format
 */
function formatTimeSlot(slot: string): string {
  if (!slot) return 'TBD';
  
  // Handle format like "10:00-11:00"
  const match = slot.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  
  return slot;
}

/**
 * Map booking status to receiving status
 */
function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'pending',
    'pending_payment': 'pending',
    'checked_in': 'checked_in',
    'in_progress': 'checked_in',
    'completed': 'completed',
    'canceled': 'canceled',
    'cancelled': 'canceled'
  };
  
  return statusMap[status] || status;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}





