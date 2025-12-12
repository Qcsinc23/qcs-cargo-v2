import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const deleteAccountSchema = z.object({
  password: z.string().min(1)
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  try {
    // Verify password by re-authenticating.
    const email = (locals.user as any)?.email as string | undefined;
    if (!email) {
      return json({ success: false, error: 'User email missing' }, { status: 400 });
    }

    await locals.pb.collection('users').authWithPassword(email, parsed.data.password);

    // Soft-delete + anonymize.
    await locals.pb.collection('users').update(locals.user.id, {
      deleted_at: new Date().toISOString(),
      email: `deleted_${locals.user.id}@deleted.local`,
      name: 'Deleted User'
    });

    // Clear auth after deletion.
    locals.pb.authStore.clear();
    locals.user = null;

    return json({ success: true });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String(err.message)
        : 'Failed to delete account. Please check your password.';
    return json({ success: false, error: message }, { status: 400 });
  }
};


