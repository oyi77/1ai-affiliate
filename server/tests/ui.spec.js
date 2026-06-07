const { test, expect } = require('@playwright/test');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Helper function to generate a token for a specific role
function generateToken(role) {
  return jwt.sign({ id: 1, email: `${role}@1ai.local`, role: role }, JWT_SECRET, { expiresIn: '1h' });
}

test.describe('1ai-Affiliate Admin UI Tests - Admin Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/');
    await page.evaluate((t) => localStorage.setItem('1ai_token', t), generateToken('admin'));
    await page.reload();
  });

  test('should render Network Overview for admin', async ({ page }) => {
    await expect(page.locator('text=Network Overview')).toBeVisible();
  });

  test('should render Offers table correctly', async ({ page }) => {
    await page.click('text=Offers');
    await page.waitForSelector('.table-wrap table');
    const headersCount = await page.locator('.table-wrap table tr th').count();
    expect(headersCount).toBeGreaterThan(3);
  });
});

test.describe('1ai-Affiliate Admin UI Tests - Affiliate Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/');
    await page.evaluate((t) => localStorage.setItem('1ai_token', t), generateToken('affiliate'));
    await page.reload();
  });

  test('should render Affiliate Dashboard for affiliate', async ({ page }) => {
    await expect(page.locator('text=Affiliate Dashboard')).toBeVisible();
  });
});

test.describe('1ai-Affiliate Admin UI Tests - Advertiser Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/');
    await page.evaluate((t) => localStorage.setItem('1ai_token', t), generateToken('advertiser'));
    await page.reload();
  });

  test('should render Advertiser Dashboard for advertiser', async ({ page }) => {
    await expect(page.locator('text=Advertiser Dashboard')).toBeVisible();
  });
});
