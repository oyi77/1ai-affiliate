const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const pool = require('../db/mysql');

router.use(authenticate);
router.use(requireAdmin);


// ── Helper: substitute postback macros ───────────────────────────────
function substitutePostbackMacros(template, data) {
  let url = template;
  for (const [key, value] of Object.entries(data)) {
    url = url.replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? '');
  }
  return url;
}
// ── GET /traffic-sources ──────────────────────────────────────────────
router.get('/traffic-sources', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, category AS type, is_active AS status, platform_type, cost_model, created_at FROM 1ai_traffic_sources ORDER BY created_at DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch traffic sources', detail: err.message });
  }
});

// ── GET /deep-links ───────────────────────────────────────────────────
router.get('/deep-links', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM deep_link_pages ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deep links', detail: err.message });
  }
});

// ── GET /landing-pages ────────────────────────────────────────────────
router.get('/landing-pages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT landing_page_id, user_id, landing_page_url, landing_page_status FROM landing_pages ORDER BY landing_page_id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch landing pages', detail: err.message });
  }
});

// ── GET /conversion-log ───────────────────────────────────────────────
router.get('/conversion-log', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cl.conversion_id, cl.click_id, cl.aff_campaign_id, ac.aff_campaign_name, cl.conversion_time FROM 1ai_conversion_logs cl LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id ORDER BY cl.conversion_time DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversion log', detail: err.message });
  }
});

// ── GET /postback-templates ───────────────────────────────────────────
router.get('/postback-templates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_postback_templates ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch postback templates', detail: err.message });
  }
});

// ── POST /postback-templates ──────────────────────────────────────────
router.post('/postback-templates', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_postback_templates SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create postback template', detail: err.message });
  }
});

// ── PUT /postback-templates/:id ───────────────────────────────────────
router.put('/postback-templates/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_postback_templates SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update postback template', detail: err.message });
  }
});

// ── DELETE /postback-templates/:id ────────────────────────────────────
router.delete('/postback-templates/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Template not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete postback template', detail: err.message });
  }
});

// ── GET /laporan-iklan ────────────────────────────────────────────────
router.get('/laporan-iklan', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.aff_campaign_id,
        ac.aff_campaign_name,
        COUNT(c.click_id) AS clicks,
        COALESCE(SUM(cl.conversions), 0) AS conversions,
        COALESCE(SUM(c.click_payout), 0) AS payout
      FROM 1ai_clicks c
      LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = c.aff_campaign_id
      LEFT JOIN (
        SELECT aff_campaign_id, COUNT(*) AS conversions
        FROM 1ai_conversion_logs
        GROUP BY aff_campaign_id
      ) cl ON cl.aff_campaign_id = c.aff_campaign_id
      GROUP BY c.aff_campaign_id, ac.aff_campaign_name
      ORDER BY clicks DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan iklan', detail: err.message });
  }
});

// ── GET /analytic-harian ──────────────────────────────────────────────
router.get('/analytic-harian', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE(FROM_UNIXTIME(c.click_time)) AS date,
        COUNT(c.click_id) AS clicks,
        COALESCE(SUM(cl.conversions), 0) AS conversions,
        COALESCE(SUM(c.click_payout), 0) AS payout
      FROM 1ai_clicks c
      LEFT JOIN (
        SELECT DATE(FROM_UNIXTIME(conversion_time)) AS conv_date,
               COUNT(*) AS conversions
        FROM 1ai_conversion_logs
        GROUP BY DATE(FROM_UNIXTIME(conversion_time))
      ) cl ON cl.conv_date = DATE(FROM_UNIXTIME(c.click_time))
      GROUP BY DATE(FROM_UNIXTIME(c.click_time))
      ORDER BY date DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytic harian', detail: err.message });
  }
});

// ── GET /laporan-taglink ──────────────────────────────────────────────
router.get('/laporan-taglink', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_taglink_mappings ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan taglink', detail: err.message });
  }
});

// ── GET /laporan-order ────────────────────────────────────────────────
router.get('/laporan-order', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        cl.conversion_id,
        cl.click_id,
        cl.aff_campaign_id,
        ac.aff_campaign_name,
        ac.aff_campaign_payout,
        cl.conversion_time
      FROM 1ai_conversion_logs cl
      LEFT JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id
      ORDER BY cl.conversion_time DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch laporan order', detail: err.message });
  }
});
// ── GET /ab-tests ─────────────────────────────────────────────────────
router.get('/ab-tests', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_ab_tests ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch AB tests', detail: err.message });
  }
});

// ── POST /ab-tests ────────────────────────────────────────────────────
router.post('/ab-tests', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_ab_tests SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create AB test', detail: err.message });
  }
});

// ── GET /automation ───────────────────────────────────────────────────
router.get('/automation', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_automation_rules ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch automation rules', detail: err.message });
  }
});

// ── POST /automation ──────────────────────────────────────────────────
router.post('/automation', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_automation_rules SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create automation rule', detail: err.message });
  }
});

// ── PUT /automation/:id ───────────────────────────────────────────────
router.put('/automation/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_automation_rules SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Rule not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update automation rule', detail: err.message });
  }
});

