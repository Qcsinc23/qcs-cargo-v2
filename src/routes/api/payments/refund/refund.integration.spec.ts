import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  paymentRateCheck: vi.fn(),
  createRefund: vi.fn(),
  getPaymentIntent: vi.fn()
}));

vi.mock('$lib/server/rate-limiter', () => ({
  paymentRateLimit: {
    check: mocks.paymentRateCheck
  }
}));

vi.mock('$lib/server/stripe', () => ({
  createRefund: mocks.createRefund,
  getPaymentIntent: mocks.getPaymentIntent
}));

import { GET as getRefunds, POST as createRefundHandler } from './+server';

function makeRefundLocals(options?: {
  user?: { id: string; role: string } | null;
  refundsGetList?: ReturnType<typeof vi.fn>;
  refundsCreate?: ReturnType<typeof vi.fn>;
  bookingsUpdate?: ReturnType<typeof vi.fn>;
}) {
  const refundsGetList = options?.refundsGetList ?? vi.fn();
  const refundsCreate = options?.refundsCreate ?? vi.fn();
  const bookingsUpdate = options?.bookingsUpdate ?? vi.fn();

  const refundsCollection = {
    getList: refundsGetList,
    create: refundsCreate
  };

  const bookingsCollection = {
    update: bookingsUpdate
  };

  const locals = {
    user: options?.user ?? null,
    correlationId: 'corr_test_001',
    pb: {
      collection: vi.fn((name: string) => {
        if (name === 'refunds') return refundsCollection;
        if (name === 'bookings') return bookingsCollection;
        throw new Error(`Unexpected collection: ${name}`);
      })
    }
  };

  return {
    locals,
    refundsGetList,
    refundsCreate,
    bookingsUpdate
  };
}

describe('API /payments/refund handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.paymentRateCheck.mockReturnValue({ allowed: true, remaining: 4, resetTime: Date.now() + 60_000 });
  });

  it('POST returns 401 when unauthenticated', async () => {
    const request = new Request('http://localhost/api/payments/refund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_123' })
    });

    const response = await createRefundHandler({ request, locals: {} } as any);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      error_code: 'AUTH_REQUIRED'
    });
  });

  it('POST returns 403 for non-admin users', async () => {
    const { locals } = makeRefundLocals({ user: { id: 'user12345', role: 'customer' } });

    const request = new Request('http://localhost/api/payments/refund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_123' })
    });

    const response = await createRefundHandler({ request, locals } as any);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      error_code: 'INSUFFICIENT_PERMISSIONS'
    });
  });

  it('POST returns 429 when rate limit is exceeded', async () => {
    mocks.paymentRateCheck.mockReturnValueOnce({ allowed: false, remaining: 0, resetTime: Date.now() + 60_000 });

    const { locals } = makeRefundLocals({ user: { id: 'admin12345', role: 'admin' } });

    const request = new Request('http://localhost/api/payments/refund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_123' })
    });

    const response = await createRefundHandler({ request, locals } as any);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      error_code: 'RATE_LIMIT_EXCEEDED'
    });
  });

  it('POST blocks duplicate successful refunds', async () => {
    mocks.getPaymentIntent.mockResolvedValueOnce({
      status: 'succeeded',
      amount: 1200,
      metadata: {
        booking_id: 'booking1234',
        user_id: 'user12345'
      }
    });

    const refundsGetList = vi.fn().mockResolvedValueOnce({
      totalItems: 1,
      items: [{ id: 'refund_row_1', refund_id: 're_existing' }]
    });

    const { locals } = makeRefundLocals({
      user: { id: 'admin12345', role: 'admin' },
      refundsGetList
    });

    const request = new Request('http://localhost/api/payments/refund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_existing' })
    });

    const response = await createRefundHandler({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      status: 'error',
      error_code: 'ALREADY_REFUNDED',
      data: { refundId: 're_existing' }
    });

    expect(mocks.createRefund).not.toHaveBeenCalled();
  });

  it('POST processes full refunds and updates related booking status', async () => {
    mocks.getPaymentIntent.mockResolvedValueOnce({
      status: 'succeeded',
      amount: 2500,
      metadata: {
        booking_id: 'booking1234',
        user_id: 'user12345'
      }
    });

    mocks.createRefund.mockResolvedValueOnce({
      id: 're_12345',
      amount: 2500,
      currency: 'usd',
      status: 'succeeded',
      created: 1_735_000_000
    });

    const refundsGetList = vi.fn().mockResolvedValueOnce({
      totalItems: 0,
      items: []
    });
    const refundsCreate = vi.fn().mockResolvedValueOnce({ id: 'refund_record_1' });
    const bookingsUpdate = vi.fn().mockResolvedValueOnce({ id: 'booking1234' });

    const { locals } = makeRefundLocals({
      user: { id: 'admin12345', role: 'admin' },
      refundsGetList,
      refundsCreate,
      bookingsUpdate
    });

    const request = new Request('http://localhost/api/payments/refund', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'pi_fresh' })
    });

    const response = await createRefundHandler({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'success',
      data: {
        refundId: 're_12345',
        amount: 25,
        currency: 'usd',
        status: 'succeeded',
        created: 1_735_000_000
      }
    });

    expect(bookingsUpdate).toHaveBeenCalledWith('booking1234', {
      payment_status: 'refunded',
      status: 'refunded',
      refunded_at: expect.any(String),
      refund_id: 're_12345'
    });

    expect(refundsCreate).toHaveBeenCalledWith({
      payment_intent_id: 'pi_fresh',
      refund_id: 're_12345',
      amount: 25,
      currency: 'usd',
      status: 'succeeded',
      reason: 'requested_by_customer',
      booking_id: 'booking1234',
      user_id: 'user12345',
      processed_by: 'admin12345',
      created: expect.any(String)
    });
  });

  it('GET sanitizes userId and enforces pagination caps for admins', async () => {
    const refundsGetList = vi.fn().mockResolvedValueOnce({
      items: [
        {
          id: 'row_1',
          payment_intent_id: 'pi_1',
          refund_id: 're_1',
          amount: 10,
          currency: 'usd',
          status: 'succeeded',
          reason: 'requested_by_customer',
          booking_id: 'booking1',
          created: '2026-01-01T00:00:00.000Z',
          expand: { booking_id: { id: 'booking1' } }
        }
      ],
      page: 2,
      perPage: 100,
      totalItems: 1,
      totalPages: 1
    });

    const { locals } = makeRefundLocals({
      user: { id: 'admin12345', role: 'admin' },
      refundsGetList
    });

    const url = new URL('http://localhost/api/payments/refund?userId=bad!&page=2&perPage=200');
    const response = await getRefunds({ url, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(refundsGetList).toHaveBeenCalledWith(2, 100, {
      filter: 'user_id = "admin12345"',
      sort: '-created',
      expand: 'booking_id'
    });

    expect(body).toEqual({
      status: 'success',
      data: [
        {
          id: 'row_1',
          paymentIntentId: 'pi_1',
          refundId: 're_1',
          amount: 10,
          currency: 'usd',
          status: 'succeeded',
          reason: 'requested_by_customer',
          bookingId: 'booking1',
          createdAt: '2026-01-01T00:00:00.000Z',
          booking: { id: 'booking1' }
        }
      ],
      page: 2,
      perPage: 100,
      totalItems: 1,
      totalPages: 1
    });
  });
});
