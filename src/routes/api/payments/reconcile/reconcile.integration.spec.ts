import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPaymentIntent: vi.fn()
}));

vi.mock('$lib/server/stripe', () => ({
  getPaymentIntent: mocks.getPaymentIntent
}));

import { POST as reconcilePayment } from './+server';

function makeReconcileLocals(options?: {
  user?: { id: string; role: string } | null;
  booking?: Record<string, unknown>;
}) {
  const bookingsGetOne = vi.fn().mockResolvedValue(
    options?.booking ?? {
      id: 'booking1234',
      user: 'user12345',
      total_cost: 25,
      status: 'pending_payment',
      payment_status: 'processing',
      payment_intent_id: 'pi1234567890'
    }
  );
  const bookingsUpdate = vi.fn().mockResolvedValue({ id: 'booking1234' });

  const invoicesGetFirstListItem = vi.fn().mockRejectedValue(new Error('not found'));
  const invoicesCreate = vi.fn().mockResolvedValue({ id: 'invoice1234' });

  const locals = {
    user: options?.user ?? null,
    pb: {
      collection: vi.fn((name: string) => {
        if (name === 'bookings') {
          return {
            getOne: bookingsGetOne,
            update: bookingsUpdate
          };
        }
        if (name === 'invoices') {
          return {
            getFirstListItem: invoicesGetFirstListItem,
            create: invoicesCreate
          };
        }
        throw new Error(`Unexpected collection: ${name}`);
      })
    }
  };

  return {
    locals,
    bookingsGetOne,
    bookingsUpdate,
    invoicesGetFirstListItem,
    invoicesCreate
  };
}

describe('API /payments/reconcile POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const request = new Request('http://localhost/api/payments/reconcile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking1234' })
    });

    const response = await reconcilePayment({ request, locals: {} } as any);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      error_code: 'AUTH_REQUIRED'
    });
  });

  it('marks booking paid and creates invoice when payment intent succeeded', async () => {
    mocks.getPaymentIntent.mockResolvedValueOnce({
      id: 'pi1234567890',
      status: 'succeeded',
      amount: 2500,
      currency: 'usd',
      metadata: {
        booking_id: 'booking1234'
      }
    });

    const { locals, bookingsUpdate, invoicesCreate } = makeReconcileLocals({
      user: { id: 'user12345', role: 'customer' }
    });

    const request = new Request('http://localhost/api/payments/reconcile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking1234' })
    });

    const response = await reconcilePayment({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: 'success',
      data: {
        bookingId: 'booking1234',
        paymentIntentId: 'pi1234567890',
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        synced: true
      }
    });

    expect(bookingsUpdate).toHaveBeenCalledWith('booking1234', {
      payment_status: 'paid',
      status: 'confirmed',
      payment_intent_id: 'pi1234567890',
      paid_at: expect.any(String)
    });

    expect(invoicesCreate).toHaveBeenCalledWith({
      invoice_number: expect.stringMatching(/^INV-/),
      booking: 'booking1234',
      user: 'user12345',
      amount: 25,
      currency: 'usd',
      status: 'paid',
      payment_intent_id: 'pi1234567890',
      paid_at: expect.any(String)
    });
  });

  it('marks booking failed when amount mismatches expected total', async () => {
    mocks.getPaymentIntent.mockResolvedValueOnce({
      id: 'pi1234567890',
      status: 'succeeded',
      amount: 2000,
      currency: 'usd',
      metadata: {
        booking_id: 'booking1234'
      }
    });

    const { locals, bookingsUpdate, invoicesCreate } = makeReconcileLocals({
      user: { id: 'user12345', role: 'customer' }
    });

    const request = new Request('http://localhost/api/payments/reconcile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking1234' })
    });

    const response = await reconcilePayment({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toMatchObject({
      status: 'error',
      error_code: 'AMOUNT_MISMATCH'
    });

    expect(bookingsUpdate).toHaveBeenCalledWith('booking1234', {
      payment_status: 'failed',
      status: 'payment_failed',
      payment_intent_id: 'pi1234567890'
    });
    expect(invoicesCreate).not.toHaveBeenCalled();
  });

  it('keeps booking pending when payment intent is processing', async () => {
    mocks.getPaymentIntent.mockResolvedValueOnce({
      id: 'pi1234567890',
      status: 'processing',
      amount: 2500,
      currency: 'usd',
      metadata: {
        booking_id: 'booking1234'
      }
    });

    const { locals, bookingsUpdate, invoicesCreate } = makeReconcileLocals({
      user: { id: 'user12345', role: 'customer' }
    });

    const request = new Request('http://localhost/api/payments/reconcile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking1234' })
    });

    const response = await reconcilePayment({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: 'success',
      data: {
        bookingStatus: 'pending_payment',
        paymentStatus: 'processing',
        synced: false
      }
    });

    expect(bookingsUpdate).toHaveBeenCalledWith('booking1234', {
      payment_status: 'processing',
      status: 'pending_payment',
      payment_intent_id: 'pi1234567890'
    });
    expect(invoicesCreate).not.toHaveBeenCalled();
  });
});
