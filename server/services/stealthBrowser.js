'use strict';

/**
 * Stealth Browser Service
 * Uses Camoufox (Firefox anti-fingerprint) with human-like behavior
 * for bypassing aggressive anti-bot systems (Shopee, etc.)
 */

const path = require('path');
const fs = require('fs');

// Persistent session directory
const SESSION_DIR = path.join(require('os').tmpdir(), 'stealth-sessions');

function ensureSessionDir() {
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
}

/**
 * Launch a stealth browser with human-like behavior
 * @param {Object} opts
 * @param {string} opts.sessionId - unique session ID for persistent context
 * @param {boolean} opts.headless - default false (headed more reliable)
 * @returns {Promise<{browser, context, page}>}
 */
async function launch(opts = {}) {
  const { sessionId = 'default', headless = false } = opts;
  ensureSessionDir();

  const { Camoufox } = require('camoufox');

  const sessionDir = path.join(SESSION_DIR, sessionId);
  let browser;
  try {
    browser = await Camoufox({
      headless,
      humanize: true,
      geoip: false,
      locale: ['id-ID', 'id'],
      block_webrtc: true,
      screen: { min_width: 1366, max_width: 1366, min_height: 768, max_height: 768 },
    });
  } catch (e) {
    // Camoufox has Playwright compatibility issues — fall back to CloakBrowser
    const { chromium } = require('playwright');
    const CLOAK = '/home/openclaw/.cloakbrowser/chromium-146.0.7680.177.5/chrome';
    const execPath = fs.existsSync(CLOAK) ? CLOAK : undefined;
    browser = await chromium.launch({
      executablePath: execPath,
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });
  }
  const context = browser;
  const page = await context.newPage({ viewport: null }).catch(() => context.newPage());
}

/**
 * Human-like delay (random between min and max ms)
 */
function humanDelay(min = 500, max = 2000) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

/**
 * Human-like type with random delays between keystrokes
 */
async function humanType(page, selector, text) {
  const el = await page.$(selector);
  if (!el) return false;
  await el.click();
  await humanDelay(100, 300);
  for (const char of text) {
    await el.type(char, { delay: 50 + Math.random() * 100 });
  }
  return true;
}

/**
 * Human-like scroll
 */
async function humanScroll(page, distance = 300) {
  await page.evaluate((d) => {
    window.scrollBy({ top: d, behavior: 'smooth' });
  }, distance);
  await humanDelay(300, 800);
}

/**
 * Set cookies from stored JSON
 */
async function setCookies(context, cookiesJson) {
  let cookies;
  try {
    cookies = typeof cookiesJson === 'string' ? JSON.parse(cookiesJson) : cookiesJson;
  } catch { return false; }

  const playwrightCookies = cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path || '/',
    secure: c.secure !== false,
    httpOnly: c.httpOnly || false,
  }));

  await context.addCookies(playwrightCookies);
  return true;
}

/**
 * Intercept JSON API responses matching a pattern
 */
function interceptJson(page, pattern) {
  return new Promise((resolve) => {
    const results = [];
    const handler = async (response) => {
      const url = response.url();
      if (url.includes(pattern)) {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('json')) {
          try {
            const body = await response.json();
            results.push({ url, status: response.status(), data: body });
          } catch {}
        }
      }
    };
    page.on('response', handler);

    // Auto-cleanup after timeout
    setTimeout(() => {
      page.off('response', handler);
      resolve(results);
    }, 15000);
  });
}

/**
 * Navigate with human-like behavior
 * @param {Page} page
 * @param {string} url
 * @param {Object} opts
 * @returns {Promise<{url, title, text, captcha: boolean}>}
 */
async function humanNavigate(page, url, opts = {}) {
  const { waitMs = 3000 } = opts;

  // Navigate
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Human-like wait
  await humanDelay(1000, 2000);

  // Simulate some scrolling
  await humanScroll(page, 200);
  await humanDelay(500, 1000);
  await humanScroll(page, -100);

  // Wait for content
  await new Promise(r => setTimeout(r, waitMs));

  // Check for captcha
  const pageUrl = page.url();
  const hasCaptcha = pageUrl.includes('captcha') || pageUrl.includes('verify') ||
    await page.evaluate(() => {
      const text = document.body.innerText || '';
      return text.includes('Geser') || text.includes('puzzle') || text.includes('captcha');
    }).catch(() => false);

  const title = await page.title().catch(() => '');
  const text = await page.evaluate(() => document.body.innerText?.substring(0, 1000) || '').catch(() => '');

  return { url: pageUrl, title, text, captcha: hasCaptcha };
}

/**
 * Extract JSON data from page by intercepting API calls or evaluating fetch
 */
async function extractApiData(page, endpoint) {
  // Try intercepting first
  const intercepted = await interceptJson(page, endpoint);
  if (intercepted.length > 0) return intercepted[0].data;

  // Fallback: try fetching from within page context
  try {
    const data = await page.evaluate(async (ep) => {
      const r = await fetch(ep, { headers: { 'Accept': 'application/json' } });
      const text = await r.text();
      try { return JSON.parse(text); } catch { return null; }
    }, endpoint);
    return data;
  } catch { return null; }
}

module.exports = {
  launch,
  humanDelay,
  humanType,
  humanScroll,
  setCookies,
  interceptJson,
  humanNavigate,
  extractApiData,
  SESSION_DIR,
};
