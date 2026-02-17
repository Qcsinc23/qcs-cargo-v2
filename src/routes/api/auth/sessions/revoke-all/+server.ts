import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { escapePbFilterValue } from '$lib/server/pb-filter';

const SESSION_PAGE_SIZE = 100;

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filter = `user = "${escapePbFilterValue(locals.user.id)}"`;

    while (true) {
      const sessionPage = await locals.pb.collection('sessions').getList(1, SESSION_PAGE_SIZE, {
        filter,
        fields: 'id'
      });

      if (sessionPage.items.length === 0) {
        break;
      }

      await Promise.all(
        sessionPage.items.map((session) => locals.pb.collection('sessions').delete(session.id))
      );
    }

    return json({ success: true });
  } catch {
    // If session tracking isn't enabled, treat as a no-op.
    return json({ success: true });
  }
};
