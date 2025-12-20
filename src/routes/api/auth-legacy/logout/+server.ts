import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  locals.pb.authStore.clear();
  locals.user = null;

  return json({ success: true });
};


