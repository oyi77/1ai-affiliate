'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

// ══════════════════════════════════════════════════════════════════════
// UNIVERSAL IMPORT — Pull data FROM external platforms
// ══════════════════════════════════════════════════════════════════════

// GET /api/import-export/sources — list all importable data sources
router.get('/sources', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT name, value FROM 1ai_settings WHERE name LIKE 'integration_%_enabled'"
    );
    const sources = [];
    for (const r of rows) {
      const platform = r.name.replace('integration_', '').replace('_enabled', '');
      if (r.value === '1') {
        sources.push({
          platform,
          types: getImportTypes(platform),
          status: 'connected'
        });
      }
    }
    res.json({ data: sources });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function getImportTypes(platform) {
  const types = {
    bemob: ['campaigns', 'conversions', 'clicks'],
    voluum: ['campaigns', 'conversions', 'clicks'],
    redtrack: ['campaigns', 'conversions', 'clicks'],
    prosper202: ['campaigns', 'conversions', 'clicks'],
    trackpro: ['conversions', 'commissions', 'daily_spend'],
    shopee: ['commissions', 'payouts', 'orders'],
    facebook: ['campaigns', 'spend', 'impressions', 'clicks'],
    google: ['campaigns', 'spend', 'impressions', 'clicks'],
    tiktok: ['campaigns', 'spend', 'impressions', 'clicks'],
  };
  return types[platform] || ['campaigns'];
}

