import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Protect dashboard routes - require authentication
  if (!locals.user) {
    // Redirect to login page
    throw redirect(302, '/login');
  }

  return {
    user: locals.user
  };
};

