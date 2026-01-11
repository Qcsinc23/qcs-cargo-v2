# Application Cleanup Report

## Summary
This report identifies files, code, and configurations that can be removed or consolidated to improve maintainability.

---

## 🗑️ Files to Remove

### 1. Legacy Authentication Routes (No longer used - Kinde handles auth)
**Location**: `src/routes/auth-legacy/`
- `src/routes/auth-legacy/+layout.server.ts`
- `src/routes/auth-legacy/+layout.svelte`
- `src/routes/auth-legacy/login/+page.svelte`
- `src/routes/auth-legacy/register/+page.svelte`
- `src/routes/auth-legacy/forgot-password/+page.svelte`
- `src/routes/auth-legacy/reset-password/+page.svelte`
- `src/routes/auth-legacy/verify-email/+page.svelte`
- `src/routes/auth-legacy/magic-link/+page.svelte`

**Reason**: These routes are no longer used since authentication is handled by Kinde. The only references are internal links within these files themselves.

### 2. Legacy Authentication API Routes
**Location**: `src/routes/api/auth-legacy/`
- `src/routes/api/auth-legacy/login/+server.ts`
- `src/routes/api/auth-legacy/logout/+server.ts`
- `src/routes/api/auth-legacy/register/+server.ts`

**Reason**: These API endpoints are no longer used. Kinde handles authentication via `/api/auth/[...kindeAuth]`.

### 3. Empty API Route Directories
**Location**: `src/routes/api/auth/`
- `src/routes/api/auth/login/` (empty directory)
- `src/routes/api/auth/register/` (empty directory, if exists)

**Reason**: These directories were created but never populated. Kinde auth uses `/api/auth/[...kindeAuth]` instead.

### 4. Placeholder Scripts
**Location**: `scripts/`
- `scripts/migrate.ts` - Just a placeholder with console.log
- `scripts/seed.ts` - Just a placeholder with console.log

**Reason**: These are empty placeholders that serve no purpose. Remove or implement them.

### 5. Duplicate Schema Setup Script
**Location**: `scripts/`
- `scripts/setup-pocketbase-schema.js` - Duplicate of `setup-full-schema.js`

**Reason**: `setup-full-schema.js` is the active script. The other appears to be an older version.

### 6. Build Artifacts (Should be in .gitignore)
**Location**: `build/`
- Entire `build/` directory

**Reason**: Build artifacts should not be committed to version control. Should be in `.gitignore`.

### 7. Test Results (Should be in .gitignore)
**Location**: `test-results/`
- Entire `test-results/` directory

**Reason**: Test results are generated files and should not be committed.

---

## 🔧 Code to Clean Up

### 1. Unused Auth Store Methods
**File**: `src/lib/stores/auth.ts`

**Methods to remove or deprecate**:
- `login(email, password)` - Only used by legacy routes
- `register(data)` - Only used by legacy routes
- `loginWithGoogle()` - Only used by legacy routes
- `requestPasswordReset()` - Only used by legacy routes
- `confirmPasswordReset()` - Only used by legacy routes
- `requestVerification()` - Only used by legacy routes
- `verifyEmail()` - Only used by legacy routes
- `deleteAccount()` - Check if still used
- `getSessions()` - Check if still used
- `revokeSession()` - Check if still used
- `revokeAllOtherSessions()` - Check if still used
- `updateNotificationPreferences()` - Check if still used

**Action**: After removing legacy routes, these methods can be removed from the auth store.

### 2. Client-Side PocketBase Instance
**File**: `src/lib/pocketbase.ts`

**Issue**: This creates a client-side PocketBase instance, but since we're using Kinde for auth and server-side PocketBase for data, this may not be needed.

**Check**: Verify if `pb` from this file is still used anywhere:
- `src/lib/stores/auth.ts` - Uses it for avatar URLs
- Any other client-side usage?

**Action**: If only used for `getFileUrl()`, consider moving that to a utility function.

### 3. Unused API Routes
**Check these routes for usage**:
- `/api/auth/avatar/+server.ts` - Verify if still used
- `/api/auth/delete-account/+server.ts` - Verify if still used
- `/api/auth/password/+server.ts` - Verify if still used
- `/api/auth/profile/+server.ts` - Verify if still used
- `/api/auth/sessions/*` - Verify if still used
- `/api/auth/oauth-sync/+server.ts` - Verify if still used

**Action**: Audit each route to see if it's still needed with Kinde auth.

---

## 📁 Directory Structure Cleanup

### 1. Archive Documentation
**Location**: `docs/archive/`

**Action**: Consider moving very old docs to a separate archive or removing if no longer relevant.

### 2. Performance Tracking
**Location**: `src/lib/performance/`

**Action**: Verify if performance tracking is actively used. If not, consider removing or documenting its purpose.

---

## 🔍 Files to Review (May Need Updates)

### 1. Service Worker
**File**: `src/service-worker.js`

**Action**: Verify it doesn't cache legacy auth routes.

### 2. Sitemap
**File**: `src/routes/sitemap.xml/+server.ts`

**Action**: Ensure it doesn't include legacy auth routes.

### 3. Email Templates
**File**: `src/lib/server/email.ts`

**Action**: Verify all email links point to correct routes (not legacy auth routes).

---

## ✅ Recommended Actions

### Phase 1: Safe Removals (No Breaking Changes)
1. ✅ Remove `build/` directory and add to `.gitignore`
2. ✅ Remove `test-results/` directory and add to `.gitignore`
3. ✅ Remove placeholder scripts (`migrate.ts`, `seed.ts`)
4. ✅ Remove duplicate schema script (`setup-pocketbase-schema.js`)
5. ✅ Remove empty API route directories

### Phase 2: Legacy Code Removal (After Verification)
1. ⚠️ Remove `src/routes/auth-legacy/` directory
2. ⚠️ Remove `src/routes/api/auth-legacy/` directory
3. ⚠️ Remove unused methods from `src/lib/stores/auth.ts`
4. ⚠️ Audit and remove unused API routes in `/api/auth/`

### Phase 3: Code Consolidation
1. 🔄 Review client-side `pocketbase.ts` usage
2. 🔄 Consolidate duplicate PocketBase utilities
3. 🔄 Update all internal links to remove legacy route references

---

## 📊 Impact Assessment

### Breaking Changes
- **None** if legacy routes are truly unused
- **Low** if only removing unused methods

### Testing Required
- Verify no internal links point to legacy routes
- Verify no API calls use legacy endpoints
- Verify Kinde auth flow still works after cleanup

---

## 🎯 Priority

1. **High**: Remove build artifacts and test results (should be in .gitignore)
2. **Medium**: Remove legacy auth routes and API endpoints
3. **Low**: Clean up unused methods and consolidate utilities

