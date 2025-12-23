import { Page } from '@playwright/test';
import PocketBase from 'pocketbase';

/**
 * Authentication helpers for E2E tests
 * 
 * Since the app uses Kinde for authentication, we need to:
 * 1. Create users in PocketBase (for data)
 * 2. Authenticate via Kinde's OAuth flow (for session)
 * 
 * For testing, we can either:
 * - Use Kinde's test mode (if available)
 * - Create test users in Kinde and authenticate normally
 * - Use PocketBase admin auth to bypass Kinde for test data setup
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5179';
const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const KINDE_LOGIN_URL = process.env.KINDE_LOGIN_URL || `${BASE_URL}/api/auth/login`;

// Admin credentials for PocketBase (for test data setup)
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'sales@quietcraftsolutions.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Qcsinc@2025*';

let pb: PocketBase | null = null;

/**
 * Initialize PocketBase admin client for test data setup
 */
export async function initPocketBaseAdmin(): Promise<PocketBase> {
  if (pb && pb.authStore.isValid) {
    return pb;
  }

  pb = new PocketBase(PB_URL);
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  return pb;
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
 * Login via Kinde OAuth flow
 * 
 * Note: This requires the user to already exist in Kinde.
 * For testing, you may need to:
 * 1. Create the user in Kinde's dashboard first, OR
 * 2. Use Kinde's test mode if available, OR
 * 3. Register the user via the normal signup flow first
 */
export async function loginWithKinde(page: Page, email: string, password: string): Promise<void> {
  // Navigate to login page (redirects to Kinde)
  await page.goto(KINDE_LOGIN_URL);
  
  // Wait for Kinde login page to load
  // Kinde's login page has email/password fields
  try {
    await page.waitForSelector('input[type="email"], input[name="email"], input[id="email"]', { timeout: 15000 });
  } catch (error) {
    // If we're already redirected (maybe already logged in), check current URL
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/admin')) {
      console.log('Already logged in, skipping login');
      return;
    }
    throw new Error(`Kinde login page did not load. Current URL: ${currentUrl}`);
  }
  
  // Fill email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
  await emailInput.fill(email);
  
  // Fill password
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[id="password"]').first();
  await passwordInput.fill(password);
  
  // Submit form
  await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first().click();
  
  // Wait for redirect back to app
  // After successful login, Kinde redirects to the callback URL
  try {
    await page.waitForURL((url) => 
      url.href.includes('/dashboard') || 
      url.href.includes('/api/auth/kinde_callback') ||
      (!url.href.includes('kinde.com') && !url.href.includes('/api/auth/login')),
      { timeout: 30000 }
    );
  } catch (error) {
    // Check if we're on an error page
    const currentUrl = page.url();
    const pageContent = await page.textContent('body').catch(() => '');
    if (pageContent?.toLowerCase().includes('error') || pageContent?.toLowerCase().includes('invalid')) {
      throw new Error(`Login failed - error on page: ${pageContent.substring(0, 200)}`);
    }
    throw new Error(`Login timeout - still on: ${currentUrl}`);
  }
  
  // If we're on the callback page, wait for final redirect
  if (page.url().includes('/api/auth/kinde_callback')) {
    await page.waitForURL((url) => 
      url.href.includes('/dashboard') || url.href.includes('/admin'),
      { timeout: 10000 }
    );
  }
  
  // Verify we're logged in (should be on dashboard or admin)
  const finalUrl = page.url();
  if (!finalUrl.includes('/dashboard') && !finalUrl.includes('/admin')) {
    throw new Error(`Login failed - unexpected redirect to: ${finalUrl}`);
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
  
  // Note: The user also needs to exist in Kinde for authentication to work
  // For now, we'll attempt login and handle the error if user doesn't exist in Kinde
  try {
    await loginWithKinde(page, email, password);
  } catch (error: any) {
    // If login fails because user doesn't exist in Kinde, we need to register first
    if (error.message.includes('login') || page.url().includes('/api/auth/login')) {
      console.warn(`User ${email} may not exist in Kinde. Please create the user in Kinde dashboard first, or register via the signup flow.`);
      throw new Error(`User ${email} not found in Kinde. Please create the user in Kinde dashboard or register first.`);
    }
    throw error;
  }
  
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
  
  // Login via Kinde
  try {
    await loginWithKinde(page, email, password);
  } catch (error: any) {
    if (error.message.includes('login') || page.url().includes('/api/auth/login')) {
      console.warn(`Admin user ${email} may not exist in Kinde. Please create the user in Kinde dashboard first.`);
      throw new Error(`Admin user ${email} not found in Kinde. Please create the user in Kinde dashboard first.`);
    }
    throw error;
  }
  
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

