import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createRefund, getPaymentIntent } from '$lib/server/stripe';
import { z } from 'zod';
import { paymentRateLimit } from '$lib/server/rate-limiter';

const RefundBodySchema = z.object({
  paymentIntentId: z.string().min(1),
  amount: z.number().optional().refine(n => !n || n > 0, 'Amount must be positive'),
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
  if (locals.user.role !== 'admin') {
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
        message: 'Too many refund attempts. Please try again later.',
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

    // Check if there's already a refund for this payment intent
    if (paymentIntent.charges?.data?.[0]?.refunds?.data?.length > 0) {
      const existingRefund = paymentIntent.charges.data[0].refunds.data[0];
      if (existingRefund.status === 'succeeded') {
        return json(
          {
            status: 'error',
            error_code: 'ALREADY_REFUNDED',
            message: 'This payment has already been refunded',
            data: { refundId: existingRefund.id }
          },
          { status: 400 }
        );
      }
    }

    // Create the refund
    const refund = await createRefund({
      paymentIntentId,
      amount,
      reason
    });

    // Update booking status if full refund
    if (!amount || amount >= paymentIntent.amount) {
      // Find the associated booking
      if (paymentIntent.metadata.booking_id) {
        await locals.pb.collection('bookings').update(paymentIntent.metadata.booking_id, {
          payment_status: 'refunded',
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_id: refund.id
        });

        console.log('[refund] Booking marked as refunded', {
          correlationId,
          bookingId: paymentIntent.metadata.booking_id,
          refundId: refund.id
        });
      }
    }

    // Create refund record for tracking
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

    const status = typeof stripeStatusCode === 'number' && stripeStatusCode >= 400 && stripeStatusCode < 600
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

  // Users can only view their own refunds, admins can view all
  const userId = locals.user.role === 'admin' ? url.searchParams.get('userId') || locals.user.id : locals.user.id;

  try {
    const refunds = await locals.pb.collection('refunds').getFullList({
      filter: locals.user.role === 'admin'
        ? (userId ? `user_id = "${userId}"` : '')
        : `user_id = "${locals.user.id}"`,
      sort: '-created',
      expand: 'booking_id'
    });

    return json({
      status: 'success',
      data: refunds.map(refund => ({
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
      }))
    });

  } catch (err) {
    console.error('[get_refunds] Error', err);
    throw error(500, { message: 'Failed to fetch refunds' });
  }
};