// POST /api/import-export/import — universal import endpoint
router.post('/import', async (req, res) => {
  try {
    const { platform, type, data, date_from, date_to } = req.body;

    if (!platform) return res.status(400).json({ error: 'platform required' });

    // If data is provided directly (CSV/JSON upload)
    if (data && Array.isArray(data)) {
      return await handleDirectImport(res, platform, type || 'campaigns', data);
    }

    // Otherwise, pull from platform API
    return await handlePlatformImport(res, platform, type || 'campaigns', date_from, date_to);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function handleDirectImport(res, platform, type, data) {
  let imported = 0;
  const errors = [];

  for (const item of data) {
    try {
      if (type === 'campaigns' || type === 'offers') {
        const name = item.name || item.campaign_name || item.campaignName;
        if (!name) continue;
        const [[existing]] = await pool.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [name]);
        if (existing) continue;
        await pool.query(
          `INSERT INTO 1ai_offers (name, status, payout, affiliate_url, type, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
          [name, item.status || 'active', item.payout || 0, item.url || item.destination_url || '', item.type || 'CPA']
        );
        imported++;
      } else if (type === 'conversions') {
        await pool.query(
          `INSERT INTO 1ai_conversions (click_id, offer_id, payout, revenue, status, created_at)
           VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
          [item.click_id || item.clickId || '', item.offer_id || item.offerId || null, item.payout || 0, item.revenue || 0, item.status || 'approved']
        );
        imported++;
      } else if (type === 'spend' || type === 'daily_spend') {
        await pool.query(
          `INSERT INTO 1ai_daily_spend (date, campaign_name, spend, clicks, impressions, source, created_at)
           VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())
           ON DUPLICATE KEY UPDATE spend = VALUES(spend), clicks = VALUES(clicks), impressions = VALUES(impressions)`,
          [item.date, item.campaign_name || item.name || 'Unknown', item.spend || 0, item.clicks || 0, item.impressions || 0, platform]
        );
        imported++;
      } else if (type === 'commissions') {
        await pool.query(
          `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, status, created_at)
           VALUES (?, ?, ?, UNIX_TIMESTAMP())`,
          [item.affiliate_id || 1, item.commission || item.payout || 0, item.status || 'pending']
        );
        imported++;
      }
    } catch (e) {
      errors.push({ item: item.name || item.id || '?', error: e.message });
    }
  }

  res.json({ success: true, imported, total: data.length, errors: errors.length ? errors : undefined, platform, type });
}

async function handlePlatformImport(res, platform, type, date_from, date_to) {
  // Fetch from platform API using stored credentials
  const creds = await getPlatformCreds(platform);
  if (!creds) return res.status(400).json({ error: `${platform} credentials not configured` });

  let data = [];

  if (platform === 'trackpro') {
    data = await importFromTrackPro(creds, type, date_from, date_to);
  } else if (platform === 'shopee') {
    data = await importFromShopee(creds, type);
  } else if (platform === 'facebook') {
    data = await importFromFacebook(creds, type, date_from, date_to);
  } else if (platform === 'bemob') {
    data = await importFromBeMob(creds, type, date_from, date_to);
  } else {
    return res.status(400).json({ error: `Platform ${platform} import not yet supported via API. Use CSV/JSON upload instead.` });
  }

  if (!data.length) return res.json({ success: true, imported: 0, message: 'No new data to import' });

  return await handleDirectImport(res, platform, type, data);
}

async function getPlatformCreds(platform) {
  const keys = {
    trackpro: ['integration_trackpro_url', 'integration_trackpro_username', 'integration_trackpro_password'],
    shopee: ['integration_shopee_affiliate_id', 'integration_shopee_cookies'],
    facebook: ['integration_facebook_token'],
    bemob: ['integration_bemob_access_key', 'integration_bemob_secret_key', 'integration_bemob_endpoint'],
    voluum: ['integration_voluum_access_id', 'integration_voluum_access_key', 'integration_voluum_endpoint'],
    redtrack: ['integration_redtrack_api_key', 'integration_redtrack_endpoint'],
  };
  const platformKeys = keys[platform];
  if (!platformKeys) return null;

  const [rows] = await pool.query("SELECT name, value FROM 1ai_settings WHERE name IN (?)", [platformKeys]);
  const creds = {};
  rows.forEach(r => { creds[r.name.replace(`integration_${platform}_`, '')] = r.value; });
  return creds;
}

async function importFromTrackPro(creds, type, date_from, date_to) {
  const { url, username, password } = creds;
  if (!url || !username || !password) return [];

  // Login
  const loginResp = await fetch(`${url}/api/v1/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!loginResp.ok) return [];
  const { token } = await loginResp.json();
  if (!token) return [];

  if (type === 'conversions' || type === 'commissions') {
    const resp = await fetch(`${url}/api/v1/conversions?limit=200`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.data || data.conversions || []).map(c => ({
      click_id: c.clickId || c.click_id || '',
      offer_id: c.offerId || c.offer_id || null,
      payout: c.payout || 0,
      revenue: c.revenue || 0,
      status: c.status || 'approved',
    }));
  }

  if (type === 'daily_spend') {
    const resp = await fetch(`${url}/api/v1/spend?date_from=${date_from || ''}&date_to=${date_to || ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.data || data.spend || []).map(s => ({
      date: s.date,
      campaign_name: s.campaign_name || 'Unknown',
      spend: s.spend || s.cost || 0,
      clicks: s.clicks || 0,
      impressions: s.impressions || 0,
    }));
  }

  return [];
}

async function importFromShopee(creds, type) {
  const { cookies } = creds;
  if (!cookies) return [];

  if (type === 'commissions' || type === 'payouts') {
    const resp = await fetch('https://affiliate.shopee.co.id/api/v1/affiliate/commission/list?page=1&pageSize=100', {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://affiliate.shopee.co.id/commission',
      },
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.data || data.commissions || []).map(c => ({
      commission: c.commission || c.amount || 0,
      status: c.status || 'pending',
    }));
  }
  return [];
}

async function importFromFacebook(creds, type, date_from, date_to) {
  const { token } = creds;
  if (!token) return [];

  if (type === 'spend' || type === 'daily_spend') {
    const from = date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const to = date_to || new Date().toISOString().split('T')[0];

    // Get ad accounts first
    const acctResp = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name&access_token=${token}`);
    if (!acctResp.ok) return [];
    const acctData = await acctResp.json();
    const accounts = acctData.data || [];

    const allSpend = [];
    for (const acct of accounts) {
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${acct.id}/insights?fields=campaign_name,impressions,clicks,spend&time_range={"since":"${from}","until":"${to}"}&level=campaign&access_token=${token}`
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      for (const row of (data.data || [])) {
        allSpend.push({
          date: from,
          campaign_name: row.campaign_name || 'Unknown',
          spend: parseFloat(row.spend || 0),
          clicks: parseInt(row.clicks || 0),
          impressions: parseInt(row.impressions || 0),
        });
      }
    }
    return allSpend;
  }
  return [];
}

async function importFromBeMob(creds, type, date_from, date_to) {
  const { access_key, secret_key, endpoint } = creds;
  if (!access_key || !secret_key) return [];

  const headers = { 'X-Access-Key': access_key, 'X-Secret-Key': secret_key, 'Content-Type': 'application/json' };

  if (type === 'campaigns') {
    const resp = await fetch(`${endpoint || 'https://api.bemob.com'}/v1/campaigns?limit=100`, { headers });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.payload || data.data || []).map(c => ({
      name: c.name || c.campaignName,
      status: c.status === 'active' ? 'active' : 'paused',
      payout: c.payout || 0,
      url: c.destinationUrl || c.url || '',
    }));
  }
  return [];
}

