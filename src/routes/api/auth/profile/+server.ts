import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const profilePatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    notification_email: z.boolean().optional(),
    notification_sms: z.boolean().optional(),
    notify_received: z.boolean().optional(),
    notify_transit: z.boolean().optional(),
    notify_delivered: z.boolean().optional()
  })
  .strict();

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { success: false, error: 'Invalid profile payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const updated = await locals.pb.collection('users').update(locals.user.id, parsed.data);
    locals.user = updated;
    
    // NOTE: Auth cookie is httpOnly and cannot be updated from API route
    // The updated user will be reflected on next request when hooks.server.ts
    // reads the auth token and fetches the user from PocketBase.
    // For immediate reflection, consider implementing a cookie refresh mechanism.
    
    return json({ success: true, user: updated });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to update profile';
    return json({ success: false, error: message }, { status: 400 });
  }
};


