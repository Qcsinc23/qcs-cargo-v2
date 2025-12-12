import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await locals.pb.collection('sessions').getFullList({
      filter: `user = "${locals.user.id}"`
    });

    for (const session of sessions) {
      await locals.pb.collection('sessions').delete(session.id);
    }

    return json({ success: true });
  } catch {
    // If session tracking isn't enabled, treat as a no-op.
    return json({ success: true });
  }
};


