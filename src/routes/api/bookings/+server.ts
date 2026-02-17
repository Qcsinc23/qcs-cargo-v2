import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import {
  calculateBookingPricing,
  normalizeServiceType,
  type BookingServiceType
} from '$lib/pricing/booking-pricing';
import { sanitizePocketBaseId } from '$lib/server/pb-filter';

const PackageSchema = z
  .object({
    id: z.string().min(1).max(120),
    weight: z.number().finite().positive().nullable().optional(),
    weightUnknown: z.boolean().optional().default(false),
    length: z.number().finite().positive().nullable().optional(),
    width: z.number().finite().positive().nullable().optional(),
    height: z.number().finite().positive().nullable().optional(),
    dimensionsUnknown: z.boolean().optional().default(false),
    declaredValue: z.number().finite().nonnegative().nullable().optional(),
    contentsDescription: z.string().max(1000).optional().default(''),
    specialInstructions: z.string().max(2000).optional().default('')
  })
  .superRefine((pkg, ctx) => {
    if (!pkg.weightUnknown && (!pkg.weight || pkg.weight <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weight'],
        message: 'Weight is required when weightUnknown is false'
      });
    }
  });

const RecipientSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(6).max(40),
  addressLine1: z.string().min(1).max(300),
  addressLine2: z.string().max(300).optional().default(''),
  city: z.string().min(1).max(120),
  destination: z.string().min(1).max(64).optional(),
  deliveryInstructions: z.string().max(1000).optional().default(''),
  saveForFuture: z.boolean().optional().default(false)
});

const CreateBookingBodySchema = z
  .object({
    serviceType: z.enum(['standard', 'express', 'door-to-door', 'consolidated']),
    destination: z.string().min(1).max(64),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: z.string().min(1).max(80),
    packages: z.array(PackageSchema).min(1).max(20),
    recipientId: z.string().min(1).max(64).optional().nullable(),
    recipient: RecipientSchema.optional().nullable(),
    specialInstructions: z.string().max(2000).optional().default('')
  })
  .superRefine((data, ctx) => {
    if (!data.recipientId && !data.recipient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recipient'],
        message: 'Either recipientId or recipient is required'
      });
    }
  });

// Generate tracking number: QCS-YYYYMMDD-XXXX
function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCS-${dateStr}-${random}`;
}

function generateQRCodeData(trackingNumber: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingNumber)}`;
}

