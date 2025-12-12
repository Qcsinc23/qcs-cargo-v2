import { json, error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { constructWebhookEvent } from '$lib/server/stripe';
import { sendBookingConfirmationEmail } from '$lib/server/email';
import { sendBookingConfirmation as sendBookingNotifications } from '$lib/server/notifications';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// Create admin PocketBase instance for webhook processing
const adminPb = new PocketBase(PUBLIC_POCKETBASE_URL);

export const POST: RequestHandler = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[stripe_webhook] Missing stripe-signature header');
    throw error(400, { message: 'Missing signature' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe_webhook] STRIPE_WEBHOOK_SECRET not configured');
    throw error(500, { message: 'Webhook not configured' });
  }

  const payload = await request.text();
  const eventId = request.headers.get('stripe-event-id') || '';

  // Implement webhook idempotency by checking if we've already processed this event
  try {
    const existingEvent = await adminPb.collection('webhook_events').getFirstListItem(`event_id = "${eventId}"`);
    if (existingEvent) {
      console.log('[stripe_webhook] Event already processed:', eventId);
      return json({ received: true, status: 'duplicate' });
    }
  } catch {
    // Event not found, proceed with processing
  }

  let event;
  try {
    event = constructWebhookEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe_webhook] Signature verification failed:', err);
    throw error(400, { message: 'Invalid signature' });
  }

  // Log the event for tracking
  console.log('[stripe_webhook] Received event', {
    type: event.type,
    id: event.id,
    created: event.created
  });

  try {
    // Store webhook event to ensure idempotency
    await adminPb.collection('webhook_events').create({
      event_id: event.id,
      event_type: event.type,
      processed: false,
      created: new Date(event.created * 1000).toISOString()
    });

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentActionRequired(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      default:
        console.log('[stripe_webhook] Unhandled event type:', event.type);
    }

    // Mark event as processed
    await adminPb.collection('webhook_events').update(event.id, { processed: true });

    return json({ received: true, processed: true });
  } catch (err) {
    console.error('[stripe_webhook] Error processing event:', {
      eventId: event.id,
      eventType: event.type,
      error: err
    });

    // Update event with error information
    try {
      await adminPb.collection('webhook_events').update(event.id, {
        processed: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        retry_count: 1
      });
    } catch (updateErr) {
      console.error('[stripe_webhook] Failed to update event record:', updateErr);
    }

    // Return 200 to acknowledge receipt (prevents Stripe retries for app errors)
    // but includes error information
    return json({
      received: true,
      processed: false,
      error: err instanceof Error ? err.message : 'Processing error'
    });
  }
};

interface PaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata: {
    booking_id?: string;
    user_id?: string;
    user_email?: string;
    correlation_id?: string;
  };
}

async function handlePaymentSuccess(paymentIntent: PaymentIntentData) {
  const { booking_id, user_id, correlation_id } = paymentIntent.metadata;

  console.log('[stripe_webhook] Payment succeeded', {
    correlationId: correlation_id,
    paymentIntentId: paymentIntent.id,
    bookingId: booking_id,
    amount: paymentIntent.amount / 100
  });

  if (!booking_id) {
    console.warn('[stripe_webhook] No booking_id in metadata');
    return;
  }

  try {
    // Update booking status
    const booking = await adminPb.collection('bookings').update(booking_id, {
      payment_status: 'paid',
      payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString(),
      status: 'confirmed'
    });

    // Create invoice record
    await adminPb.collection('invoices').create({
      booking: booking_id,
      user: user_id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'paid',
      payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString()
    });

    // Get user details and send notifications
    if (user_id) {
      try {
        const user = await adminPb.collection('users').getOne(user_id);

        // Get packages for tracking numbers
        const packages = await adminPb.collection('packages').getFullList({
          filter: `booking = "${booking_id}"`
        });

        const trackingNumbers = packages.map(p => p.tracking_number);

        // Send both email and SMS notifications
        await sendBookingNotifications(user_id, {
          name: user.name || 'Customer',
          email: user.email,
          phone: user.phone,
          bookingId: booking_id,
          destination: booking.destination || 'Caribbean',
          scheduledDate: booking.scheduled_date || 'TBD',
          timeSlot: booking.time_slot || 'TBD',
          packageCount: booking.package_count || 1,
          total: paymentIntent.amount / 100,
          trackingNumbers
        });

        console.log('[stripe_webhook] Confirmation notifications sent', {
          correlationId: correlation_id,
          bookingId: booking_id,
          email: user.email,
          phone: user.phone,
          trackingNumbers: trackingNumbers.length
        });
      } catch (notificationErr) {
        console.error('[stripe_webhook] Failed to send confirmation notifications:', notificationErr);
        // Non-fatal, booking is still confirmed
      }
    }

    console.log('[stripe_webhook] Booking confirmed', {
      correlationId: correlation_id,
      bookingId: booking_id
    });
  } catch (err) {
    console.error('[stripe_webhook] Failed to update booking:', err);
    throw err;
  }
}

