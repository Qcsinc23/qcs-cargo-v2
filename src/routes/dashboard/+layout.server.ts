import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Protect dashboard routes - require authentication
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/dashboard');
  }

  return {
    user: locals.user
  };
};

