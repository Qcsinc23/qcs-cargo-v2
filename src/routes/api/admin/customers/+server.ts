import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { isAdminOrStaff } from '$lib/server/authz';
import { sanitizePocketBaseId, sanitizeSearchTerm } from '$lib/server/pb-filter';

const CustomerDetailSchema = z.object({
  customerId: z.string().min(1).max(64)
});

async function countCollectionByFilter(
  locals: App.Locals,
  collection: string,
  filter: string
): Promise<number> {
  return locals.pb
    .collection(collection)
    .getList(1, 1, { filter, fields: 'id' })
    .then((res) => res.totalItems)
    .catch(() => 0);
}

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // Ensure user is admin or staff
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const search = sanitizeSearchTerm(url.searchParams.get('search') || '');
    const pageRaw = Number.parseInt(url.searchParams.get('page') || '1', 10);
    const perPageRaw = Number.parseInt(url.searchParams.get('perPage') || '10', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.min(perPageRaw, 100) : 10;

    // Build filter
    const filterParts = ['role = "customer"'];
    if (search) {
      filterParts.push(
        `(name ~ "${search}" || email ~ "${search}" || phone ~ "${search}" || mailbox_number ~ "${search}")`
      );
    }

    // Fetch customers
    const customersList = await locals.pb.collection('users').getList(page, perPage, {
      filter: filterParts.join(' && '),
      sort: 'name',
      fields: 'id,name,email,phone,mailbox_number,created'
    });

    // Get booking counts for each customer using count queries instead of full list fetches.
    const customersWithStats = await Promise.all(
      customersList.items.map(async (customer) => {
        const customerId = sanitizePocketBaseId(String(customer.id || ''));
        if (!customerId) {
          return {
            ...customer,
            totalBookings: 0,
            activeBookings: 0
          };
        }

        const [totalBookings, activeBookings] = await Promise.all([
          countCollectionByFilter(locals, 'bookings', `user = "${customerId}"`),
          countCollectionByFilter(
            locals,
            'bookings',
            `user = "${customerId}" && status != "completed" && status != "canceled" && status != "cancelled"`
          )
        ]);

        return {
          ...customer,
          totalBookings,
          activeBookings
        };
      })
    );

    const payload = {
      customers: customersWithStats,
      totalItems: customersList.totalItems,
      totalPages: customersList.totalPages,
      currentPage: page
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Customers fetch error:', err);
    return json({ status: 'error', message: 'Failed to fetch customers' }, { status: 500 });
  }
};

// Get customer details
export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin or staff
    if (!locals.user || !isAdminOrStaff(locals.user)) {
      return json({ status: 'error', message: 'Unauthorized' }, { status: 403 });
    }

    const parsed = CustomerDetailSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ status: 'error', message: 'Invalid request body' }, { status: 400 });
    }

    const customerId = sanitizePocketBaseId(parsed.data.customerId);
    if (!customerId) {
      return json({ status: 'error', message: 'Invalid customer ID' }, { status: 400 });
    }

    // Fetch customer details
    const customer = await locals.pb.collection('users').getOne(customerId, {
      fields: 'id,name,email,phone,mailbox_number,created,role'
    });

    // Fetch related data
    const [bookings, shipments, recipients] = await Promise.all([
      locals.pb.collection('bookings').getList(1, 10, {
        filter: `user = "${customerId}"`,
        sort: '-created',
        expand: 'recipient'
      }),
      locals.pb.collection('shipments').getList(1, 10, {
        filter: `user = "${customerId}"`,
        sort: '-created'
      }),
      locals.pb.collection('recipients').getList(1, 100, {
        filter: `user = "${customerId}"`,
        sort: '-is_default,-created'
      })
    ]);

    const payload = {
      customer,
      recentBookings: bookings.items,
      recentShipments: shipments.items,
      recipients: recipients.items
    };

    return json({
      status: 'success',
      data: payload,
      ...payload
    });
  } catch (err) {
    console.error('Customer details fetch error:', err);
    return json({ status: 'error', message: 'Failed to fetch customer details' }, { status: 500 });
  }
};
