const { test, expect } = require('@playwright/test');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Helper: generate a valid JWT for the React SPA (token key, correct email domain)
function generateToken(email, role) {
  return jwt.sign({ id: 1, email, role }, JWT_SECRET, { expiresIn: '1h' });
}

const ADMIN_EMAIL = 'admin@1ai.io';

// ── Admin UI (React SPA /admin route) ──────────────────────────────────
test.describe('1ai-Affiliate Admin UI Tests - Admin Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), generateToken(ADMIN_EMAIL, 'admin'));
    await page.goto('/admin');
  });

  test('should render System Admin heading', async ({ page }) => {
    await expect(page.locator('text=System Admin')).toBeVisible();
  });
});

// ── Affiliate UI (React SPA Dashboard) ─────────────────────────────────
test.describe('1ai-Affiliate Admin UI Tests - Affiliate Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), generateToken('affiliate@1ai.io', 'affiliate'));
    await page.goto('/');
  });

  test('should render Dashboard heading', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});

// ── Advertiser UI (React SPA Dashboard) ────────────────────────────────
test.describe('1ai-Affiliate Admin UI Tests - Advertiser Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), generateToken('advertiser@1ai.io', 'advertiser'));
    await page.goto('/');
  });

  test('should render Dashboard heading', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});

// ── Wallet, Finance, 2FA Settings ──────────────────────────────────────
test.describe('1ai-Affiliate UI Tests - Wallet & Finance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), generateToken(ADMIN_EMAIL, 'admin'));
    // Navigate to root and let SPA boot — sets up axios interceptor with the token
    await page.goto('/');
  });

  test('should render Wallet page for admin', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page.locator('text=Wallet')).toBeVisible();
    await expect(page.locator('text=Manage your balance, top up, and track spending')).toBeVisible();
  });

  test('should render Finance Management page for admin', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.locator('text=Finance Management')).toBeVisible();
    await expect(page.locator('text=Monitor deposits, withdrawals, pricing, and exchange rates')).toBeVisible();
  });

  test('should render Two-Factor Authentication section in Settings', async ({ page }) => {
    await page.goto('/settings');
    // Security tab contains 2FA section — click it first
    await page.click('text=Security');
    await expect(page.locator('text=Two-Factor Authentication')).toBeVisible();
    await expect(page.locator('text=Add an extra layer of security with TOTP authenticator app')).toBeVisible();
  });
});
