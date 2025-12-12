import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

const oauthSyncSchema = z.object({
  token: z.string().min(1),
  model: z.unknown().optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = oauthSyncSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid OAuth payload' }, { status: 400 });
  }

  try {
    locals.pb.authStore.save(parsed.data.token, parsed.data.model ?? null);

    // Validate token + normalize model by refreshing against PocketBase.
    await locals.pb.collection('users').authRefresh();

    locals.user = locals.pb.authStore.model;
    return json({ success: true, user: locals.pb.authStore.model });
  } catch {
    locals.pb.authStore.clear();
    locals.user = null;
    return json({ success: false, error: 'OAuth session invalid' }, { status: 401 });
  }
};


