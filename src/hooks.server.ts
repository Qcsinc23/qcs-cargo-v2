import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { sessionHooks, kindeAuthClient } from "@kinde-oss/kinde-auth-sveltekit";
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

// #region agent log
const debugLog = (msg: string, data: any, hyp: string) => fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks.server.ts',message:msg,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hyp})}).catch(()=>{});
// #endregion

// Kinde Authentication hook
const kindeAuthHook: Handle = async ({ event, resolve }) => {
  const isAuthCallback = event.url.pathname.includes('kinde_callback');
  const isAuthRoute = event.url.pathname.startsWith('/api/auth/');
  
  // #region agent log
  if (isAuthCallback) {
    const stateCookie = event.cookies.get('kinde_ac-state-key');
    await debugLog('kindeAuthHook entry (callback)', { path: event.url.pathname, hasStateCookie: !!stateCookie, stateCookieValue: stateCookie?.slice(0,20), allCookies: event.cookies.getAll().map(c => c.name) }, 'B');
  }
  // #endregion
  
  // Initialize Kinde session storage methods on event.request
  await sessionHooks({ event });
  
  // Still need PocketBase for data operations (not auth)
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  
  // Get the authenticated user from Kinde using the stored tokens
  // Skip for auth routes to avoid interfering with the auth flow
  let kindeUser = null;
  if (!isAuthRoute) {
    try {
      const isAuthenticated = await kindeAuthClient.isAuthenticated(event.request);
      // #region agent log
      await debugLog('isAuthenticated check', { isAuthenticated, path: event.url.pathname }, 'D');
      // #endregion
      
      if (isAuthenticated) {
        kindeUser = await kindeAuthClient.getUser(event.request);
        // #region agent log
        await debugLog('getUser result', { hasUser: !!kindeUser, userId: kindeUser?.id, email: kindeUser?.email }, 'D');
        // #endregion
      }
    } catch (err: any) {
      // #region agent log
      await debugLog('kindeAuthClient error', { error: err?.message || String(err) }, 'E');
      // #endregion
      // If token is expired or invalid, user will be null (not authenticated)
      kindeUser = null;
    }
  }
  
  if (kindeUser) {
    // Map Kinde user to your app's user structure
    event.locals.user = {
      id: kindeUser.id || (kindeUser as any).sub,
      email: kindeUser.email,
      name: kindeUser.given_name || kindeUser.family_name || kindeUser.email?.split('@')[0] || 'User',
      emailVerified: (kindeUser as any).email_verified || false,
      picture: kindeUser.picture || null,
      kindeId: kindeUser.id || (kindeUser as any).sub,
      role: 'user'
    };
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  
  // #region agent log
  if (isAuthCallback || event.url.pathname === '/dashboard') {
    await debugLog('kindeAuthHook response', { path: event.url.pathname, status: response.status, location: response.headers.get('location'), hasUser: !!event.locals.user }, 'C');
  }
  // #endregion
  
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
