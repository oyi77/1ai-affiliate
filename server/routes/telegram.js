const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTelegramConfig, saveTelegramConfig, testConnection } = require('../services/telegramService');
const pool = require('../db/mysql');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const config = await getTelegramConfig(pool, req.user.id);
    res.json({ data: config || {} });
  } catch (err) {
    console.error('getTelegramConfig error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const config = await saveTelegramConfig(pool, req.user.id, req.body);
    res.json({ data: config });
  } catch (err) {
    console.error('saveTelegramConfig error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/test', async (req, res) => {
  try {
    const config = await getTelegramConfig(pool, req.user.id);
    if (!config || !config.bot_token || !config.chat_id) {
      return res.status(400).json({ error: 'Bot token and chat ID are required' });
    }
    const result = await testConnection(config.bot_token, config.chat_id);
    res.json({ success: true, result });
  } catch (err) {
    console.error('testTelegram error:', err);
    res.status(400).json({ error: err.message || 'Failed to send test message' });
  }
});

module.exports = router;
