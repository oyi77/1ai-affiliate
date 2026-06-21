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

module.exports = router;
