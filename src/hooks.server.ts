import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { sessionHooks } from "@kinde-oss/kinde-auth-sveltekit";
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { dev } from '$app/environment';
import * as Sentry from '@sentry/sveltekit';

// Initialize Sentry for server-side error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  
  // Server-side filtering
  beforeSend(event) {
    // Don't send PocketBase connection errors in development
    if (event.exception?.values?.[0]?.value?.includes('ECONNREFUSED') && dev) {
      return null;
    }
    return event;
  }
});

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

// Kinde Authentication hook
const kindeAuthHook: Handle = async ({ event, resolve }) => {
  // Initialize Kinde session
  sessionHooks({ event });
  
  // Still need PocketBase for data operations (not auth)
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  
  // Get Kinde user from session (Kinde sets event.locals.user via sessionHooks)
  const kindeUser = event.locals.user as any;
  
  if (kindeUser) {
    // Map Kinde user to your app's user structure
    event.locals.user = {
      id: kindeUser.id || kindeUser.sub,
      email: kindeUser.email,
      name: kindeUser.given_name || kindeUser.family_name || kindeUser.email?.split('@')[0] || 'User',
      emailVerified: kindeUser.email_verified || false,
      picture: kindeUser.picture || null,
      // Preserve any additional Kinde properties
      kindeId: kindeUser.id || kindeUser.sub,
      role: 'user' // Default role, adjust based on your needs
    };
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  return response;
};

// Security headers hook
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Get PocketBase URL for CSP connect-src
  // In production, replace with actual PocketBase domain
  const pocketbaseUrl = process.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    `connect-src 'self' https://api.stripe.com ${pocketbaseUrl} https://qcsinc.kinde.com`,
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

export const handle = sequence(correlationHook, kindeAuthHook, securityHook);

// Use Sentry's error handler
export const handleError = Sentry.handleErrorWithSentry();