async function handlePaymentFailure(paymentIntent: PaymentIntentData) {
  const { booking_id, correlation_id } = paymentIntent.metadata;

  console.log('[stripe_webhook] Payment failed', {
    correlationId: correlation_id,
    paymentIntentId: paymentIntent.id,
    bookingId: booking_id
  });

  if (!booking_id) return;

  try {
    await adminPb.collection('bookings').update(booking_id, {
      payment_status: 'failed',
      payment_intent_id: paymentIntent.id,
      status: 'payment_failed'
    });

    console.log('[stripe_webhook] Booking marked as payment_failed', {
      correlationId: correlation_id,
      bookingId: booking_id
    });
  } catch (err) {
    console.error('[stripe_webhook] Failed to update booking:', err);
  }
}

async function handlePaymentCanceled(paymentIntent: PaymentIntentData) {
  const { booking_id, correlation_id } = paymentIntent.metadata;

  console.log('[stripe_webhook] Payment canceled', {
    correlationId: correlation_id,
    paymentIntentId: paymentIntent.id,
    bookingId: booking_id
  });

  if (!booking_id) return;

  try {
    await adminPb.collection('bookings').update(booking_id, {
      payment_status: 'canceled',
      status: 'canceled'
    });
  } catch (err) {
    console.error('[stripe_webhook] Failed to update booking:', err);
  }
}

async function handlePaymentActionRequired(paymentIntent: PaymentIntentData) {
  const { booking_id, correlation_id } = paymentIntent.metadata;

  console.log('[stripe_webhook] Payment requires action', {
    correlationId: correlation_id,
    paymentIntentId: paymentIntent.id,
    bookingId: booking_id
  });

  if (!booking_id) return;

  try {
    await adminPb.collection('bookings').update(booking_id, {
      payment_status: 'requires_action',
      status: 'pending_payment'
    });
  } catch (err) {
    console.error('[stripe_webhook] Failed to update booking:', err);
  }
}

async function handleDisputeCreated(charge: any) {
  console.log('[stripe_webhook] Dispute created', {
    chargeId: charge.id,
    amount: charge.amount / 100,
    reason: charge.reason
  });

  // Find the payment intent and associated booking
  try {
    if (charge.payment_intent) {
      // Look up booking by payment intent ID
      const bookings = await adminPb.collection('bookings').getFullList({
        filter: `payment_intent_id = "${charge.payment_intent}"`
      });

      for (const booking of bookings) {
        await adminPb.collection('bookings').update(booking.id, {
          payment_status: 'disputed',
          status: 'under_review'
        });

        console.log('[stripe_webhook] Booking marked as disputed', {
          bookingId: booking.id,
          chargeId: charge.id
        });
      }
    }
  } catch (err) {
    console.error('[stripe_webhook] Failed to handle dispute:', err);
  }
}