// ══════════════════════════════════════════════════════════════════════
// UNIVERSAL EXPORT — Push data TO external platforms
// ══════════════════════════════════════════════════════════════════════

// POST /api/import-export/export — export data as CSV/JSON
router.post('/export', async (req, res) => {
  try {
    const { type, format, date_from, date_to, filters } = req.body;

    let data = [];
    let filename = '';

    if (type === 'campaigns') {
      const [rows] = await pool.query(
        'SELECT id, name, status, payout, type, affiliate_url, created_at FROM 1ai_offers ORDER BY id DESC LIMIT 1000'
      );
      data = rows;
      filename = 'campaigns';
    } else if (type === 'conversions') {
      const from = date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const to = date_to || new Date().toISOString().split('T')[0];
      const [rows] = await pool.query(
        `SELECT * FROM 1ai_conversions WHERE created_at >= UNIX_TIMESTAMP(?) AND created_at <= UNIX_TIMESTAMP(?) ORDER BY id DESC LIMIT 1000`,
        [from, to + ' 23:59:59']
      );
      data = rows;
      filename = 'conversions';
    } else if (type === 'clicks') {
      const [rows] = await pool.query(
        'SELECT * FROM 1ai_clicks ORDER BY click_id DESC LIMIT 1000'
      );
      data = rows;
      filename = 'clicks';
    } else if (type === 'spend') {
      const [rows] = await pool.query(
        'SELECT * FROM 1ai_daily_spend ORDER BY date DESC LIMIT 1000'
      );
      data = rows;
      filename = 'daily_spend';
    } else if (type === 'earnings') {
      const [rows] = await pool.query(
        'SELECT * FROM 1ai_affiliate_earnings ORDER BY id DESC LIMIT 1000'
      );
      data = rows;
      filename = 'earnings';
    } else if (type === 'roas') {
      // Cross-platform ROAS report
      data = await generateROASReport(date_from, date_to);
      filename = 'roas_report';
    } else {
      return res.status(400).json({ error: `Unknown export type: ${type}` });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    // Default: JSON
    res.json({ data, count: data.length, type, exported_at: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function convertToCSV(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','));
  return [headers.join(','), ...rows].join('\n');
}

// ══════════════════════════════════════════════════════════════════════
// CROSS-PLATFORM ROAS — Meta Ads spend × Shopee commissions
// ══════════════════════════════════════════════════════════════════════

// GET /api/import-export/roas — unified ROAS dashboard
router.get('/roas', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await generateROASReport(
      new Date(Date.now() - days * 86400000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );
    res.json({ data, days });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function generateROASReport(date_from, date_to) {
  // Get spend data (from Meta/Google/TikTok)
  const [spendRows] = await pool.query(
    `SELECT date, campaign_name, SUM(spend) as spend, SUM(clicks) as clicks, SUM(impressions) as impressions
     FROM 1ai_daily_spend
     WHERE date >= ? AND date <= ?
     GROUP BY date, campaign_name
     ORDER BY date DESC`,
    [date_from, date_to]
  );

  // Get conversion data (from tracking)
  const [convRows] = await pool.query(
    `SELECT DATE(FROM_UNIXTIME(conversion_time)) as date, COUNT(*) as conversions, SUM(affiliate_payout_snapshot) as revenue
     FROM 1ai_conversion_logs
     WHERE conversion_time >= UNIX_TIMESTAMP(?) AND conversion_time <= UNIX_TIMESTAMP(?)
     GROUP BY DATE(FROM_UNIXTIME(conversion_time))
     ORDER BY date DESC`,
    [date_from, date_to + ' 23:59:59']
  );

  // Get earnings data (from affiliate)
  const [earnRows] = await pool.query(
    `SELECT COUNT(*) as count, SUM(payout_amount) as total_earnings
     FROM 1ai_affiliate_earnings
     WHERE created_at >= UNIX_TIMESTAMP(?) AND created_at <= UNIX_TIMESTAMP(?)`,
    [date_from, date_to + ' 23:59:59']
  );

  // Merge by date
  const dateMap = {};

  for (const s of spendRows) {
    const key = s.date;
    if (!dateMap[key]) dateMap[key] = { date: key, spend: 0, clicks: 0, impressions: 0, conversions: 0, revenue: 0, sources: [] };
    dateMap[key].spend += parseFloat(s.spend || 0);
    dateMap[key].clicks += parseInt(s.clicks || 0);
    dateMap[key].impressions += parseInt(s.impressions || 0);
    dateMap[key].sources.push({ source: 'daily_spend', campaign: s.campaign_name, spend: parseFloat(s.spend || 0) });
  }

  for (const c of convRows) {
    const key = c.date;
    if (!dateMap[key]) dateMap[key] = { date: key, spend: 0, clicks: 0, impressions: 0, conversions: 0, revenue: 0, sources: [] };
    dateMap[key].conversions += parseInt(c.conversions || 0);
    dateMap[key].revenue += parseFloat(c.revenue || 0);
  }

  // Calculate ROAS per day
  const report = Object.values(dateMap).map(d => ({
    ...d,
    roas: d.spend > 0 ? Math.round((d.revenue / d.spend) * 100) / 100 : null,
    profit: Math.round((d.revenue - d.spend) * 100) / 100,
    cpa: d.conversions > 0 ? Math.round((d.spend / d.conversions) * 100) / 100 : null,
    epc: d.clicks > 0 ? Math.round((d.revenue / d.clicks) * 100) / 100 : null,
  })).sort((a, b) => String(b.date).localeCompare(String(a.date)));

  // Totals
  const totals = {
    total_spend: report.reduce((s, d) => s + d.spend, 0),
    total_revenue: report.reduce((s, d) => s + d.revenue, 0),
    total_clicks: report.reduce((s, d) => s + d.clicks, 0),
    total_conversions: report.reduce((s, d) => s + d.conversions, 0),
    total_impressions: report.reduce((s, d) => s + d.impressions, 0),
    total_earnings: parseFloat(earnRows[0]?.total_earnings || 0),
  };
  totals.roas = totals.total_spend > 0 ? Math.round((totals.total_revenue / totals.total_spend) * 100) / 100 : null;
  totals.profit = Math.round((totals.total_revenue - totals.total_spend) * 100) / 100;

  return { daily: report, totals };
}

// ══════════════════════════════════════════════════════════════════════
// LIVE SYNC — Scheduled sync from connected platforms
// ══════════════════════════════════════════════════════════════════════

// POST /api/import-export/sync — trigger manual sync from all connected platforms
router.post('/sync', async (req, res) => {
  try {
    const results = [];

    // Sync Meta Ads spend
    try {
      const [[fbEnabled]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_facebook_enabled'");
      if (fbEnabled?.value === '1') {
        const spendData = await importFromFacebook(
          { token: (await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_facebook_token'"))[0]?.[0]?.value },
          'daily_spend'
        );
        if (spendData.length) {
          await handleDirectImport({ json: (d) => { results.push({ platform: 'facebook', ...d }); } }, 'facebook', 'daily_spend', spendData);
        }
      }
    } catch (e) { results.push({ platform: 'facebook', error: e.message }); }

    // Sync Shopee commissions
    try {
      const [[shEnabled]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_enabled'");
      if (shEnabled?.value === '1') {
        const [[cookieRow]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_shopee_cookies'");
        const commData = await importFromShopee({ cookies: cookieRow?.value }, 'commissions');
        if (commData.length) {
          await handleDirectImport({ json: (d) => { results.push({ platform: 'shopee', ...d }); } }, 'shopee', 'commissions', commData);
        }
      }
    } catch (e) { results.push({ platform: 'shopee', error: e.message }); }

    // Sync TrackPro conversions
    try {
      const [[tpEnabled]] = await pool.query("SELECT value FROM 1ai_settings WHERE name = 'integration_trackpro_enabled'");
      if (tpEnabled?.value === '1') {
        const creds = await getPlatformCreds('trackpro');
        const convData = await importFromTrackPro(creds, 'conversions');
        if (convData.length) {
          await handleDirectImport({ json: (d) => { results.push({ platform: 'trackpro', ...d }); } }, 'trackpro', 'conversions', convData);
        }
      }
    } catch (e) { results.push({ platform: 'trackpro', error: e.message }); }

    res.json({ success: true, results, synced_at: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
