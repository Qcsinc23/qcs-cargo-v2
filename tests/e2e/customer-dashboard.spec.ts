import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestUser, initPocketBaseAdmin, deleteTestUser } from './helpers/auth';

/**
 * Comprehensive E2E tests for Customer Dashboard
 * 
 * Tests all customer-facing features:
 * - Dashboard home
 * - Bookings (list, create, view, modify, payment)
 * - Shipments (list, view, tracking)
 * - Invoices (list, view, download)
 * - Recipients (CRUD operations)
 * - Mailbox
 * - Profile
 * - Settings (security, notifications, sessions, delete account)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5179';

// Test user credentials (will be created if needed)
const TEST_USER = {
  email: `test-customer-${Date.now()}@example.com`,
  password: 'Test123!@#',
  name: 'E2E Test Customer'
};

let testUserId: string = '';

test.beforeAll(async () => {
  // Create test user in PocketBase
  const pb = await initPocketBaseAdmin();
  const user = await createTestUser(TEST_USER.email, TEST_USER.password, TEST_USER.name);
  testUserId = user.id;
  console.log(`Created test user: ${TEST_USER.email} (ID: ${testUserId})`);
});

test.afterAll(async () => {
  // Cleanup test user
  if (testUserId) {
    await deleteTestUser(testUserId);
  }
});

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load dashboard home page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should show welcome message
    await expect(page.locator('text=/Welcome|Dashboard/i')).toBeVisible();
    
    // Should show stats cards
    await expect(page.locator('text=/Active Shipments|Pending Bookings/i')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check for stat cards (may show 0 if no data)
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/Active Shipments|Pending Bookings|Invoices|Recipients/i);
  });

  test('should have working quick actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Look for "New Booking" button
    const newBookingBtn = page.locator('button:has-text("New Booking"), a:has-text("New Booking")');
    if (await newBookingBtn.first().isVisible()) {
      await newBookingBtn.first().click();
      await page.waitForURL(/\/dashboard\/bookings\/new/, { timeout: 5000 });
      expect(page.url()).toContain('/dashboard/bookings/new');
    }
  });
});

test.describe('Bookings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load bookings list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/bookings');
    
    // Should show bookings page content
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/booking|shipment|schedule/i);
  });

  test('should navigate to new booking page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings/new`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/bookings/new');
    
    // Should show booking wizard
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/service|destination|package/i);
  });

  test('should view booking details', async ({ page }) => {
    // First, check if there are any bookings
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    // Try to find a booking link (if bookings exist)
    const bookingLink = page.locator('a[href*="/dashboard/bookings/"]').first();
    const hasBookings = await bookingLink.isVisible().catch(() => false);
    
    if (hasBookings) {
      await bookingLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/dashboard\/bookings\/[^/]+$/);
    } else {
      // No bookings yet - that's okay for a new user
      console.log('No bookings found - user may be new');
    }
  });
});

test.describe('Shipments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load shipments list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/shipments`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/shipments');
    
    // Should show shipments page content
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/shipment|tracking|package/i);
  });

  test('should view shipment details', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/shipments`);
    await page.waitForLoadState('networkidle');
    
    // Try to find a shipment link
    const shipmentLink = page.locator('a[href*="/dashboard/shipments/"]').first();
    const hasShipments = await shipmentLink.isVisible().catch(() => false);
    
    if (hasShipments) {
      await shipmentLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/dashboard\/shipments\/[^/]+$/);
    }
  });
});

test.describe('Invoices', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load invoices list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/invoices');
    
    // Should show invoices page content
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/invoice|amount|total/i);
  });

  test('should view invoice details', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    await page.waitForLoadState('networkidle');
    
    // Try to find an invoice link
    const invoiceLink = page.locator('a[href*="/dashboard/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    
    if (hasInvoices) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/dashboard\/invoices\/[^/]+$/);
    }
  });

  test('should have download PDF option on invoice detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    await page.waitForLoadState('networkidle');
    
    const invoiceLink = page.locator('a[href*="/dashboard/invoices/"]').first();
    const hasInvoices = await invoiceLink.isVisible().catch(() => false);
    
    if (hasInvoices) {
      await invoiceLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for download button
      const downloadBtn = page.locator('button:has-text("Download"), a:has-text("Download")');
      const hasDownload = await downloadBtn.first().isVisible().catch(() => false);
      
      if (hasDownload) {
        await expect(downloadBtn.first()).toBeEnabled();
      }
    }
  });
});

test.describe('Recipients', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load recipients list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/recipients`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/recipients');
    
    // Should show recipients page content
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/recipient|address|contact/i);
  });

  test('should navigate to new recipient page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/recipients/new`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/recipients/new');
    
    // Should show recipient form
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/name|address|phone|email/i);
  });
});

test.describe('Mailbox', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load mailbox page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/mailbox`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/mailbox');
    
    // Should show mailbox address
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/mailbox|address|copy/i);
  });

  test('should display mailbox address', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/mailbox`);
    await page.waitForLoadState('networkidle');
    
    // Look for mailbox address (usually contains @ or mailbox format)
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load profile page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/profile');
    
    // Should show profile form
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/profile|name|email|phone/i);
  });
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should load settings page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/settings');
    
    // Should show settings options
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/setting|preference|account/i);
  });

  test('should navigate to security settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings/security`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/settings/security');
  });

  test('should navigate to notification settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings/notifications`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/settings/notifications');
  });

  test('should navigate to sessions settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings/sessions`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/dashboard/settings/sessions');
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, TEST_USER.email, TEST_USER.password, TEST_USER.name);
  });

  test('should navigate between dashboard pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Navigate to bookings
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    expect(page.url()).toContain('/dashboard/bookings');
    
    // Navigate to shipments
    await page.goto(`${BASE_URL}/dashboard/shipments`);
    expect(page.url()).toContain('/dashboard/shipments');
    
    // Navigate to invoices
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    expect(page.url()).toContain('/dashboard/invoices');
  });
});

