'use strict';
/**
 * Campaign / offer / network / report handlers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');
const { queryRows, queryOne, toNumber, startExpression, buildCsv } = require('./adminShared');

async function getCampaigns(req, res) {
  try {
    const role = req.user.role;
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    let sql, params;

    if (role === 'admin' || role === 'manager') {
      sql = `SELECT c.aff_campaign_id AS id, c.aff_campaign_name AS name, c.aff_campaign_payout AS payout,
              c.aff_campaign_payout AS payout_amount, c.aff_campaign_payout_type AS payout_type,
              c.aff_campaign_status AS status, IF(c.aff_campaign_status IN ('active','1',1), 1, 0) AS active,
              COUNT(ck.click_id) AS clicks,
              COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs WHERE aff_campaign_id = c.aff_campaign_id), 0) AS conversions,
              COALESCE((SELECT SUM(click_payout) FROM 1ai_clicks WHERE aff_campaign_id = c.aff_campaign_id), 0) AS revenue
       FROM 1ai_aff_campaigns c
       LEFT JOIN 1ai_clicks ck ON c.aff_campaign_id = ck.aff_campaign_id
       GROUP BY c.aff_campaign_id
       ORDER BY c.aff_campaign_id DESC LIMIT ?`;
      params = [limit];
    } else if (role === 'advertiser') {
      sql = `SELECT c.aff_campaign_id AS id, c.aff_campaign_name AS name, c.aff_campaign_payout AS payout,
              c.aff_campaign_payout AS payout_amount, c.aff_campaign_payout_type AS payout_type,
              c.aff_campaign_status AS status, IF(c.aff_campaign_status IN ('active','1',1), 1, 0) AS active,
              COUNT(ck.click_id) AS clicks,
              COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs WHERE aff_campaign_id = c.aff_campaign_id), 0) AS conversions,
              COALESCE((SELECT SUM(click_payout) FROM 1ai_clicks WHERE aff_campaign_id = c.aff_campaign_id), 0) AS revenue
       FROM 1ai_aff_campaigns c
       LEFT JOIN 1ai_clicks ck ON c.aff_campaign_id = ck.aff_campaign_id
       JOIN 1ai_offer_campaigns oc ON c.aff_campaign_id = oc.aff_campaign_id
       JOIN 1ai_offers o ON oc.offer_id = o.id
       WHERE o.advertiser_id = ?
       GROUP BY c.aff_campaign_id
       ORDER BY c.aff_campaign_id DESC LIMIT ?`;
      params = [req.user.id, limit];
    }

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('getCampaigns error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getOffers(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const role = req.user.role;
    
    let sql = `SELECT o.id, o.name, o.payout AS payout_amount, o.status, 
                      IF(o.status IN ('active'), 1, 0) AS active,
                      COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs cl JOIN 1ai_offer_campaigns oc ON cl.aff_campaign_id = oc.aff_campaign_id WHERE oc.offer_id = o.id), 0) AS conversions,
                      COALESCE((SELECT COUNT(*) FROM 1ai_clicks ck JOIN 1ai_offer_campaigns oc ON ck.aff_campaign_id = oc.aff_campaign_id WHERE oc.offer_id = o.id), 0) AS clicks`;
    let params = [];
    
    if (role === 'admin' || role === 'manager') {
       sql += `, o.network_payout, o.advertiser_id, o.network_id, n.name AS network_name FROM 1ai_offers o LEFT JOIN 1ai_networks n ON o.network_id = n.id ORDER BY o.id DESC LIMIT ?`;
       params.push(limit);
    } else if (role === 'advertiser' || role === 'manager') {
       sql += `, o.network_payout FROM 1ai_offers o WHERE o.advertiser_id = ? ORDER BY o.id DESC LIMIT ?`;
       params.push(req.user.id, limit);
    } else {
       // Affiliate
       sql += ` FROM 1ai_offers o
                JOIN 1ai_offer_affiliate_access acc ON o.id = acc.offer_id
                JOIN 1ai_affiliates a ON acc.affiliate_id = a.id
                WHERE a.user_id = ? AND o.status = 'active'
                ORDER BY o.id DESC LIMIT ?`;
       params.push(req.user.id, limit);
    }

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('getOffers error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createOffer(req, res) {
  try {
    const role = req.user.role;
    if (role === 'affiliate') return res.status(403).json({ error: 'Unauthorized' });

    const { name, network_id } = req.body;
    const payoutAmount = req.body.payout_amount || req.body.payout || 0;
    const networkPayout = req.body.network_payout || payoutAmount;
    let adv_id = req.body.advertiser_id || null;
    
    // Admin can explicitly set advertiser_id; advertisers always self-assign
    if (role === 'advertiser' || role === 'manager') {
       adv_id = req.user.id;
    }

    await pool.query(
      `INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, network_id, created_at, status) 
       VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), 'active')`,
      [name, payoutAmount, networkPayout, adv_id, network_id || null]
    );
    const offerId = (await queryOne('SELECT LAST_INSERT_ID() AS id')).id;

    res.json({ success: true, offer_id: offerId });
  } catch (err) {
    console.error('createOffer error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function linkOfferToCampaign(req, res) {
  try {
    const { offer_id, aff_campaign_id } = req.body;
    if (!offer_id || !aff_campaign_id) return res.status(400).json({ error: 'offer_id and aff_campaign_id required' });
    await pool.query(
      'INSERT IGNORE INTO 1ai_offer_campaigns (offer_id, aff_campaign_id) VALUES (?, ?)',
      [offer_id, aff_campaign_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('linkOfferToCampaign error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getNetworks(req, res) {
  try {
    const [rows] = await pool.query(`SELECT id, name, status, created_at FROM 1ai_networks ORDER BY id DESC`);
    res.json({ data: rows });
  } catch (err) {
    console.error('getNetworks error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createNetwork(req, res) {
  try {
    const { name } = req.body;
    await pool.query(`INSERT INTO 1ai_networks (name, created_at) VALUES (?, UNIX_TIMESTAMP())`, [name]);
    res.json({ success: true });
  } catch (err) {
    console.error('createNetwork error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getReport(req, res) {
  try {
    const range = req.query.range || '30d';
    const type = req.query.type || 'summary';
    const since = startExpression(range);
    let headers = [];
    let rows = [];
    let totals = {};

    if (type === 'clicks') {
      rows = await queryRows(`SELECT click_id AS id, aff_campaign_id AS campaign_id, click_ip AS ip, click_payout AS payout, click_time AS timestamp FROM 1ai_clicks WHERE click_time >= ${since} ORDER BY click_time DESC LIMIT 500`);
      headers = ['id', 'campaign_id', 'ip', 'payout', 'timestamp'];
      totals = { clicks: rows.length, payout: rows.reduce((s, r) => s + toNumber(r.payout), 0) };
    } else if (type === 'conversions') {
      rows = await queryRows(`SELECT id, aff_campaign_id AS campaign_id, payout, created_at AS timestamp FROM 1ai_conversion_logs WHERE created_at >= ${since} ORDER BY created_at DESC LIMIT 500`);
      headers = ['id', 'campaign_id', 'payout', 'timestamp'];
      totals = { conversions: rows.length, payout: rows.reduce((s, r) => s + toNumber(r.payout), 0) };
    } else if (type === 'payouts') {
      rows = await queryRows(`SELECT id, affiliate_id, payout_amount AS amount, status, created_at AS timestamp FROM 1ai_affiliate_earnings WHERE created_at >= ${since} ORDER BY created_at DESC LIMIT 500`);
      headers = ['id', 'affiliate_id', 'amount', 'status', 'timestamp'];
      totals = { payouts: rows.length, amount: rows.reduce((s, r) => s + toNumber(r.amount), 0) };
    } else {
      const click = await queryOne(`SELECT COUNT(*) AS clicks, COUNT(DISTINCT click_ip) AS unique_ips, COALESCE(SUM(click_payout), 0) AS click_revenue FROM 1ai_clicks WHERE click_time >= ${since}`);
      const earn = await queryOne(`SELECT COUNT(*) AS earnings, COALESCE(SUM(payout_amount), 0) AS payout_total FROM 1ai_affiliate_earnings WHERE created_at >= ${since}`);
      rows = [{ metric: 'Clicks', value: toNumber(click.clicks) }, { metric: 'Unique IPs', value: toNumber(click.unique_ips) }, { metric: 'Click Revenue', value: toNumber(click.click_revenue) }, { metric: 'Earnings', value: toNumber(earn.earnings) }, { metric: 'Payout Total', value: toNumber(earn.payout_total) }];
      headers = ['metric', 'value'];
      totals = { clicks: toNumber(click.clicks), unique_ips: toNumber(click.unique_ips), revenue: toNumber(click.click_revenue), payouts: toNumber(earn.payout_total) };
    }

    res.json({ range, type, headers, rows, totals, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('getReport error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function exportReportCsv(req, res) {
  const capture = { body: null, statusCode: 200 };
  await getReport(req, {
    json: body => { capture.body = body; },
    status: code => ({ json: body => { capture.statusCode = code; capture.body = body; } }),
  });
  if (capture.statusCode >= 400) return res.status(capture.statusCode).json(capture.body);
  const csv = buildCsv(capture.body.headers, capture.body.rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="1ai-${capture.body.type}-${capture.body.range}.csv"`);
  res.send(csv);
}

module.exports = {
  getCampaigns,
  getOffers,
  createOffer,
  linkOfferToCampaign,
  getNetworks,
  createNetwork,
  getReport,
  exportReportCsv,

};
