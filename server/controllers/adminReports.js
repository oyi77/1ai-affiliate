'use strict';
/**
 * System-status and click-server admin handlers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');
const { queryRows, queryOne, toNumber } = require('./adminShared');

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

module.exports = {
  getSystemStatus,
  getClickServers,
  addClickServer,

};
