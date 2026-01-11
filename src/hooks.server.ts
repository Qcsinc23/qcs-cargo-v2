import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import * as Sentry from '@sentry/sveltekit';
import { getCurrentUser } from '$lib/server/magic-link';
import { appendFileSync } from 'fs';

const logFile = '/app/app.log';

function logToFile(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

console.log('[hooks] Server hooks initializing...');
logToFile('Server hooks initializing...');

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

  // Log all requests for debugging
  const duration = Date.now() - start;
  const logMsg = `[request] ${event.request.method} ${event.url.pathname} - ${response.status} (${duration}ms) [${correlationId}]`;
  console.log(logMsg);
  logToFile(logMsg);

  return response;
};

// PocketBase Authentication hook
const pbAuthHook: Handle = async ({ event, resolve }) => {
  // Initialize PocketBase for data operations
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  event.locals.user = null; // Default to no user
  
  // Authenticate PocketBase with admin credentials for server-side operations
  const adminEmail = env.POCKETBASE_ADMIN_EMAIL || 'sales@quietcraftsolutions.com';
  const adminPassword = env.POCKETBASE_ADMIN_PASSWORD || 'Qcsinc@2025*';
  
  try {
    await event.locals.pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (err: any) {
    console.error('[hooks] Failed to authenticate PocketBase admin:', err?.message || err);
    // Continue anyway - some routes might not need admin access
  }
  
  // Get auth token from cookie
  const authToken = event.cookies.get('pb_auth');
  
  // Get the authenticated user from PocketBase using the auth token
  if (authToken) {
    try {
      const result = await getCurrentUser(authToken);
      
      if (result.success && result.user) {
        const pbUser = result.user;
        
        // Map PocketBase user to app's user structure
        event.locals.user = {
          id: pbUser.id,
          email: pbUser.email,
          name: pbUser.name || pbUser.email.split('@')[0],
          phone: pbUser.phone || undefined,
          role: pbUser.role as 'customer' | 'staff' | 'admin',
          verified: pbUser.verified || false,
          avatar: pbUser.avatar || undefined,
          stripe_customer_id: pbUser.stripe_customer_id || undefined,
          created: pbUser.created,
          updated: pbUser.updated
        };
      } else {
        // Invalid or expired token - clear it
        event.cookies.delete('pb_auth', { path: '/' });
      }
    } catch (err: any) {
      // Token validation failed - clear the cookie
      console.error('[hooks] Failed to validate auth token:', err?.message || err);
      event.cookies.delete('pb_auth', { path: '/' });
    }
  }

  const response = await resolve(event);
  
  return response;
};

// Security headers hook
const securityHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Get PocketBase URL for CSP connect-src
  const pocketbaseUrl = PUBLIC_POCKETBASE_URL || 'https://api.qcs-cargo.com';

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    `connect-src 'self' https://api.stripe.com ${pocketbaseUrl}`,
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

export const handle = sequence(correlationHook, pbAuthHook, securityHook);

// Use Sentry's error handler
const sentryErrorHandler = Sentry.handleErrorWithSentry();

export const handleError: import('@sveltejs/kit').HandleServerError = ({ error, event }) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  const errorMsg = `[error] 500 at ${event.url.pathname} - ${message}\n${stack}`;
  console.error(errorMsg);
  logToFile(errorMsg);
  
  return sentryErrorHandler({ error, event });
};
