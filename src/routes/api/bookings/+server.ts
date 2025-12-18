import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Generate tracking number: QCS-YYYYMMDD-XXXX
function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCS-${dateStr}-${random}`;
}

// Generate QR code data URL (simple implementation)
function generateQRCodeData(trackingNumber: string): string {
  // In production, use a proper QR library like 'qrcode'
  // For now, return a placeholder that can be rendered
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingNumber)}`;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const {
      serviceType,
      destination,
      scheduledDate,
      timeSlot,
      packages,
      recipientId,
      recipient: newRecipient,
      quote,
      specialInstructions
    } = body;

    // Validate required fields
    if (!serviceType || !destination || !scheduledDate || !timeSlot || !packages?.length) {
      throw error(400, { message: 'Missing required booking fields' });
    }

    console.log('[create_booking]', {
      correlationId,
      userId: locals.user.id,
      serviceType,
      destination,
      packageCount: packages.length
    });

    // Handle recipient - either use existing or create new
    let finalRecipientId = recipientId;

    if (!recipientId && newRecipient) {
      // Create new recipient
      const createdRecipient = await locals.pb.collection('recipients').create({
        user: locals.user.id,
        name: newRecipient.name,
        phone: newRecipient.phone,
        address_line1: newRecipient.addressLine1,
        address_line2: newRecipient.addressLine2 || '',
        city: newRecipient.city,
        destination: newRecipient.destination || destination,
        delivery_instructions: newRecipient.deliveryInstructions || '',
        is_default: newRecipient.saveForFuture && !recipientId
      });
      finalRecipientId = createdRecipient.id;

      console.log('[create_booking] Created new recipient', {
        correlationId,
        recipientId: finalRecipientId
      });
    }

    // Transform service type to match database schema
    const dbServiceType = serviceType === 'door-to-door' ? 'door_to_door' : serviceType;

    // Create booking record
    const booking = await locals.pb.collection('bookings').create({
      user: locals.user.id,
      recipient: finalRecipientId || null,
      service_type: dbServiceType,
      destination,
      scheduled_date: scheduledDate,
      time_slot: timeSlot,
      package_count: packages.length,
      total_weight: quote?.packages?.reduce((sum: number, p: { weight: number }) => sum + (p.weight || 0), 0) || 0,
      subtotal: quote?.subtotal || 0,
      discount: quote?.multiPackageDiscount || 0,
      insurance_cost: quote?.insuranceCost || 0,
      total_cost: quote?.totalCost || 0,
      status: 'pending_payment',
      payment_status: 'pending',
      special_instructions: specialInstructions || ''
    });

    console.log('[create_booking] Booking created', {
      correlationId,
      bookingId: booking.id
    });

    // Create package records
    const createdPackages = [];
    for (const pkg of packages) {
      const trackingNumber = generateTrackingNumber();
      const qrCode = generateQRCodeData(trackingNumber);

      const createdPkg = await locals.pb.collection('packages').create({
        booking: booking.id,
        tracking_number: trackingNumber,
        qr_code: qrCode,
        weight: pkg.weight,
        weight_unknown: pkg.weightUnknown || false,
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        dimensions_unknown: pkg.dimensionsUnknown || false,
        dim_weight: pkg.dimWeight || null,
        billable_weight: pkg.billableWeight || pkg.weight,
        declared_value: pkg.declaredValue,
        contents_description: pkg.contentsDescription || '',
        special_instructions: pkg.specialInstructions || '',
        cost: pkg.cost || 0
      });

      createdPackages.push({
        id: createdPkg.id,
        trackingNumber,
        qrCode
      });
    }

    console.log('[create_booking] Packages created', {
      correlationId,
      bookingId: booking.id,
      packageCount: createdPackages.length
    });

    return json({
      status: 'success',
      data: {
        bookingId: booking.id,
        packages: createdPackages,
        totalCost: quote?.totalCost || 0,
        status: 'pending_payment'
      }
    });
  } catch (err) {
    console.error('[create_booking] Error', { correlationId, error: err });

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to create booking' });
  }
};

// Whitelist of valid booking statuses (prevents filter injection)
const VALID_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
  'under_review'
] as const;

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
  const status = url.searchParams.get('status');

  try {
    // BUG FIX: Prevent filter injection by validating status against whitelist
    let filter = `user = "${locals.user.id}"`;
    if (status && status !== 'all' && VALID_BOOKING_STATUSES.includes(status as any)) {
      filter += ` && status = "${status}"`;
    }

    const result = await locals.pb.collection('bookings').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'recipient'
    });

    return json({
      status: 'success',
      data: {
        items: result.items,
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    console.error('[get_bookings] Error', err);
    throw error(500, { message: 'Failed to fetch bookings' });
  }
};

