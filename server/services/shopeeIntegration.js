'use strict';

/**
 * Shopee Integration Service
 * 3-tier approach: Open Platform API → CloakBrowser scraping → CSV import
 */

const crypto = require('crypto');
const pool = require('../db/mysql');

// ══════════════════════════════════════════════════════════════════════
// TIER 1: Shopee Open Platform API (HMAC-SHA256 auth)
// ══════════════════════════════════════════════════════════════════════

async function getOpenPlatformCreds() {
  const [rows] = await pool.query(
    "SELECT name, value FROM 1ai_settings WHERE name IN ('integration_shopee_partner_id','integration_shopee_partner_key','integration_shopee_shop_id','integration_shopee_access_token','integration_shopee_open_api_enabled')"
  );
  const cfg = {};
  rows.forEach(r => { cfg[r.name.replace('integration_shopee_', '')] = r.value; });
  return cfg;
}

function generateShopeeSign(partnerKey, partnerId, apiPath, timestamp, accessToken = '', shopId = '') {
  const baseString = `${partnerId}${apiPath}${timestamp}${accessToken}${shopId}`;
  return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
}

async function shopeeOpenApiGet(apiPath, extraParams = {}) {
  const creds = await getOpenPlatformCreds();
  if (!creds.partner_id || !creds.partner_key) {
    return { error: 'Shopee Open Platform credentials not configured', tier: 1 };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const sign = generateShopeeSign(
    creds.partner_key, creds.partner_id, apiPath, timestamp,
    creds.access_token || '', creds.shop_id || ''
  );

  const params = new URLSearchParams({
    partner_id: creds.partner_id,
    timestamp: String(timestamp),
    sign,
    ...extraParams,
  });
  if (creds.access_token) params.set('access_token', creds.access_token);
  if (creds.shop_id) params.set('shop_id', creds.shop_id);

  const url = `https://partner.shopeemobile.com${apiPath}?${params}`;
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { error: `Shopee API ${resp.status}: ${text}`, tier: 1 };
  }

  return { data: await resp.json(), tier: 1 };
}

// ══════════════════════════════════════════════════════════════════════
// TIER 2: CloakBrowser Scraping (stealth browser + cookies)
// ══════════════════════════════════════════════════════════════════════

async function getCloakBrowserCreds() {
  const [rows] = await pool.query(
    "SELECT name, value FROM 1ai_settings WHERE name IN ('integration_shopee_cookies','integration_shopee_affiliate_id','integration_shopee_cloak_enabled')"
  );
  const cfg = {};
  rows.forEach(r => { cfg[r.name.replace('integration_shopee_', '')] = r.value; });
  return cfg;
}

async function scrapeShopeeApi(endpoint) {
  const creds = await getCloakBrowserCreds();
  if (!creds.cookies) return { error: 'Shopee cookies not configured', tier: 2 };

  let chromium;
  try {
    chromium = require('playwright').chromium;
  } catch {
    return { error: 'Playwright not installed', tier: 2 };
  }

  const CLOAK_PATH = '/home/openclaw/.cloakbrowser/chromium-146.0.7680.177.5/chrome';
  const fs = require('fs');
  const execPath = fs.existsSync(CLOAK_PATH) ? CLOAK_PATH : undefined;

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: execPath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'id-ID',
      timezoneId: 'Asia/Jakarta',
    });

    // Set cookies
    let cookies;
    try { cookies = typeof creds.cookies === 'string' ? JSON.parse(creds.cookies) : creds.cookies; } catch { return { error: 'Invalid cookies JSON', tier: 2 }; }

    for (const c of cookies) {
      await context.addCookies([{
        name: c.name, value: c.value,
        domain: c.domain || '.shopee.co.id', path: c.path || '/',
      }]);
    }

    const page = await context.newPage();

    // Intercept API responses
    let apiData = null;
    page.on('response', async (response) => {
      if (response.url().includes(endpoint) && response.headers()['content-type']?.includes('json')) {
        try { apiData = await response.json(); } catch {}
      }
    });

    // Navigate to dashboard to trigger API calls
    await page.goto('https://affiliate.shopee.co.id/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // If we got API data from interception, return it
    if (apiData) {
      await browser.close();
      return { data: apiData, tier: 2, method: 'intercept' };
    }

    // Otherwise try direct API call from within the page context
    const directData = await page.evaluate(async (ep) => {
      try {
        const r = await fetch(ep, { headers: { 'Accept': 'application/json' } });
        const text = await r.text();
        try { return JSON.parse(text); } catch { return { raw: text.substring(0, 500) }; }
      } catch (e) { return { error: e.message }; }
    }, endpoint);

    await browser.close();

    if (directData && !directData.error && !directData.raw) {
      return { data: directData, tier: 2, method: 'direct' };
    }

    return { error: 'Shopee returned non-JSON (anti-bot protection active)', tier: 2, raw: directData };
  } catch (err) {
    if (browser) try { await browser.close(); } catch {}
    return { error: err.message, tier: 2 };
  }
}

