import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  if (!sessionId) {
    return json({ success: false, error: 'Missing session id' }, { status: 400 });
  }

  try {
    const session = await locals.pb.collection('sessions').getOne(sessionId);
    const sessionUserId = (session as any)?.user as string | undefined;
    if (sessionUserId && sessionUserId !== locals.user.id) {
      return json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await locals.pb.collection('sessions').delete(sessionId);
    return json({ success: true });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to revoke session';
    return json({ success: false, error: message }, { status: 400 });
  }
};


