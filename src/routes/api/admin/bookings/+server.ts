import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { escapePbFilterValue, sanitizePocketBaseId, sanitizeSearchTerm } from '$lib/server/pb-filter';
import { isAdminOrStaff } from '$lib/server/authz';
import {
  calculateBookingPricing,
  normalizeServiceType,
  type BookingServiceType
} from '$lib/pricing/booking-pricing';

const VALID_BOOKING_STATUSES = new Set([
  'draft',
  'pending_payment',
  'confirmed',
  'payment_failed',
  'in_progress',
  'completed',
  'canceled'
]);

const VALID_PAYMENT_STATUSES = new Set([
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
  'canceled'
]);

const AdminPackageSchema = z
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

const AdminRecipientSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(6).max(40),
  addressLine1: z.string().min(1).max(300),
  addressLine2: z.string().max(300).optional().default(''),
  city: z.string().min(1).max(120),
  destination: z.string().min(1).max(64).optional(),
  deliveryInstructions: z.string().max(1000).optional().default(''),
  saveForFuture: z.boolean().optional().default(false)
});

const CreateAdminBookingSchema = z
  .object({
    customerId: z.string().min(1).max(64),
    serviceType: z.enum(['standard', 'express', 'door-to-door', 'consolidated']),
    destination: z.string().min(1).max(64),
    scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: z.string().min(1).max(80),
    packages: z.array(AdminPackageSchema).min(1).max(20),
    recipientId: z.string().min(1).max(64).optional().nullable(),
    recipient: AdminRecipientSchema.optional().nullable(),
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

const UpdateBookingSchema = z.object({
  bookingId: z.string().min(1).max(64),
  status: z.string().optional(),
  paymentStatus: z.string().optional()
});

const CancelBookingSchema = z.object({
  bookingId: z.string().min(1).max(64)
});

function normalizeBookingStatus(status: string): string {
  return status === 'cancelled' ? 'canceled' : status;
}

function generateTrackingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCS-${dateStr}-${random}`;
}

function generateQRCodeData(trackingNumber: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingNumber)}`;
}

function validateScheduledDate(rawDate: string): { valid: true } | { valid: false; message: string } {
  const parsed = new Date(`${rawDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, message: 'Invalid scheduledDate' };
  }

  const day = parsed.getUTCDay();
  if (day === 0) {
    return { valid: false, message: 'Bookings are not available on Sundays' };
  }

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const scheduledUtc = new Date(parsed);
  scheduledUtc.setUTCHours(0, 0, 0, 0);
  if (scheduledUtc.getTime() <= todayUtc.getTime()) {
    return { valid: false, message: 'scheduledDate must be in the future' };
  }

  return { valid: true };
}

async function countBookings(locals: App.Locals, filter: string): Promise<number> {
  return locals.pb
    .collection('bookings')
    .getList(1, 1, { filter, fields: 'id' })
    .then((res) => res.totalItems)
    .catch(() => 0);
}

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = CreateAdminBookingSchema.safeParse(await request.json());
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
      customerId: rawCustomerId,
      serviceType,
      destination: rawDestination,
      scheduledDate,
      timeSlot,
      packages,
      recipientId,
      recipient: newRecipient,
      specialInstructions
    } = parsed.data;

    const customerId = sanitizePocketBaseId(rawCustomerId);
    if (!customerId) {
      return json({ status: 'error', message: 'Invalid customer ID' }, { status: 400 });
    }

    const customer = await locals.pb.collection('users').getOne(customerId, {
      fields: 'id,role,name,email'
    });
    if (String(customer.role || '') !== 'customer') {
      return json({ status: 'error', message: 'Selected user is not a customer' }, { status: 400 });
    }

    const dateValidation = validateScheduledDate(scheduledDate);
    if (!dateValidation.valid) {
      return json({ status: 'error', message: dateValidation.message }, { status: 400 });
    }

    const destination = rawDestination.trim().toLowerCase();
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
      return json({ status: 'error', message: 'Calculated booking total is invalid' }, { status: 400 });
    }

    let finalRecipientId: string | null = null;
    const normalizedRecipientId = recipientId ? sanitizePocketBaseId(recipientId) : null;
    if (recipientId && !normalizedRecipientId) {
      return json({ status: 'error', message: 'Invalid recipientId' }, { status: 400 });
    }

    if (normalizedRecipientId) {
      const existingRecipient = await locals.pb.collection('recipients').getOne(normalizedRecipientId, {
        fields: 'id,user'
      });
      if (existingRecipient.user !== customerId) {
        return json({ status: 'error', message: 'Recipient does not belong to selected customer' }, { status: 403 });
      }
      finalRecipientId = existingRecipient.id;
    } else if (newRecipient) {
      const createdRecipient = await locals.pb.collection('recipients').create({
        user: customerId,
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

    const booking = await locals.pb.collection('bookings').create({
      user: customerId,
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
    });

    const createdPackageIds: string[] = [];
    const createdPackages: Array<{ id: string; trackingNumber: string; qrCode: string }> = [];
    const quoteById = new Map(pricing.packages.map((pkg) => [pkg.id, pkg]));

    try {
      for (const pkg of packages) {
        const quote = quoteById.get(pkg.id);
        if (!quote) {
          throw new Error(`Missing calculated quote for package ${pkg.id}`);
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
    } catch (packageErr) {
      for (const packageId of createdPackageIds) {
        await locals.pb.collection('packages').delete(packageId).catch(() => null);
      }
      await locals.pb.collection('bookings').delete(booking.id).catch(() => null);
      return json({ status: 'error', message: 'Failed to create booking packages' }, { status: 500 });
    }

    await locals.pb
      .collection('activity_logs')
      .create({
        user: locals.user.id,
        action: `Created booking ${booking.id} for customer ${customerId}`,
        resource_type: 'booking',
        resource_id: booking.id,
        metadata: {
          customerId,
          packageCount: packages.length
        }
      })
      .catch(() => null);

    return json({
      status: 'success',
      data: {
        bookingId: booking.id,
        customerId,
        customerName: customer.name || customer.email || customer.id,
        totalCost: pricing.totalCost,
        packages: createdPackages,
        status: 'pending_payment'
      }
    });
  } catch (err) {
    console.error('Admin booking create error:', err);
    return json({ status: 'error', message: 'Failed to create booking' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const search = sanitizeSearchTerm(url.searchParams.get('search') || '');
    const requestedStatus = normalizeBookingStatus((url.searchParams.get('status') || 'all').trim());
    const status = requestedStatus === 'all' || VALID_BOOKING_STATUSES.has(requestedStatus) ? requestedStatus : 'all';
    const dateFilter = (url.searchParams.get('date') || 'all').trim();
    const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 10;

    const filterParts: string[] = [];

    if (search) {
      filterParts.push(
        `(id ~ "${search}" || user.name ~ "${search}" || user.email ~ "${search}")`
      );
    }

    if (status !== 'all') {
      filterParts.push(`status = "${escapePbFilterValue(status)}"`);
    }

    if (dateFilter === 'today' || dateFilter === 'upcoming') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      if (dateFilter === 'today') {
        filterParts.push(
          `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`
        );
      } else {
        filterParts.push(`scheduled_date >= "${startOfDay.toISOString()}"`);
      }
    }

    const filter = filterParts.join(' && ');

    const bookingsList = await locals.pb.collection('bookings').getList(page, perPage, {
      ...(filter ? { filter } : {}),
      sort: '-created',
      expand: 'user,recipient'
    });

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [todayCount, pendingCount, failedPaymentCount] = await Promise.all([
      countBookings(
        locals,
        `scheduled_date >= "${startOfDay.toISOString()}" && scheduled_date < "${endOfDay.toISOString()}"`
      ),
      countBookings(locals, 'status = "pending_payment"'),
      countBookings(locals, 'status = "payment_failed"')
    ]);

    const formattedBookings = bookingsList.items.map((booking) => ({
      id: booking.id,
      customer: booking.expand?.user?.name || 'Unknown',
      customerId: booking.user,
      email: booking.expand?.user?.email || '',
      scheduledDate: booking.scheduled_date,
      timeSlot: booking.time_slot,
      destination: booking.destination,
      packages: booking.package_count,
      status: normalizeBookingStatus(String(booking.status || 'draft')),
      amount: booking.total_cost,
      paymentStatus: booking.payment_status || 'pending',
      serviceType: booking.service_type
    }));

    const payload = {
      bookings: formattedBookings,
      totalItems: bookingsList.totalItems,
      totalPages: bookingsList.totalPages,
      currentPage: page,
      stats: {
        today: todayCount,
        pending: pendingCount,
        paymentFailed: failedPaymentCount
      }
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    return json({ status: 'error', message: 'Failed to fetch bookings' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = UpdateBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const normalizedBookingId = sanitizePocketBaseId(parsed.data.bookingId);
    if (!normalizedBookingId) {
      return json({ status: 'error', message: 'Invalid booking ID' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (parsed.data.status) {
      const normalizedStatus = normalizeBookingStatus(parsed.data.status);
      if (!VALID_BOOKING_STATUSES.has(normalizedStatus)) {
        return json({ status: 'error', message: 'Invalid booking status' }, { status: 400 });
      }
      updateData.status = normalizedStatus;
    }

    if (parsed.data.paymentStatus) {
      const normalizedPaymentStatus = normalizeBookingStatus(parsed.data.paymentStatus);
      if (!VALID_PAYMENT_STATUSES.has(normalizedPaymentStatus)) {
        return json({ status: 'error', message: 'Invalid payment status' }, { status: 400 });
      }
      updateData.payment_status = normalizedPaymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return json({ status: 'error', message: 'No valid fields to update' }, { status: 400 });
    }

    const updatedBooking = await locals.pb.collection('bookings').update(normalizedBookingId, updateData);

    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Updated booking ${normalizedBookingId} status`,
      resource_type: 'booking',
      resource_id: normalizedBookingId,
      metadata: updateData
    }).catch((logErr) => {
      console.warn('Failed to log booking update activity', logErr);
    });

    return json({
      status: 'success',
      data: { booking: updatedBooking },
      success: true,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Booking update error:', err);
    return json({ status: 'error', message: 'Failed to update booking' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  try {
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = CancelBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const bookingId = sanitizePocketBaseId(parsed.data.bookingId);
    if (!bookingId) {
      return json({ status: 'error', message: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await locals.pb.collection('bookings').getOne(bookingId, {
      fields: 'id,payment_status'
    });

    const nextPaymentStatus =
      booking.payment_status === 'paid' || booking.payment_status === 'refunded'
        ? booking.payment_status
        : 'canceled';

    const canceledBooking = await locals.pb.collection('bookings').update(bookingId, {
      status: 'canceled',
      payment_status: nextPaymentStatus
    });

    await locals.pb.collection('activity_logs').create({
      user: locals.user.id,
      action: `Canceled booking ${bookingId}`,
      resource_type: 'booking',
      resource_id: bookingId
    }).catch((logErr) => {
      console.warn('Failed to log booking cancellation activity', logErr);
    });

    return json({
      status: 'success',
      data: { booking: canceledBooking },
      success: true,
      booking: canceledBooking
    });
  } catch (err) {
    console.error('Booking cancellation error:', err);
    return json({ status: 'error', message: 'Failed to cancel booking' }, { status: 500 });
  }
};
