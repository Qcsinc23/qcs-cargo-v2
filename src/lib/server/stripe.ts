import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Lazy initialization of Stripe
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
    }
    stripeInstance = new Stripe(secretKey, {
      // Use apiVersion compatible with the installed stripe@14.7.0 type declarations
      apiVersion: '2023-10-16',
      typescript: true,
      telemetry: false // Disable telemetry for production
    });
  }
  return stripeInstance;
}

export const stripe = {
  get paymentIntents() { return getStripe().paymentIntents; },
  get customers() { return getStripe().customers; },
  get refunds() { return getStripe().refunds; },
  get webhooks() { return getStripe().webhooks; }
};

// Deprecated: direct export for backwards compatibility
export const _stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  }
});


/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  bookingId: string;
  description: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}): Promise<Stripe.PaymentIntent> {
  const { amount, currency = 'usd', customerId, bookingId, description, metadata = {}, idempotencyKey } = params;

  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount,
    currency,
    description,
    metadata: {
      booking_id: bookingId,
      ...metadata
    },
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never' // Disable redirects for better security
    },
    // Add payment method configuration for better UX
    payment_method_types: ['card', 'us_bank_account'], // Support cards and ACH
    setup_future_usage: 'off_session' // Allow saving cards for future use
  };

  if (customerId) {
    paymentIntentParams.customer = customerId;
  }

  const options: Stripe.RequestOptions = {};
  if (idempotencyKey) {
    options.idempotencyKey = idempotencyKey;
  }

  return stripe.paymentIntents.create(paymentIntentParams, options);
}

/**
 * Create or get a Stripe customer for a user
 */
export async function getOrCreateCustomer(params: {
  userId: string;
  email: string;
  name: string;
  existingStripeCustomerId?: string;
}): Promise<string> {
  const { userId, email, name, existingStripeCustomerId } = params;

  // If user already has a Stripe customer ID, verify it exists
  if (existingStripeCustomerId) {
    try {
      await stripe.customers.retrieve(existingStripeCustomerId);
      return existingStripeCustomerId;
    } catch (err) {
      const e = err as any;
      const statusCode = e?.statusCode;

      // Only fall back to creating a new customer when the customer truly doesn't exist.
      if (statusCode !== 404) {
        throw err;
      }
    }
  }

  // Reduce accidental duplicate customers: try searching by metadata/user_id (best-effort).
  try {
    const results = await stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
      limit: 1
    });
    const found = results.data?.[0]?.id;
    if (found) {
      return found;
    }
  } catch {
    // Best-effort only; proceed to create.
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      user_id: userId
    }
  });

  return customer.id;
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Create a payment intent with timeout handling
 */
export async function createPaymentIntentWithTimeout(params: {
  amount: number;
  currency?: string;
  customerId?: string;
  bookingId: string;
  description: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
  timeoutMinutes?: number;
}): Promise<Stripe.PaymentIntent> {
  const { timeoutMinutes = 30, ...otherParams } = params;

  // Create payment intent
  const paymentIntent = await createPaymentIntent(otherParams);

  // Schedule automatic cancellation if payment is not completed
  // In production, this should be handled by a job queue (e.g., BullMQ, Agenda)
  const cancelAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

  // Store cancellation schedule (you'd implement this with your job queue)
  console.log(`Payment intent ${paymentIntent.id} scheduled for cancellation at ${cancelAt.toISOString()}`);

  return paymentIntent;
}

/**
 * Handle payment timeout
 */
export async function handlePaymentTimeout(paymentIntentId: string): Promise<void> {
  try {
    // Check if payment intent is still in pending state
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'requires_payment_method') {
      // Cancel the payment intent
      await cancelPaymentIntent(paymentIntentId);
      console.log(`Payment intent ${paymentIntentId} cancelled due to timeout`);
    }
  } catch (error) {
    console.error(`Failed to handle timeout for payment intent ${paymentIntentId}:`, error);
  }
}

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Issue a refund for a payment intent
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amount?: number; // partial refund in cents, omit for full refund
  reason?: Stripe.RefundCreateParams.Reason;
}): Promise<Stripe.Refund> {
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = params;

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason
  };

  if (amount) {
    refundParams.amount = amount;
  }

  return stripe.refunds.create(refundParams);
}
