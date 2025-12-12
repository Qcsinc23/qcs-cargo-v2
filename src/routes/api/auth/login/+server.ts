import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid login payload' }, { status: 400 });
  }

  try {
    const authData = await locals.pb
      .collection('users')
      .authWithPassword(parsed.data.email, parsed.data.password);

    // Keep locals.user in sync for this request lifecycle.
    locals.user = authData.record;

    return json({ success: true, user: authData.record });
  } catch {
    return json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }
};


