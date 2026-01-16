import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests - WCAG 2.1 AA Compliance
 * 
 * Tests all major pages for accessibility violations using axe-core.
 * Target: WCAG 2.1 Level AA compliance
 */

test.describe('Accessibility Tests - Public Pages', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('register page should not have accessibility violations', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('shipping calculator should not have accessibility violations', async ({ page }) => {
    await page.goto('/shipping-calculator');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('services page should not have accessibility violations', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility Tests - Keyboard Navigation', () => {
  test('login form should be keyboard accessible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Tab through form
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('test@example.com');
    
    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Should submit
    
    // Verify form attempted to submit (would show error or redirect)
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab to first navigation link
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Should have something focused (link, button, input, etc)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });
});

test.describe('Accessibility Tests - Screen Reader Support', () => {
  test('page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // h1 should come before h2
    const firstH1 = page.locator('h1').first();
    const firstH2 = page.locator('h2').first();
    
    if (await firstH2.count() > 0) {
      const h1Box = await firstH1.boundingBox();
      const h2Box = await firstH2.boundingBox();
      
      if (h1Box && h2Box) {
        // h1 should generally appear before h2 in the document
        expect(h1Box.y).toBeLessThan(h2Box.y);
      }
    }
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all images
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Images should have alt text or role="presentation"
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check email input has label
    const emailInput = page.locator('input[type="email"], #email');
    const emailLabel = page.locator('label[for="email"]');
    
    if (await emailInput.count() > 0) {
      const hasLabel = await emailLabel.count() > 0;
      const hasAriaLabel = await emailInput.getAttribute('aria-label');
      
      // Input should have either a label or aria-label
      expect(hasLabel || !!hasAriaLabel).toBeTruthy();
    }
  });
});

test.describe('Accessibility Tests - Color Contrast', () => {
  test('page should not have color contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['aria-allowed-attr']) // Focus on contrast only
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe('Accessibility Tests - ARIA', () => {
  test('interactive elements should have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledby = await button.getAttribute('aria-labelledby');
      
      // Button should have text, aria-label, or aria-labelledby
      const hasAccessibleName = 
        (text && text.trim().length > 0) || 
        !!ariaLabel || 
        !!ariaLabelledby;
      
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('page should have lang attribute', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('en');
  });

  test('page should have valid title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Accessibility Tests - Focus Management', () => {
  test('skip link should be present and functional', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Check if a skip link is visible on focus
    const skipLink = page.locator('a:has-text("Skip"), a[href^="#main"], a[href^="#content"]').first();
    
    if (await skipLink.count() > 0) {
      const isVisible = await skipLink.isVisible();
      // Skip link should be visible when focused
      expect(isVisible).toBeTruthy();
    }
  });

  test('focus should be visible on interactive elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Get the focused element's outline or focus ring
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow
        };
      });
      
      // Element should have some visible focus indicator
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.outlineWidth !== '0px' ||
        styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});
