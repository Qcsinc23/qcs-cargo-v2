import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPaymentIntent, getOrCreateCustomer, getPaymentIntent } from '$lib/server/stripe';
import { z } from 'zod';
import { paymentRateLimit } from '$lib/server/rate-limiter';
import { sanitizePocketBaseId } from '$lib/server/pb-filter';

const CreateIntentBodySchema = z.object({
  bookingId: z.string().min(1).max(64),
  description: z.string().max(500).optional()
});

const ACTIVE_INTENT_STATUSES = new Set([
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'processing'
]);

function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json(
      { status: 'error', error_code: 'AUTH_REQUIRED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const rateLimitResult = paymentRateLimit.check(locals.user.id);
  if (!rateLimitResult.allowed) {
    return json(
      {
        status: 'error',
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many payment attempts. Please try again later.',
        data: { resetTime: new Date(rateLimitResult.resetTime).toISOString() }
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const correlationId = locals.correlationId || crypto.randomUUID();

  try {
    const parsed = CreateIntentBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return json(
        {
          status: 'error',
          error_code: 'INVALID_INPUT',
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

    const bookingId = sanitizePocketBaseId(parsed.data.bookingId);
    if (!bookingId) {
      return json(
        { status: 'error', error_code: 'INVALID_BOOKING_ID', message: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const booking = await locals.pb.collection('bookings').getOne(bookingId, {
      fields: 'id,user,total_cost,status,payment_status,payment_intent_id'
    });

    if (booking.user !== locals.user.id) {
      return json(
        { status: 'error', error_code: 'FORBIDDEN', message: 'Booking does not belong to current user' },
        { status: 403 }
      );
    }

    if (!['pending_payment', 'payment_failed'].includes(String(booking.status))) {
      return json(
        {
          status: 'error',
          error_code: 'BOOKING_NOT_PAYABLE',
          message: 'Booking is not in a payable state'
        },
        { status: 409 }
      );
    }

    if (['paid', 'refunded', 'canceled'].includes(String(booking.payment_status))) {
      return json(
        {
          status: 'error',
          error_code: 'BOOKING_ALREADY_SETTLED',
          message: 'Booking payment is already settled'
        },
        { status: 409 }
      );
    }

    const bookingTotal = Number(booking.total_cost);
    if (!Number.isFinite(bookingTotal) || bookingTotal <= 0) {
      console.error('[create_payment_intent] Invalid booking total', {
        correlationId,
        bookingId: booking.id,
        bookingTotal: booking.total_cost
      });
      return json(
        {
          status: 'error',
          error_code: 'INVALID_BOOKING_TOTAL',
          message: 'Booking total is invalid. Please contact support.'
        },
        { status: 500 }
      );
    }

    const amountCents = dollarsToCents(bookingTotal);
    const existingPaymentIntentId = typeof booking.payment_intent_id === 'string' ? booking.payment_intent_id : '';

    if (existingPaymentIntentId) {
      try {
        const existingIntent = await getPaymentIntent(existingPaymentIntentId);
        if (
          existingIntent.amount === amountCents &&
          ACTIVE_INTENT_STATUSES.has(existingIntent.status) &&
          existingIntent.client_secret
        ) {
          return json({
            status: 'success',
            data: {
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id
            }
          });
        }
      } catch (existingErr) {
        console.warn('[create_payment_intent] Existing intent not reusable', {
          correlationId,
          bookingId,
          paymentIntentId: existingPaymentIntentId,
          error: existingErr instanceof Error ? existingErr.message : String(existingErr)
        });
      }
    }

    const stripeCustomerId = await getOrCreateCustomer({
      userId: locals.user.id,
      email: locals.user.email,
      name: locals.user.name || locals.user.email,
      existingStripeCustomerId: locals.user.stripe_customer_id
    });

    if (!locals.user.stripe_customer_id && stripeCustomerId) {
      try {
        const fresh = await locals.pb.collection('users').getOne(locals.user.id, {
          fields: 'stripe_customer_id'
        });
        if (!fresh?.stripe_customer_id) {
          await locals.pb.collection('users').update(locals.user.id, { stripe_customer_id: stripeCustomerId });
        }
      } catch (saveCustomerErr) {
        console.error('[create_payment_intent] Failed to persist stripe_customer_id', saveCustomerErr);
      }
    }

    const idempotencyKey = `payment_intent_${locals.user.id}_${booking.id}_${amountCents}`;

    const paymentIntent = await createPaymentIntent({
      amount: amountCents,
      customerId: stripeCustomerId,
      bookingId: booking.id,
      description: parsed.data.description || `QCS Cargo Booking ${booking.id}`,
      metadata: {
        user_id: locals.user.id,
        user_email: locals.user.email,
        correlation_id: correlationId,
        booking_total_cents: String(amountCents)
      },
      idempotencyKey
    });

    try {
      await locals.pb.collection('bookings').update(booking.id, {
        payment_intent_id: paymentIntent.id,
        payment_status: 'processing'
      });
    } catch (updateErr) {
      console.error('[create_payment_intent] Failed to persist payment intent id', {
        correlationId,
        bookingId: booking.id,
        paymentIntentId: paymentIntent.id,
        error: updateErr
      });
    }

    return json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (err) {
    const e = err as any;
    const stripeStatusCode = e?.statusCode;
    const stripeCode = e?.code;
    const message = typeof e?.message === 'string' ? e.message : 'Failed to create payment intent';

    console.error('[create_payment_intent] Error', { correlationId, error: err });

    const status =
      typeof stripeStatusCode === 'number' && stripeStatusCode >= 400 && stripeStatusCode < 600
        ? stripeStatusCode
        : 500;

    return json(
      {
        status: 'error',
        error_code: stripeCode || 'CREATE_INTENT_FAILED',
        message
      },
      {
        status,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    );
  }
};
