const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getPayoutRules, savePayoutRules } = require('../services/payoutService');
const { batchPayout, getPayoutSummary, batchPayoutValidator } = require('../controllers/payoutController');
const pool = require('../db/mysql');

router.use(authenticate);

router.get('/rules', async (req, res) => {
  try {
    const rules = await getPayoutRules(pool, req.user.id);
    res.json({ data: rules || {} });
  } catch (err) {
    console.error('getPayoutRules error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const rules = await savePayoutRules(pool, req.user.id, req.body);
    res.json({ data: rules });
  } catch (err) {
    console.error('savePayoutRules error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Admin batch payout endpoints ─────────────────────────────────────────────
router.post('/batch', requireAdmin, batchPayoutValidator, batchPayout);
router.get('/summary', requireAdmin, getPayoutSummary);

module.exports = router;
