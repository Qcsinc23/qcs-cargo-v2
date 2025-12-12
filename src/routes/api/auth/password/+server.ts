import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { success: false, error: 'Invalid password payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await locals.pb.collection('users').update(locals.user.id, {
      oldPassword: parsed.data.currentPassword,
      password: parsed.data.newPassword,
      passwordConfirm: parsed.data.confirmPassword
    });

    return json({ success: true });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to change password';
    return json({ success: false, error: message }, { status: 400 });
  }
};


