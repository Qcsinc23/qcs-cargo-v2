import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { constructWebhookEvent } from '$lib/server/stripe';
import { sendBookingConfirmation as sendBookingNotifications } from '$lib/server/notifications';
import { pb, ensureAdminAuth } from '$lib/server/pocketbase';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

type PaymentIntentData = {
  id: string;
  amount: number;
  currency: string;
  metadata?: {
    booking_id?: string;
    user_id?: string;
    user_email?: string;
    correlation_id?: string;
    booking_total_cents?: string;
  };
};

type ChargeData = {
  id: string;
  amount: number;
  reason?: string;
  payment_intent?: string | null;
};

const WEBHOOK_PAGE_SIZE = 200;

function toEventErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function generateInvoiceNumber(paymentIntentId: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = paymentIntentId.slice(-8).toUpperCase();
  return `INV-${date}-${suffix}`;
}

async function listBookingTrackingNumbers(bookingId: string): Promise<string[]> {
  const trackingNumbers: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const packagePage = await pb.collection('packages').getList(page, WEBHOOK_PAGE_SIZE, {
      filter: `booking = "${escapePbFilterValue(bookingId)}"`,
      fields: 'tracking_number'
    });

    for (const pkg of packagePage.items) {
      const trackingNumber = String(pkg.tracking_number || '').trim();
      if (trackingNumber) {
        trackingNumbers.push(trackingNumber);
      }
    }

    totalPages = packagePage.totalPages;
    page += 1;
  }

  return trackingNumbers;
}

async function listBookingIdsByPaymentIntent(paymentIntentId: string): Promise<string[]> {
  const bookingIds: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const bookingPage = await pb.collection('bookings').getList(page, WEBHOOK_PAGE_SIZE, {
      filter: `payment_intent_id = "${escapePbFilterValue(paymentIntentId)}"`,
      fields: 'id'
    });

    bookingIds.push(...bookingPage.items.map((booking) => String(booking.id)));
    totalPages = bookingPage.totalPages;
    page += 1;
  }

  return bookingIds;
}

async function findWebhookEvent(eventId: string) {
  try {
    return await pb
      .collection('webhook_events')
      .getFirstListItem(`event_id = "${escapePbFilterValue(eventId)}"`);
  } catch (err) {
    console.warn('[stripe_webhook] webhook_events lookup unavailable, continuing without DB idempotency', {
      eventId,
      error: toEventErrorMessage(err)
    });
    return null;
  }
}

async function createWebhookEventRecord(eventId: string, eventType: string, created: number) {
  try {
    const record = await pb.collection('webhook_events').create({
      event_id: eventId,
      event_type: eventType,
      processed: false,
      created: new Date(created * 1000).toISOString()
    });
    return record?.id ?? null;
  } catch (err) {
    console.warn('[stripe_webhook] webhook_events create unavailable, continuing', {
      eventId,
      error: toEventErrorMessage(err)
    });
    return null;
  }
}

async function markWebhookEventProcessed(recordId: string, processed: boolean, errorMessage?: string) {
  try {
    await pb.collection('webhook_events').update(recordId, {
      processed,
      ...(errorMessage ? { error: errorMessage } : {})
    });
  } catch (err) {
    console.warn('[stripe_webhook] webhook_events update failed', {
      recordId,
      error: toEventErrorMessage(err)
    });
  }
}

export const POST: RequestHandler = async ({ request }) => {
  if (!env.POCKETBASE_ADMIN_EMAIL || !env.POCKETBASE_ADMIN_PASSWORD) {
    console.error('[stripe_webhook] PocketBase admin credentials not configured');
    throw error(500, { message: 'Webhook not configured' });
  }
  await ensureAdminAuth();

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    console.error('[stripe_webhook] Missing stripe-signature header');
    throw error(400, { message: 'Missing signature' });
  }

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[stripe_webhook] STRIPE_WEBHOOK_SECRET not configured');
    throw error(500, { message: 'Webhook not configured' });
  }

  const payload = await request.text();

  let event;
  try {
    event = constructWebhookEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[stripe_webhook] Signature verification failed', err);
    throw error(400, { message: 'Invalid signature' });
  }

  console.log('[stripe_webhook] Received event', {
    id: event.id,
    type: event.type,
    created: event.created
  });

  const existingEvent = await findWebhookEvent(event.id);
  if (existingEvent?.processed) {
    return json({ received: true, duplicate: true });
  }

  const eventRecordId = await createWebhookEventRecord(event.id, event.type, event.created);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as PaymentIntentData);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as PaymentIntentData);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as PaymentIntentData);
        break;
      case 'payment_intent.requires_action':
        await handlePaymentActionRequired(event.data.object as PaymentIntentData);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as ChargeData);
        break;
      default:
        console.log('[stripe_webhook] Unhandled event type', event.type);
    }

    if (eventRecordId) {
      await markWebhookEventProcessed(eventRecordId, true);
    }

    return json({ received: true, processed: true });
  } catch (err) {
    const message = toEventErrorMessage(err);
    console.error('[stripe_webhook] Error processing event', {
      eventId: event.id,
      eventType: event.type,
      message
    });

    if (eventRecordId) {
      await markWebhookEventProcessed(eventRecordId, false, message);
    }

    // Return non-2xx so Stripe retries transient failures.
    return json(
      {
        received: false,
        processed: false,
        error: message
      },
      { status: 500 }
    );
  }
};

