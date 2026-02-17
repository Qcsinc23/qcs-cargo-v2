import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

const LIST_PAGE_SIZE = 100;
const CANCELED_BOOKING_STATUSES = new Set(['canceled', 'cancelled']);

export type CustomerShipmentSummary = {
  id: string;
  tracking_number: string;
  status: string;
  destination: string;
  weight_lbs: number;
  created: string;
  recipient_name: string;
  estimated_delivery?: string;
  source: 'shipment' | 'package';
};

export type CustomerShipmentDetail = {
  id: string;
  tracking_number: string;
  status: string;
  destination: string;
  weight_lbs: number;
  dim_weight_lbs?: number;
  billable_weight_lbs: number;
  length_in?: number;
  width_in?: number;
  height_in?: number;
  declared_value_usd: number;
  shipping_cost_usd: number;
  insurance_cost_usd: number;
  total_cost_usd: number;
  contents_description: string;
  special_instructions?: string;
  recipient: {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
  };
  created: string;
  estimated_delivery?: string;
  delivered_at?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

async function listAllRecords(locals: App.Locals, collectionName: string, options: Record<string, unknown>) {
  const items: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await locals.pb.collection(collectionName).getList(page, LIST_PAGE_SIZE, options as any);
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}

function mapShipmentSummary(shipment: any): CustomerShipmentSummary {
  const packageWeight = shipment.expand?.package
    ? toNumber(shipment.expand.package.billable_weight, toNumber(shipment.expand.package.weight, 0))
    : 0;

  return {
    id: toString(shipment.id),
    tracking_number: toString(shipment.tracking_number),
    status: toString(shipment.status, 'pending'),
    destination: toString(shipment.destination),
    weight_lbs: toNumber(shipment.actual_weight, toNumber(shipment.weight, packageWeight)),
    created: toString(shipment.created, new Date().toISOString()),
    recipient_name: toString(
      shipment.recipient_name,
      toString(shipment.expand?.booking?.expand?.recipient?.name, 'Recipient')
    ),
    estimated_delivery: toOptionalString(shipment.estimated_delivery),
    source: 'shipment'
  };
}

function mapPackageSummary(pkg: any): CustomerShipmentSummary {
  const booking = pkg.expand?.booking;
  const recipient = booking?.expand?.recipient;
  const status = booking?.payment_status === 'paid' ? 'confirmed' : 'pending';

  return {
    id: `pkg_${toString(pkg.id)}`,
    tracking_number: toString(pkg.tracking_number),
    status,
    destination: toString(booking?.destination),
    weight_lbs: toNumber(pkg.billable_weight, toNumber(pkg.weight, 0)),
    created: toString(pkg.created, toString(booking?.created, new Date().toISOString())),
    recipient_name: toString(recipient?.name, 'Recipient'),
    source: 'package'
  };
}

async function listPackagesForUser(locals: App.Locals, userId: string): Promise<any[]> {
  const safeUserId = escapePbFilterValue(userId);

  try {
    return await listAllRecords(locals, 'packages', {
      filter: `booking.user = "${safeUserId}"`,
      sort: '-created',
      expand: 'booking,booking.recipient'
    });
  } catch {
    const bookings = await listAllRecords(locals, 'bookings', {
      filter: `user = "${safeUserId}"`,
      sort: '-created',
      expand: 'recipient'
    });

    const packages: any[] = [];
    for (const booking of bookings) {
      const bookingId = toString(booking.id);
      if (!bookingId) continue;

      const bookingPackages = await listAllRecords(locals, 'packages', {
        filter: `booking = "${escapePbFilterValue(bookingId)}"`,
        sort: '-created'
      });

      for (const pkg of bookingPackages) {
        packages.push({
          ...pkg,
          expand: {
            ...(pkg.expand || {}),
            booking
          }
        });
      }
    }

    return packages;
  }
}

function mapStatusHistoryEntry(event: any) {
  return {
    status: toString(event?.status, 'pending'),
    timestamp: toString(event?.timestamp, new Date().toISOString()),
    location: toOptionalString(event?.location),
    note: toOptionalString(event?.notes || event?.note)
  };
}

function buildTimelineFromShipment(shipment: any) {
  const timeline: Array<{ status: string; timestamp: string; location?: string; note?: string }> = [];

  if (Array.isArray(shipment.status_history)) {
    for (const event of shipment.status_history) {
      timeline.push(mapStatusHistoryEntry(event));
    }
  }

  if (timeline.length === 0) {
    timeline.push({
      status: toString(shipment.status, 'pending'),
      timestamp: toString(shipment.created, new Date().toISOString()),
      location: toOptionalString(shipment.current_location),
      note: 'Shipment created'
    });
  }

  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return timeline;
}

function mapShipmentDetail(shipment: any): CustomerShipmentDetail {
  const expandedPackage = shipment.expand?.package;
  const expandedBooking = shipment.expand?.booking;
  const recipient = expandedBooking?.expand?.recipient;

  const shippingCost = toNumber(shipment.shipping_cost, toNumber(expandedPackage?.cost, 0));
  const insuranceCost = toNumber(shipment.insurance_cost, toNumber(expandedBooking?.insurance_cost, 0));

  return {
    id: toString(shipment.id),
    tracking_number: toString(shipment.tracking_number),
    status: toString(shipment.status, 'pending'),
    destination: toString(shipment.destination),
    weight_lbs: toNumber(shipment.actual_weight, toNumber(shipment.weight, toNumber(expandedPackage?.weight, 0))),
    dim_weight_lbs: toNumber(shipment.dim_weight, toNumber(expandedPackage?.dim_weight, 0)) || undefined,
    billable_weight_lbs: toNumber(
      shipment.billable_weight,
      toNumber(expandedPackage?.billable_weight, toNumber(shipment.actual_weight, toNumber(shipment.weight, 0)))
    ),
    length_in: toNumber(shipment.length, toNumber(expandedPackage?.length, 0)) || undefined,
    width_in: toNumber(shipment.width, toNumber(expandedPackage?.width, 0)) || undefined,
    height_in: toNumber(shipment.height, toNumber(expandedPackage?.height, 0)) || undefined,
    declared_value_usd: toNumber(shipment.declared_value, toNumber(expandedPackage?.declared_value, 0)),
    shipping_cost_usd: shippingCost,
    insurance_cost_usd: insuranceCost,
    total_cost_usd: toNumber(shipment.total_cost, shippingCost + insuranceCost),
    contents_description: toString(
      shipment.contents_description,
      toString(expandedPackage?.contents_description, 'Package')
    ),
    special_instructions: toOptionalString(
      shipment.special_instructions || expandedPackage?.special_instructions
    ),
    recipient: {
      name: toString(shipment.recipient_name, toString(recipient?.name, 'Recipient')),
      phone: toString(shipment.recipient_phone, toString(recipient?.phone, 'N/A')),
      address_line1: toString(recipient?.address_line1, ''),
      address_line2: toOptionalString(recipient?.address_line2),
      city: toString(recipient?.city, '')
    },
    created: toString(shipment.created, new Date().toISOString()),
    estimated_delivery: toOptionalString(shipment.estimated_delivery),
    delivered_at: toOptionalString(shipment.delivered_at),
    timeline: buildTimelineFromShipment(shipment)
  };
}

function mapPackageDetail(pkg: any): CustomerShipmentDetail {
  const booking = pkg.expand?.booking;
  const recipient = booking?.expand?.recipient;
  const packageCount = Math.max(1, toNumber(booking?.package_count, 1));
  const insuranceShare = toNumber(booking?.insurance_cost, 0) / packageCount;
  const shippingCost = toNumber(pkg.cost, 0);

  const timeline = [
    {
      status: booking?.payment_status === 'paid' ? 'confirmed' : 'pending',
      timestamp: toString(booking?.created, toString(pkg.created, new Date().toISOString())),
      note:
        booking?.payment_status === 'paid'
          ? 'Booking confirmed. Package is awaiting warehouse check-in.'
          : 'Booking created. Complete payment and drop-off to start transit.'
    }
  ];

  return {
    id: `pkg_${toString(pkg.id)}`,
    tracking_number: toString(pkg.tracking_number),
    status: booking?.payment_status === 'paid' ? 'confirmed' : 'pending',
    destination: toString(booking?.destination),
    weight_lbs: toNumber(pkg.weight, 0),
    dim_weight_lbs: toNumber(pkg.dim_weight, 0) || undefined,
    billable_weight_lbs: toNumber(pkg.billable_weight, toNumber(pkg.weight, 0)),
    length_in: toNumber(pkg.length, 0) || undefined,
    width_in: toNumber(pkg.width, 0) || undefined,
    height_in: toNumber(pkg.height, 0) || undefined,
    declared_value_usd: toNumber(pkg.declared_value, 0),
    shipping_cost_usd: shippingCost,
    insurance_cost_usd: insuranceShare,
    total_cost_usd: shippingCost + insuranceShare,
    contents_description: toString(pkg.contents_description, 'Package'),
    special_instructions: toOptionalString(pkg.special_instructions),
    recipient: {
      name: toString(recipient?.name, 'Recipient'),
      phone: toString(recipient?.phone, 'N/A'),
      address_line1: toString(recipient?.address_line1, ''),
      address_line2: toOptionalString(recipient?.address_line2),
      city: toString(recipient?.city, '')
    },
    created: toString(pkg.created, new Date().toISOString()),
    estimated_delivery: toOptionalString(booking?.estimated_delivery),
    timeline
  };
}

export async function listCustomerShipmentSummaries(
  locals: App.Locals,
  userId: string
): Promise<CustomerShipmentSummary[]> {
  const safeUserId = escapePbFilterValue(userId);
  const summaries: CustomerShipmentSummary[] = [];
  const trackedNumbers = new Set<string>();

  let shipmentItems: any[] = [];
  try {
    shipmentItems = await listAllRecords(locals, 'shipments', {
      filter: `user = "${safeUserId}"`,
      sort: '-created',
      expand: 'booking,booking.recipient,package'
    });
  } catch {
    shipmentItems = [];
  }

  for (const shipment of shipmentItems) {
    const summary = mapShipmentSummary(shipment);
    summaries.push(summary);
    if (summary.tracking_number) {
      trackedNumbers.add(summary.tracking_number);
    }
  }

  const packages = await listPackagesForUser(locals, userId);

  for (const pkg of packages) {
    const bookingStatus = toString(pkg.expand?.booking?.status);
    if (CANCELED_BOOKING_STATUSES.has(bookingStatus)) {
      continue;
    }

    const trackingNumber = toString(pkg.tracking_number);
    if (trackingNumber && trackedNumbers.has(trackingNumber)) {
      continue;
    }

    summaries.push(mapPackageSummary(pkg));
  }

  summaries.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  return summaries;
}

export async function getCustomerShipmentDetail(
  locals: App.Locals,
  userId: string,
  rawRouteId: string
): Promise<CustomerShipmentDetail | null> {
  const routeId = rawRouteId.trim();
  const packagePrefixed = routeId.startsWith('pkg_');
  const normalizedId = sanitizePocketBaseId(packagePrefixed ? routeId.slice(4) : routeId);

  if (!normalizedId) {
    return null;
  }

  if (!packagePrefixed) {
    try {
      const shipment = await locals.pb.collection('shipments').getOne(normalizedId, {
        expand: 'booking,booking.recipient,package'
      });

      const ownerId = toString(shipment.user, toString(shipment.expand?.booking?.user));
      if (ownerId !== userId) {
        return null;
      }

      return mapShipmentDetail(shipment);
    } catch {
      // Fall back to package-backed pending detail.
    }
  }

  try {
    const pkg = await locals.pb.collection('packages').getOne(normalizedId, {
      expand: 'booking,booking.recipient'
    });

    const bookingUser = toString(pkg.expand?.booking?.user);
    if (!bookingUser || bookingUser !== userId) {
      return null;
    }

    const bookingStatus = toString(pkg.expand?.booking?.status);
    if (CANCELED_BOOKING_STATUSES.has(bookingStatus)) {
      return null;
    }

    return mapPackageDetail(pkg);
  } catch {
    return null;
  }
}