// ── GET /day-parting ──────────────────────────────────────────────────
router.get('/day-parting', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT value FROM 1ai_settings WHERE name = 'day_parting' LIMIT 1"
    );
    const config = rows.length ? JSON.parse(rows[0].value) : {};
    res.json({ data: config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch day-parting config', detail: err.message });
  }
});

// ── PUT /day-parting ──────────────────────────────────────────────────
router.put('/day-parting', async (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    await pool.query(
      `INSERT INTO 1ai_settings (name, value)
       VALUES ('day_parting', ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [value]
    );
    res.json({ data: req.body });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save day-parting config', detail: err.message });
  }
});

// ── GET /webhooks ─────────────────────────────────────────────────────
router.get('/webhooks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_webhooks ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch webhooks', detail: err.message });
  }
});

// ── POST /webhooks ────────────────────────────────────────────────────
router.post('/webhooks', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO 1ai_webhooks SET ?', [req.body]
    );
    res.status(201).json({ data: { id: result.insertId, ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create webhook', detail: err.message });
  }
});

// ── PUT /webhooks/:id ─────────────────────────────────────────────────
router.put('/webhooks/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_webhooks SET ? WHERE id = ?', [req.body, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ data: { id: Number(req.params.id), ...req.body } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update webhook', detail: err.message });
  }
});

// ── DELETE /webhooks/:id ──────────────────────────────────────────────
router.delete('/webhooks/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM 1ai_webhooks WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete webhook', detail: err.message });
  }
});

// ── GET /saldo-budget ─────────────────────────────────────────────────
router.get('/saldo-budget', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_balance_ledger WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    const balance = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    res.json({ data: { balance, transactions: rows } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saldo/budget', detail: err.message });
  }
});

// ── GET /advertisers ────────────────────────────────────────────────
router.get('/advertisers', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT a.*, u.user_email, u.user_name FROM 1ai_advertisers a
       LEFT JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY a.id DESC LIMIT ?`, [limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /clicks ─────────────────────────────────────────────────────
router.get('/clicks', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const [rows] = await pool.query(
      `SELECT click_id, click_time, aff_campaign_id, click_payout, click_ip
       FROM 1ai_clicks ORDER BY click_id DESC LIMIT ?`, [limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversions/manual ────────────────────────────────────────
router.post('/conversions/manual', async (req, res) => {
  try {
    const { click_id, offer_id, payout } = req.body;
    if (!click_id || !offer_id) return res.status(400).json({ error: 'click_id and offer_id required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_conversion_logs (click_id, aff_campaign_id, conversion_time) VALUES (?, ?, UNIX_TIMESTAMP())',
      [click_id, offer_id]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /notifications ──────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await pool.query(
      `SELECT * FROM 1ai_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [req.user.id, limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /notifications/read-all ────────────────────────────────────
router.post('/notifications/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE 1ai_notifications SET read_at = UNIX_TIMESTAMP() WHERE user_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /shopee-accounts ────────────────────────────────────────────
router.get('/shopee-accounts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_shopee_reports ORDER BY id DESC LIMIT 50');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /stats/daily ────────────────────────────────────────────────
router.get('/stats/daily', async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const days = parseInt(range) || 30;
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
    const [rows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(click_time)) as date,
              COUNT(*) as clicks,
              SUM(click_payout) as revenue
       FROM 1ai_clicks WHERE click_time >= ? GROUP BY date ORDER BY date DESC`,
      [cutoff]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/notifications ─────────────────────────────────────
router.get('/settings/notifications', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM 1ai_settings WHERE name = ?',
      ['notifications_' + req.user.id]
    );
    res.json(row ? JSON.parse(row.value || '{}') : { email: true, push: false, telegram: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/payouts/rules ────────────────────────────────────
router.get('/settings/payouts/rules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_payout_rules ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/telegram ──────────────────────────────────────────
router.get('/settings/telegram', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_telegram_config WHERE user_id = ?', [req.user.id]);
    res.json(row || { bot_token: null, channel_id: null, enabled: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /settings/telegram/test ────────────────────────────────────
router.post('/settings/telegram/test', async (req, res) => {
  try {
    res.json({ success: true, message: 'Test message queued' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /settings/white-label ───────────────────────────────────────
router.get('/settings/white-label', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_white_label WHERE user_id = ?', [req.user.id]);
    res.json(row || { logo_url: null, brand_name: null, custom_domain: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /campaigns/:id ──────────────────────────────────────────────
router.get('/campaigns/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_aff_campaigns WHERE aff_campaign_id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Campaign not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /offers/pending — admin sees pending applications ───────────
router.get('/offers/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT oaa.id, oaa.offer_id, oaa.affiliate_id, oaa.status, oaa.created_at,
              o.name AS offer_name, u.user_name AS affiliate_name
       FROM 1ai_offer_affiliate_access oaa
       JOIN 1ai_offers o ON o.id = oaa.offer_id
       JOIN 1ai_affiliates a ON a.id = oaa.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       WHERE oaa.status = 'pending'
       ORDER BY oaa.created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending applications', detail: err.message });
  }
});

// ── GET /offers/:id ─────────────────────────────────────────────────
router.get('/offers/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_offers WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Offer not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /conversion-approval ──────────────────────────────────────
router.get('/conversion-approval', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT cl.conversion_id, cl.click_id, cl.aff_campaign_id, cl.conversion_time, cl.network_payout_snapshot, cl.affiliate_payout_snapshot, cl.margin_amount, cl.affiliate_id, cl.affiliate_status, cl.status, cl.approved_by, cl.approved_at, cl.reject_reason FROM 1ai_conversion_logs cl';
    const params = [];
    if (status) {
      sql += ' WHERE cl.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY cl.conversion_time DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversions', detail: err.message });
  }
});

// ── POST /conversion-approval/:id/approve ─────────────────────────
router.post('/conversion-approval/:id/approve', async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?",
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conversion not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversion-approval/:id/reject ──────────────────────────
router.post('/conversion-approval/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });
    const [result] = await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'rejected', reject_reason = ?, approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id = ?",
      [reason, req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conversion not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /conversion-approval/batch-approve ───────────────────────
router.post('/conversion-approval/batch-approve', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array is required' });
    const [result] = await pool.query(
      "UPDATE 1ai_conversion_logs SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE conversion_id IN (?)",
      [req.user.id, ids]
    );
    res.json({ success: true, affected: result.affectedRows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /conversion-approval/stats ────────────────────────────────
router.get('/conversion-approval/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT status, COUNT(*) AS count FROM 1ai_conversion_logs GROUP BY status"
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── GET /creatives ──────────────────────────────────────────────────
router.get('/creatives', async (req, res) => {
  try {
    const { offer_id } = req.query;
    if (!offer_id) return res.status(400).json({ error: 'offer_id is required' });
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_offer_creatives WHERE offer_id = ? ORDER BY id DESC', [offer_id]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch creatives', detail: err.message });
  }
});

// ── POST /creatives ─────────────────────────────────────────────────
router.post('/creatives', async (req, res) => {
  try {
    const { offer_id, name, type, asset_url, html_body, dimensions } = req.body;
    if (!offer_id || !name || !type) return res.status(400).json({ error: 'offer_id, name, and type are required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_offer_creatives (offer_id, name, type, asset_url, html_body, dimensions, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
      [offer_id, name, type, asset_url || null, html_body || null, dimensions || null]
    );
    res.status(201).json({ data: { id: result.insertId, offer_id, name, type, asset_url, html_body, dimensions, is_active: 1 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create creative', detail: err.message });
  }
});

// ── PUT /creatives/:id ──────────────────────────────────────────────
router.put('/creatives/:id', async (req, res) => {
  try {
    const fields = ['offer_id', 'name', 'type', 'asset_url', 'html_body', 'dimensions'];
    const updates = [];
    const values = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('updated_at = UNIX_TIMESTAMP()');
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE 1ai_offer_creatives SET ${updates.join(', ')} WHERE id = ?`, values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Creative not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update creative', detail: err.message });
  }
});

// ── DELETE /creatives/:id ───────────────────────────────────────────
router.delete('/creatives/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE 1ai_offer_creatives SET is_active = 0, updated_at = UNIX_TIMESTAMP() WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Creative not found' });
    res.json({ data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete creative', detail: err.message });
  }
});

// ── GET /payouts/batches ────────────────────────────────────────────
router.get('/payouts/batches', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payout_batches ORDER BY id DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout batches', detail: err.message });
  }
});

// ── POST /payouts/batches ───────────────────────────────────────────
router.post('/payouts/batches', async (req, res) => {
  try {
    // Aggregate pending earnings by affiliate
    const [pendingEarnings] = await pool.query(
      "SELECT affiliate_id, SUM(amount) AS total FROM 1ai_affiliate_earnings WHERE status = 'pending' GROUP BY affiliate_id"
    );
    if (pendingEarnings.length === 0) return res.status(400).json({ error: 'No pending earnings to process' });
    const grandTotal = pendingEarnings.reduce((sum, e) => sum + parseFloat(e.total), 0);
    // Create batch
    const [batchResult] = await pool.query(
      "INSERT INTO payout_batches (total, status, created_at) VALUES (?, 'draft', UNIX_TIMESTAMP())",
      [grandTotal]
    );
    const batchId = batchResult.insertId;
    // Create payout items
    for (const earning of pendingEarnings) {
      await pool.query(
        'INSERT INTO payout_items (batch_id, affiliate_id, amount) VALUES (?, ?, ?)',
        [batchId, earning.affiliate_id, earning.total]
      );
    }
    // Update earnings status to processing
    await pool.query(
      "UPDATE 1ai_affiliate_earnings SET status = 'processing' WHERE status = 'pending'"
    );
    res.status(201).json({ data: { id: batchId, total: grandTotal, status: 'draft', items: pendingEarnings.length } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payout batch', detail: err.message });
  }
});

// ── POST /payouts/batches/:id/mark-paid ────────────────────────────
router.post('/payouts/batches/:id/mark-paid', async (req, res) => {
  try {
    const [batchCheck] = await pool.query(
      'SELECT id, status FROM payout_batches WHERE id = ?', [req.params.id]
    );
    if (batchCheck.length === 0) return res.status(404).json({ error: 'Batch not found' });
    await pool.query(
      "UPDATE payout_batches SET status = 'paid' WHERE id = ?", [req.params.id]
    );
    // Update affiliate earnings associated with this batch's items to 'paid'
    const [items] = await pool.query(
      'SELECT affiliate_id, amount FROM payout_items WHERE batch_id = ?', [req.params.id]
    );
    for (const item of items) {
      await pool.query(
        "UPDATE 1ai_affiliate_earnings SET status = 'paid' WHERE affiliate_id = ? AND status = 'processing'",
        [item.affiliate_id]
      );
    }
    res.json({ success: true, items_updated: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark batch as paid', detail: err.message });
  }
});

// ── GET /payouts/batches/:id/items ─────────────────────────────────
router.get('/payouts/batches/:id/items', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payout_items WHERE batch_id = ?', [req.params.id]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout items', detail: err.message });
  }
});

// ── GET /postback-templates/:id/preview ─────────────────────────────
router.get('/postback-templates/:id/preview', async (req, res) => {
  try {
    const [[template]] = await pool.query(
      'SELECT * FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const sampleData = {
      click_id: 'abc123',
      payout: '10.00',
      status: 'approved',
      transaction_id: 'txn_001',
      sub_id: 'sub_01',
      offer_id: '1'
    };
    const macros = template.macros ? (typeof template.macros === 'string' ? JSON.parse(template.macros) : template.macros) : {};
    const mergedData = { ...sampleData, ...macros };
    const previewUrl = substitutePostbackMacros(template.url_template, mergedData);
    res.json({ data: { ...template, preview_url: previewUrl, sample_data: mergedData } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to preview postback template', detail: err.message });
  }
});

// ── POST /postback-templates/:id/test ──────────────────────────────
router.post('/postback-templates/:id/test', async (req, res) => {
  try {
    const [[template]] = await pool.query(
      'SELECT * FROM 1ai_postback_templates WHERE id = ?', [req.params.id]
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    const testData = req.body.data || {
      click_id: 'test_click',
      payout: '1.00',
      status: 'approved',
      transaction_id: 'test_txn',
      sub_id: 'test_sub',
      offer_id: '0'
    };
    const macros = template.macros ? (typeof template.macros === 'string' ? JSON.parse(template.macros) : template.macros) : {};
    const mergedData = { ...macros, ...testData };
    const url = substitutePostbackMacros(template.url_template, mergedData);
    const method = (template.method || 'GET').toUpperCase();
    const headers = template.headers ? (typeof template.headers === 'string' ? JSON.parse(template.headers) : template.headers) : {};
    const fetchOptions = { method, headers: { 'User-Agent': '1ai-postback-test', ...headers } };
    if (method === 'POST' && req.body.payload) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body.payload);
    }
    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();
    res.json({
      data: {
        url,
        method,
        status: response.status,
        response_body: responseBody.substring(0, 2000),
        sent_data: mergedData
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to test postback', detail: err.message });
  }
});
// ═══════════════════════════════════════════════════════════════════
// AFFILIATE CLAIM FLOW
// ═══════════════════════════════════════════════════════════════════

// ── GET /earnings/my — affiliate sees own earnings ──────────────────
router.get('/earnings/my', async (req, res) => {
  try {
    const [affRows] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!affRows.length) return res.json({ data: [], summary: { pending: 0, approved: 0, paid: 0, rejected: 0 } });
    const affiliateId = affRows[0].id;
    const status = req.query.status;
    let sql = 'SELECT * FROM 1ai_affiliate_earnings WHERE affiliate_id = ?';
    const params = [affiliateId];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY id DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    const [summary] = await pool.query(
      `SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total
       FROM 1ai_affiliate_earnings WHERE affiliate_id = ? GROUP BY status`, [affiliateId]
    );
    const sum = { pending: 0, approved: 0, paid: 0, rejected: 0 };
    summary.forEach(r => { sum[r.status] = { count: r.cnt, amount: Number(r.total) }; });
    res.json({ data: rows, summary: sum });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings', detail: err.message });
  }
});

// ── POST /earnings/claim — affiliate requests payout ────────────────
router.post('/earnings/claim', async (req, res) => {
  try {
    const [affRows] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!affRows.length) return res.status(403).json({ error: 'Not an affiliate' });
    const affiliateId = affRows[0].id;
    const { ids } = req.body; // optional: specific earning IDs to claim
    let affected;
    if (ids && ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      const [result] = await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
         WHERE id IN (${placeholders}) AND affiliate_id = ? AND status = 'pending'`,
        [req.user.id, ...ids, affiliateId]
      );
      affected = result.affectedRows;
    } else {
      const [result] = await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
         WHERE affiliate_id = ? AND status = 'pending'`,
        [req.user.id, affiliateId]
      );
      affected = result.affectedRows;
    }
    res.json({ success: true, claimed: affected });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim earnings', detail: err.message });
  }
});

// ── GET /earnings/claims — admin sees all claims ────────────────────
router.get('/earnings/claims', async (req, res) => {
  try {
    const status = req.query.status;
    let sql = `SELECT e.*, a.affiliate_code, u.user_name, u.user_email
               FROM 1ai_affiliate_earnings e
               JOIN 1ai_affiliates a ON a.id = e.affiliate_id
               JOIN 1ai_users u ON u.user_id = a.user_id`;
    const params = [];
    if (status) { sql += ' WHERE e.status = ?'; params.push(status); }
    sql += ' ORDER BY e.id DESC LIMIT 500';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch claims', detail: err.message });
  }
});

// ── POST /earnings/:id/approve — admin approves earning ─────────────
router.post('/earnings/:id/approve', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP() WHERE id = ? AND status = 'pending'`,
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Earning not found or already processed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve earning', detail: err.message });
  }
});

// ── POST /earnings/:id/reject — admin rejects earning ───────────────
router.post('/earnings/:id/reject', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_earnings SET status = 'rejected' WHERE id = ? AND status = 'pending'`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Earning not found or already processed' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject earning', detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ADVERTISER BILLING FLOW
// ═══════════════════════════════════════════════════════════════════

// ── GET /invoices — list invoices (filtered by role) ────────────────
router.get('/invoices', async (req, res) => {
  try {
    let sql = `SELECT i.*, a.company_name, u.user_name, u.user_email
               FROM 1ai_affiliate_invoices i
               LEFT JOIN 1ai_advertisers a ON a.id = i.affiliate_id
               LEFT JOIN 1ai_affiliates af ON af.id = i.affiliate_id
               LEFT JOIN 1ai_users u ON u.user_id = af.user_id`;
    const params = [];
    if (req.user.role === 'advertiser') {
      const [advRows] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [req.user.id]);
      if (advRows.length) {
        sql += ' WHERE i.affiliate_id = ?';
        params.push(advRows[0].id);
      }
    }
    if (req.query.status) {
      sql += params.length ? ' AND' : ' WHERE';
      sql += ' i.status = ?';
      params.push(req.query.status);
    }
    sql += ' ORDER BY i.id DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices', detail: err.message });
  }
});

// ── POST /invoices — admin creates invoice ──────────────────────────
router.post('/invoices', async (req, res) => {
  try {
    const { affiliate_id, period_start, period_end, conversions_count, revenue_amount, payout_amount, margin_amount, currency, notes } = req.body;
    if (!affiliate_id || !period_start || !period_end) return res.status(400).json({ error: 'affiliate_id, period_start, period_end required' });
    const [result] = await pool.query(
      `INSERT INTO 1ai_affiliate_invoices (affiliate_id, period_start, period_end, conversions_count, revenue_amount, payout_amount, margin_amount, currency, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [affiliate_id, period_start, period_end, conversions_count || 0, revenue_amount || 0, payout_amount || 0, margin_amount || 0, currency || 'USD', notes || null]
    );
    res.json({ success: true, invoice_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create invoice', detail: err.message });
  }
});

// ── POST /invoices/:id/pay — mark invoice as paid ───────────────────
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_invoices SET status = 'paid', paid_at = UNIX_TIMESTAMP(), paid_by = ?, updated_at = UNIX_TIMESTAMP() WHERE id = ? AND status IN ('draft','sent')`,
      [req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found or already paid' });
    // Update related earnings to 'paid'
    const [[invoice]] = await pool.query('SELECT affiliate_id, period_start, period_end FROM 1ai_affiliate_invoices WHERE id = ?', [req.params.id]);
    if (invoice) {
      await pool.query(
        `UPDATE 1ai_affiliate_earnings SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE affiliate_id = ? AND status = 'approved' AND created_at >= UNIX_TIMESTAMP(?) AND created_at <= UNIX_TIMESTAMP(?)`,
        [invoice.affiliate_id, invoice.period_start, invoice.period_end]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark invoice as paid', detail: err.message });
  }
});

// ── POST /invoices/:id/send — mark invoice as sent ──────────────────
router.post('/invoices/:id/send', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_invoices SET status = 'sent', updated_at = UNIX_TIMESTAMP() WHERE id = ? AND status = 'draft'`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found or not in draft' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send invoice', detail: err.message });
  }
});

// ── GET /billing/summary — billing overview ─────────────────────────
router.get('/billing/summary', async (req, res) => {
  try {
    const [totalEarned] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings`);
    const [totalPaid] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings WHERE status = 'paid'`);
    const [totalPending] = await pool.query(`SELECT COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings WHERE status IN ('pending','approved')`);
    const [invoiceStats] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_invoices GROUP BY status`);
    const [depositTotal] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type = 'deposit'`);
    const [withdrawTotal] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type IN ('withdrawal','spend')`);
    const invoices = {};
    invoiceStats.forEach(r => { invoices[r.status] = { count: r.cnt, amount: Number(r.total) }; });
    res.json({
      earnings: {
        total: Number(totalEarned[0].total),
        paid: Number(totalPaid[0].total),
        pending: Number(totalPending[0].total),
      },
      invoices,
      balance: {
        deposits: Number(depositTotal[0].total),
        withdrawals: Number(withdrawTotal[0].total),
        available: Number(depositTotal[0].total) - Number(withdrawTotal[0].total),
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch billing summary', detail: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// MANAGEMENT OVERSIGHT
// ═══════════════════════════════════════════════════════════════════

// ── GET /management/overview — full financial overview ──────────────
router.get('/management/overview', async (req, res) => {
  try {
    const [earnings] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_earnings GROUP BY status`);
    const [invoices] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(payout_amount),0) AS total FROM 1ai_affiliate_invoices GROUP BY status`);
    const [payments] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(amount),0) AS total FROM 1ai_affiliate_payments GROUP BY status`);
    const [batches] = await pool.query(`SELECT status, COUNT(*) AS cnt, COALESCE(SUM(total),0) AS total FROM payout_batches GROUP BY status`);
    const [deposits] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type='deposit'`);
    const [withdrawals] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM 1ai_balance_ledger WHERE type IN ('withdrawal','spend')`);
    const format = (rows) => { const o = {}; rows.forEach(r => { o[r.status] = { count: r.cnt, amount: Number(r.total) }; }); return o; };
    res.json({
      earnings: format(earnings),
      invoices: format(invoices),
      payments: format(payments),
      payout_batches: format(batches),
      balance: {
        deposits: Number(deposits[0].total),
        withdrawals: Number(withdrawals[0].total),
        net: Number(deposits[0].total) - Number(withdrawals[0].total),
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch management overview', detail: err.message });
  }
});

// ── GET /management/transactions — all transactions with details ────
router.get('/management/transactions', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const [earnings] = await pool.query(
      `SELECT 'earning' AS type, e.id, e.payout_amount AS amount, e.status, e.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_earnings e
       JOIN 1ai_affiliates a ON a.id = e.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY e.id DESC LIMIT ?`, [limit]
    );
    const [payments] = await pool.query(
      `SELECT 'payment' AS type, p.id, p.amount, p.status, p.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_payments p
       JOIN 1ai_users u ON u.user_id = p.user_id
       ORDER BY p.id DESC LIMIT ?`, [limit]
    );
    const [invoices] = await pool.query(
      `SELECT 'invoice' AS type, i.id, i.payout_amount AS amount, i.status, i.created_at, u.user_name, u.user_email
       FROM 1ai_affiliate_invoices i
       JOIN 1ai_affiliates a ON a.id = i.affiliate_id
       JOIN 1ai_users u ON u.user_id = a.user_id
       ORDER BY i.id DESC LIMIT ?`, [limit]
    );
    const all = [...earnings, ...payments, ...invoices].sort((a, b) => b.created_at - a.created_at).slice(0, limit);
    res.json({ data: all });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', detail: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════
// AFFILIATE OFFER ACCESS FLOW
// ═══════════════════════════════════════════════════════════════════

router.post('/offers/:id/apply', async (req, res) => {
  try {
    const offerId = req.params.id;
    const [affiliates] = await pool.query(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [req.user.id]
    );
    if (!affiliates.length) return res.status(404).json({ error: 'Affiliate not found' });
    const affiliateId = affiliates[0].id;

    await pool.query(
      `INSERT INTO 1ai_offer_affiliate_access (offer_id, affiliate_id, status, assigned_by, assignment_type, created_at)
       VALUES (?, ?, 'pending', ?, 'specific', UNIX_TIMESTAMP())`,
      [offerId, affiliateId, req.user.id]
    );
    res.json({ success: true, status: 'pending' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Already applied to this offer' });
    res.status(500).json({ error: 'Failed to apply', detail: err.message });
  }
});


// ── POST /offers/access/:id/approve — admin approves application ────
router.post('/offers/access/:id/approve', async (req, res) => {
  try {
    await pool.query(
      "UPDATE 1ai_offer_affiliate_access SET status = 'approved' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, status: 'approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve', detail: err.message });
  }
});

// ── POST /offers/access/:id/reject — admin rejects application ──────
router.post('/offers/access/:id/reject', async (req, res) => {
  try {
    await pool.query(
      "UPDATE 1ai_offer_affiliate_access SET status = 'revoked' WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, status: 'revoked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject', detail: err.message });
  }
});


// ── Campaign Taglinks CRUD ──────────────────────────────────────
router.get('/campaign-taglinks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_campaign_taglinks ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/campaign-taglinks', async (req, res) => {
  try {
    const { campaign_name, taglink, source, notes } = req.body;
    if (!campaign_name || !taglink) return res.status(400).json({ error: 'campaign_name and taglink required' });
    const [result] = await pool.query(
      'INSERT INTO 1ai_campaign_taglinks (campaign_name, taglink, source, notes) VALUES (?, ?, ?, ?)',
      [campaign_name, taglink, source || 'manual', notes || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/campaign-taglinks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_campaign_taglinks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Shopee Payouts CRUD ─────────────────────────────────────────
router.get('/shopee-payouts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_shopee_payouts ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/shopee-payouts', async (req, res) => {
  try {
    const { amount, shopee_account, report_id, issued_date, notes } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    const [result] = await pool.query(
      "INSERT INTO 1ai_shopee_payouts (amount, shopee_account, report_id, status, issued_date, notes, created_at) VALUES (?, ?, ?, 'pending', ?, ?, UNIX_TIMESTAMP())",
      [amount, shopee_account || null, report_id || null, issued_date || null, notes || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/shopee-payouts/:id/pay', async (req, res) => {
  try {
    await pool.query("UPDATE 1ai_shopee_payouts SET status='paid', paid_date=CURDATE() WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Meta Accounts CRUD ───────────────────────────────────────────
router.get('/meta-accounts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM 1ai_meta_accounts ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/meta-accounts', async (req, res) => {
  try {
    const { act_id, account_name, access_token } = req.body;
    if (!act_id) return res.status(400).json({ error: 'act_id required' });
    const [result] = await pool.query(
      "INSERT INTO 1ai_meta_accounts (user_id, act_id, account_name, access_token, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())",
      [req.user.id, act_id, account_name || null, access_token || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── TrackPro Sync ─────────────────────────────────────────────────
router.get('/trackpro/status', async (req, res) => {
  try {
    const trackproService = require('../services/trackproService');
    const status = await trackproService.getSyncStatus();
    res.json({ data: status });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/trackpro/sync', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'TrackPro credentials required' });
    const trackproService = require('../services/trackproService');
    const scraped = await trackproService.scrapeTrackPro({ username, password });
    const imported = await trackproService.importTrackProData(scraped);
    res.json({ success: true, dashboard: scraped.dashboard, imported, scrapedAt: scraped.scrapedAt });
  } catch (err) {
    console.error('TrackPro sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/trackpro/data', async (req, res) => {
  try {
    const [spend] = await pool.query('SELECT date, campaign_name, spend, clicks FROM 1ai_daily_spend ORDER BY date DESC LIMIT 30');
    const [payouts] = await pool.query('SELECT * FROM 1ai_shopee_payouts ORDER BY id DESC LIMIT 20');
    const [meta] = await pool.query('SELECT act_id, account_name, balance, status FROM 1ai_meta_accounts ORDER BY id DESC');
    const [taglinks] = await pool.query('SELECT * FROM 1ai_campaign_taglinks ORDER BY id DESC LIMIT 20');
    res.json({ data: { spend, payouts, metaAccounts: meta, taglinks } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Traffic Rules CRUD ─────────────────────────────────────────────
router.get('/traffic-rules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, o.name as offer_name FROM 1ai_traffic_rules r
       LEFT JOIN 1ai_offers o ON r.offer_id = o.id
       WHERE r.user_id = ? ORDER BY r.priority DESC, r.id DESC`,
      [req.user.id]
    );
    for (const r of rows) {
      if (typeof r.conditions === 'string') { try { r.conditions = JSON.parse(r.conditions); } catch {} }
    }
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/traffic-rules', async (req, res) => {
  try {
    const { name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const now = Math.floor(Date.now() / 1000);
    const [result] = await pool.query(
      `INSERT INTO 1ai_traffic_rules (user_id, name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, offer_id || null, JSON.stringify(conditions || {}), action || 'redirect', target_url || null, landing_page_id || null, weight || 100, enabled !== false ? 1 : 0, priority || 0, now, now]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/traffic-rules/:id', async (req, res) => {
  try {
    const { name, offer_id, conditions, action, target_url, landing_page_id, weight, enabled, priority } = req.body;
    const now = Math.floor(Date.now() / 1000);
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (offer_id !== undefined) { fields.push('offer_id = ?'); params.push(offer_id); }
    if (conditions !== undefined) { fields.push('conditions = ?'); params.push(JSON.stringify(conditions)); }
    if (action !== undefined) { fields.push('action = ?'); params.push(action); }
    if (target_url !== undefined) { fields.push('target_url = ?'); params.push(target_url); }
    if (landing_page_id !== undefined) { fields.push('landing_page_id = ?'); params.push(landing_page_id); }
    if (weight !== undefined) { fields.push('weight = ?'); params.push(weight); }
    if (enabled !== undefined) { fields.push('enabled = ?'); params.push(enabled ? 1 : 0); }
    if (priority !== undefined) { fields.push('priority = ?'); params.push(priority); }
    fields.push('updated_at = ?'); params.push(now);
    params.push(req.params.id, req.user.id);
    await pool.query(`UPDATE 1ai_traffic_rules SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, params);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/traffic-rules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM 1ai_traffic_rules WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Affiliates Earnings ────────────────────────────────────────────
router.get('/affiliates/earnings', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const [rows] = await pool.query(
      `SELECT e.*, a.user_id as affiliate_user_id, u.user_name
       FROM 1ai_affiliate_earnings e
       LEFT JOIN 1ai_affiliates a ON e.affiliate_id = a.id
       LEFT JOIN 1ai_users u ON a.user_id = u.user_id
       ORDER BY e.id DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reports: Conversions ───────────────────────────────────────────
router.get('/reports/conversions', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT c.*, o.name as offer_name, a.user_name as affiliate_name
       FROM 1ai_conversions c
       LEFT JOIN 1ai_offers o ON c.offer_id = o.id
       LEFT JOIN 1ai_affiliates af ON c.affiliate_id = af.id
       LEFT JOIN 1ai_users a ON af.user_id = a.user_id
       ORDER BY c.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM 1ai_conversions');
    res.json({ data: rows, pagination: { page, limit, total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Reports: Clicks ────────────────────────────────────────────────
router.get('/reports/clicks', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT cl.*, o.name as offer_name, a.user_name as affiliate_name
       FROM 1ai_clicks cl
       LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
       LEFT JOIN 1ai_affiliates af ON cl.affiliate_id = af.id
       LEFT JOIN 1ai_users a ON af.user_id = a.user_id
       ORDER BY cl.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM 1ai_clicks');
    res.json({ data: rows, pagination: { page, limit, total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reports: Ad Performance (Laporan Iklan) ────────────────────────
router.get('/reports/ads', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT o.name as campaign_name,
              COUNT(DISTINCT cl.id) as clicks,
              COUNT(DISTINCT cv.id) as conversions,
              COALESCE(SUM(cv.revenue), 0) as revenue,
              COALESCE(SUM(cv.payout), 0) as payout
       FROM 1ai_offers o
       LEFT JOIN 1ai_clicks cl ON cl.offer_id = o.id AND cl.click_time >= UNIX_TIMESTAMP(?) AND cl.click_time <= UNIX_TIMESTAMP(?)
       LEFT JOIN 1ai_conversions cv ON cv.offer_id = o.id AND cv.created_at >= UNIX_TIMESTAMP(?) AND cv.created_at <= UNIX_TIMESTAMP(?)
       GROUP BY o.id, o.name ORDER BY clicks DESC`,
      [dateFrom, dateTo + ' 23:59:59', dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows, date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reports: Daily Analytics ───────────────────────────────────────
router.get('/reports/daily', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(click_time)) as date,
              COUNT(*) as clicks,
              COUNT(DISTINCT affiliate_id) as affiliates
       FROM 1ai_clicks
       WHERE click_time >= UNIX_TIMESTAMP(?) AND click_time <= UNIX_TIMESTAMP(?)
       GROUP BY DATE(FROM_UNIXTIME(click_time))
       ORDER BY date DESC`,
      [dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows, date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reports: Taglink ───────────────────────────────────────────────
router.get('/reports/taglink', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT tm.tag, tm.campaign_id, o.name as campaign_name,
              COUNT(DISTINCT cl.id) as clicks,
              COUNT(DISTINCT cv.id) as conversions
       FROM 1ai_taglink_mappings tm
       LEFT JOIN 1ai_offers o ON tm.campaign_id = o.id
       LEFT JOIN 1ai_clicks cl ON cl.tag = tm.tag AND cl.click_time >= UNIX_TIMESTAMP(?) AND cl.click_time <= UNIX_TIMESTAMP(?)
       LEFT JOIN 1ai_conversions cv ON cv.offer_id = tm.campaign_id AND cv.created_at >= UNIX_TIMESTAMP(?) AND cv.created_at <= UNIX_TIMESTAMP(?)
       GROUP BY tm.id, tm.tag, tm.campaign_id, o.name
       ORDER BY clicks DESC`,
      [dateFrom, dateTo + ' 23:59:59', dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows, date_from: dateFrom, date_to: dateTo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ── Reports: Orders (Laporan Order) ───────────────────────────────
router.get('/reports/orders', async (req, res) => {
  try {
    const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT cv.id, cv.click_id, o.name as campaign_name, cv.payout, cv.revenue, cv.status, cv.created_at
       FROM 1ai_conversions cv
       LEFT JOIN 1ai_offers o ON cv.offer_id = o.id
       WHERE cv.created_at >= UNIX_TIMESTAMP(?) AND cv.created_at <= UNIX_TIMESTAMP(?)
       ORDER BY cv.id DESC LIMIT 100`,
      [dateFrom, dateTo + ' 23:59:59']
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Balance & Budget ───────────────────────────────────────────────
router.get('/balance', async (req, res) => {
  try {
    const [[earnings]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "approved"');
    const [[pending]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "pending"');
    const [[paid]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_payments WHERE status = "paid"');
    const [transactions] = await pool.query(
      `SELECT * FROM 1ai_balance_ledger ORDER BY id DESC LIMIT 50`
    );
    res.json({ data: { earnings: earnings.total, pending: pending.total, paid: paid.total, transactions } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/balance/summary', async (req, res) => {
  try {
    const [[earnings]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "approved"');
    const [[pending]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_earnings WHERE status = "pending"');
    const [[paid]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM 1ai_affiliate_payments WHERE status = "paid"');
    res.json({ data: { total_earnings: earnings.total, total_pending: pending.total, total_paid: paid.total, available_balance: earnings.total - paid.total } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Traffic Sources Integrations ───────────────────────────────────
router.get('/traffic-sources/integrations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, platform_type as type, is_active as status, postback_url_template as postback_url FROM 1ai_traffic_sources ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
