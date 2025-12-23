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

// Kinde Authentication hook
const kindeAuthHook: Handle = async ({ event, resolve }) => {
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
  const isAuthRoute = event.url.pathname.startsWith('/api/auth/');

  if (!isAuthRoute) {
    try {
      const isAuthenticated = await kindeAuthClient.isAuthenticated(event.request);
      
      if (isAuthenticated) {
        kindeUser = await kindeAuthClient.getUser(event.request);
      }
    } catch (err: any) {
      // If token is expired or invalid, user will be null (not authenticated)
      kindeUser = null;
    }
  }
  
  if (kindeUser) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks.server.ts:100',message:'Starting user sync',data:{kindeId:kindeUser.id,email:kindeUser.email,pbAuthValid:event.locals.pb?.authStore?.isValid,pbIsAdmin:event.locals.pb?.authStore?.isAdmin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Sync Kinde user to PocketBase and get PocketBase user record
      const pbUser = await syncKindeUserToPocketBase(kindeUser, event.locals.pb);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks.server.ts:103',message:'User sync successful',data:{pbUserId:pbUser.id,email:pbUser.email,role:pbUser.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
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
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5b213dbc-91de-4ad8-8838-6c46ba2df294',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks.server.ts:118',message:'User sync failed - using fallback',data:{kindeId:kindeUser.id,email:kindeUser.email,errorType:err?.constructor?.name,errorMessage:err?.message,errorStatus:err?.status,errorCode:err?.response?.code,errorData:err?.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Log error but don't break auth flow - user is still authenticated via Kinde
      console.error('[hooks] Failed to sync Kinde user to PocketBase:', err?.message || err);
      console.error('[hooks] Full sync error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      // CRITICAL: If sync fails, we CANNOT use Kinde ID for database operations
      // This will cause foreign key failures. Log the error but allow the request to continue
      // so we can see the actual booking error. The booking endpoint will fail with a clear error.
      // In production, you may want to throw here to force sync to succeed.
    }
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
