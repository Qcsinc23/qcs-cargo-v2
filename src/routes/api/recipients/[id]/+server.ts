import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, { message: 'Authentication required' });
  }

  const { id } = params;

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

  const { id } = params;

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
      const existingDefaults = await locals.pb.collection('recipients').getFullList({
        filter: `user = "${locals.user.id}" && is_default = true && id != "${id}"`
      });

      for (const def of existingDefaults) {
        await locals.pb.collection('recipients').update(def.id, { is_default: false });
      }
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

  const { id } = params;

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





