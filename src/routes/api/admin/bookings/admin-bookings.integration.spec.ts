import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  calculateBookingPricing: vi.fn()
}));

vi.mock('$lib/pricing/booking-pricing', () => ({
  calculateBookingPricing: mocks.calculateBookingPricing,
  normalizeServiceType: (value: string) => value,
  normalizeServiceTypeForStorage: (value: string) => value
}));

import { POST as createAdminBooking } from './+server';

function makeFutureDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 2);
  if (date.getUTCDay() === 0) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

function makeLocals(options?: {
  user?: { id: string; role: string } | null;
  customerRole?: string;
  recipientUser?: string;
  failPackageCreate?: boolean;
}) {
  const usersGetOne = vi.fn().mockResolvedValue({
    id: 'cust12345',
    role: options?.customerRole ?? 'customer',
    name: 'Test Customer',
    email: 'customer@example.com'
  });
  const recipientsGetOne = vi.fn().mockResolvedValue({
    id: 'rec12345',
    user: options?.recipientUser ?? 'cust12345'
  });
  const recipientsCreate = vi.fn().mockResolvedValue({ id: 'rec-new-1' });
  const bookingsCreate = vi.fn().mockResolvedValue({ id: 'book12345' });
  const bookingsDelete = vi.fn().mockResolvedValue({});
  const packagesCreate = options?.failPackageCreate
    ? vi.fn().mockRejectedValue(new Error('package fail'))
    : vi.fn().mockResolvedValue({ id: 'pkg-created-1' });
  const packagesDelete = vi.fn().mockResolvedValue({});
  const activityCreate = vi.fn().mockResolvedValue({});

  const locals = {
    user: options?.user ?? null,
    pb: {
      collection: vi.fn((name: string) => {
        if (name === 'users') return { getOne: usersGetOne };
        if (name === 'recipients') return { getOne: recipientsGetOne, create: recipientsCreate };
        if (name === 'bookings') return { create: bookingsCreate, delete: bookingsDelete };
        if (name === 'packages') return { create: packagesCreate, delete: packagesDelete };
        if (name === 'activity_logs') return { create: activityCreate };
        throw new Error(`Unexpected collection: ${name}`);
      })
    }
  };

  return {
    locals,
    usersGetOne,
    recipientsGetOne,
    recipientsCreate,
    bookingsCreate,
    bookingsDelete,
    packagesCreate,
    packagesDelete
  };
}

describe('API /admin/bookings POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.calculateBookingPricing.mockReturnValue({
      packages: [
        {
          id: 'pkg-1',
          dimWeight: 1,
          billableWeight: 3,
          cost: 10.5
        }
      ],
      subtotal: 10.5,
      multiPackageDiscount: 0,
      insuranceCost: 0,
      totalCost: 10.5,
      totalWeight: 3
    });
  });

  it('returns 403 when unauthenticated', async () => {
    const request = new Request('http://localhost/api/admin/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });

    const response = await createAdminBooking({ request, locals: {} } as any);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ status: 'error' });
  });

  it('creates booking and packages for customer with new recipient', async () => {
    const { locals, bookingsCreate, packagesCreate, recipientsCreate } = makeLocals({
      user: { id: 'admin1234', role: 'admin' }
    });

    const request = new Request('http://localhost/api/admin/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust12345',
        serviceType: 'standard',
        destination: 'guyana',
        scheduledDate: makeFutureDate(),
        timeSlot: '10:00-11:00',
        packages: [
          {
            id: 'pkg-1',
            weight: 3,
            weightUnknown: false,
            length: 10,
            width: 8,
            height: 6,
            dimensionsUnknown: false,
            declaredValue: 20,
            contentsDescription: 'test',
            specialInstructions: ''
          }
        ],
        recipient: {
          name: 'Recipient',
          phone: '2015550199',
          addressLine1: '123 Main St',
          addressLine2: '',
          city: 'Georgetown',
          destination: 'guyana',
          deliveryInstructions: '',
          saveForFuture: false
        }
      })
    });

    const response = await createAdminBooking({ request, locals } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: 'success',
      data: {
        bookingId: 'book12345',
        customerId: 'cust12345',
        status: 'pending_payment'
      }
    });
    expect(recipientsCreate).toHaveBeenCalledTimes(1);
    expect(bookingsCreate).toHaveBeenCalledTimes(1);
    expect(packagesCreate).toHaveBeenCalledTimes(1);
  });

  it('returns 403 when selected recipient belongs to another customer', async () => {
    const { locals } = makeLocals({
      user: { id: 'admin1234', role: 'admin' },
      recipientUser: 'otherUser'
    });

    const request = new Request('http://localhost/api/admin/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust12345',
        serviceType: 'standard',
        destination: 'guyana',
        scheduledDate: makeFutureDate(),
        timeSlot: '10:00-11:00',
        packages: [
          {
            id: 'pkg-1',
            weight: 3,
            weightUnknown: false
          }
        ],
        recipientId: 'rec12345'
      })
    });

    const response = await createAdminBooking({ request, locals } as any);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      message: 'Recipient does not belong to selected customer'
    });
  });

  it('rolls back booking when package creation fails', async () => {
    const { locals, bookingsDelete, packagesDelete } = makeLocals({
      user: { id: 'admin1234', role: 'admin' },
      failPackageCreate: true
    });

    const request = new Request('http://localhost/api/admin/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust12345',
        serviceType: 'standard',
        destination: 'guyana',
        scheduledDate: makeFutureDate(),
        timeSlot: '10:00-11:00',
        packages: [
          {
            id: 'pkg-1',
            weight: 3,
            weightUnknown: false
          }
        ],
        recipient: {
          name: 'Recipient',
          phone: '2015550199',
          addressLine1: '123 Main St',
          city: 'Georgetown'
        }
      })
    });

    const response = await createAdminBooking({ request, locals } as any);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      status: 'error',
      message: 'Failed to create booking packages'
    });
    expect(bookingsDelete).toHaveBeenCalledWith('book12345');
    expect(packagesDelete).not.toHaveBeenCalled();
  });
});
