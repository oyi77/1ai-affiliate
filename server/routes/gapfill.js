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
module.exports = router;
