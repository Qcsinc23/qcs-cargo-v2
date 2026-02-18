import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createRefund, getPaymentIntent } from '$lib/server/stripe';
import { z } from 'zod';
import { paymentRateLimit } from '$lib/server/rate-limiter';
import { hasRole } from '$lib/server/authz';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

const RefundBodySchema = z.object({
  paymentIntentId: z.string().min(1),
  amount: z
    .number()
    .optional()
    .refine((n) => n === undefined || n > 0, 'Amount must be positive'),
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
  // Require authentication and admin privileges
  if (!locals.user) {
    return json(
      { status: 'error', error_code: 'AUTH_REQUIRED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check for admin privileges (in production, implement proper role-based access)
  if (!hasRole(locals.user, ['admin'])) {
    return json(
      { status: 'error', error_code: 'INSUFFICIENT_PERMISSIONS', message: 'Admin access required' },
      { status: 403 }
    );
  }

  // Apply rate limiting
  const rateLimitResult = paymentRateLimit.check(locals.user.id);
  if (!rateLimitResult.allowed) {
    return json(
      {
        status: 'error',
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many refund attempts. Please try again later.'
      },
      { status: 429 }
    );
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const body = await request.json();
    const parsed = RefundBodySchema.safeParse(body);

    if (!parsed.success) {
      return json(
        {
          status: 'error',
          error_code: 'INVALID_INPUT',
          message: 'Invalid request body',
          data: { issues: parsed.error.issues }
        },
        { status: 400 }
      );
    }

    const { paymentIntentId, amount, reason = 'requested_by_customer' } = parsed.data;

    // Verify the payment intent exists and was successful
    const paymentIntent = await getPaymentIntent(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return json(
        {
          status: 'error',
          error_code: 'INVALID_PAYMENT_INTENT',
          message: 'Payment intent must be in succeeded state to issue refund'
        },
        { status: 400 }
      );
    }

    // Check if there's already a successful refund for this payment intent.
    try {
      const existingRefunds = await locals.pb.collection('refunds').getList(1, 1, {
        filter: `payment_intent_id = "${escapePbFilterValue(paymentIntentId)}" && status = "succeeded"`,
        fields: 'id,refund_id'
      });
      if (existingRefunds.totalItems > 0) {
        const existingRefund = existingRefunds.items[0];
        return json(
          {
            status: 'error',
            error_code: 'ALREADY_REFUNDED',
            message: 'This payment has already been refunded',
            data: { refundId: existingRefund.refund_id }
          },
          { status: 400 }
        );
      }
    } catch (duplicateCheckErr) {
      // Continue with Stripe refund even if local audit collection is unavailable.
      console.warn('[refund] Failed to check local refund records; continuing', {
        correlationId,
        paymentIntentId,
        error: duplicateCheckErr instanceof Error ? duplicateCheckErr.message : String(duplicateCheckErr)
      });
    }

    // Create the refund
    const refund = await createRefund({
      paymentIntentId,
      amount,
      reason
    });

    // Update booking payment status if full refund
    if (!amount || amount >= paymentIntent.amount) {
      // Find the associated booking
      if (paymentIntent.metadata.booking_id) {
        const bookingId = sanitizePocketBaseId(paymentIntent.metadata.booking_id);
        if (bookingId) {
          const booking = await locals.pb.collection('bookings').getOne(bookingId, {
            fields: 'id,status'
          });

          const currentStatus = String(booking.status || 'pending_payment');
          const nextStatus =
            currentStatus === 'in_progress' || currentStatus === 'completed'
              ? currentStatus
              : 'canceled';

          await locals.pb.collection('bookings').update(bookingId, {
            payment_status: 'refunded',
            status: nextStatus,
            payment_intent_id: paymentIntentId
          });
        }

        console.log('[refund] Booking marked as refunded', {
          correlationId,
          bookingId: paymentIntent.metadata.booking_id,
          refundId: refund.id
        });
      }
    }

    // Create refund record for tracking
    try {
      await locals.pb.collection('refunds').create({
        payment_intent_id: paymentIntentId,
        refund_id: refund.id,
        amount: refund.amount / 100, // Convert to dollars
        currency: refund.currency,
        status: refund.status,
        reason,
        booking_id: paymentIntent.metadata.booking_id,
        user_id: paymentIntent.metadata.user_id,
        processed_by: locals.user.id,
        created: new Date().toISOString()
      });
    } catch (recordErr) {
      console.warn('[refund] Refund audit record creation failed', {
        correlationId,
        paymentIntentId,
        refundId: refund.id,
        error: recordErr instanceof Error ? recordErr.message : String(recordErr)
      });
    }

    console.log('[refund] Refund processed successfully', {
      correlationId,
      paymentIntentId,
      refundId: refund.id,
      amount: refund.amount / 100,
      reason
    });

    return json({
      status: 'success',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        created: refund.created
      }
    });
  } catch (err) {
    console.error('[refund] Error', { correlationId, error: err });

    const e = err as any;
    const stripeStatusCode = e?.statusCode;
    const message = typeof e?.message === 'string' ? e.message : 'Failed to process refund';

    const status =
      typeof stripeStatusCode === 'number' && stripeStatusCode >= 400 && stripeStatusCode < 600
        ? stripeStatusCode
        : 500;

    return json(
      {
        status: 'error',
        error_code: e?.code || 'REFUND_FAILED',
        message
      },
      { status }
    );
  }
};

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const requestedUserId = sanitizePocketBaseId(url.searchParams.get('userId') || '');
  const userId = locals.user.role === 'admin' ? requestedUserId || locals.user.id : locals.user.id;
  const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
  const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '25', 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 25;

  try {
    const refunds = await locals.pb.collection('refunds').getList(page, perPage, {
      filter: `user_id = "${escapePbFilterValue(userId)}"`,
      sort: '-created',
      expand: 'booking_id'
    });

    const mappedRefunds = refunds.items.map((refund) => ({
      id: refund.id,
      paymentIntentId: refund.payment_intent_id,
      refundId: refund.refund_id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      bookingId: refund.booking_id,
      createdAt: refund.created,
      booking: refund.expand?.booking_id
    }));

    return json({
      status: 'success',
      data: mappedRefunds,
      page: refunds.page,
      perPage: refunds.perPage,
      totalItems: refunds.totalItems,
      totalPages: refunds.totalPages
    });
  } catch (err) {
    console.error('[get_refunds] Error', err);
    throw error(500, { message: 'Failed to fetch refunds' });
  }
};
