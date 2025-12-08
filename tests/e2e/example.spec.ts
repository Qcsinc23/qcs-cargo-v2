import { test, expect } from '@playwright/test';

test('home page has expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/QCS Cargo/);
});

test('home page has main heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /QCS Cargo/i })).toBeVisible();
});

test('skip link is focusable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByText('Skip to main content');
  await expect(skipLink).toBeFocused();
});