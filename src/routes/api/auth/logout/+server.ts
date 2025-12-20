import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { handleAuth } from '@kinde-oss/kinde-auth-sveltekit';

// Kinde expects GET /api/auth/logout to terminate the session.
// This route previously only supported POST (PocketBase logout), which caused 405s when
// clicking "Logout" as a normal navigation. We keep POST for legacy /auth-legacy pages.
export const GET: RequestHandler = async (event) => {
  return handleAuth(event);
};

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  locals.pb.authStore.clear();
  locals.user = null;

  return json({ success: true });
};


