import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Protect dashboard routes - require authentication
  if (!locals.user) {
    // Redirect to Kinde login - post_login_redirect_url handles the redirect back
    throw redirect(302, '/api/auth/login');
  }

  return {
    user: locals.user
  };
};

