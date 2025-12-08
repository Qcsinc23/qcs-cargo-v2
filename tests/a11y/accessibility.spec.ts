import { test, expect } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('home page should not have automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });
});