import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { escapePbFilterValue } from '$lib/server/pb-filter';

const SESSION_PAGE_SIZE = 100;

async function listUserSessions(locals: App.Locals, userId: string) {
  const filter = `user = "${escapePbFilterValue(userId)}"`;
  const sessions: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const sessionPage = await locals.pb.collection('sessions').getList(page, SESSION_PAGE_SIZE, {
      filter,
      sort: '-last_active'
    });

    sessions.push(...sessionPage.items);
    totalPages = sessionPage.totalPages;
    page += 1;
  }

  return sessions;
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Session tracking is optional; if the collection doesn't exist or rules block access,
    // we return an empty list (the UI already communicates it's coming soon).
    const sessions = await listUserSessions(locals, locals.user.id);

    return json({ success: true, sessions });
  } catch {
    return json({ success: true, sessions: [] });
  }
};

