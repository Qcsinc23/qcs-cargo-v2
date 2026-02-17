import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';
import { getDestination } from '$lib/config/destinations';

const PACKAGE_PAGE_SIZE = 100;

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function normalizeServiceType(value: unknown): string {
  if (typeof value !== 'string') return 'standard';
  return value.replace(/_/g, '-');
}

function normalizeStatus(value: unknown):
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'canceled'
  | 'cancelled'
  | 'pending_payment'
  | 'payment_failed' {
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

async function listBookingPackages(locals: App.Locals, bookingId: string) {
  const items: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await locals.pb.collection('packages').getList(page, PACKAGE_PAGE_SIZE, {
      filter: `booking = "${escapePbFilterValue(bookingId)}"`,
      sort: 'created'
    });

    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const bookingId = sanitizePocketBaseId(params.id || '');
  if (!bookingId) {
    return { booking: null };
  }

  let booking: any;
  try {
    booking = await locals.pb.collection('bookings').getOne(bookingId, {
      expand: 'recipient'
    });
  } catch {
    return { booking: null };
  }

  if (booking.user !== locals.user.id) {
    throw error(403, { message: 'Access denied' });
  }

  const packages = await listBookingPackages(locals, bookingId);
  const recipient = booking.expand?.recipient;
  const destination = typeof booking.destination === 'string' ? booking.destination : '';
  const destinationConfig = getDestination(destination);

  const mappedPackages = packages.map((pkg: any) => {
    const length = toNumber(pkg.length, 0);
    const width = toNumber(pkg.width, 0);
    const height = toNumber(pkg.height, 0);
    const hasDimensions = length > 0 && width > 0 && height > 0;

    return {
      id: String(pkg.id),
      trackingNumber: typeof pkg.tracking_number === 'string' ? pkg.tracking_number : String(pkg.id),
      weight: toNumber(pkg.billable_weight, toNumber(pkg.weight, 0)),
      dimensions: hasDimensions ? `${length}" × ${width}" × ${height}"` : undefined,
      declaredValue: toNumber(pkg.declared_value, 0),
      contents: typeof pkg.contents_description === 'string' ? pkg.contents_description : 'Package contents'
    };
  });

  return {
    booking: {
      id: String(booking.id),
      confirmationNumber: `QCS-${String(booking.id).toUpperCase().slice(0, 8)}`,
      status: normalizeStatus(booking.status),
      serviceType: normalizeServiceType(booking.service_type),
      destination,
      packages: mappedPackages,
      recipient: {
        name: typeof recipient?.name === 'string' ? recipient.name : 'Recipient',
        phone: typeof recipient?.phone === 'string' ? recipient.phone : 'N/A',
        addressLine1: typeof recipient?.address_line1 === 'string' ? recipient.address_line1 : '',
        addressLine2: toOptionalString(recipient?.address_line2),
        city: typeof recipient?.city === 'string' ? recipient.city : ''
      },
      schedule: {
        date: typeof booking.scheduled_date === 'string' ? booking.scheduled_date : new Date().toISOString(),
        time: typeof booking.time_slot === 'string' ? booking.time_slot : 'TBD'
      },
      cost: {
        subtotal: toNumber(booking.subtotal, 0),
        discount: toNumber(booking.discount, 0),
        insurance: toNumber(booking.insurance_cost, 0),
        total: toNumber(booking.total_cost, 0)
      },
      estimatedDelivery: destinationConfig
        ? `${destinationConfig.transitDays.min}-${destinationConfig.transitDays.max} business days`
        : '3-5 business days',
      createdAt: typeof booking.created === 'string' ? booking.created : new Date().toISOString(),
      paidAt: toOptionalString(booking.paid_at)
    }
  };
};
