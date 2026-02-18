import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getPaymentIntent } from '$lib/server/stripe';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

const ReconcileBodySchema = z.object({
  bookingId: z.string().min(1).max(64),
  paymentIntentId: z.string().min(1).max(255).optional()
});

function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

function generateInvoiceNumber(paymentIntentId: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = paymentIntentId.slice(-8).toUpperCase();
  return `INV-${date}-${suffix}`;
}

async function ensurePaidInvoice(
  locals: App.Locals,
  bookingId: string,
  userId: string,
  paymentIntentId: string,
  amountCents: number,
  currency: string
) {
  try {
    const existingInvoice = await locals.pb
      .collection('invoices')
      .getFirstListItem(`payment_intent_id = "${escapePbFilterValue(paymentIntentId)}"`)
      .catch(() => null);

    if (existingInvoice) return;

    await locals.pb.collection('invoices').create({
      invoice_number: generateInvoiceNumber(paymentIntentId),
      booking: bookingId,
      user: userId,
      amount: amountCents / 100,
      currency: currency || 'usd',
      status: 'paid',
      payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString()
    });
  } catch (invoiceErr) {
    // Invoice creation is best-effort; booking payment state remains source-of-truth.
    console.warn('[payment_reconcile] Failed to ensure invoice', {
      bookingId,
      paymentIntentId,
      error: invoiceErr instanceof Error ? invoiceErr.message : String(invoiceErr)
    });
  }
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json(
      { status: 'error', error_code: 'AUTH_REQUIRED', message: 'Authentication required' },
      { status: 401 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json(
      { status: 'error', error_code: 'INVALID_JSON', message: 'Request body must be valid JSON' },
      { status: 400 }
    );
  }

  const parsed = ReconcileBodySchema.safeParse(rawBody);
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

  const requestedIntentId = parsed.data.paymentIntentId?.trim() || null;

  try {
    const booking = await locals.pb.collection('bookings').getOne(bookingId, {
      fields: 'id,user,total_cost,status,payment_status,payment_intent_id'
    });

    if (booking.user !== locals.user.id) {
      return json(
        {
          status: 'error',
          error_code: 'FORBIDDEN',
          message: 'Booking does not belong to current user'
        },
        { status: 403 }
      );
    }

    const bookingPaymentIntentId =
      typeof booking.payment_intent_id === 'string' ? booking.payment_intent_id.trim() : '';
    const paymentIntentId = requestedIntentId || bookingPaymentIntentId;
    if (!paymentIntentId) {
      return json(
        {
          status: 'error',
          error_code: 'PAYMENT_INTENT_MISSING',
          message: 'No payment intent is associated with this booking yet'
        },
        { status: 409 }
      );
    }

    if (
      bookingPaymentIntentId &&
      requestedIntentId &&
      bookingPaymentIntentId !== requestedIntentId
    ) {
      return json(
        {
          status: 'error',
          error_code: 'PAYMENT_INTENT_MISMATCH',
          message: 'Payment intent does not match booking payment record'
        },
        { status: 409 }
      );
    }

    const paymentIntent = await getPaymentIntent(paymentIntentId);
    const metadataBookingId = paymentIntent.metadata?.booking_id
      ? sanitizePocketBaseId(paymentIntent.metadata.booking_id)
      : null;
    if (metadataBookingId && metadataBookingId !== booking.id) {
      return json(
        {
          status: 'error',
          error_code: 'BOOKING_METADATA_MISMATCH',
          message: 'Payment intent metadata does not match booking'
        },
        { status: 409 }
      );
    }

    const expectedAmountCents = dollarsToCents(Number(booking.total_cost));
    if (!Number.isFinite(expectedAmountCents) || expectedAmountCents <= 0) {
      return json(
        {
          status: 'error',
          error_code: 'INVALID_BOOKING_TOTAL',
          message: 'Booking total is invalid. Please contact support.'
        },
        { status: 500 }
      );
    }

    if (paymentIntent.status === 'succeeded') {
      if (paymentIntent.amount !== expectedAmountCents) {
        await locals.pb.collection('bookings').update(booking.id, {
          payment_status: 'failed',
          status: 'payment_failed',
          payment_intent_id: paymentIntent.id
        });

        return json(
          {
            status: 'error',
            error_code: 'AMOUNT_MISMATCH',
            message: 'Paid amount does not match booking total'
          },
          { status: 409 }
        );
      }

      await locals.pb.collection('bookings').update(booking.id, {
        payment_status: 'paid',
        status: 'confirmed',
        payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString()
      });

      await ensurePaidInvoice(
        locals,
        booking.id,
        booking.user,
        paymentIntent.id,
        paymentIntent.amount,
        paymentIntent.currency || 'usd'
      );

      return json({
        status: 'success',
        data: {
          bookingId: booking.id,
          paymentIntentId: paymentIntent.id,
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
          synced: true
        }
      });
    }

    if (paymentIntent.status === 'requires_payment_method') {
      await locals.pb.collection('bookings').update(booking.id, {
        payment_status: 'failed',
        status: 'payment_failed',
        payment_intent_id: paymentIntent.id
      });

      return json(
        {
          status: 'error',
          error_code: 'PAYMENT_FAILED',
          message: 'Payment failed. Please try another payment method.'
        },
        { status: 409 }
      );
    }

    if (paymentIntent.status === 'canceled') {
      await locals.pb.collection('bookings').update(booking.id, {
        payment_status: 'canceled',
        status: 'canceled',
        payment_intent_id: paymentIntent.id
      });
    } else if (
      paymentIntent.status === 'processing' ||
      paymentIntent.status === 'requires_action' ||
      paymentIntent.status === 'requires_confirmation'
    ) {
      await locals.pb.collection('bookings').update(booking.id, {
        payment_status: paymentIntent.status === 'processing' ? 'processing' : 'pending',
        status: 'pending_payment',
        payment_intent_id: paymentIntent.id
      });
    }

    return json({
      status: 'success',
      data: {
        bookingId: booking.id,
        paymentIntentId: paymentIntent.id,
        bookingStatus: paymentIntent.status === 'canceled' ? 'canceled' : 'pending_payment',
        paymentStatus: paymentIntent.status,
        synced: false
      }
    });
  } catch (err) {
    const e = err as any;
    const message = err instanceof Error ? err.message : String(err);
    const stripeStatusCode = e?.statusCode;
    const status =
      typeof stripeStatusCode === 'number' && stripeStatusCode >= 400 && stripeStatusCode < 600
        ? stripeStatusCode
        : 500;
    const errorCode = e?.code === 'resource_missing' ? 'PAYMENT_INTENT_NOT_FOUND' : 'RECONCILE_FAILED';

    console.error('[payment_reconcile] Error', {
      bookingId,
      requestedIntentId,
      message
    });

    return json(
      {
        status: 'error',
        error_code: errorCode,
        message: status === 500 ? 'Failed to reconcile payment status' : message
      },
      { status }
    );
  }
};
