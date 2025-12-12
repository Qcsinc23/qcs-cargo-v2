import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPaymentIntent, getOrCreateCustomer } from '$lib/server/stripe';
import { z } from 'zod';
import { paymentRateLimit } from '$lib/server/rate-limiter';

const CreateIntentBodySchema = z.object({
  amount: z.union([z.number(), z.string()]),
  bookingId: z.string().min(1).max(200),
  description: z.string().max(500).optional()
});

function parseAmountToCents(amount: unknown): { ok: true; cents: number } | { ok: false; message: string } {
  if (typeof amount === 'string') {
    const trimmed = amount.trim();
    // Strict money format: "12" or "12.3" or "12.34"
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      return { ok: false, message: 'Invalid amount format' };
    }
    const [dollarsPart, centsPart = ''] = trimmed.split('.');
    const dollars = Number(dollarsPart);
    const cents = Number((centsPart + '00').slice(0, 2));
    const total = dollars * 100 + cents;
    if (!Number.isFinite(total) || total <= 0) return { ok: false, message: 'Invalid amount' };
    return { ok: true, cents: total };
  }

  if (typeof amount === 'number') {
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: 'Invalid amount' };
    // Reject values that can’t be represented to exactly 2 decimal places (prevents float rounding surprises).
    const scaled = amount * 100;
    const rounded = Math.round(scaled);
    if (Math.abs(scaled - rounded) > 1e-6) {
      return { ok: false, message: 'Amount must have at most 2 decimal places' };
    }
    return { ok: true, cents: rounded };
  }

  return { ok: false, message: 'Invalid amount' };
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // Require authentication
  if (!locals.user) {
    return json(
      { status: 'error', error_code: 'AUTH_REQUIRED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Apply rate limiting
  const rateLimitResult = paymentRateLimit.check(locals.user.id);
  if (!rateLimitResult.allowed) {
    return json(
      {
        status: 'error',
        error_code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many payment attempts. Please try again later.',
        data: {
          resetTime: new Date(rateLimitResult.resetTime).toISOString()
        }
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
    const body = await request.json();
    const parsed = CreateIntentBodySchema.safeParse(body);
    if (!parsed.success) {
      return json(
        {
          status: 'error',
          error_code: 'INVALID_INPUT',
          message: 'Invalid request body',
          data: { issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) }
        },
        { status: 400 }
      );
    }

    const { amount, bookingId, description } = parsed.data;
    const amountResult = parseAmountToCents(amount);
    if (!amountResult.ok) {
      return json(
        { status: 'error', error_code: 'INVALID_AMOUNT', message: amountResult.message },
        { status: 400 }
      );
    }
    const amountCents = amountResult.cents;

    // Generate idempotency key for payment intent creation
    // This prevents duplicate charges if network issues occur
    // BUG FIX: Removed Date.now() - idempotency key must be stable across retries
    // so that the same bookingId+amount always produces the same key
    const idempotencyKey = `payment_intent_${locals.user.id}_${bookingId}_${amountCents}`;

    
    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateCustomer({
      userId: locals.user.id,
      email: locals.user.email,
      name: locals.user.name || locals.user.email,
      existingStripeCustomerId: locals.user.stripe_customer_id
    });

    
    // If user doesn't have stripe_customer_id saved, update it (best-effort, reduce races by re-reading)
    if (!locals.user.stripe_customer_id && stripeCustomerId) {
      try {
        const fresh = await locals.pb.collection('users').getOne(locals.user.id, {
          fields: 'stripe_customer_id'
        });
        if (!fresh?.stripe_customer_id) {
          await locals.pb.collection('users').update(locals.user.id, { stripe_customer_id: stripeCustomerId });
        }
      } catch (err) {
        console.error('[create_payment_intent] Failed to save stripe_customer_id:', err);
        // Non-fatal, continue
      }
    }

    // Create payment intent (amount in cents)
    const paymentIntent = await createPaymentIntent({
      amount: amountCents,
      customerId: stripeCustomerId,
      bookingId,
      description: description || `QCS Cargo Booking ${bookingId}`,
      metadata: {
        user_id: locals.user.id,
        user_email: locals.user.email,
        correlation_id: correlationId
      },
      idempotencyKey
    });

    
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
    const stripeType = e?.type;
    const message = typeof e?.message === 'string' ? e.message : 'Failed to create payment intent';

    
    console.error('[create_payment_intent] Error', { correlationId, error: err });

    const status = typeof stripeStatusCode === 'number' && stripeStatusCode >= 400 && stripeStatusCode < 600 ? stripeStatusCode : 500;
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
