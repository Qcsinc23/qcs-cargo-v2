import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Protect admin routes - require authentication
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/admin');
  }

  const role = (locals.user as any)?.role as string | undefined;
  if (role !== 'admin' && role !== 'staff') {
    // Not authorized for admin panel
    throw redirect(302, '/dashboard');
  }

  return {
    user: locals.user
  };
};

