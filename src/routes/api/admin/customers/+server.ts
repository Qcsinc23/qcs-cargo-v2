import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/server/pocketbase';

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // Ensure user is admin or staff
    if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'staff')) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');

    // Build filter
    let filter = 'role = "customer"';
    if (search) {
      filter += ` && (name ~ "${search}" || email ~ "${search}" || phone ~ "${search}" || mailbox_number ~ "${search}")`;
    }

    // Fetch customers
    const customersList = await pb.collection('users').getList(page, perPage, {
      filter,
      sort: 'name',
      fields: 'id,name,email,phone,mailbox_number,created'
    });

    // Get booking counts for each customer
    const customersWithStats = await Promise.all(
      customersList.items.map(async (customer) => {
        const [totalBookings, activeBookings] = await Promise.all([
          pb.collection('bookings').getFullList({
            filter: `user = "${customer.id}"`,
            fields: 'id'
          }),
          pb.collection('bookings').getFullList({
            filter: `user = "${customer.id}" && status != "completed" && status != "canceled"`,
            fields: 'id'
          })
        ]);

        return {
          ...customer,
          totalBookings: totalBookings.length,
          activeBookings: activeBookings.length
        };
      })
    );

    return json({
      customers: customersWithStats,
      totalItems: customersList.totalItems,
      totalPages: customersList.totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
};

// Get customer details
export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Ensure user is admin or staff
    if (!locals.user || (locals.user.role !== 'admin' && locals.user.role !== 'staff')) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { customerId } = await request.json();

    if (!customerId) {
      return json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Fetch customer details
    const customer = await pb.collection('users').getOne(customerId);

    // Fetch related data
    const [bookings, shipments, recipients] = await Promise.all([
      pb.collection('bookings').getFullList({
        filter: `user = "${customerId}"`,
        sort: '-created',
        expand: 'recipient',
        limit: 10
      }),
      pb.collection('shipments').getFullList({
        filter: `user = "${customerId}"`,
        sort: '-created',
        limit: 10
      }),
      pb.collection('recipients').getFullList({
        filter: `user = "${customerId}"`
      })
    ]);

    return json({
      customer,
      recentBookings: bookings,
      recentShipments: shipments,
      recipients: recipients
    });
  } catch (error) {
    console.error('Customer details fetch error:', error);
    return json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
};