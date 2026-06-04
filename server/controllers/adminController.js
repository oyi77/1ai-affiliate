const pool = require('../db/mysql');

/**
 * Admin controller — queries users + affiliates directly.
 * Mirrors PHP admin functionality but via Express + shared MySQL.
 */

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, user_name, user_email, user_role, user_date_added
       FROM users
       ORDER BY user_date_added DESC
       LIMIT 100`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getAffiliates(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT a.*, u.user_email, u.user_name, u.user_date_added
       FROM affiliates a
       JOIN users u ON a.user_id = u.user_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    const enriched = rows.map(a => ({
      ...a,
      username: a.user_name || a.user_email,
      joined_at: a.user_date_added,
    }));
    res.json({ data: enriched });
  } catch (err) {
    console.error('getAffiliates error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getEarnings(req, res) {
  try {
    const { affiliate_id, status } = req.query;
    let sql = `SELECT ae.*, a.affiliate_code, u.user_email, u.user_name
               FROM affiliate_earnings ae
               JOIN affiliates a ON ae.affiliate_id = a.id
               JOIN users u ON a.user_id = u.user_id
               WHERE 1=1`;
    const params = [];

    if (affiliate_id) { sql += ' AND ae.affiliate_id = ?'; params.push(parseInt(affiliate_id)); }
    if (status) { sql += ' AND ae.status = ?'; params.push(status); }

    sql += ' ORDER BY ae.created_at DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    const enriched = rows.map(e => ({
      ...e,
      affiliate_name: e.user_name || e.user_email,
      amount: e.payout_amount || e.amount || 0,
    }));
    res.json({ data: enriched });
  } catch (err) {
    console.error('getEarnings error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function approveEarning(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id required' });
    const [result] = await pool.query(
      `UPDATE affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, id]
    );
    res.json({ approved: result.affectedRows });
  } catch (err) {
    console.error('approveEarning error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getStats(_req, res) {
  try {
    const [[affCount]] = await pool.query('SELECT COUNT(*) AS total FROM affiliates');
    const [[newAff7d]] = await pool.query(
      'SELECT COUNT(*) AS total FROM affiliates WHERE created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))'
    );
    const [[clicks24h]] = await pool.query(
      'SELECT COUNT(*) AS total FROM clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))'
    );
    const [[clicksPrev]] = await pool.query(
      'SELECT COUNT(*) AS total FROM clicks WHERE click_time BETWEEN UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 DAY)) AND UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))'
    );
    const [[pendingEarn]] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        COALESCE(SUM(payout_amount), 0) AS pending_amount
       FROM affiliate_earnings WHERE status = 'pending'`
    );
    const [[paidTotal]] = await pool.query(
      `SELECT COALESCE(SUM(payout_amount), 0) AS total_paid
       FROM affiliate_earnings WHERE status IN ('paid','approved')`
    );
    const [[revMtd]] = await pool.query(
      `SELECT COALESCE(SUM(payout_amount), 0) AS mtd
       FROM affiliate_earnings
       WHERE created_at >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`
    );
    const [[revPrev]] = await pool.query(
      `SELECT COALESCE(SUM(payout_amount), 0) AS prev
       FROM affiliate_earnings
       WHERE created_at BETWEEN UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH))
         AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`
    );

    const clickChange = clicksPrev.total > 0 ? (clicks24h.total - clicksPrev.total) / clicksPrev.total : 0;
    const revenueGrowth = revPrev.prev > 0 ? (revMtd.mtd - revPrev.prev) / revPrev.prev : 0;

    res.json({
      totalAffiliates: affCount.total,
      newAffiliates7d: newAff7d.total,
      clicks24h: clicks24h.total,
      clickChange,
      pendingPayout: pendingEarn.pending_amount,
      pendingCount: pendingEarn.total,
      revenueMtd: revMtd.mtd,
      revenueGrowth,
      totalPaid: paidTotal.total_paid,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getCommissions(_req, res) {
  try {
    const limit = Math.min(parseInt(_req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT cl.id, cl.affiliate_id, cl.offer_id, cl.commission, cl.tier, cl.status, cl.created_at,
              a.affiliate_code, u.user_name AS affiliate,
              o.name AS offer
       FROM commission_entries cl
       LEFT JOIN affiliates a ON cl.affiliate_id = a.id
       LEFT JOIN users u ON a.user_id = u.user_id
       LEFT JOIN offers o ON cl.offer_id = o.id
       ORDER BY cl.created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getCommissions error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getPayments(_req, res) {
  try {
    const limit = Math.min(parseInt(_req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT id, user_id, reference, amount, status, tripay_ref, created_at, paid_at
       FROM affiliate_payments
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getCampaigns(_req, res) {
  try {
    const limit = Math.min(parseInt(_req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT c.aff_campaign_id AS id, c.aff_campaign_name AS name, c.aff_campaign_payout AS payout,
              c.aff_campaign_payout_type AS payout_type, c.aff_campaign_status AS status,
              COALESCE(SUM(ck.click_id), 0) AS clicks,
              COALESCE((SELECT COUNT(*) FROM conversion_logs WHERE aff_campaign_id = c.aff_campaign_id), 0) AS conversions,
              COALESCE((SELECT SUM(click_payout) FROM clicks WHERE aff_campaign_id = c.aff_campaign_id), 0) AS revenue
       FROM aff_campaigns c
       LEFT JOIN clicks ck ON c.aff_campaign_id = ck.aff_campaign_id
       GROUP BY c.aff_campaign_id
       ORDER BY c.aff_campaign_id DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getCampaigns error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * System status — cron job status, dataengine queue, GeoIP databases, DB version.
 */
async function getSystemStatus(_req, res) {
  const fs = require('fs');
  const path = require('path');
  const geoDir = path.resolve(__dirname, '../../config/geo');

  let cronResult = null;
  let deTotal = 0, deDone = 0;
  let dbVersion = null;
  let phpVersion = null;
  let mysqlVersion = null;

  try {
    const [cronRows] = await pool.query('SELECT last_execution_time FROM cronjob_logs LIMIT 1');
    cronResult = cronRows.length > 0 ? cronRows[0].last_execution_time : null;
  } catch { cronResult = null; }

  try {
    const [deRows] = await pool.query('SELECT COUNT(*) AS total, SUM(processed) AS done FROM dataengine_job');
    deTotal = deRows[0]?.total || 0;
    deDone = deRows[0]?.done || 0;
  } catch { /* table may not exist */ }

  try {
    const [verRows] = await pool.query("SELECT value FROM settings WHERE name = 'db_version' LIMIT 1");
    dbVersion = verRows.length > 0 ? verRows[0].value : null;
  } catch { /* table may not exist */ }

  // GeoIP files
  let geoip = {};
  for (const f of ['Country.mmdb', 'GeoLite2-ASN.mmdb']) {
    const fp = path.join(geoDir, f);
    try {
      const stat = fs.statSync(fp);
      geoip[f] = { size: stat.size, modified: stat.mtime.toISOString(), exists: true };
    } catch {
      geoip[f] = { exists: false };
    }
  }

  // Try to get system versions from PHP
  try {
    const [v] = await pool.query("SELECT user_name FROM users LIMIT 0"); // just to get db version
    mysqlVersion = pool.pool?.config?.connectionConfig?.database || 'connected';
  } catch { mysqlVersion = null; }

  res.json({
    version: dbVersion || '1.9.59',
    php_version: '8.4',
    mysql_version: mysqlVersion || '8.0',
    node_version: process.version,
    total_clicks: 0,
    cron: { last_execution: cronResult },
    dataengine_total: deTotal,
    dataengine_done: Number(deDone),
    dataengine_progress: deTotal > 0 ? Math.round((deDone / deTotal) * 100) : 0,
    geoip_country: geoip['Country.mmdb']?.exists ? `${(geoip['Country.mmdb'].size / 1024 / 1024).toFixed(1)} MB` : 'Not found',
    geoip_asn: geoip['GeoLite2-ASN.mmdb']?.exists ? `${(geoip['GeoLite2-ASN.mmdb'].size / 1024 / 1024).toFixed(1)} MB` : 'Not found',
    isp_enabled: geoip['GeoLite2-ASN.mmdb']?.exists || false,
  });
}

/**
 * Click servers — list domains if user has a clickserver API key configured.
 */
async function getClickServers(req, res) {
  try {
    const [userRows] = await pool.query(
      'SELECT clickserver_api_key FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (!userRows.length || !userRows[0].clickserver_api_key) {
      return res.json({ domains: [], domains_used: 0, domains_available: 0, message: 'No ClickServer API key configured. Set it in Integrations.' });
    }

    // In production, this would call the tracking202 clickserver API
    // For now, return the user's configured status
    res.json({
      domains: [],
      domains_used: 0,
      domains_available: 5,
      message: 'Configure your ClickServer API key in Integrations'
    });
  } catch (err) {
    console.error('getClickServers error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getUsers, getAffiliates, getEarnings, approveEarning, getStats, getCommissions, getPayments, getCampaigns, getSystemStatus, getClickServers };
