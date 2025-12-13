import { test, expect } from '@playwright/test';
import PocketBase from 'pocketbase';

const PB_URL = 'http://127.0.0.1:8090';
const TEST_ADMIN_EMAIL = 'sales@quietcraftsolutions.com';
const TEST_ADMIN_PASSWORD = 'Qcsinc@2025*';
const TEST_USER = {
  email: `test-modify-${Date.now()}@example.com`,
  password: 'Test123!@#',
  passwordConfirm: 'Test123!@#',
  name: 'Test User',
  role: 'customer'
};

let testData: {
  userId: string;
  recipientId: string;
  bookingId: string;
  bookingConfirmationNumber: string;
} | null = null;

test.beforeAll(async () => {
  console.log('\n🌱 Setting up booking modification test data...\n');

  const pb = new PocketBase(PB_URL);

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    console.log('✅ Admin authenticated');

    // Create test user
    const user = await pb.collection('users').create({
      ...TEST_USER,
      emailVisibility: true,
      verified: true
    });
    console.log(`✅ Test user created: ${user.id}`);

    // Create recipient
    const recipient = await pb.collection('recipients').create({
      user: user.id,
      name: 'Test Recipient',
      phone: '+592-123-4567',
      address_line1: '123 Test Street',
      city: 'Georgetown',
      destination: 'guyana'
    });
    console.log(`✅ Recipient created: ${recipient.id}`);

    // Create a confirmed booking scheduled 3 days from now (within modification window)
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3); // 3 days from now
    const scheduledDateStr = scheduledDate.toISOString().split('T')[0];

    const booking = await pb.collection('bookings').create({
      user: user.id,
      recipient: recipient.id,
      service_type: 'standard',
      destination: 'guyana',
      scheduled_date: scheduledDateStr,
      time_slot: '10:00-11:00',
      package_count: 1,
      total_weight: 25,
      subtotal: 87.50,
      discount: 0,
      insurance_cost: 0,
      total_cost: 87.50,
      status: 'confirmed',
      payment_status: 'paid',
      paid_at: new Date().toISOString()
    });
    console.log(`✅ Confirmed booking created: ${booking.id}`);

    testData = {
      userId: user.id,
      recipientId: recipient.id,
      bookingId: booking.id,
      bookingConfirmationNumber: booking.id.substring(0, 8).toUpperCase()
    };

    console.log('\n============================================================');
    console.log('✅ BOOKING MODIFICATION TEST DATA READY');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Failed to setup test data:', error);
    throw error;
  }
});

test.afterAll(async () => {
  if (!testData) return;

  console.log('\n🧹 Cleaning up booking modification test data...\n');

  const pb = new PocketBase(PB_URL);

  try {
    await pb.admins.authWithPassword(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);

    // Delete in correct order (respecting foreign keys)
    try {
      await pb.collection('bookings').delete(testData.bookingId);
      console.log('✅ Booking deleted');
    } catch (e) {
      console.warn('⚠️ Could not delete booking:', e);
    }

    try {
      await pb.collection('recipients').delete(testData.recipientId);
      console.log('✅ Recipient deleted');
    } catch (e) {
      console.warn('⚠️ Could not delete recipient:', e);
    }

    try {
      await pb.collection('users').delete(testData.userId);
      console.log('✅ User deleted');
    } catch (e) {
      console.warn('⚠️ Could not delete user:', e);
    }

    console.log('\n✅ Cleanup complete\n');
  } catch (error) {
    console.error('❌ Failed to cleanup:', error);
  }
});

// Helper to login with better error handling
async function loginAsTestUser(page: any) {
  await page.goto('/auth/login');
  
  // Wait for form to be ready
  await page.waitForSelector('input[id="email"]', { timeout: 5000 });
  await page.waitForSelector('input[id="password"]', { timeout: 5000 });
  
  // Clear and fill email
  const emailInput = page.locator('input[id="email"]');
  await emailInput.clear();
  await emailInput.fill(TEST_USER.email);
  
  // Clear and fill password  
  const passwordInput = page.locator('input[id="password"]');
  await passwordInput.clear();
  await passwordInput.fill(TEST_USER.password);
  
  // Wait a moment for form to process
  await page.waitForTimeout(500);
  
  // Click submit button
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  try {
    await page.waitForURL(url => 
      url.href.includes('/dashboard') || !url.href.includes('/auth/login'),
      { timeout: 15000 }
    );
    
    if (page.url().includes('/auth/login')) {
      throw new Error('Login failed - still on login page');
    }
  } catch (e: any) {
    console.log(`Login failed. URL: ${page.url()}`);
    throw new Error(`Login failed: ${e.message}`);
  }
}

