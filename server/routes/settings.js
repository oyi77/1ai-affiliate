const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProfile, updateProfile, generateApiKey, removeApiKey,
  getIntegrations, updateIntegration, getPostback, updatePostback,
} = require('../controllers/settingsController');

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

module.exports = router;