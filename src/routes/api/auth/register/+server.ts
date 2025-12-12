import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
    name: z.string().min(1),
    phone: z.string().optional()
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm']
  });

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { success: false, error: 'Invalid registration payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, name, phone } = parsed.data;

  try {
    await locals.pb.collection('users').create({
      email,
      password,
      passwordConfirm: parsed.data.passwordConfirm,
      name,
      phone,
      role: 'customer',
      emailVisibility: true
    });

    // Best-effort: verification email. If your PB config requires verified email for login,
    // consider removing auto-login below.
    try {
      await locals.pb.collection('users').requestVerification(email);
    } catch {
      // Ignore verification email failures; account creation still succeeded.
    }

    const authData = await locals.pb.collection('users').authWithPassword(email, password);
    locals.user = authData.record;

    return json({ success: true, user: authData.record });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Registration failed';
    return json({ success: false, error: message }, { status: 400 });
  }
};