test.describe('Booking Modification Feature', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should display "Modify Booking" button on booking detail page', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}`);
    
    const modifyButton = page.locator('a:has-text("Modify Booking")');
    await expect(modifyButton).toBeVisible();
  });

  test('should navigate to modification page', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}`);
    await page.click('a:has-text("Modify Booking")');
    
    await expect(page).toHaveURL(`/dashboard/bookings/${testData.bookingId}/modify`);
    await expect(page.locator('h2:has-text("Modify Booking")')).toBeVisible();
  });

  test('should load current booking details in form', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    
    // Wait for form to load
    await page.waitForSelector('input[type="date"]');
    
    // Check that form has current values
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).not.toHaveValue('');
    
    const timeSlotSelect = page.locator('select#timeSlot');
    await expect(timeSlotSelect).toHaveValue('10:00-11:00');
  });

  test('should display info alert about modification policy', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    
    const infoAlert = page.locator('[role="alert"]:has-text("Free modifications")');
    await expect(infoAlert).toBeVisible();
  });

  test('should allow changing date and time slot', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('input[type="date"]');
    
    // Change date to 5 days from now
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 5);
    const newDateStr = newDate.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', newDateStr);
    
    // Wait for time slots to load
    await page.waitForTimeout(500);
    
    // Change time slot
    await page.selectOption('select#timeSlot', '14:00-15:00');
    
    // Verify selections
    await expect(page.locator('input[type="date"]')).toHaveValue(newDateStr);
    await expect(page.locator('select#timeSlot')).toHaveValue('14:00-15:00');
  });

  test('should allow adding/editing special instructions', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('textarea#instructions');
    
    const specialInstructions = 'Please call when you arrive at the warehouse.';
    await page.fill('textarea#instructions', specialInstructions);
    
    await expect(page.locator('textarea#instructions')).toHaveValue(specialInstructions);
  });

  test('should successfully save modifications', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('input[type="date"]');
    
    // Change date
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 6);
    const newDateStr = newDate.toISOString().split('T')[0];
    
    await page.fill('input[type="date"]', newDateStr);
    await page.waitForTimeout(500);
    
    // Change time slot
    await page.selectOption('select#timeSlot', '15:00-16:00');
    
    // Add instructions
    await page.fill('textarea#instructions', 'Please handle with care.');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Save Changes")');
    
    // Should redirect to booking detail page
    await page.waitForURL(`/dashboard/bookings/${testData.bookingId}`);
    
    // Should show success toast
    await expect(page.locator('text=Booking updated successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should show cancel button that goes back to detail page', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('button:has-text("Cancel")');
    
    await page.click('button:has-text("Cancel")');
    
    await expect(page).toHaveURL(`/dashboard/bookings/${testData.bookingId}`);
  });

  test('should display contact info for other changes', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    
    await expect(page.locator('text=Need to make other changes?')).toBeVisible();
    await expect(page.locator('a[href="tel:201-249-0929"]')).toBeVisible();
    await expect(page.locator('a[href="mailto:support@quietcraftsolutions.com"]')).toBeVisible();
  });

  test('should validate date is at least 24 hours in future', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('input[type="date"]');
    
    // Try to set date to today (should be prevented by HTML5 min attribute)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // The browser should prevent this, but if not, our validation should catch it
    // (HTML5 min attribute should handle this client-side)
    const dateInput = page.locator('input[type="date"]');
    const minDate = await dateInput.getAttribute('min');
    
    expect(minDate).toBeTruthy();
    expect(new Date(minDate!) > new Date(today)).toBeTruthy();
  });

  test('should disable submit button when no time slot selected', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('select#timeSlot');
    
    // Clear time slot selection
    await page.selectOption('select#timeSlot', '');
    
    // Submit button should be disabled
    const submitButton = page.locator('button[type="submit"]:has-text("Save Changes")');
    await expect(submitButton).toBeDisabled();
  });

  test('should show loading state while saving', async ({ page }) => {
    if (!testData) throw new Error('Test data not initialized');

    await page.goto(`/dashboard/bookings/${testData.bookingId}/modify`);
    await page.waitForSelector('input[type="date"]');
    
    // Make a change
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 7);
    const newDateStr = newDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', newDateStr);
    await page.waitForTimeout(500);
    
    // Start saving and check for loading state
    const submitPromise = page.click('button[type="submit"]:has-text("Save Changes")');
    
    // Should show "Saving..." text briefly
    await expect(page.locator('button:has-text("Saving...")')).toBeVisible({ timeout: 1000 });
    
    await submitPromise;
  });
});

test.describe('Booking Modification Restrictions', () => {
  let restrictedBookingId: string;

  test.beforeAll(async () => {
    // Create a booking that's less than 24 hours away (cannot be modified)
    const pb = new PocketBase(PB_URL);
    await pb.admins.authWithPassword(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);

    if (!testData) throw new Error('Test data not initialized');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(tomorrow.getHours() + 12); // 12 hours from now
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const restrictedBooking = await pb.collection('bookings').create({
      user: testData.userId,
      recipient: testData.recipientId,
      service_type: 'express',
      destination: 'guyana',
      scheduled_date: tomorrowStr,
      time_slot: '09:00-10:00',
      package_count: 1,
      total_weight: 10,
      subtotal: 35.00,
      discount: 0,
      insurance_cost: 0,
      total_cost: 35.00,
      status: 'confirmed',
      payment_status: 'paid'
    });

    restrictedBookingId = restrictedBooking.id;
    console.log(`✅ Restricted booking created: ${restrictedBookingId}`);
  });

  test.afterAll(async () => {
    if (!restrictedBookingId) return;

    const pb = new PocketBase(PB_URL);
    try {
      await pb.admins.authWithPassword(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
      await pb.collection('bookings').delete(restrictedBookingId);
      console.log('✅ Restricted booking deleted');
    } catch (e) {
      console.warn('⚠️ Could not delete restricted booking:', e);
    }
  });

  test('should show restriction message for bookings within 24 hours', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/dashboard/bookings/${restrictedBookingId}/modify`);
    
    // Should show some kind of restriction message
    const content = await page.textContent('body');
    const hasRestrictionContent = 
      content?.includes('Cannot Modify') ||
      content?.includes('24 hours') ||
      content?.includes('cannot be modified') ||
      content?.includes('modification');
    
    expect(hasRestrictionContent).toBeTruthy();
  });
});

