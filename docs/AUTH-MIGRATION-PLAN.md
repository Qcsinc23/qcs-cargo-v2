# Authentication Migration Plan: Kinde to PocketBase Magic Links

> Status (2026-02-18): Historical reference only.  
> The migration to PocketBase magic-link auth is already complete in the live codebase.

## Overview

This document outlines the comprehensive migration from Kinde authentication to PocketBase-native authentication with magic link functionality, integrated with Resend for email delivery.

## Current State Analysis

### Kinde Integration Points

1. **Server Hooks** (`src/hooks.server.ts`)
   - `sessionHooks` from `@kinde-oss/kinde-auth-sveltekit`
   - `kindeAuthClient` for user authentication
   - `syncKindeUserToPocketBase` function

2. **API Routes**
   - `src/routes/api/auth/[...kindeAuth]/+server.ts` - Kinde OAuth handler
   - `src/routes/api/auth/oauth-sync/+server.ts` - OAuth sync endpoint

3. **Server Libraries**
   - `src/lib/server/kinde-sync.ts` - Kinde to PocketBase user sync

4. **Client Components**
   - Login/Register links pointing to `/api/auth/login` and `/api/auth/register`
   - Logout functionality using `/api/auth/logout`

5. **Auth Store** (`src/lib/stores/auth.ts`)
   - References to Kinde user properties
   - Logout redirect to Kinde endpoint

6. **Environment Variables** (Kinde-related)
   - `KINDE_CLIENT_ID`
   - `KINDE_CLIENT_SECRET`
   - `KINDE_ISSUER_URL`
   - `KINDE_REDIRECT_URL`
   - `KINDE_POST_LOGOUT_REDIRECT_URL`
   - `KINDE_POST_LOGIN_REDIRECT_URL`
   - `KINDE_SCOPE`
   - `KINDE_COOKIE_DOMAIN`

---

## Migration Plan

### Phase 1: Create New Authentication Infrastructure

#### 1.1 Create Magic Link API Endpoints

Create the following new API routes:

```
src/routes/api/auth/magic-link/request/+server.ts  - Request magic link
src/routes/api/auth/magic-link/verify/+server.ts   - Verify magic link token
src/routes/api/auth/logout/+server.ts              - Handle logout
```

#### 1.2 Create Login/Register Pages

Create the following pages:

```
src/routes/(auth)/login/+page.svelte     - Login form (email input)
src/routes/(auth)/register/+page.svelte  - Registration form
src/routes/(auth)/verify/+page.svelte    - Magic link verification page
src/routes/(auth)/+layout.svelte         - Auth layout
```

#### 1.3 Update PocketBase Configuration

Enable email authentication in PocketBase:
- Configure auth settings for the `users` collection
- Set up magic link token expiration (10 minutes recommended)
- Configure email templates

---

### Phase 2: Implement Resend Email Integration

#### 2.1 Update Email Service (`src/lib/server/email.ts`)

Create/update the email service to handle magic link emails:

```typescript
// Magic Link Email Template
interface MagicLinkEmailData {
  email: string;
  name?: string;
  magicLinkUrl: string;
  expiresIn: string;
}

async function sendMagicLinkEmail(data: MagicLinkEmailData): Promise<boolean>
```

#### 2.2 Email Templates

Create branded email templates for:
- Magic link login
- Welcome email for new users
- Password reset (optional backup)

#### 2.3 Error Handling & Delivery Confirmation

Implement:
- Retry logic for failed emails
- Logging for all email attempts
- Webhook endpoint for Resend delivery status (optional)

---

### Phase 3: Update Server Hooks

#### 3.1 New `hooks.server.ts` Structure

Replace Kinde hooks with PocketBase session management:

```typescript
// Remove
import { sessionHooks, kindeAuthClient } from "@kinde-oss/kinde-auth-sveltekit";
import { syncKindeUserToPocketBase } from '$lib/server/kinde-sync';

// Add
// PocketBase auth token from cookies
// Session validation via PocketBase
```

