import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isAdminOrStaff } from '$lib/server/authz';
import { sanitizePocketBaseId } from '$lib/server/pb-filter';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceId = sanitizePocketBaseId(params.id || '');
    if (!invoiceId) {
      return json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Fetch invoice with expanded relations
    const invoice = await locals.pb.collection('invoices').getOne(invoiceId, {
      expand: 'user,booking'
    });

    // Check authorization - only invoice owner or admins can view
    if (
      invoice.user !== locals.user.id &&
      !isAdminOrStaff(locals.user)
    ) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return invoice data for client-side PDF generation
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      created: invoice.created,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency || 'USD',
      notes: invoice.notes,
      line_items: invoice.line_items || [],
      user: {
        name: invoice.expand?.user?.name || 'Unknown',
        email: invoice.expand?.user?.email || '',
        phone: invoice.expand?.user?.phone
      },
      booking: invoice.expand?.booking
        ? {
            tracking_number: invoice.expand.booking.tracking_number,
            destination: invoice.expand.booking.destination,
            scheduled_date: invoice.expand.booking.scheduled_date
          }
        : undefined
    };

    return json(invoiceData);
  } catch (error) {
    console.error('[Invoice PDF] Error fetching invoice:', error);
    return json(
      { error: 'Failed to fetch invoice data' },
      { status: 500 }
    );
  }
};
