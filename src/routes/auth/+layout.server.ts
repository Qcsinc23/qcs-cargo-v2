import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // If user is already logged in, redirect to dashboard
  // Unless they're trying to verify email or reset password
  const allowedPaths = ['/auth/verify-email', '/auth/reset-password'];
  const isAllowedPath = allowedPaths.some(path => url.pathname.startsWith(path));
  
  if (locals.user && !isAllowedPath) {
    throw redirect(302, '/dashboard');
  }
  
  return {};
};

