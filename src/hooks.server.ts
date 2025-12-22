import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { sessionHooks, kindeAuthClient } from "@kinde-oss/kinde-auth-sveltekit";
import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import * as Sentry from '@sentry/sveltekit';
import { syncKindeUserToPocketBase } from '$lib/server/kinde-sync';

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
const debugLog = (msg: string, data: any, hyp: string) => {
  console.log(`[DEBUG][${hyp}] ${msg}:`, JSON.stringify(data));
  return fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks.server.ts',message:msg,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:hyp})}).catch(()=>{});
};
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
  // Authenticate as admin for server-side operations
  event.locals.pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  
  // Authenticate PocketBase with admin credentials for server-side operations
  const adminEmail = env.POCKETBASE_ADMIN_EMAIL || 'sales@quietcraftsolutions.com';
  const adminPassword = env.POCKETBASE_ADMIN_PASSWORD || 'Qcsinc@2025*';
  
  try {
    await event.locals.pb.admins.authWithPassword(adminEmail, adminPassword);
  } catch (err: any) {
    console.error('[hooks] Failed to authenticate PocketBase admin:', err?.message || err);
    // Continue anyway - some routes might not need admin access
  }
  
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
    try {
      // Sync Kinde user to PocketBase and get PocketBase user record
      const pbUser = await syncKindeUserToPocketBase(kindeUser, event.locals.pb);
      
      // Map PocketBase user to app's user structure
      // Use PocketBase user ID (not Kinde ID) for all database operations
      event.locals.user = {
        id: pbUser.id, // ✅ PocketBase user ID (not Kinde ID)
        email: pbUser.email,
        name: pbUser.name || kindeUser.given_name || kindeUser.family_name || kindeUser.email?.split('@')[0] || 'User',
        phone: pbUser.phone || undefined,
        role: (pbUser.role as 'customer' | 'staff' | 'admin') || 'customer',
        verified: pbUser.email_verified || (kindeUser as any).email_verified || false,
        avatar: kindeUser.picture || pbUser.avatar || undefined,
        stripe_customer_id: pbUser.stripe_customer_id || undefined,
        created: pbUser.created,
        updated: pbUser.updated
      };

      // #region agent log
      await debugLog('kinde-sync success', {
        kindeId: kindeUser.id,
        pbUserId: pbUser.id,
        email: pbUser.email
      }, 'F');
      // #endregion
    } catch (err: any) {
      // Log error but don't break auth flow - user is still authenticated via Kinde
      console.error('[hooks] Failed to sync Kinde user to PocketBase:', err?.message || err);
      
      // #region agent log
      await debugLog('kinde-sync error', {
        error: err?.message || String(err),
        kindeId: kindeUser.id,
        email: kindeUser.email
      }, 'G');
      // #endregion
      
      // Fallback: Use Kinde user data (but this will cause issues with database operations)
      // This should rarely happen, but provides graceful degradation
      event.locals.user = {
        id: kindeUser.id || (kindeUser as any).sub,
        email: kindeUser.email,
        name: kindeUser.given_name || kindeUser.family_name || kindeUser.email?.split('@')[0] || 'User',
        verified: (kindeUser as any).email_verified || false,
        avatar: kindeUser.picture || undefined,
        role: 'customer', // Default fallback
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    }
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
    "font-src 'self' https://fonts.gstatic.com data:",
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
