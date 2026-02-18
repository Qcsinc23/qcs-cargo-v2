import type { Page } from '@playwright/test';
import PocketBase from 'pocketbase';

/**
 * Authentication helpers for E2E tests
 * 
 * The app uses a PocketBase auth token stored in the httpOnly `pb_auth` cookie.
 * For E2E, we bypass UI/email flows by:
 * - Creating test users via PocketBase admin
 * - Authenticating via PocketBase `authWithPassword`
 * - Setting `pb_auth` cookie in the browser context
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5179';
const PB_URL = process.env.PB_URL || 'http://localhost:8090';

// Admin credentials for PocketBase (for test data setup)
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD;

let pb: PocketBase | null = null;

/**
 * Initialize PocketBase admin client for test data setup
 */
export async function initPocketBaseAdmin(): Promise<PocketBase> {
  if (pb && pb.authStore.isValid) {
    return pb;
  }

  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    throw new Error(
      'Missing PocketBase admin creds for tests (PB_ADMIN_EMAIL/PB_ADMIN_PASSWORD or POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD)'
    );
  }

  pb = new PocketBase(PB_URL);
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  return pb;
}

async function setAuthCookie(page: Page, token: string): Promise<void> {
  if (!token) throw new Error('Missing PocketBase auth token');
  await page.context().addCookies([
    {
      name: 'pb_auth',
      value: token,
      url: BASE_URL,
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);
}

async function loginByCookie(page: Page, email: string, password: string, redirectPath: string): Promise<void> {
  const userPb = new PocketBase(PB_URL);
  await userPb.collection('users').authWithPassword(email, password);
  await setAuthCookie(page, userPb.authStore.token);
  await page.goto(`${BASE_URL}${redirectPath}`);
}

/**
 * Create a test user in PocketBase
 * This creates the user record that will be synced with Kinde
 */
export async function createTestUser(email: string, password: string, name: string) {
  const adminPb = await initPocketBaseAdmin();
  
  try {
    // Check if user already exists
    const existing = await adminPb.collection('users').getFirstListItem(`email = "${email}"`).catch(() => null);
    if (existing) {
      return existing;
    }

    // Create user in PocketBase
    const user = await adminPb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      role: 'customer',
      emailVisibility: true,
      verified: true
    });

    return user;
  } catch (error: any) {
    if (error.status === 400 && error.data?.email?.message?.includes('already exists')) {
      // User already exists, fetch it
      return await adminPb.collection('users').getFirstListItem(`email = "${email}"`);
    }
    throw error;
  }
}

/**
 * Create a test admin user in PocketBase
 */
export async function createTestAdmin(email: string, password: string, name: string) {
  const adminPb = await initPocketBaseAdmin();
  
  try {
    const existing = await adminPb.collection('users').getFirstListItem(`email = "${email}"`).catch(() => null);
    if (existing) {
      // Update to admin if not already
      if (existing.role !== 'admin') {
        return await adminPb.collection('users').update(existing.id, { role: 'admin' });
      }
      return existing;
    }

    const user = await adminPb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      role: 'admin',
      emailVisibility: true,
      verified: true
    });

    return user;
  } catch (error: any) {
    if (error.status === 400 && error.data?.email?.message?.includes('already exists')) {
      const user = await adminPb.collection('users').getFirstListItem(`email = "${email}"`);
      if (user.role !== 'admin') {
        return await adminPb.collection('users').update(user.id, { role: 'admin' });
      }
      return user;
    }
    throw error;
  }
}

/**
 * Login as a test user (creates user if needed, then authenticates)
 */
export async function loginAsTestUser(
  page: Page,
  email: string = `test-${Date.now()}@example.com`,
  password: string = 'Test123!@#',
  name: string = 'E2E Test User'
): Promise<{ email: string; password: string; userId: string }> {
  // Create user in PocketBase first
  const user = await createTestUser(email, password, name);

  await loginByCookie(page, email, password, '/dashboard');
  
  return { email, password, userId: user.id };
}

/**
 * Login as admin (creates admin user if needed, then authenticates)
 */
export async function loginAsAdmin(
  page: Page,
  email: string = `admin-${Date.now()}@example.com`,
  password: string = 'Admin123!@#',
  name: string = 'E2E Admin User'
): Promise<{ email: string; password: string; userId: string }> {
  // Create admin user in PocketBase
  const user = await createTestAdmin(email, password, name);

  await loginByCookie(page, email, password, '/admin');
  
  return { email, password, userId: user.id };
}

/**
 * Cleanup test user
 */
export async function deleteTestUser(userId: string): Promise<void> {
  if (!pb) {
    await initPocketBaseAdmin();
  }
  
  try {
    await pb!.collection('users').delete(userId);
  } catch (error: any) {
    if (error.status !== 404) {
      console.warn(`Failed to delete test user ${userId}:`, error.message);
    }
  }
}

/**
 * Check if user is logged in (by checking for dashboard/admin in URL or auth indicators)
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/dashboard') || url.includes('/admin');
}
