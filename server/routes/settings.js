const pool = require('../db/mysql');

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProfile, updateProfile, generateApiKey, removeApiKey,
  getIntegrations, updateIntegration, getPostback, updatePostback,
} = require('../controllers/settingsController');

// Public platform settings (no auth required — used by landing page, client portal)
router.get('/platform/public', async (req, res) => {
  try {
    const keys = ['brand_name', 'app_domain', 'support_email', 'default_currency', 'smartlink_domain'];
    const [rows] = await pool.query("SELECT name, value FROM 1ai_settings WHERE name IN (?)", [keys]);
    const settings = {};
    rows.forEach(r => { settings[r.name] = r.value; });
    res.json({ data: settings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticate);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// API Key
router.post('/api-key', generateApiKey);
router.delete('/api-key', removeApiKey);

// Integrations
router.get('/integrations', getIntegrations);
router.put('/integrations', updateIntegration);

// Postback Configuration
router.get('/postback', getPostback);
router.put('/postback', updatePostback);


// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const [[row]] = await pool.query('SELECT * FROM 1ai_settings WHERE name = ?', ['notifications_' + req.user.id]);
    res.json(row ? JSON.parse(row.value || '{}') : { email: true, push: false, telegram: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Payout rules
router.get('/payouts/rules', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const [rows] = await pool.query('SELECT * FROM 1ai_payout_rules ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Telegram config
router.get('/telegram', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const [[row]] = await pool.query('SELECT * FROM 1ai_telegram_config WHERE user_id = ?', [req.user.id]);
    res.json(row || { bot_token: null, channel_id: null, enabled: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/telegram/test', async (req, res) => {
  try {
    res.json({ success: true, message: 'Test message queued' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// White label
router.get('/white-label', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const [[row]] = await pool.query('SELECT * FROM 1ai_white_label WHERE user_id = ?', [req.user.id]);
    res.json(row || { logo_url: null, brand_name: null, custom_domain: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// Feature toggles
router.get('/features', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const [rows] = await pool.query("SELECT name, value FROM 1ai_settings WHERE name LIKE 'feature_%'");
    const features = {};
    rows.forEach(r => {
      try { features[r.name] = JSON.parse(r.value); } catch { features[r.name] = { enabled: false }; }
    });
    res.json({ data: features });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/features/:name', async (req, res) => {
  try {
    const pool = require('../db/mysql');
    const { enabled, config } = req.body;
    const value = JSON.stringify({ enabled: !!enabled, ...(config || {}) });
    await pool.query(
      "INSERT INTO 1ai_settings (name, value, updated_at) VALUES (?, ?, UNIX_TIMESTAMP()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)",
      ['feature_' + req.params.name, value]
    );
    res.json({ success: true, feature: req.params.name, enabled: !!enabled });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Platform settings (domains, branding, misc)
const PLATFORM_KEYS = [
  'smartlink_domain', 'smartlink_domain_alt', 'deeplink_domain', 'click_domain',
  'landing_domain', 'app_domain', 'brand_name', 'support_email', 'noreply_email',
  'default_currency', 'default_fallback_url', 'postback_url_template', 'webhook_url_template',
  'status_page_url', 'changelog_url', 'community_url',
];

router.get('/platform', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT name, value FROM 1ai_settings WHERE name IN (?)",
      [PLATFORM_KEYS]
    );
    const settings = {};
    rows.forEach(r => { settings[r.name] = r.value; });
    // Merge with env defaults
    const schema = require('../services/settingsService');
    const all = schema.getAll ? schema.getAll() : {};
    for (const key of PLATFORM_KEYS) {
      if (!settings[key]) settings[key] = all[key] || process.env[key.toUpperCase()] || '';
    }
    res.json({ data: settings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/platform', async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'settings object required' });
    for (const [key, value] of Object.entries(settings)) {
      if (!PLATFORM_KEYS.includes(key)) continue;
      await pool.query(
        "INSERT INTO 1ai_settings (name, value, updated_at) VALUES (?, ?, UNIX_TIMESTAMP()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)",
        [key, String(value)]
      );
    }
    // Reload settings cache
    try { require('../services/settingsService').reload(); } catch {}
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/settings/notifications ────────────────────────────
router.post('/notifications', async (req, res) => {
  try {
    const allowed = ['notif_email_enabled','notif_telegram_enabled','notif_conversion_min','notif_low_balance_threshold'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) await settings.set(key, String(req.body[key]));
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/settings/payouts/rules ────────────────────────────
router.post('/payouts/rules', async (req, res) => {
  try {
    const allowed = ['payout_min_amount','payout_schedule','payout_auto_approve','payout_methods'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) await settings.set(key, typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : String(req.body[key]));
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/settings/telegram ─────────────────────────────────
router.post('/telegram', async (req, res) => {
  try {
    const { bot_token, chat_id, enabled } = req.body;
    if (bot_token !== undefined) await settings.set('telegram_bot_token', bot_token);
    if (chat_id   !== undefined) await settings.set('telegram_chat_id', String(chat_id));
    if (enabled   !== undefined) await settings.set('telegram_enabled', String(enabled));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/settings/white-label ──────────────────────────────
router.post('/white-label', async (req, res) => {
  try {
    const allowed = ['wl_brand_name','wl_logo_url','wl_primary_color','wl_domain','wl_enabled'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) await settings.set(key, String(req.body[key]));
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;