#### 3.2 Session Management

- Store auth token in httpOnly cookie
- Validate session on each request
- Handle token refresh/expiration

---

### Phase 4: Update Client Components

#### 4.1 Auth Store Updates (`src/lib/stores/auth.ts`)

Update the auth store to:
- Remove Kinde-specific code
- Add magic link request method
- Update logout to use new endpoint
- Add email verification state

#### 4.2 Header/Navigation Updates

Update components:
- `src/lib/components/layout/PublicHeader.svelte`
- `src/lib/components/layout/dashboard/Header.svelte`
- `src/lib/components/landing/Calculator.svelte`
- `src/lib/components/calculator/CalculationResult.svelte`

Change login/register links from:
```svelte
href="/api/auth/login"
href="/api/auth/register"
```
To:
```svelte
href="/login"
href="/register"
```

---

### Phase 5: Remove Kinde Dependencies

#### 5.1 Files to Delete

```
src/routes/api/auth/[...kindeAuth]/+server.ts
src/routes/api/auth/oauth-sync/+server.ts
src/lib/server/kinde-sync.ts
```

#### 5.2 Package Dependencies to Remove

```bash
npm uninstall @kinde-oss/kinde-auth-sveltekit
```

#### 5.3 Environment Variables to Remove

Remove from `.env`:
```
KINDE_CLIENT_ID
KINDE_CLIENT_SECRET
KINDE_ISSUER_URL
KINDE_REDIRECT_URL
KINDE_POST_LOGOUT_REDIRECT_URL
KINDE_POST_LOGIN_REDIRECT_URL
KINDE_SCOPE
KINDE_COOKIE_DOMAIN
```

---

### Phase 6: Database Schema Updates

#### 6.1 Users Collection Updates

Add/update fields:
- `magic_link_token` (text, optional) - Temporary magic link token
- `magic_link_expires` (datetime, optional) - Token expiration
- `last_login` (datetime, optional) - Track last successful login
- Remove `kinde_id` field (no longer needed)

#### 6.2 Sessions Collection (Optional)

Create a sessions collection for multi-device support:
```json
{
  "name": "sessions",
  "fields": [
    { "name": "user", "type": "relation", "options": { "collectionId": "users" } },
    { "name": "token", "type": "text" },
    { "name": "device_info", "type": "json" },
    { "name": "ip_address", "type": "text" },
    { "name": "expires_at", "type": "date" },
    { "name": "last_active", "type": "date" }
  ]
}
```

---

## Implementation Details

### Magic Link Flow

1. **User enters email** → Frontend calls `/api/auth/magic-link/request`
2. **Server generates token** → Creates unique token, stores in user record with expiration
3. **Server sends email** → Uses Resend to send magic link email
4. **User clicks link** → Redirects to `/verify?token=xxx`
5. **Server verifies token** → Validates token, creates session, sets cookie
6. **User redirected** → Sent to dashboard or intended destination

### Token Generation

```typescript
function generateMagicLinkToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomBytes(32).toString('hex');
}
```

### Cookie Configuration

```typescript
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Always true in production
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 7 days
};
```

---

## Resend Integration Details

### Configuration

```typescript
// src/lib/server/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@qcs-cargo.com';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'support@qcs-cargo.com';
```

### Magic Link Email Template

```typescript
async function sendMagicLinkEmail({
  to,
  name,
  magicLinkUrl,
  expiresIn = '10 minutes'
}: MagicLinkEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: `QCS Cargo <${FROM_EMAIL}>`,
      to: [to],
      replyTo: REPLY_TO_EMAIL,
      subject: 'Sign in to QCS Cargo',
      html: generateMagicLinkEmailHtml({ name, magicLinkUrl, expiresIn }),
      text: generateMagicLinkEmailText({ name, magicLinkUrl, expiresIn })
    });

    if (error) {
      console.error('[email] Failed to send magic link:', error);
      return { success: false, error };
    }

    console.log('[email] Magic link sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('[email] Unexpected error sending magic link:', err);
    return { success: false, error: err };
  }
}
```

