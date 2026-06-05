const pool = require('../db/mysql');

/**
 * Admin controller — dashboard data from the shared tracking database.
 */

async function queryRows(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (err) {
    return [];
  }
}

async function queryOne(sql, params = [], fallback = {}) {
  const rows = await queryRows(sql, params);
  return rows[0] || fallback;
}

function toNumber(value) {
  return Number(value || 0);
}

function startExpression(range) {
  const allowed = {
    '1d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))',
    '7d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))',
    '30d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY))',
    '90d': 'UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 90 DAY))',
    mtd: "UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))",
    ytd: "UNIX_TIMESTAMP(MAKEDATE(YEAR(NOW()), 1))",
  };
  return allowed[range] || allowed['30d'];
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(headers, rows) {
  return [headers.map(csvEscape).join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n');
}

async function ensureVipTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS affiliate_vip_profiles (
    user_id INT PRIMARY KEY,
    monthly_traffic VARCHAR(50) DEFAULT '',
    primary_vertical VARCHAR(80) DEFAULT '',
    preferred_payout VARCHAR(80) DEFAULT '',
    notes TEXT NULL,
    status VARCHAR(30) DEFAULT 'submitted',
    updated_at INT DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

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
    const affCount = await queryOne('SELECT COUNT(*) AS total FROM affiliates');
    const newAff7d = await queryOne('SELECT COUNT(*) AS total FROM affiliates WHERE created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))');
    const clicks24h = await queryOne('SELECT COUNT(*) AS total FROM clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))');
    const clicksPrev = await queryOne('SELECT COUNT(*) AS total FROM clicks WHERE click_time BETWEEN UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 DAY)) AND UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))');
    const totalClicks = await queryOne('SELECT COUNT(*) AS total FROM clicks');
    const uniqueIps = await queryOne('SELECT COUNT(DISTINCT click_ip) AS total FROM clicks');
    const conversions = await queryOne('SELECT COUNT(*) AS total FROM conversion_logs');
    const pendingEarn = await queryOne(`SELECT COUNT(*) AS total, COALESCE(SUM(payout_amount), 0) AS pending_amount FROM affiliate_earnings WHERE status = 'pending'`);
    const paidTotal = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS total_paid FROM affiliate_earnings WHERE status IN ('paid','approved')`);
    const revMtd = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS mtd FROM affiliate_earnings WHERE created_at >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);
    const revPrev = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS prev FROM affiliate_earnings WHERE created_at BETWEEN UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)) AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);

    const totalClickCount = toNumber(totalClicks.total);
    const conversionCount = toNumber(conversions.total);
    const revenueMtd = toNumber(revMtd.mtd);
    const clickChange = toNumber(clicksPrev.total) > 0 ? (toNumber(clicks24h.total) - toNumber(clicksPrev.total)) / toNumber(clicksPrev.total) : 0;
    const revenueGrowth = toNumber(revPrev.prev) > 0 ? (revenueMtd - toNumber(revPrev.prev)) / toNumber(revPrev.prev) : 0;
    const avgEpc = totalClickCount > 0 ? revenueMtd / totalClickCount : 0;
    const avgCtr = totalClickCount > 0 ? (conversionCount / totalClickCount) * 100 : 0;

    res.json({
      totalAffiliates: toNumber(affCount.total),
      newAffiliates7d: toNumber(newAff7d.total),
      clicks24h: toNumber(clicks24h.total),
      active_clicks_24h: toNumber(clicks24h.total),
      clicks_today: toNumber(clicks24h.total),
      total_clicks: totalClickCount,
      unique_ips: toNumber(uniqueIps.total),
      attributed_conversions: conversionCount,
      assisted_conversions: 0,
      avg_epc: avgEpc,
      avg_ctr: Number(avgCtr.toFixed(2)),
      clickChange,
      pendingPayout: toNumber(pendingEarn.pending_amount),
      pending_payout: toNumber(pendingEarn.pending_amount),
      pendingCount: toNumber(pendingEarn.total),
      pending_count: toNumber(pendingEarn.total),
      revenueMtd,
      revenue_mtd: revenueMtd,
      revenueGrowth,
      revenue_growth: revenueGrowth,
      totalPaid: toNumber(paidTotal.total_paid),
      total_paid: toNumber(paidTotal.total_paid),
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
      `SELECT cl.id, cl.affiliate_id, cl.offer_id, cl.commission, cl.commission AS amount, cl.tier, cl.status, cl.created_at,
              a.affiliate_code, u.user_name AS affiliate,
              o.name AS offer, o.name AS source
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
              c.aff_campaign_payout AS payout_amount, c.aff_campaign_payout_type AS payout_type,
              c.aff_campaign_status AS status, IF(c.aff_campaign_status IN ('active','1',1), 1, 0) AS active,
              COUNT(ck.click_id) AS clicks,
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

async function getReport(req, res) {
  try {
    const range = req.query.range || '30d';
    const type = req.query.type || 'summary';
    const since = startExpression(range);
    let headers = [];
    let rows = [];
    let totals = {};

    if (type === 'clicks') {
      rows = await queryRows(`SELECT click_id AS id, aff_campaign_id AS campaign_id, click_ip AS ip, click_payout AS payout, click_time AS timestamp FROM clicks WHERE click_time >= ${since} ORDER BY click_time DESC LIMIT 500`);
      headers = ['id', 'campaign_id', 'ip', 'payout', 'timestamp'];
      totals = { clicks: rows.length, payout: rows.reduce((s, r) => s + toNumber(r.payout), 0) };
    } else if (type === 'conversions') {
      rows = await queryRows(`SELECT id, aff_campaign_id AS campaign_id, payout, created_at AS timestamp FROM conversion_logs WHERE created_at >= ${since} ORDER BY created_at DESC LIMIT 500`);
      headers = ['id', 'campaign_id', 'payout', 'timestamp'];
      totals = { conversions: rows.length, payout: rows.reduce((s, r) => s + toNumber(r.payout), 0) };
    } else if (type === 'payouts') {
      rows = await queryRows(`SELECT id, affiliate_id, payout_amount AS amount, status, created_at AS timestamp FROM affiliate_earnings WHERE created_at >= ${since} ORDER BY created_at DESC LIMIT 500`);
      headers = ['id', 'affiliate_id', 'amount', 'status', 'timestamp'];
      totals = { payouts: rows.length, amount: rows.reduce((s, r) => s + toNumber(r.amount), 0) };
    } else {
      const click = await queryOne(`SELECT COUNT(*) AS clicks, COUNT(DISTINCT click_ip) AS unique_ips, COALESCE(SUM(click_payout), 0) AS click_revenue FROM clicks WHERE click_time >= ${since}`);
      const earn = await queryOne(`SELECT COUNT(*) AS earnings, COALESCE(SUM(payout_amount), 0) AS payout_total FROM affiliate_earnings WHERE created_at >= ${since}`);
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

async function getSystemStatus(_req, res) {
  const fs = require('fs');
  const path = require('path');
  const geoDir = path.resolve(__dirname, '../../config/geo');

  const cronRow = await queryOne('SELECT last_execution_time FROM cronjob_logs ORDER BY last_execution_time DESC LIMIT 1');
  const dbRow = await queryOne("SELECT value FROM settings WHERE name = 'db_version' LIMIT 1");
  const mysqlRow = await queryOne('SELECT VERSION() AS version');
  const clicksRow = await queryOne('SELECT COUNT(*) AS total FROM clicks');
  let deTotal = 0;
  let deDone = 0;

  const columns = await queryRows("SHOW COLUMNS FROM dataengine_job");
  const names = columns.map(c => c.Field);
  if (names.length) {
    const doneColumn = ['processed', 'is_done', 'done', 'completed'].find(c => names.includes(c));
    const statusColumn = names.includes('status') ? 'status' : null;
    if (doneColumn) {
      const row = await queryOne(`SELECT COUNT(*) AS total, SUM(IF(${doneColumn}, 1, 0)) AS done FROM dataengine_job`);
      deTotal = toNumber(row.total);
      deDone = toNumber(row.done);
    } else if (statusColumn) {
      const row = await queryOne(`SELECT COUNT(*) AS total, SUM(IF(${statusColumn} IN ('done','complete','completed','processed'), 1, 0)) AS done FROM dataengine_job`);
      deTotal = toNumber(row.total);
      deDone = toNumber(row.done);
    } else {
      const row = await queryOne('SELECT COUNT(*) AS total FROM dataengine_job');
      deTotal = toNumber(row.total);
    }
  }

  const geoip = {};
  for (const f of ['Country.mmdb', 'GeoLite2-ASN.mmdb']) {
    const fp = path.join(geoDir, f);
    try {
      const stat = fs.statSync(fp);
      geoip[f] = { size: stat.size, modified: stat.mtime.toISOString(), exists: true };
    } catch {
      geoip[f] = { exists: false };
    }
  }

  res.json({
    version: dbRow.value || 'Unavailable',
    php_version: process.env.PHP_VERSION || 'Unavailable',
    mysql_version: mysqlRow.version || 'Unavailable',
    node_version: process.version,
    total_clicks: toNumber(clicksRow.total),
    cron: { last_execution: cronRow.last_execution_time || null },
    dataengine_total: deTotal,
    dataengine_done: deDone,
    dataengine_progress: deTotal > 0 ? Math.round((deDone / deTotal) * 100) : 0,
    geoip_country: geoip['Country.mmdb']?.exists ? `${(geoip['Country.mmdb'].size / 1024 / 1024).toFixed(1)} MB` : '',
    geoip_asn: geoip['GeoLite2-ASN.mmdb']?.exists ? `${(geoip['GeoLite2-ASN.mmdb'].size / 1024 / 1024).toFixed(1)} MB` : '',
    isp_enabled: Boolean(geoip['GeoLite2-ASN.mmdb']?.exists),
  });
}

async function getClickServers(req, res) {
  try {
    const user = await queryOne('SELECT clickserver_api_key FROM users WHERE user_id = ?', [req.user.id]);
    if (!user.clickserver_api_key) {
      return res.json({ configured: false, domains: [], domains_used: 0, domains_available: null, message: 'Add a ClickServer API key in Integrations to manage domains.' });
    }

    let domains = [];
    const columns = await queryRows('SHOW COLUMNS FROM clickserver_domains');
    if (columns.length) {
      domains = await queryRows('SELECT id, domain, status, created_at, updated_at FROM clickserver_domains WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 100', [req.user.id]);
    }

    res.json({
      configured: true,
      domains,
      domains_used: domains.length,
      domains_available: null,
      message: domains.length ? 'ClickServer domains loaded.' : 'API key saved. No domains are registered in the local tracker yet.',
    });
  } catch (err) {
    console.error('getClickServers error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getVipProfile(req, res) {
  try {
    await ensureVipTable();
    const profile = await queryOne('SELECT monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at FROM affiliate_vip_profiles WHERE user_id = ?', [req.user.id]);
    const user = await queryOne('SELECT vip_perks_status, install_hash FROM users WHERE user_id = ?', [req.user.id]);
    res.json({
      monthly_traffic: profile.monthly_traffic || '',
      primary_vertical: profile.primary_vertical || '',
      preferred_payout: profile.preferred_payout || '',
      notes: profile.notes || '',
      status: profile.status || (user.vip_perks_status ? 'submitted' : 'open'),
      updated_at: profile.updated_at || null,
      install_hash: user.install_hash || null,
    });
  } catch (err) {
    console.error('getVipProfile error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function saveVipProfile(req, res) {
  try {
    await ensureVipTable();
    const monthlyTraffic = String(req.body.monthly_traffic || '').slice(0, 50);
    const primaryVertical = String(req.body.primary_vertical || '').slice(0, 80);
    const preferredPayout = String(req.body.preferred_payout || '').slice(0, 80);
    const notes = String(req.body.notes || '').slice(0, 2000);
    await pool.query(
      `INSERT INTO affiliate_vip_profiles (user_id, monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', UNIX_TIMESTAMP())
       ON DUPLICATE KEY UPDATE monthly_traffic = VALUES(monthly_traffic), primary_vertical = VALUES(primary_vertical), preferred_payout = VALUES(preferred_payout), notes = VALUES(notes), status = 'submitted', updated_at = UNIX_TIMESTAMP()`,
      [req.user.id, monthlyTraffic, primaryVertical, preferredPayout, notes]
    );
    await queryRows('UPDATE users SET vip_perks_status = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ saved: true, status: 'submitted' });
  } catch (err) {
    console.error('saveVipProfile error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  getAffiliates,
  getEarnings,
  approveEarning,
  getStats,
  getCommissions,
  getPayments,
  getCampaigns,
  getReport,
  exportReportCsv,
  getSystemStatus,
  getClickServers,
  getVipProfile,
  saveVipProfile,
};
