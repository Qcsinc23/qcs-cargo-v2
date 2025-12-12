import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const avatar = form.get('avatar');

  if (!(avatar instanceof File)) {
    return json({ success: false, error: 'Avatar file is required' }, { status: 400 });
  }

  if (!avatar.type.startsWith('image/')) {
    return json({ success: false, error: 'Avatar must be an image file' }, { status: 400 });
  }

  if (avatar.size > MAX_AVATAR_BYTES) {
    return json({ success: false, error: 'Avatar must be less than 5MB' }, { status: 400 });
  }

  try {
    const data = new FormData();
    data.set('avatar', avatar);

    const updated = await locals.pb.collection('users').update(locals.user.id, data);
    locals.user = updated;
    return json({ success: true, user: updated });
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to update avatar';
    return json({ success: false, error: message }, { status: 400 });
  }
};