// ══════════════════════════════════════════════════════════════════════
// TIER 3: CSV Import (always works, manual)
// ══════════════════════════════════════════════════════════════════════

function parseCommissionCsv(csvText) {
  const shopeeService = require('./shopeeService');
  return shopeeService.parseCommissionCsv(csvText);
}

async function importCommissionCsv(csvText, userId) {
  const shopeeService = require('./shopeeService');
  const [[idRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_affiliate_id'");
  const affiliateId = idRow?.value || 'unknown';

  const rows = shopeeService.parseCommissionCsv(csvText);
  if (!rows.length) return { imported: 0, message: 'No valid rows in CSV' };

  const mapped = rows.map(r => shopeeService.mapCommissionRow(r, null, userId, affiliateId, 'Shopee Affiliate'));
  const result = await shopeeService.bulkInsertReports(mapped);

  return { imported: result.inserted, duplicates: result.duplicates, total: rows.length, tier: 3 };
}

// ══════════════════════════════════════════════════════════════════════
// UNIFIED: Smart fetch — tries all 3 tiers automatically
// ══════════════════════════════════════════════════════════════════════

async function fetchCommissions(days = 30) {
  // Try Tier 1: Open Platform API
  const t1 = await shopeeOpenApiGet('/api/v2/affiliate/commission/list', {
    page: '1', page_size: '100',
  });
  if (t1.data && !t1.error) {
    return { source: 'open_api', ...t1 };
  }

  // Try Tier 2: CloakBrowser
  const t2 = await scrapeShopeeApi('/api/v3/affiliate/commission');
  if (t2.data && !t2.error) {
    return { source: 'cloakbrowser', ...t2 };
  }

  // Fallback: read from DB (Tier 3 data)
  const [rows] = await pool.query(
    `SELECT * FROM 1ai_shopee_reports WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY order_time DESC LIMIT 200`,
    [days]
  );
  const [[totals]] = await pool.query(
    `SELECT COUNT(*) as orders, SUM(commission_gross) as gross, SUM(commission_net) as net
     FROM 1ai_shopee_reports WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [days]
  );

  return {
    source: 'database',
    data: rows,
    summary: totals,
    days,
    tier: 3,
    note: rows.length ? 'Data from CSV import' : 'No data. Import CSV from Shopee dashboard or configure Open Platform API.',
  };
}

module.exports = {
  // Tier 1: Open Platform API
  shopeeOpenApiGet,
  generateShopeeSign,
  getOpenPlatformCreds,

  // Tier 2: CloakBrowser
  scrapeShopeeApi,
  getCloakBrowserCreds,

  // Tier 3: CSV
  parseCommissionCsv,
  importCommissionCsv,

  // Unified
  fetchCommissions,
};
