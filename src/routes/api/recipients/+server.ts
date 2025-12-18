import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  try {
    const recipients = await locals.pb.collection('recipients').getFullList({
      filter: `user = "${locals.user.id}"`,
      sort: '-is_default,-created'
    });

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
      const existingDefaults = await locals.pb.collection('recipients').getFullList({
        filter: `user = "${locals.user.id}" && is_default = true`
      });

      for (const existing of existingDefaults) {
        await locals.pb.collection('recipients').update(existing.id, { is_default: false });
      }
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