function normalizeScheduledDate(rawDate: string): string {
  const parsed = new Date(`${rawDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw error(400, { message: 'Invalid scheduledDate' });
  }

  const day = parsed.getUTCDay();
  if (day === 0) {
    throw error(400, { message: 'Bookings are not available on Sundays' });
  }

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const scheduledUtc = new Date(parsed);
  scheduledUtc.setUTCHours(0, 0, 0, 0);
  if (scheduledUtc.getTime() <= todayUtc.getTime()) {
    throw error(400, { message: 'scheduledDate must be in the future' });
  }

  return rawDate;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const parsed = CreateBookingBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return json(
        {
          status: 'error',
          message: 'Invalid request body',
          data: {
            issues: parsed.error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message
            }))
          }
        },
        { status: 400 }
      );
    }

    const {
      serviceType,
      destination: rawDestination,
      scheduledDate: rawScheduledDate,
      timeSlot,
      packages,
      recipientId,
      recipient: newRecipient,
      specialInstructions
    } = parsed.data;

    const destination = rawDestination.trim().toLowerCase();
    const scheduledDate = normalizeScheduledDate(rawScheduledDate);

    const pricing = calculateBookingPricing({
      destination,
      serviceType,
      packages: packages.map((pkg) => ({
        id: pkg.id,
        weight: pkg.weight ?? null,
        weightUnknown: pkg.weightUnknown,
        length: pkg.length ?? null,
        width: pkg.width ?? null,
        height: pkg.height ?? null,
        declaredValue: pkg.declaredValue ?? null
      }))
    });

    if (!Number.isFinite(pricing.totalCost) || pricing.totalCost <= 0) {
      throw error(400, { message: 'Calculated booking total is invalid' });
    }

    console.log('[create_booking]', {
      correlationId,
      userId: locals.user.id,
      serviceType,
      destination,
      packageCount: packages.length,
      totalCost: pricing.totalCost
    });

    let finalRecipientId: string | null = null;
    const normalizedRecipientId = recipientId ? sanitizePocketBaseId(recipientId) : null;
    if (recipientId && !normalizedRecipientId) {
      throw error(400, { message: 'Invalid recipientId' });
    }

    if (normalizedRecipientId) {
      const existingRecipient = await locals.pb.collection('recipients').getOne(normalizedRecipientId, {
        fields: 'id,user'
      });
      if (existingRecipient.user !== locals.user.id) {
        throw error(403, { message: 'Recipient does not belong to current user' });
      }
      finalRecipientId = existingRecipient.id;
    } else if (newRecipient) {
      const createdRecipient = await locals.pb.collection('recipients').create({
        user: locals.user.id,
        name: newRecipient.name.trim(),
        phone: newRecipient.phone.trim(),
        address_line1: newRecipient.addressLine1.trim(),
        address_line2: newRecipient.addressLine2?.trim() || '',
        city: newRecipient.city.trim(),
        destination: (newRecipient.destination || destination).trim().toLowerCase(),
        delivery_instructions: newRecipient.deliveryInstructions?.trim() || '',
        is_default: !!newRecipient.saveForFuture
      });
      finalRecipientId = createdRecipient.id;
    }

    const bookingData = {
      user: locals.user.id,
      recipient: finalRecipientId,
      service_type: normalizeServiceType(serviceType as BookingServiceType),
      destination,
      scheduled_date: scheduledDate,
      time_slot: timeSlot,
      package_count: packages.length,
      total_weight: pricing.totalWeight,
      subtotal: pricing.subtotal,
      discount: pricing.multiPackageDiscount,
      insurance_cost: pricing.insuranceCost,
      total_cost: pricing.totalCost,
      status: 'pending_payment',
      payment_status: 'pending',
      special_instructions: specialInstructions || ''
    };

    const booking = await locals.pb.collection('bookings').create(bookingData);

    const createdPackages: Array<{ id: string; trackingNumber: string; qrCode: string }> = [];
    const createdPackageIds: string[] = [];
    const quoteById = new Map(pricing.packages.map((pkg) => [pkg.id, pkg]));

    try {
      for (const pkg of packages) {
        const quote = quoteById.get(pkg.id);
        if (!quote) {
          throw error(400, { message: `Missing calculated quote for package ${pkg.id}` });
        }

        const trackingNumber = generateTrackingNumber();
        const qrCode = generateQRCodeData(trackingNumber);

        const createdPkg = await locals.pb.collection('packages').create({
          booking: booking.id,
          tracking_number: trackingNumber,
          qr_code: qrCode,
          weight: pkg.weightUnknown ? null : pkg.weight,
          weight_unknown: pkg.weightUnknown,
          length: pkg.length ?? null,
          width: pkg.width ?? null,
          height: pkg.height ?? null,
          dimensions_unknown: pkg.dimensionsUnknown,
          dim_weight: quote.dimWeight,
          billable_weight: quote.billableWeight,
          declared_value: pkg.declaredValue ?? 0,
          contents_description: pkg.contentsDescription || '',
          special_instructions: pkg.specialInstructions || '',
          cost: quote.cost
        });

        createdPackageIds.push(createdPkg.id);
        createdPackages.push({
          id: createdPkg.id,
          trackingNumber,
          qrCode
        });
      }
    } catch (packageError: any) {
      console.error('[create_booking] Package creation failed, rolling back', {
        correlationId,
        bookingId: booking.id,
        error: packageError?.message || packageError
      });

      for (const packageId of createdPackageIds) {
        try {
          await locals.pb.collection('packages').delete(packageId);
        } catch (rollbackError) {
          console.error('[create_booking] Failed to rollback package', packageId, rollbackError);
        }
      }

      try {
        await locals.pb.collection('bookings').delete(booking.id);
      } catch (bookingDeleteError) {
        console.error('[create_booking] Failed to rollback booking', bookingDeleteError);
      }

      throw packageError;
    }

    return json({
      status: 'success',
      data: {
        bookingId: booking.id,
        packages: createdPackages,
        totalCost: pricing.totalCost,
        status: 'pending_payment'
      }
    });
  } catch (err) {
    const details: Record<string, unknown> = {
      correlationId,
      userId: locals.user?.id,
      message: err instanceof Error ? err.message : String(err)
    };
    console.error('[create_booking] Error', details);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to create booking' });
  }
};

const VALID_BOOKING_STATUSES = [
  'draft',
  'pending_payment',
  'confirmed',
  'payment_failed',
  'in_progress',
  'completed',
  'canceled',
  'cancelled'
] as const;

function isValidBookingStatus(value: string): value is (typeof VALID_BOOKING_STATUSES)[number] {
  return (VALID_BOOKING_STATUSES as readonly string[]).includes(value);
}

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
  const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '10', 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 10;
  const requestedStatus = url.searchParams.get('status');

  try {
    let filter = `user = "${locals.user.id}"`;

    if (requestedStatus && requestedStatus !== 'all' && isValidBookingStatus(requestedStatus)) {
      const normalizedStatus = requestedStatus === 'cancelled' ? 'canceled' : requestedStatus;
      filter += ` && status = "${normalizedStatus}"`;
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
