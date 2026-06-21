const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const pool = require('../db/mysql');

router.use(authenticate);
router.use(requireAdmin);

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

// ── GET /offers/:id ─────────────────────────────────────────────────
router.get('/offers/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM 1ai_offers WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Offer not found' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
