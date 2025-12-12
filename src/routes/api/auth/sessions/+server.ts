import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Session tracking is optional; if the collection doesn't exist or rules block access,
    // we return an empty list (the UI already communicates it's coming soon).
    const sessions = await locals.pb.collection('sessions').getFullList({
      filter: `user = "${locals.user.id}"`,
      sort: '-last_active'
    });

    return json({ success: true, sessions });
  } catch {
    return json({ success: true, sessions: [] });
  }
};


