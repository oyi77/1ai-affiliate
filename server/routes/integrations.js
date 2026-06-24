'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(requireAdmin);

// ── Get all integration configs ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const keys = [
      'integration_bemob_access_key', 'integration_bemob_secret_key', 'integration_bemob_endpoint', 'integration_bemob_enabled',
      'integration_trackpro_url', 'integration_trackpro_username', 'integration_trackpro_password', 'integration_trackpro_enabled',
      'integration_shopee_affiliate_id', 'integration_shopee_cookies', 'integration_shopee_enabled',
      'integration_facebook_token', 'integration_facebook_enabled',
      'integration_voluum_access_id', 'integration_voluum_access_key', 'integration_voluum_endpoint', 'integration_voluum_enabled',
      'integration_redtrack_api_key', 'integration_redtrack_endpoint', 'integration_redtrack_enabled',
      'integration_prosper202_url', 'integration_prosper202_api_key', 'integration_prosper202_enabled',
    ];
    const [rows] = await pool.query("SELECT name, value FROM 1ai_settings WHERE name IN (?)", [keys]);
    const config = {};
    rows.forEach(r => { config[r.name] = r.value; });
    res.json({ data: config });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Update integration config ──────────────────────────────────────
router.put('/:service', async (req, res) => {
  try {
    const service = req.params.service;
    const validServices = ['bemob', 'trackpro', 'shopee', 'facebook', 'voluum', 'redtrack', 'prosper202'];
    if (!validServices.includes(service)) return res.status(400).json({ error: 'Invalid service' });

    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      const settingName = `integration_${service}_${key}`;
      await pool.query(
        "INSERT INTO 1ai_settings (name, value, updated_at) VALUES (?, ?, UNIX_TIMESTAMP()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = UNIX_TIMESTAMP()",
        [settingName, String(value)]
      );
    }
    res.json({ success: true, service });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BeMob: Test connection ─────────────────────────────────────────
router.post('/bemob/test', async (req, res) => {
  try {
    const [[accessRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_access_key'");
    const [[secretRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_secret_key'");
    const [[endpointRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_endpoint'");
    const accessKey = accessRow?.value;
    const secretKey = secretRow?.value;
    const endpoint = endpointRow?.value || 'https://api.bemob.com';
    if (!accessKey || !secretKey) return res.status(400).json({ error: 'BeMob credentials not configured' });

    const resp = await fetch(`${endpoint}/v1/campaigns?limit=1`, {
      headers: { 'X-Access-Key': accessKey, 'X-Secret-Key': secretKey, 'Content-Type': 'application/json' },
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: `BeMob API error: ${t}` }); }
    const data = await resp.json();
    res.json({ success: true, message: 'BeMob connected', campaigns_count: data.payload?.length || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BeMob: Import campaigns ────────────────────────────────────────
router.post('/bemob/import', async (req, res) => {
  try {
    const [[accessRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_access_key'");
    const [[secretRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_secret_key'");
    const [[endpointRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_endpoint'");

    const accessKey = accessRow?.value;
    const secretKey = secretRow?.value;
    const endpoint = endpointRow?.value || 'https://api.bemob.com';

    if (!accessKey || !secretKey) return res.status(400).json({ error: 'BeMob credentials not configured' });

    // Fetch campaigns from BeMob
    const resp = await fetch(`${endpoint}/v1/campaigns?limit=100`, {
      headers: { 'X-Access-Key': accessKey, 'X-Secret-Key': secretKey, 'Content-Type': 'application/json' },
    });

    const data = await resp.json();
    const campaigns = data.data || data.campaigns || [];

    let imported = 0;
    for (const c of campaigns) {
      // Check if already exists
      const [[existing]] = await pool.query(
        'SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1',
        [c.name || c.campaignName]
      );
      if (existing) continue;

      await pool.query(
        `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [c.name || c.campaignName, c.status === 'active' ? 'active' : 'paused', c.payout || 0, c.url || c.destinationUrl || '']
      );
      imported++;
    }

    res.json({ success: true, imported, total: campaigns.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BeMob: Fetch statistics ────────────────────────────────────────
router.get('/bemob/stats', async (req, res) => {
  try {
    const [[accessRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_access_key'");
    const [[secretRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_secret_key'");
    const [[endpointRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_bemob_endpoint'");

    const accessKey = accessRow?.value;
    const secretKey = secretRow?.value;
    const endpoint = endpointRow?.value || 'https://api.bemob.com';

    if (!accessKey || !secretKey) return res.status(400).json({ error: 'BeMob credentials not configured' });

    const dateFrom = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];

    const resp = await fetch(`${endpoint}/v1/statistics?dateFrom=${dateFrom}&dateTo=${dateTo}&groupBy=campaign`, {
      headers: { 'X-Access-Key': accessKey, 'X-Secret-Key': secretKey, 'Content-Type': 'application/json' },
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'BeMob API error' });

    const data = await resp.json();
    res.json({ data: data.data || data.rows || [], date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TrackPro: Test connection ──────────────────────────────────────
router.post('/trackpro/test', async (req, res) => {
  try {
    const [[urlRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_url'");
    const [[userRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_username'");
    const [[passRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_password'");

    const baseUrl = urlRow?.value || 'https://tracker.getflashsale.xyz';
    const username = userRow?.value;
    const password = passRow?.value;

    if (!username || !password) return res.status(400).json({ error: 'TrackPro credentials not configured' });

    // Login to TrackPro
    const resp = await fetch(`${baseUrl}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'TrackPro login failed' });

    const data = await resp.json();
    res.json({ success: true, message: 'TrackPro connected', token: data.token ? '***' : 'no token' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TrackPro: Sync commissions ─────────────────────────────────────
router.post('/trackpro/sync', async (req, res) => {
  try {
    const [[urlRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_url'");
    const [[userRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_username'");
    const [[passRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_password'");

    const baseUrl = urlRow?.value || 'https://tracker.getflashsale.xyz';
    const username = userRow?.value;
    const password = passRow?.value;

    if (!username || !password) return res.status(400).json({ error: 'TrackPro credentials not configured' });

    // Login
    const loginResp = await fetch(`${baseUrl}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!loginResp.ok) return res.status(loginResp.status).json({ error: 'TrackPro login failed' });

    const { token } = await loginResp.json();
    if (!token) return res.status(401).json({ error: 'No token received from TrackPro' });

    // Fetch conversions
    const convResp = await fetch(`${baseUrl}/api/v1/conversions?limit=100`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!convResp.ok) return res.status(convResp.status).json({ error: 'Failed to fetch conversions' });

    const convData = await convResp.json();
    const conversions = convData.data || convData.conversions || [];

    let imported = 0;
    for (const c of conversions) {
      const [[existing]] = await pool.query(
        'SELECT id FROM 1ai_conversion_logs WHERE click_id = ? LIMIT 1',
        [c.clickId || c.click_id]
      );
      if (existing) continue;

      await pool.query(
        `INSERT INTO 1ai_conversion_logs (click_id, offer_id, payout, revenue, status, conversion_time)
         VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [c.clickId || c.click_id || '', c.offerId || c.offer_id || null, c.payout || 0, c.revenue || 0, c.status || 'approved']
      );
      imported++;
    }

    res.json({ success: true, imported, total: conversions.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee: Test connection (3-tier: Open API → CloakBrowser → DB) ─
router.post('/shopee/test', async (req, res) => {
  try {
    const shopeeIntegration = require('../services/shopeeIntegration');

    // Check what credentials are configured
    const openApiCreds = await shopeeIntegration.getOpenPlatformCreds();
    const cloakCreds = await shopeeIntegration.getCloakBrowserCreds();

    const [[countRow]] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_shopee_reports');
    const [[payoutRow]] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_shopee_payouts');

    // Try Open Platform API first
    let openApiStatus = 'not_configured';
    if (openApiCreds.partner_id && openApiCreds.partner_key) {
      const t1 = await shopeeIntegration.shopeeOpenApiGet('/api/v2/affiliate/commission/list', { page: '1', page_size: '1' });
      openApiStatus = t1.error ? `error: ${t1.error}` : 'connected';
    }

    // Try CloakBrowser
    let cloakStatus = 'not_configured';
    if (cloakCreds.cookies) {
      cloakStatus = 'cookies_configured';
    }

    res.json({
      success: true,
      tiers: {
        open_api: { status: openApiStatus, partner_id: openApiCreds.partner_id || 'not set' },
        cloakbrowser: { status: cloakStatus, affiliate_id: cloakCreds.affiliate_id || 'not set' },
        csv_import: { status: 'always_available', reports_in_db: countRow?.cnt || 0, payouts_in_db: payoutRow?.cnt || 0 },
      },
      recommendation: openApiStatus === 'connected' ? 'Using Open Platform API (best)' :
                       cloakStatus === 'cookies_configured' ? 'Using CloakBrowser scraping (good)' :
                       'Using CSV import (manual). Configure Open Platform API for best results.',
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Shopee: Import from CSV ────────────────────────────────────────
router.post('/shopee/import-csv', async (req, res) => {
  try {
    const { csv_data, type } = req.body;
    if (!csv_data) return res.status(400).json({ error: 'csv_data required' });

    const shopeeService = require('../services/shopeeService');
    const [[idRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_affiliate_id'");
    const affiliateId = idRow?.value || 'unknown';

    if (type === 'commissions' || type === 'orders') {
      const rows = shopeeService.parseCommissionCsv(csv_data);
      if (!rows.length) return res.json({ success: true, imported: 0, message: 'No valid rows in CSV' });
      const mapped = rows.map(r => shopeeService.mapCommissionRow(r, null, req.user.id, affiliateId, 'Shopee Affiliate'));
      const result = await shopeeService.bulkInsertReports(mapped);
      res.json({ success: true, imported: result.inserted, duplicates: result.duplicates, total: rows.length });
    } else if (type === 'payouts') {
      const lines = csv_data.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((h, idx) => row[h] = cols[idx] || '');
        const orderId = row.order_id || row.orderid || row.id;
        if (!orderId) continue;
        const [[existing]] = await pool.query('SELECT id FROM 1ai_shopee_payouts WHERE order_id = ? LIMIT 1', [orderId]);
        if (existing) continue;
        await pool.query(
          `INSERT INTO 1ai_shopee_payouts (order_id, product_name, amount, status, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())`,
          [orderId, row.product_name || '', parseFloat(row.commission || row.amount || 0), row.status || 'pending']
        );
        imported++;
      }
      res.json({ success: true, imported, total: lines.length - 1 });
    } else {
      return res.status(400).json({ error: 'type required: commissions, orders, or payouts' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee: Live fetch (tries Open API → CloakBrowser → falls back to DB) ──
router.get('/shopee/live', async (req, res) => {
  try {
    const shopeeIntegration = require('../services/shopeeIntegration');
    const days = parseInt(req.query.days) || 30;
    const result = await shopeeIntegration.fetchCommissions(days);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Shopee: Get stored reports ─────────────────────────────────────
router.get('/shopee/reports', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await pool.query(
      `SELECT * FROM 1ai_shopee_reports WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY order_time DESC LIMIT 200`, [days]
    );
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) as orders, SUM(commission_gross) as gross, SUM(commission_net) as net, SUM(order_amount) as order_total
       FROM 1ai_shopee_reports WHERE report_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`, [days]
    );
    res.json({ data: rows, summary: totals, days });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee: Get stored payouts ─────────────────────────────────────
router.get('/shopee/payouts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_shopee_payouts ORDER BY id DESC LIMIT 100');
    const [[totals]] = await pool.query('SELECT COUNT(*) as count, SUM(amount) as total FROM 1ai_shopee_payouts WHERE status = "paid"');
    res.json({ data: rows, summary: totals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ── Meta Ads: Fetch ad accounts ────────────────────────────────────
router.get('/facebook/accounts', async (req, res) => {
  try {
    const [[tokenRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_facebook_token'");
    const token = tokenRow?.value;
    if (!token) return res.status(400).json({ error: 'Facebook token not configured' });

    const resp = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency,balance,amount_spent&access_token=${token}`);
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: `Meta API error: ${t}` }); }

    const data = await resp.json();
    const accounts = data.data || [];

    // Store/update accounts in DB
    for (const acct of accounts) {
      await pool.query(
        `INSERT INTO 1ai_meta_accounts (user_id, act_id, account_name, access_token, status, balance, last_synced_at)
         VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())
         ON DUPLICATE KEY UPDATE account_name = VALUES(account_name), balance = VALUES(balance), last_synced_at = UNIX_TIMESTAMP()`,
        [req.user.id, acct.id, acct.name, token, acct.account_status === 1 ? 'active' : 'inactive', parseFloat(acct.balance || 0) / 100]
      );
    }

    res.json({ data: accounts, stored: accounts.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Meta Ads: Sync campaign spend ──────────────────────────────────
router.post('/facebook/sync', async (req, res) => {
  try {
    const [[tokenRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_facebook_token'");
    const token = tokenRow?.value;
    if (!token) return res.status(400).json({ error: 'Facebook token not configured' });

    const dateFrom = req.body.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const dateTo = req.body.date_to || new Date().toISOString().split('T')[0];

    // Get stored accounts
    const [accounts] = await pool.query('SELECT act_id FROM 1ai_meta_accounts WHERE status = "active"');

    let totalSynced = 0;
    for (const acct of accounts) {
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${acct.act_id}/insights?fields=campaign_name,impressions,clicks,spend,actions,cost_per_action_type&time_range={"since":"${dateFrom}","until":"${dateTo}"}&level=campaign&access_token=${token}`
      );
      if (!resp.ok) continue;

      const data = await resp.json();
      const insights = data.data || [];

      for (const row of insights) {
        const spend = parseFloat(row.spend || 0);
        const clicks = parseInt(row.clicks || 0);
        const impressions = parseInt(row.impressions || 0);

        await pool.query(
          `INSERT INTO 1ai_daily_spend (date, campaign_name, spend, clicks, impressions, source, created_at)
           VALUES (?, ?, ?, ?, ?, 'meta', UNIX_TIMESTAMP())
           ON DUPLICATE KEY UPDATE spend = VALUES(spend), clicks = VALUES(clicks), impressions = VALUES(impressions)`,
          [dateFrom, row.campaign_name || 'Unknown', spend, clicks, impressions]
        );
        totalSynced++;
      }
    }

    // Update last synced time
    await pool.query("UPDATE 1ai_meta_accounts SET last_synced_at = UNIX_TIMESTAMP() WHERE status = 'active'");

    res.json({ success: true, synced: totalSynced, accounts: accounts.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Meta Ads: Get spend data ───────────────────────────────────────
router.get('/facebook/spend', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const [rows] = await pool.query(
      `SELECT date, campaign_name, spend, clicks, impressions FROM 1ai_daily_spend
       WHERE source = 'meta' AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date DESC, spend DESC`,
      [days]
    );
    const [[total]] = await pool.query(
      `SELECT COALESCE(SUM(spend), 0) as total_spend, COALESCE(SUM(clicks), 0) as total_clicks
       FROM 1ai_daily_spend WHERE source = 'meta' AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );
    res.json({ data: rows, summary: total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ══════════════════════════════════════════════════════════════════════
// VOLUUM INTEGRATION
// ══════════════════════════════════════════════════════════════════════
async function getVoluumCreds() {
  const [rows] = await pool.query(
    "SELECT name, value FROM 1ai_settings WHERE name IN ('integration_voluum_access_id','integration_voluum_access_key','integration_voluum_endpoint','integration_voluum_enabled')"
  );
  const cfg = {}; rows.forEach(r => cfg[r.name] = r.value);
  return {
    accessId: cfg.integration_voluum_access_id,
    accessKey: cfg.integration_voluum_access_key,
    endpoint: cfg.integration_voluum_endpoint || 'https://api.voluum.com',
    enabled: cfg.integration_voluum_enabled === '1',
  };
}

router.post('/voluum/test', async (req, res) => {
  try {
    const { accessId, accessKey, endpoint } = await getVoluumCreds();
    if (!accessId || !accessKey) return res.status(400).json({ error: 'Voluum credentials not configured' });

    // Authenticate and get session token
    const authResp = await fetch(`${endpoint}/auth/access/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId, accessKey }),
    });
    if (!authResp.ok) { const t = await authResp.text(); return res.status(authResp.status).json({ error: `Voluum auth error: ${t}` }); }

    const authData = await authResp.json();
    const token = authData.token;

    // Test: list campaigns
    const campResp = await fetch(`${endpoint}/campaign?limit=1`, {
      headers: { 'cwauth-token': token, 'Content-Type': 'application/json' },
    });
    if (!campResp.ok) return res.status(campResp.status).json({ error: 'Voluum campaigns API error' });

    const campData = await campResp.json();
    res.json({ success: true, message: 'Voluum connected', campaigns_count: campData.campaigns?.length || 0, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/voluum/import', async (req, res) => {
  try {
    const { accessId, accessKey, endpoint } = await getVoluumCreds();
    if (!accessId || !accessKey) return res.status(400).json({ error: 'Voluum credentials not configured' });

    // Auth
    const authResp = await fetch(`${endpoint}/auth/access/session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId, accessKey }),
    });
    if (!authResp.ok) return res.status(authResp.status).json({ error: 'Voluum auth failed' });
    const { token } = await authResp.json();

    // Fetch campaigns
    const campResp = await fetch(`${endpoint}/campaign?limit=100`, {
      headers: { 'cwauth-token': token },
    });
    if (!campResp.ok) return res.status(campResp.status).json({ error: 'Voluum API error' });
    const campData = await campResp.json();
    const campaigns = campData.campaigns || [];

    let imported = 0;
    for (const c of campaigns) {
      const [[existing]] = await pool.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [c.name]);
      if (existing) continue;
      await pool.query(
        `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at, updated_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [c.name, c.status === 'active' ? 'active' : 'paused', c.cost || 0, c.url || c.campaignUrl || '']
      );
      imported++;
    }
    res.json({ success: true, imported, total: campaigns.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/voluum/stats', async (req, res) => {
  try {
    const { accessId, accessKey, endpoint } = await getVoluumCreds();
    if (!accessId || !accessKey) return res.status(400).json({ error: 'Voluum credentials not configured' });

    const authResp = await fetch(`${endpoint}/auth/access/session`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessId, accessKey }),
    });
    if (!authResp.ok) return res.status(authResp.status).json({ error: 'Voluum auth failed' });
    const { token } = await authResp.json();

    const from = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const to = req.query.date_to || new Date().toISOString().split('T')[0];

    const statsResp = await fetch(`${endpoint}/report?from=${from}&to=${to}&groupBy=campaign&columns=clicks,conversions,revenue,cost`, {
      headers: { 'cwauth-token': token },
    });
    if (!statsResp.ok) return res.status(statsResp.status).json({ error: 'Voluum stats API error' });

    const data = await statsResp.json();
    res.json({ data: data.rows || data.report || [], date_from: from, date_to: to });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════
// REDTRACK INTEGRATION
// ══════════════════════════════════════════════════════════════════════
async function getRedTrackCreds() {
  const [rows] = await pool.query(
    "SELECT name, value FROM 1ai_settings WHERE name IN ('integration_redtrack_api_key','integration_redtrack_endpoint','integration_redtrack_enabled')"
  );
  const cfg = {}; rows.forEach(r => cfg[r.name] = r.value);
  return {
    apiKey: cfg.integration_redtrack_api_key,
    endpoint: cfg.integration_redtrack_endpoint || 'https://api.redtrack.io',
    enabled: cfg.integration_redtrack_enabled === '1',
  };
}

router.post('/redtrack/test', async (req, res) => {
  try {
    const { apiKey, endpoint } = await getRedTrackCreds();
    if (!apiKey) return res.status(400).json({ error: 'RedTrack API key not configured' });

    const resp = await fetch(`${endpoint}/pub/campaigns?limit=1`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: `RedTrack API error: ${t}` }); }

    const data = await resp.json();
    res.json({ success: true, message: 'RedTrack connected', campaigns_count: data.total || data.data?.length || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/redtrack/import', async (req, res) => {
  try {
    const { apiKey, endpoint } = await getRedTrackCreds();
    if (!apiKey) return res.status(400).json({ error: 'RedTrack API key not configured' });

    const resp = await fetch(`${endpoint}/pub/campaigns?limit=100`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'RedTrack API error' });

    const data = await resp.json();
    const campaigns = data.data || data.campaigns || [];

    let imported = 0;
    for (const c of campaigns) {
      const [[existing]] = await pool.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [c.name]);
      if (existing) continue;
      await pool.query(
        `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at, updated_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [c.name, c.status === 'active' ? 'active' : 'paused', c.payout || 0, c.url || c.destinationUrl || '']
      );
      imported++;
    }
    res.json({ success: true, imported, total: campaigns.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/redtrack/stats', async (req, res) => {
  try {
    const { apiKey, endpoint } = await getRedTrackCreds();
    if (!apiKey) return res.status(400).json({ error: 'RedTrack API key not configured' });

    const from = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const to = req.query.date_to || new Date().toISOString().split('T')[0];

    const resp = await fetch(`${endpoint}/pub/reporting?date_from=${from}&date_to=${to}&group_by=campaign`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'RedTrack reporting API error' });

    const data = await resp.json();
    res.json({ data: data.rows || data.data || [], date_from: from, date_to: to });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════
// PROSPER202 INTEGRATION (self-hosted)
// ══════════════════════════════════════════════════════════════════════
async function getProsper202Creds() {
  const [rows] = await pool.query(
    "SELECT name, value FROM 1ai_settings WHERE name IN ('integration_prosper202_url','integration_prosper202_api_key','integration_prosper202_enabled')"
  );
  const cfg = {}; rows.forEach(r => cfg[r.name] = r.value);
  return {
    url: cfg.integration_prosper202_url,
    apiKey: cfg.integration_prosper202_api_key,
    enabled: cfg.integration_prosper202_enabled === '1',
  };
}

router.post('/prosper202/test', async (req, res) => {
  try {
    const { url, apiKey } = await getProsper202Creds();
    if (!url || !apiKey) return res.status(400).json({ error: 'Prosper202 credentials not configured' });

    const resp = await fetch(`${url}/api/v3/campaigns?limit=1`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: `Prosper202 API error: ${t}` }); }

    const data = await resp.json();
    res.json({ success: true, message: 'Prosper202 connected', campaigns_count: data.total || data.data?.length || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/prosper202/import', async (req, res) => {
  try {
    const { url, apiKey } = await getProsper202Creds();
    if (!url || !apiKey) return res.status(400).json({ error: 'Prosper202 credentials not configured' });

    const resp = await fetch(`${url}/api/v3/campaigns?limit=100`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Prosper202 API error' });

    const data = await resp.json();
    const campaigns = data.data || data.campaigns || [];

    let imported = 0;
    for (const c of campaigns) {
      const [[existing]] = await pool.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [c.name]);
      if (existing) continue;
      await pool.query(
        `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at, updated_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [c.name, c.status || 'active', c.payout || 0, c.url || '']
      );
      imported++;
    }
    res.json({ success: true, imported, total: campaigns.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/prosper202/stats', async (req, res) => {
  try {
    const { url, apiKey } = await getProsper202Creds();
    if (!url || !apiKey) return res.status(400).json({ error: 'Prosper202 credentials not configured' });

    const from = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const to = req.query.date_to || new Date().toISOString().split('T')[0];

    const resp = await fetch(`${url}/api/v1/?type=traffic&apikey=${apiKey}&date_from=${from}&date_to=${to}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Prosper202 API error' });

    const data = await resp.json();
    res.json({ data: data.rows || data.data || [], date_from: from, date_to: to });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════
// GENERIC PLATFORM IMPORT (CSV/JSON upload)
// ══════════════════════════════════════════════════════════════════════
router.post('/generic/import', async (req, res) => {
  try {
    const { platform, campaigns } = req.body;
    if (!campaigns || !Array.isArray(campaigns)) return res.status(400).json({ error: 'campaigns array required' });

    let imported = 0;
    for (const c of campaigns) {
      const name = c.name || c.campaign_name || c.campaignName;
      if (!name) continue;
      const [[existing]] = await pool.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [name]);
      if (existing) continue;
      await pool.query(
        `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at, updated_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [name, c.status || 'active', c.payout || 0, c.url || c.destination_url || '']
      );
      imported++;
    }
    res.json({ success: true, imported, total: campaigns.length, platform: platform || 'generic' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Currency: Get exchange rates ───────────────────────────────────
router.get('/currency/rates', async (req, res) => {
  try {
    const base = req.query.base || 'USD';
    const [rows] = await pool.query(
      'SELECT target_currency, rate FROM 1ai_exchange_rates WHERE base_currency = ? ORDER BY target_currency',
      [base.toUpperCase()]
    );
    res.json({ base: base.toUpperCase(), rates: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Currency: Convert amount ───────────────────────────────────────
router.get('/currency/convert', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 0;
    const from = (req.query.from || 'IDR').toUpperCase();
    const to = (req.query.to || 'USD').toUpperCase();

    if (from === to) return res.json({ amount, from, to, converted: amount, rate: 1 });

    const [[rateRow]] = await pool.query(
      'SELECT rate FROM 1ai_exchange_rates WHERE base_currency = ? AND target_currency = ?',
      [from, to]
    );

    if (!rateRow) return res.status(404).json({ error: `Rate ${from}→${to} not found` });

    const converted = Math.round(amount * rateRow.rate * 100) / 100;
    res.json({ amount, from, to, converted, rate: rateRow.rate });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Currency: Update rates from API ────────────────────────────────
router.post('/currency/sync', async (req, res) => {
  try {
    // Fetch live rates from exchangerate-api (free, no key needed)
    const resp = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!resp.ok) return res.status(resp.status).json({ error: 'Failed to fetch rates' });

    const data = await resp.json();
    const rates = data.rates || {};
    const currencies = ['IDR', 'EUR', 'GBP', 'SGD', 'MYR', 'THB', 'PHP', 'VND', 'JPY', 'KRW', 'INR', 'AUD', 'CAD'];

    let updated = 0;
    for (const cur of currencies) {
      if (!rates[cur]) continue;
      await pool.query(
        `INSERT INTO 1ai_exchange_rates (base_currency, target_currency, rate, fetched_at)
         VALUES ('USD', ?, ?, UNIX_TIMESTAMP())
         ON DUPLICATE KEY UPDATE rate = VALUES(rate), fetched_at = UNIX_TIMESTAMP()`,
        [cur, rates[cur]]
      );
      // Also insert reverse rate
      await pool.query(
        `INSERT INTO 1ai_exchange_rates (base_currency, target_currency, rate, fetched_at)
         VALUES (?, 'USD', ?, UNIX_TIMESTAMP())
         ON DUPLICATE KEY UPDATE rate = VALUES(rate), fetched_at = UNIX_TIMESTAMP()`,
        [cur, 1 / rates[cur]]
      );
      updated++;
    }

    res.json({ success: true, updated, base: 'USD', timestamp: data.time_last_update_utc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
