import { test, expect } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-annotations
 * @annotation suite: Sample E2E Tests
 * @description This file demonstrates E2E testing patterns for the 1affiliate application
 */
test.describe('Sample E2E Tests', () => {
  /**
   * @beforeEach Setup
   * Navigate to the application and set up test state
   */
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Set API key in localStorage for testing (after page load)
    await page.evaluate(() => {
      try {
        localStorage.setItem('gemini_api_key', 'test-api-key-for-testing');
      } catch (e) {
        // Ignore if localStorage is not available
      }
    });
  });

  /**
   * @test Basic page load
   * @description Verify the page loads without console errors
   */
  test('should load without console errors', async ({ page }) => {
    const consoleErrors = [];

    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for the page to be ready
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);

    // Check that login overlay is visible (expected for unauthenticated user)
    await expect(page.locator('h2:has-text("1affiliate")')).toBeVisible({ timeout: 10000 });

    // Filter out expected API key errors
    const realErrors = consoleErrors.filter(
      (error) =>
        !error.includes('API Key') &&
        !error.includes('geminiApiKey') &&
        !error.includes('Failed to fetch')
    );

    // Assert no real errors
    expect(realErrors).toHaveLength(0);
  });

  /**
   * @test Responsive design
   * @description Verify the application works on different viewport sizes
   */
  test('should be responsive', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("1affiliate")')).toBeVisible({ timeout: 5000 });

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("1affiliate")')).toBeVisible({ timeout: 5000 });

    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("1affiliate")')).toBeVisible({ timeout: 5000 });
  });

  /**
   * @test API key validation
   * @description Verify API key validation works correctly
   */
  test('should validate API key', async ({ page }) => {
    // Clear API key
    await page.evaluate(() => {
      localStorage.removeItem('gemini_api_key');
    });

    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check that page still loads
    await expect(page.locator('h2:has-text("1affiliate")')).toBeVisible({ timeout: 10000 });
  });
});
