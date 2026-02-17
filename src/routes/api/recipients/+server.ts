import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { escapePbFilterValue } from '$lib/server/pb-filter';

const RECIPIENT_PAGE_SIZE = 100;

async function listRecipientsByFilter(
  locals: App.Locals,
  filter: string,
  sort = '-is_default,-created'
) {
  const recipients: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const recipientPage = await locals.pb.collection('recipients').getList(page, RECIPIENT_PAGE_SIZE, {
      filter,
      sort
    });

    recipients.push(...recipientPage.items);
    totalPages = recipientPage.totalPages;
    page += 1;
  }

  return recipients;
}

async function unsetDefaultRecipientsForUser(locals: App.Locals, userId: string) {
  const filter = `user = "${escapePbFilterValue(userId)}" && is_default = true`;

  let hasMore = true;
  while (hasMore) {
    const defaultPage = await locals.pb.collection('recipients').getList(1, RECIPIENT_PAGE_SIZE, {
      filter,
      fields: 'id'
    });

    hasMore = defaultPage.items.length > 0;
    if (!hasMore) {
      return;
    }

    await Promise.all(
      defaultPage.items.map((existing) =>
        locals.pb.collection('recipients').update(existing.id, { is_default: false })
      )
    );
  }
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const recipients = await listRecipientsByFilter(
      locals,
      `user = "${escapePbFilterValue(locals.user.id)}"`
    );

    return json({
      status: 'success',
      data: recipients
    });
  } catch (err) {
    console.error('[get_recipients] Error', err);
    throw error(500, { message: 'Failed to fetch recipients' });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const body = await request.json();
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      destination,
      deliveryInstructions,
      isDefault
    } = body;

    // Validate required fields
    if (!name || !phone || !addressLine1 || !city || !destination) {
      throw error(400, { message: 'Missing required recipient fields' });
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await unsetDefaultRecipientsForUser(locals, locals.user.id);
    }

    const recipient = await locals.pb.collection('recipients').create({
      user: locals.user.id,
      name,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2 || '',
      city,
      destination,
      delivery_instructions: deliveryInstructions || '',
      is_default: isDefault || false
    });

    return json({
      status: 'success',
      data: recipient
    });
  } catch (err) {
    console.error('[create_recipient] Error', err);

    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    throw error(500, { message: 'Failed to create recipient' });
  }
};






