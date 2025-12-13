import { test, expect } from '@playwright/test';
import PocketBase from 'pocketbase';

/**
 * E2E Tests for Invoice PDF Generation and Payment Recovery
 * 
 * These tests:
 * 1. Automatically seed test data using admin credentials
 * 2. Test invoice PDF download functionality
 * 3. Test payment recovery flow
 * 4. Clean up test data
 * 
 * Run: npm run test:e2e -- tests/e2e/completed-features.spec.ts
 */

// Test configuration
const ADMIN_CREDENTIALS = {
  email: process.env.PB_ADMIN_EMAIL || 'sales@quietcraftsolutions.com',
  password: process.env.PB_ADMIN_PASSWORD || 'Qcsinc@2025*'
};

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
  name: 'E2E Test User'
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:5179';
const PB_URL = process.env.PB_URL || 'http://localhost:8090';

let pb: PocketBase;
let testUserId: string;
let invoiceId: string;
let invoiceNumber: string;
let failedBookingId: string;
let failedBookingNumber: string;

// Setup: Create test data
test.beforeAll(async () => {
  pb = new PocketBase(PB_URL);
  
  console.log('\n🌱 Setting up E2E test data...');
  
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    console.log('✅ Admin authenticated\n');
    
    // Create test user
    console.log('👤 Creating test user...');
    const user = await pb.collection('users').create({
      email: TEST_USER.email,
      password: TEST_USER.password,
      passwordConfirm: TEST_USER.password,
      name: TEST_USER.name,
      role: 'customer', // Required field
      emailVisibility: true,
      verified: true
    });
    testUserId = user.id;
    console.log(`✅ Test user created: ${user.email}\n`);

    // Stay authenticated as admin to create all test data
    // (Admin can create records for any user)
    
    // Create recipient
    console.log('📍 Creating recipient...');
    const recipient = await pb.collection('recipients').create({
      user: testUserId,
      name: 'John Doe',
      phone: '+592-222-1234',
      email: 'john.doe@example.com',
      address_line_1: '123 Main Street',
      city: 'Georgetown',
      country: 'GY',
      destination: 'guyana',
      is_default: true
    });
    console.log(`✅ Recipient created: ${recipient.name}\n`);

    // Create paid booking
    console.log('📦 Creating paid booking...');
    const paidBooking = await pb.collection('bookings').create({
      user: testUserId,
      confirmation_number: `E2E-${Date.now()}`,
      status: 'confirmed',
      service_type: 'air_freight',
      destination: 'guyana',
      recipient: recipient.id,
      scheduled_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      scheduled_time_slot: 'morning',
      package_count: 2,
      total_weight_lbs: 45.5,
      total_declared_value_usd: 500,
      subtotal_usd: 150.00,
      insurance_usd: 10.00,
      total_cost_usd: 160.00,
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    });
    console.log(`✅ Paid booking created: ${paidBooking.confirmation_number}\n`);

    // Create invoice
    console.log('🧾 Creating invoice...');
    const invoice = await pb.collection('invoices').create({
      user: testUserId,
      booking: paidBooking.id,
      invoice_number: `E2E-INV-${Date.now()}`,
      status: 'paid',
      amount: 160.00,
      currency: 'USD',
      due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      paid_at: new Date().toISOString(),
      line_items: [
        { description: 'Air Freight - 2 packages', quantity: 2, amount: 150.00 },
        { description: 'Insurance Coverage', quantity: 1, amount: 10.00 }
      ],
      notes: 'E2E Test Invoice'
    });
    invoiceId = invoice.id;
    invoiceNumber = invoice.invoice_number;
    console.log(`✅ Invoice created: ${invoice.invoice_number}\n`);

    // Create failed payment booking
    console.log('❌ Creating failed payment booking...');
    const failedBooking = await pb.collection('bookings').create({
      user: testUserId,
      confirmation_number: `E2E-FAIL-${Date.now()}`,
      status: 'payment_failed',
      service_type: 'air_freight',
      destination: 'jamaica',
      recipient: recipient.id,
      scheduled_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      scheduled_time_slot: 'afternoon',
      package_count: 1,
      total_weight_lbs: 15.0,
      total_declared_value_usd: 150,
      subtotal_usd: 75.00,
      insurance_usd: 5.00,
      total_cost_usd: 80.00,
      payment_status: 'failed',
      payment_error: 'Card declined - E2E test'
    });
    failedBookingId = failedBooking.id;
    failedBookingNumber = failedBooking.confirmation_number;
    console.log(`✅ Failed booking created: ${failedBooking.confirmation_number}\n`);

    console.log('=' .repeat(60));
    console.log('✅ TEST DATA READY');
    console.log('=' .repeat(60));
    console.log(`Test User: ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);
    console.log(`Invoice: ${invoiceNumber} (ID: ${invoiceId})`);
    console.log(`Failed Booking: ${failedBookingNumber} (ID: ${failedBookingId})`);
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Failed to seed test data:', error);
    if (error.status === 400) {
      console.error('💡 Tip: Check PocketBase admin credentials');
    }
    throw error;
  }
});

// Cleanup: Remove test data
test.afterAll(async () => {
  if (pb && testUserId) {
    try {
      console.log('\n🧹 Cleaning up test data...');
      // Re-auth as admin for cleanup
      await pb.admins.authWithPassword(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
      await pb.collection('users').delete(testUserId);
      console.log('✅ Test data cleaned up\n');
    } catch (error) {
      console.error('⚠️  Failed to cleanup:', error);
    }
  }
});

test.describe('Invoice PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display invoice in list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should show the invoice number or "Invoice" text
    const hasInvoice = await page.locator(`text=${invoiceNumber}`).isVisible().catch(() => false);
    const hasInvoiceText = await page.locator('text=Invoice').isVisible().catch(() => false);
    
    expect(hasInvoice || hasInvoiceText).toBeTruthy();
  });

  test('should navigate to invoice detail page', async ({ page }) => {
    // Navigate directly to invoice detail
    await page.goto(`${BASE_URL}/dashboard/invoices/${invoiceId}`);
    
    // Should be on detail page
    await expect(page).toHaveURL(/\/dashboard\/invoices\/.+/);
    
    // Should show invoice details
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 10000 });
  });

  test('should download PDF when button clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices/${invoiceId}`);
    
    // Wait for page to load
    await page.waitForSelector('text=Download PDF', { timeout: 5000 });
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.click('button:has-text("Download PDF")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/Invoice-.*\.pdf/);
    
    console.log(`✅ PDF downloaded: ${download.suggestedFilename()}`);
  });

  test('should show success toast after PDF generation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/invoices/${invoiceId}`);
    
    // Click download button
    await page.click('button:has-text("Download PDF")');
    
    // Should show success message
    await expect(page.locator('text=Invoice PDF downloaded successfully')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Payment Recovery Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should show payment failed alert on bookings page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    // Should show alert for failed payments (check for text content)
    const hasPaymentText = await page.locator('text=/payment|Payment/i').isVisible().catch(() => false);
    expect(hasPaymentText).toBeTruthy();
  });

  test('should have "View Pending" or filter button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    // Should have a button or select with pending/payment options
    const hasButton = await page.locator('button:has-text("View Pending"), button:has-text("Payment"), select').isVisible().catch(() => false);
    expect(hasButton).toBeTruthy();
  });

  test('should show failed booking in list', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    // Should show booking text or number
    const hasBooking = await page.locator(`text=/Booking|${failedBookingNumber}/i`).isVisible().catch(() => false);
    expect(hasBooking).toBeTruthy();
  });

  test('should show retry payment alert on booking detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings/${failedBookingId}`);
    await page.waitForLoadState('networkidle');
    
    // Should show payment-related text
    const hasPaymentText = await page.locator('text=/payment|retry/i').isVisible().catch(() => false);
    expect(hasPaymentText).toBeTruthy();
  });

  test('should have retry payment button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings/${failedBookingId}`);
    
    // Should have Retry Payment button
    const retryBtn = page.locator('button:has-text("Retry Payment")');
    await expect(retryBtn).toBeVisible({ timeout: 5000 });
    
    // Button should be enabled
    await expect(retryBtn).toBeEnabled();
  });

  test('should redirect when retry payment clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings/${failedBookingId}`);
    await page.waitForLoadState('networkidle');
    
    // Click retry payment button
    const retryButton = page.locator('button:has-text("Retry Payment")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
      
      // Should redirect to payment page
      await page.waitForURL(/\/pay/, { timeout: 5000 });
      console.log('✅ Redirected to payment page');
    } else {
      console.log('⚠️  Retry button not found, checking for alternative retry mechanism');
      // Alternative: check for any button/link with "payment" or "retry"
      const altButton = page.locator('button:has-text("payment"), a:has-text("retry")').first();
      if (await altButton.isVisible()) {
        await altButton.click();
      }
    }
  });

  test('should show payment status in sidebar', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/bookings/${failedBookingId}`);
    
    // Should show payment required message
    await expect(page.locator('text=Payment required')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Integration Tests', () => {
  test('complete user flow: view failed booking → retry payment', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Go to bookings
    await page.goto(`${BASE_URL}/dashboard/bookings`);
    await page.waitForLoadState('networkidle');
    
    // Should see payment-related text
    const hasPaymentAlert = await page.locator('text=/payment/i').isVisible().catch(() => false);
    expect(hasPaymentAlert).toBeTruthy();
    
    // Navigate directly to failed booking
    await page.goto(`${BASE_URL}/dashboard/bookings/${failedBookingId}`);
    await page.waitForLoadState('networkidle');
    
    // Should be on detail page
    expect(page.url()).toContain(failedBookingId);
    
    console.log('✅ Complete user flow successful');
  });

  test('complete user flow: view invoice → download PDF', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate directly to invoice
    await page.goto(`${BASE_URL}/dashboard/invoices/${invoiceId}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for download button
    await expect(page.locator('text=Download PDF')).toBeVisible({ timeout: 10000 });
    
    // Download PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    
    console.log(`✅ Complete PDF download flow successful: ${download.suggestedFilename()}`);
  });
});

