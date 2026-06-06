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
  await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_affiliate_vip_profiles (
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
       FROM 1ai_users
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
       FROM 1ai_affiliates a
       JOIN 1ai_users u ON a.user_id = u.user_id
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
    const role = req.user.role;
    let sql = `SELECT ae.*, a.affiliate_code, u.user_email, u.user_name
               FROM 1ai_affiliate_earnings ae
               JOIN 1ai_affiliates a ON ae.affiliate_id = a.id
               JOIN 1ai_users u ON a.user_id = u.user_id
               WHERE 1=1`;
    const params = [];

    if (role === 'affiliate') {
      sql += ' AND a.user_id = ?';
      params.push(req.user.id);
    } else if (affiliate_id) {
      sql += ' AND ae.affiliate_id = ?';
      params.push(parseInt(affiliate_id));
    }
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
      `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, id]
    );
    res.json({ approved: result.affectedRows });
  } catch (err) {
    console.error('approveEarning error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getStats(req, res) {
  try {
    const role = req.user.role;
    if (role !== 'admin' && role !== 'manager') {
       return res.json({
          totalAffiliates: 0, newAffiliates7d: 0, clicks24h: 0, active_clicks_24h: 0,
          clicks_today: 0, total_clicks: 0, unique_ips: 0, attributed_conversions: 0,
          assisted_conversions: 0, avg_epc: 0, avg_ctr: 0, clickChange: 0, pendingPayout: 0,
          pending_payout: 0, pendingCount: 0, pending_count: 0, revenueMtd: 0, revenue_mtd: 0,
          revenueGrowth: 0, revenue_growth: 0, totalPaid: 0, total_paid: 0
       });
    }

    const affCount = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_affiliates WHERE status = 'active'`);
    const newAff7d = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_affiliates WHERE status = 'active' AND created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))`);
    const clicks24h = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))`);
    const clicksPrev = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time BETWEEN UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 DAY)) AND UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))`);
    const totalClicks = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks`);
    const uniqueIps = await queryOne(`SELECT COUNT(DISTINCT click_ip) AS total FROM 1ai_clicks`);
    const conversions = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_conversion_logs`);
    const pendingEarn = await queryOne(`SELECT COUNT(*) AS total, COALESCE(SUM(payout_amount), 0) AS pending_amount FROM 1ai_affiliate_earnings WHERE status = 'pending'`);
    const paidTotal = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS total_paid FROM 1ai_affiliate_earnings WHERE status IN ('paid','approved')`);
    const revMtd = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS mtd FROM 1ai_affiliate_earnings WHERE created_at >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);
    const revPrev = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS prev FROM 1ai_affiliate_earnings WHERE created_at BETWEEN UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)) AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);

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
       FROM 1ai_commission_entries cl
       LEFT JOIN 1ai_affiliates a ON cl.affiliate_id = a.id
       LEFT JOIN 1ai_users u ON a.user_id = u.user_id
       LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
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
       FROM 1ai_affiliate_payments
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ error: err.message });
  }
}

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
       JOIN 1ai_offers o ON c.aff_campaign_id = o.aff_campaign_id
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

    const { name, payout_amount, network_payout, network_id } = req.body;
    let adv_id = req.body.advertiser_id || null;
    
    if (role === 'advertiser' || role === 'manager') {
       adv_id = req.user.id;
    }

    await pool.query(
      `INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, network_id, created_at, status) 
       VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), 'active')`,
      [name, payout_amount || 0, network_payout || payout_amount || 0, adv_id, network_id || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('createOffer error:', err);
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

async function getSystemStatus(_req, res) {
  const fs = require('fs');
  const path = require('path');
  const geoDir = path.resolve(__dirname, '../../config/geo');

  const cronRow = await queryOne('SELECT last_execution_time FROM 1ai_cronjob_logs ORDER BY last_execution_time DESC LIMIT 1');
  const dbRow = await queryOne("SELECT value FROM 1ai_settings WHERE name = 'db_version' LIMIT 1");
  const mysqlRow = await queryOne('SELECT VERSION() AS version');
  const clicksRow = await queryOne('SELECT COUNT(*) AS total FROM 1ai_clicks');
  let deTotal = 0;
  let deDone = 0;

  const columns = await queryRows("SHOW COLUMNS FROM 1ai_dataengine_job");
  const names = columns.map(c => c.Field);
  if (names.length) {
    const doneColumn = ['processed', 'is_done', 'done', 'completed'].find(c => names.includes(c));
    const statusColumn = names.includes('status') ? 'status' : null;
    if (doneColumn) {
      const row = await queryOne(`SELECT COUNT(*) AS total, SUM(IF(${doneColumn}, 1, 0)) AS done FROM 1ai_dataengine_job`);
      deTotal = toNumber(row.total);
      deDone = toNumber(row.done);
    } else if (statusColumn) {
      const row = await queryOne(`SELECT COUNT(*) AS total, SUM(IF(${statusColumn} IN ('done','complete','completed','processed'), 1, 0)) AS done FROM 1ai_dataengine_job`);
      deTotal = toNumber(row.total);
      deDone = toNumber(row.done);
    } else {
      const row = await queryOne('SELECT COUNT(*) AS total FROM 1ai_dataengine_job');
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
    const user = await queryOne('SELECT clickserver_api_key FROM 1ai_users WHERE user_id = ?', [req.user.id]);
    if (!user.clickserver_api_key) {
      return res.json({ configured: false, domains: [], domains_used: 0, domains_available: null, message: 'Add a ClickServer API key in Integrations to manage domains.' });
    }

    let domains = [];
    const columns = await queryRows('SHOW COLUMNS FROM 1ai_clickserver_domains');
    if (columns.length) {
      domains = await queryRows('SELECT id, domain, status, created_at, updated_at FROM 1ai_clickserver_domains WHERE user_id = ? ORDER BY updated_at DESC, id DESC LIMIT 100', [req.user.id]);
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

async function addClickServer(req, res) {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    
    // Check if table exists
    const columns = await queryRows('SHOW COLUMNS FROM 1ai_clickserver_domains');
    if (!columns.length) {
      await pool.query(`CREATE TABLE 1ai_clickserver_domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        domain VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at INT,
        updated_at INT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    }

    await pool.query(
      'INSERT INTO 1ai_clickserver_domains (user_id, domain, status, created_at, updated_at) VALUES (?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
      [req.user.id, domain, 'active']
    );
    res.json({ success: true, domain });
  } catch (err) {
    console.error('addClickServer error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getVipProfile(req, res) {
  try {
    await ensureVipTable();
    const profile = await queryOne('SELECT monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at FROM 1ai_affiliate_vip_profiles WHERE user_id = ?', [req.user.id]);
    const user = await queryOne('SELECT vip_perks_status, install_hash FROM 1ai_users WHERE user_id = ?', [req.user.id]);
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
      `INSERT INTO 1ai_affiliate_vip_profiles (user_id, monthly_traffic, primary_vertical, preferred_payout, notes, status, updated_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', UNIX_TIMESTAMP())
       ON DUPLICATE KEY UPDATE monthly_traffic = VALUES(monthly_traffic), primary_vertical = VALUES(primary_vertical), preferred_payout = VALUES(preferred_payout), notes = VALUES(notes), status = 'submitted', updated_at = UNIX_TIMESTAMP()`,
      [req.user.id, monthlyTraffic, primaryVertical, preferredPayout, notes]
    );
    await queryRows('UPDATE 1ai_users SET vip_perks_status = 1 WHERE user_id = ?', [req.user.id]);
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
  addClickServer,
  getVipProfile,
  saveVipProfile,
  getOffers,
  createOffer,
  getNetworks,
  createNetwork,
};