async function handlePaymentSuccess(paymentIntent: PaymentIntentData) {
  const metadata = paymentIntent.metadata || {};
  const bookingId = metadata.booking_id ? sanitizePocketBaseId(metadata.booking_id) : null;

  if (!bookingId) {
    throw new Error('Missing or invalid booking_id metadata');
  }

  const booking = await pb.collection('bookings').getOne(bookingId, {
    fields: 'id,user,total_cost,payment_status,payment_intent_id,destination,scheduled_date,time_slot,package_count'
  });

  if (booking.payment_status === 'paid' && booking.payment_intent_id === paymentIntent.id) {
    return;
  }

  const expectedAmountCents = Math.round(Number(booking.total_cost) * 100);
  if (!Number.isFinite(expectedAmountCents) || expectedAmountCents <= 0) {
    throw new Error(`Booking total is invalid for booking ${bookingId}`);
  }

  if (expectedAmountCents !== paymentIntent.amount) {
    await pb.collection('bookings').update(bookingId, {
      payment_status: 'failed',
      status: 'payment_failed',
      payment_intent_id: paymentIntent.id
    });
    throw new Error(
      `Payment amount mismatch for booking ${bookingId}: expected ${expectedAmountCents}, got ${paymentIntent.amount}`
    );
  }

  await pb.collection('bookings').update(bookingId, {
    payment_status: 'paid',
    payment_intent_id: paymentIntent.id,
    paid_at: new Date().toISOString(),
    status: 'confirmed'
  });

  const existingInvoice = await pb
    .collection('invoices')
    .getFirstListItem(`payment_intent_id = "${escapePbFilterValue(paymentIntent.id)}"`)
    .catch(() => null);

  if (!existingInvoice) {
    await pb.collection('invoices').create({
      invoice_number: generateInvoiceNumber(paymentIntent.id),
      booking: bookingId,
      user: metadata.user_id || booking.user,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency || 'usd',
      status: 'paid',
      payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString()
    });
  }

  const userId = metadata.user_id || booking.user;
  if (!userId) return;

  try {
    const user = await pb.collection('users').getOne(userId);
    const trackingNumbers = await listBookingTrackingNumbers(bookingId);

    await sendBookingNotifications(userId, {
      name: user.name || 'Customer',
      email: user.email,
      phone: user.phone,
      bookingId,
      destination: booking.destination || 'Caribbean',
      scheduledDate: booking.scheduled_date || 'TBD',
      timeSlot: booking.time_slot || 'TBD',
      packageCount: booking.package_count || 1,
      total: paymentIntent.amount / 100,
      trackingNumbers
    });
  } catch (notificationErr) {
    // Notifications are best effort and should not fail webhook processing.
    console.error('[stripe_webhook] Failed to send booking confirmation notifications', notificationErr);
  }
}

async function handlePaymentFailure(paymentIntent: PaymentIntentData) {
  const bookingId = paymentIntent.metadata?.booking_id
    ? sanitizePocketBaseId(paymentIntent.metadata.booking_id)
    : null;
  if (!bookingId) return;

  await pb.collection('bookings').update(bookingId, {
    payment_status: 'failed',
    payment_intent_id: paymentIntent.id,
    status: 'payment_failed'
  });
}

async function handlePaymentCanceled(paymentIntent: PaymentIntentData) {
  const bookingId = paymentIntent.metadata?.booking_id
    ? sanitizePocketBaseId(paymentIntent.metadata.booking_id)
    : null;
  if (!bookingId) return;

  await pb.collection('bookings').update(bookingId, {
    payment_status: 'canceled',
    payment_intent_id: paymentIntent.id,
    status: 'canceled'
  });
}

async function handlePaymentActionRequired(paymentIntent: PaymentIntentData) {
  const bookingId = paymentIntent.metadata?.booking_id
    ? sanitizePocketBaseId(paymentIntent.metadata.booking_id)
    : null;
  if (!bookingId) return;

  await pb.collection('bookings').update(bookingId, {
    payment_status: 'pending',
    payment_intent_id: paymentIntent.id,
    status: 'pending_payment'
  });
}

async function handleDisputeCreated(charge: ChargeData) {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
  if (!paymentIntentId) return;

  const bookingIds = await listBookingIdsByPaymentIntent(paymentIntentId);
  if (bookingIds.length === 0) return;

  await Promise.all(
    bookingIds.map((bookingId) =>
      pb.collection('bookings').update(bookingId, {
        payment_status: 'failed',
        status: 'payment_failed'
      })
    )
  );
}
