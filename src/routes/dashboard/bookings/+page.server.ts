import type { PageServerLoad } from './$types';
import { escapePbFilterValue } from '$lib/server/pb-filter';

const PAGE_SIZE = 100;

type BookingListItem = {
  id: string;
  status: 'draft' | 'pending' | 'confirmed' | 'canceled' | 'cancelled' | 'pending_payment' | 'payment_failed';
  destination: string;
  package_count: number;
  total_weight_lbs: number;
  total_cost_usd: number;
  scheduled_date?: string;
  created: string;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeStatus(value: unknown): BookingListItem['status'] {
  const status = typeof value === 'string' ? value : 'pending';
  if (status === 'cancelled') return 'cancelled';
  if (
    status === 'draft' ||
    status === 'pending' ||
    status === 'confirmed' ||
    status === 'canceled' ||
    status === 'pending_payment' ||
    status === 'payment_failed'
  ) {
    return status;
  }
  return 'pending';
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return { bookings: [] satisfies BookingListItem[] };
  }

  const safeUserId = escapePbFilterValue(locals.user.id);
  const items: any[] = [];

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await locals.pb.collection('bookings').getList(page, PAGE_SIZE, {
      filter: `user = "${safeUserId}"`,
      sort: '-created'
    });

    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  const bookings: BookingListItem[] = items.map((booking) => ({
    id: String(booking.id),
    status: normalizeStatus(booking.status),
    destination: typeof booking.destination === 'string' ? booking.destination : '',
    package_count: toNumber(booking.package_count, 0),
    total_weight_lbs: toNumber(booking.total_weight, 0),
    total_cost_usd: toNumber(booking.total_cost, 0),
    scheduled_date: typeof booking.scheduled_date === 'string' ? booking.scheduled_date : undefined,
    created: typeof booking.created === 'string' ? booking.created : new Date().toISOString()
  }));

  return { bookings };
};
