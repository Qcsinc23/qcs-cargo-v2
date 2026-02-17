import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { escapePbFilterValue, sanitizePocketBaseId } from '$lib/server/pb-filter';

const RECIPIENT_PAGE_SIZE = 100;

async function unsetDefaultRecipientsForUser(
  locals: App.Locals,
  userId: string,
  excludeRecipientId: string
) {
  const filter = `user = "${escapePbFilterValue(userId)}" && is_default = true && id != "${escapePbFilterValue(excludeRecipientId)}"`;

  while (true) {
    const defaultPage = await locals.pb.collection('recipients').getList(1, RECIPIENT_PAGE_SIZE, {
      filter,
      fields: 'id'
    });

    if (defaultPage.items.length === 0) {
      return;
    }

    await Promise.all(
      defaultPage.items.map((recipient) =>
        locals.pb.collection('recipients').update(recipient.id, { is_default: false })
      )
    );
  }
}

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid recipient ID' });
  }

  try {
    const recipient = await locals.pb.collection('recipients').getOne(id);

    // Verify user owns this recipient
    if (recipient.user !== locals.user.id) {
      throw error(403, { message: 'Access denied' });
    }

    return json({
      status: 'success',
      data: recipient
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    throw error(500, { message: 'Failed to fetch recipient' });
  }
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid recipient ID' });
  }

  try {
    const existing = await locals.pb.collection('recipients').getOne(id);

    if (existing.user !== locals.user.id) {
      throw error(403, { message: 'Access denied' });
    }

    const body = await request.json();
    const allowedFields = [
      'name',
      'phone',
      'address_line1',
      'address_line2',
      'city',
      'destination',
      'delivery_instructions',
      'is_default'
    ];

    // Map camelCase to snake_case
    const fieldMapping: Record<string, string> = {
      addressLine1: 'address_line1',
      addressLine2: 'address_line2',
      deliveryInstructions: 'delivery_instructions',
      isDefault: 'is_default'
    };

    const updateData: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(body)) {
      const snakeKey = fieldMapping[key] || key;
      if (allowedFields.includes(snakeKey) && value !== undefined) {
        updateData[snakeKey] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw error(400, { message: 'No valid fields to update' });
    }

    // If setting as default, unset other defaults first
    if (updateData.is_default === true) {
      await unsetDefaultRecipientsForUser(locals, locals.user.id, id);
    }

    const updated = await locals.pb.collection('recipients').update(id, updateData);

    return json({
      status: 'success',
      data: updated
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    throw error(500, { message: 'Failed to update recipient' });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const id = sanitizePocketBaseId(params.id || '');
  if (!id) {
    throw error(400, { message: 'Invalid recipient ID' });
  }

  try {
    const recipient = await locals.pb.collection('recipients').getOne(id);

    if (recipient.user !== locals.user.id) {
      throw error(403, { message: 'Access denied' });
    }

    await locals.pb.collection('recipients').delete(id);

    return json({
      status: 'success',
      message: 'Recipient deleted'
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    throw error(500, { message: 'Failed to delete recipient' });
  }
};