### Error Handling

- Rate limiting: Max 3 magic link requests per email per hour
- Invalid email: Return generic "check your email" message (security)
- Expired token: Clear and prompt to request new link
- Used token: Invalidate immediately after use (one-time use)

---

## Testing Checklist

### Unit Tests
- [ ] Magic link token generation
- [ ] Token validation and expiration
- [ ] Email template rendering
- [ ] Cookie setting/clearing

### Integration Tests
- [ ] Full magic link flow (request → email → verify → dashboard)
- [ ] Invalid/expired token handling
- [ ] Rate limiting
- [ ] Session management

### E2E Tests
- [ ] New user registration via magic link
- [ ] Existing user login via magic link
- [ ] Logout functionality
- [ ] Protected route access

---

## Rollback Plan

If issues arise:
1. Revert environment variables
2. Restore Kinde API routes from git
3. Revert hooks.server.ts
4. Reinstall `@kinde-oss/kinde-auth-sveltekit`

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: New Infrastructure | 2-3 hours | None |
| Phase 2: Resend Integration | 1-2 hours | Phase 1 |
| Phase 3: Server Hooks | 1-2 hours | Phase 1, 2 |
| Phase 4: Client Updates | 2-3 hours | Phase 1, 3 |
| Phase 5: Remove Kinde | 30 mins | Phase 1-4 |
| Phase 6: Database Updates | 30 mins | Can be done early |
| Testing | 2-3 hours | All phases |

**Total Estimated Time: 10-14 hours**

---

## Files to Create

```
src/routes/(auth)/+layout.svelte
src/routes/(auth)/login/+page.svelte
src/routes/(auth)/register/+page.svelte
src/routes/(auth)/verify/+page.svelte
src/routes/api/auth/magic-link/request/+server.ts
src/routes/api/auth/magic-link/verify/+server.ts
src/routes/api/auth/logout/+server.ts
src/lib/server/magic-link.ts
```

## Files to Modify

```
src/hooks.server.ts
src/lib/stores/auth.ts
src/lib/server/email.ts
src/lib/pocketbase.ts
src/lib/components/layout/PublicHeader.svelte
src/lib/components/layout/dashboard/Header.svelte
src/lib/components/landing/Calculator.svelte
src/lib/components/calculator/CalculationResult.svelte
src/routes/dashboard/+layout.server.ts
.env
.env.example
package.json
```

## Files to Delete

```
src/routes/api/auth/[...kindeAuth]/+server.ts
src/routes/api/auth/oauth-sync/+server.ts
src/lib/server/kinde-sync.ts
```

---

## Environment Variables (New)

```env
# PocketBase (existing)
PUBLIC_POCKETBASE_URL=https://api.qcs-cargo.com
POCKETBASE_ADMIN_EMAIL=admin@qcs-cargo.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password

# Resend Email (existing, verify configured)
RESEND_API_KEY=re_xxxxxxxx
FROM_EMAIL=noreply@qcs-cargo.com
REPLY_TO_EMAIL=support@qcs-cargo.com

# Auth Configuration (new)
AUTH_COOKIE_SECRET=generate-a-secure-random-string
MAGIC_LINK_EXPIRY_MINUTES=10
PUBLIC_SITE_URL=https://qcs-cargo.com
```

---

## Security Considerations

1. **Token Security**: Use cryptographically secure random tokens
2. **One-Time Use**: Tokens invalidated immediately after use
3. **Expiration**: Short expiration (10 minutes)
4. **Rate Limiting**: Prevent abuse of magic link requests
5. **HTTPS Only**: All auth operations over HTTPS
6. **HttpOnly Cookies**: Session cookies not accessible via JavaScript
7. **CSRF Protection**: SvelteKit's built-in CSRF protection
8. **Secure Cookie Flags**: `Secure`, `HttpOnly`, `SameSite=Lax`
