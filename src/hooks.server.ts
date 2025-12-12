import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { dev } from '$app/environment';

// Correlation + minimal admin audit logging
const correlationHook: Handle = async ({ event, resolve }) => {
  const start = Date.now();
  const correlationId =
    event.request.headers.get('x-correlation-id') ?? crypto.randomUUID();

  event.locals.correlationId = correlationId;

  const response = await resolve(event);
  response.headers.set('x-correlation-id', correlationId);

  // Only log admin traffic to keep noise low
  if (event.url.pathname.startsWith('/admin')) {
    const userId = event.locals.user?.id ?? null;
    const role = (event.locals.user as any)?.role ?? null;

    console.log(
      '[admin_request]',
      JSON.stringify({
        ts: new Date().toISOString(),
        correlationId,
        method: event.request.method,
        path: event.url.pathname,
        status: response.status,
        duration_ms: Date.now() - start,
        userId,
        role
      })
    );
  }

  return response;
};

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

  // Set auth cookie with appropriate settings for the environment
  // In development, secure must be false for localhost to work
  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({ 
      httpOnly: false, 
      secure: !dev, 
      sameSite: 'Lax',
      path: '/'
    })
  );

  return response;
};

// Security headers hook
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Content Security Policy for payment security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  // Add security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(), payment=(self)'
  );

  return response;
};

export const handle = sequence(correlationHook, authHook, securityHook);
