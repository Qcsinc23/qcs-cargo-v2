import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { dev } from '$app/environment';

// Authentication hook
const authHook: Handle = async ({ event, resolve }) => {
  // Create PocketBase instance for this request
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);

  // Load auth store from cookie
  const cookie = event.request.headers.get('cookie') || '';
  event.locals.pb.authStore.loadFromCookie(cookie);

  try {
    // Verify and refresh auth if valid
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection('users').authRefresh();
      event.locals.user = event.locals.pb.authStore.model;
    }
  } catch (error) {
    // Log error in development for debugging
    if (dev) {
      console.error('[Auth Hook Error]', error);
    }
    // Clear invalid auth
    event.locals.pb.authStore.clear();
    event.locals.user = null;
  }

  const response = await resolve(event);

  // Set auth cookie
  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' })
  );

  return response;
};

// Security headers hook
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Add security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=()'
  );

  return response;
};

export const handle = sequence(authHook, securityHook);