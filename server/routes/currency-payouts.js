const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const svc = require('../services/currencyPayoutService');

// GET /api/currency-payouts/preferences — get own prefs
router.get('/preferences', authenticate, asyncHandler(async (req, res) => {
  const prefs = await svc.getPreferences(req.user.id);
  res.json({ data: prefs });
}));

// PUT /api/currency-payouts/preferences — upsert own prefs
router.put('/preferences', authenticate, asyncHandler(async (req, res) => {
  const { preferred_currency, auto_convert, rounding_mode } = req.body;
  if (!preferred_currency) {
    return res.status(400).json({ error: 'preferred_currency required' });
  }
  if (auto_convert !== undefined && ![0, 1].includes(auto_convert)) {
    return res.status(400).json({ error: 'auto_convert must be 0 or 1' });
  }
  if (rounding_mode && !['round', 'ceil', 'floor'].includes(rounding_mode)) {
    return res.status(400).json({ error: 'rounding_mode must be round, ceil, or floor' });
  }
  const id = await svc.upsertPreferences(
    req.user.id,
    preferred_currency,
    auto_convert !== undefined ? auto_convert : 1,
    rounding_mode || 'round'
  );
  res.json({ data: { id } });
}));

// GET /api/currency-payouts/rates — exchange rates
router.get('/rates', authenticate, asyncHandler(async (req, res) => {
  const rates = svc.getExchangeRates();
  res.json({ data: rates });
}));

// POST /api/currency-payouts/convert — convert amount
router.post('/convert', authenticate, asyncHandler(async (req, res) => {
  const { amount, from, to, rounding_mode } = req.body;
  if (amount === undefined || !from || !to) {
    return res.status(400).json({ error: 'amount, from, and to are required' });
  }
  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ error: 'amount must be a non-negative number' });
  }
  try {
    const result = svc.convertAmount(amount, from.toUpperCase(), to.toUpperCase(), rounding_mode);
    res.json({ data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}));

// GET /api/currency-payouts/supported — supported currencies
router.get('/supported', authenticate, asyncHandler(async (req, res) => {
  const currencies = svc.getSupportedCurrencies();
  res.json({ data: currencies });
}));

module.exports = router;
