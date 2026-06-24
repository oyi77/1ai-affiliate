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
    const validServices = ['bemob', 'trackpro', 'shopee', 'facebook'];
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

    if (!accessKey || !secretKey) {
      return res.status(400).json({ error: 'BeMob credentials not configured' });
    }

    // Test BeMob API - list campaigns
    const resp = await fetch(`${endpoint}/v1/campaigns?limit=1`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accessKey}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ error: `BeMob API error: ${errText}` });
    }

    const data = await resp.json();
    res.json({ success: true, message: 'BeMob connected', campaigns_count: data.total || data.data?.length || 0 });
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
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accessKey}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'BeMob API error' });

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
        `INSERT INTO 1ai_offers (name, status, payout, url, created_at, updated_at)
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
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accessKey}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
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

// ── Shopee: Test connection ────────────────────────────────────────
router.post('/shopee/test', async (req, res) => {
  try {
    const [[cookieRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_cookies'");
    const [[idRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_affiliate_id'");

    const cookies = cookieRow?.value;
    const affiliateId = idRow?.value || '1301713950';

    if (!cookies) return res.status(400).json({ error: 'Shopee cookies not configured' });

    // Test Shopee affiliate API
    const resp = await fetch(`https://affiliate.shopee.co.id/api/v1/affiliate/dashboard`, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://affiliate.shopee.co.id/dashboard',
      },
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'Shopee API error' });

    const data = await resp.json();
    res.json({ success: true, message: 'Shopee connected', data: data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee: Fetch commissions ──────────────────────────────────────
router.get('/shopee/commissions', async (req, res) => {
  try {
    const [[cookieRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_cookies'");

    const cookies = cookieRow?.value;
    if (!cookies) return res.status(400).json({ error: 'Shopee cookies not configured' });

    // Fetch commission data from Shopee affiliate
    const resp = await fetch(`https://affiliate.shopee.co.id/api/v1/affiliate/commission/list?page=1&pageSize=50`, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://affiliate.shopee.co.id/commission',
      },
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'Shopee API error' });

    const data = await resp.json();
    res.json({ data: data.data || data.commissions || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee: Sync payouts ───────────────────────────────────────────
router.post('/shopee/sync', async (req, res) => {
  try {
    const [[cookieRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_cookies'");
    const cookies = cookieRow?.value;
    if (!cookies) return res.status(400).json({ error: 'Shopee cookies not configured' });

    // Fetch payout data
    const resp = await fetch(`https://affiliate.shopee.co.id/api/v1/affiliate/payout/list?page=1&pageSize=50`, {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://affiliate.shopee.co.id/payout',
      },
    });

    if (!resp.ok) return res.status(resp.status).json({ error: 'Shopee API error' });

    const data = await resp.json();
    const payouts = data.data || data.payouts || [];

    let imported = 0;
    for (const p of payouts) {
      const [[existing]] = await pool.query(
        'SELECT id FROM 1ai_shopee_payouts WHERE order_id = ? LIMIT 1',
        [p.orderId || p.order_id]
      );
      if (existing) continue;

      await pool.query(
        `INSERT INTO 1ai_shopee_payouts (order_id, product_name, commission, status, created_at)
         VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [p.orderId || p.order_id || '', p.productName || p.product_name || '', p.commission || 0, p.status || 'pending']
      );
      imported++;
    }

    res.json({ success: true, imported, total: payouts.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
