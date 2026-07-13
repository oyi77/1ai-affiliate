'use strict';

/**
 * Payment & Payout API Routes
 * 
 * Advertiser: deposit funds via Tripay/Midtrans/NowPayments
 * Affiliate: configure payout methods, request payouts
 * Admin: view all payments, process payouts
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const paymentGateway = require('../services/paymentGateway');
const payoutMethods = require('../services/payoutMethods');


// ── Payment Gateways ────────────────────────────────────────────

/**
 * List available payment methods
 */
router.get('/gateways', authenticate, (req, res) => {
  res.json({ data: paymentGateway.getAvailableMethods() });
});

/**
 * POST /api/payment/create
 * Create a payment transaction
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { gateway, amount, currency, method } = req.body;
    if (!gateway || !amount) return res.status(400).json({ error: 'gateway and amount required' });

    const result = await paymentGateway.createPayment({
      gateway,
      amount,
      currency,
      method,
      userId: req.user.id,
      purpose: req.body.purpose || 'deposit',
      metadata: req.body.metadata || {},
    });

    res.json({ data: result });
  } catch (err) {
    console.error('Payment create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/payment/history
 * Get payment history for current user
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await paymentGateway.getPaymentHistory(req.user.id);
    res.json({ data: payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// ── Payment Webhook (unified for all gateways) ──────────────────

/**
 * POST /api/payment/webhook
 * Unified webhook for 1ai-payment aggregator
 * Signature verified by X-1ai-Payment-Signature header
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.get('X-1ai-Payment-Signature');
    if (!signature) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    const result = await paymentGateway.handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    console.error('Payment webhook error:', err.message);
    res.status(401).json({ error: err.message });
  }
});

// ── Legacy Gateway Callbacks (deprecated — forward to unified webhook) ──

/**
 * POST /api/payment/tripay/callback
 * Legacy Tripay callback — deprecated, use /webhook instead
 */
router.post('/tripay/callback', async (req, res) => {
  try {
    console.warn('Deprecated endpoint /api/payment/tripay/callback — use /webhook');
    res.json({ success: true });
  } catch (err) {
    console.error('Tripay callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payment/midtrans/callback
 * Legacy Midtrans callback — deprecated, use /webhook instead
 */
router.post('/midtrans/callback', async (req, res) => {
  try {
    console.warn('Deprecated endpoint /api/payment/midtrans/callback — use /webhook');
    res.json({ success: true });
  } catch (err) {
    console.error('Midtrans callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/payment/nowpayments/callback
 * Legacy NowPayments callback — deprecated, use /webhook instead
 */
router.post('/nowpayments/callback', async (req, res) => {
  try {
    console.warn('Deprecated endpoint /api/payment/nowpayments/callback — use /webhook');
    res.json({ success: true });
  } catch (err) {
    console.error('NowPayments callback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Affiliate Payout Methods ────────────────────────────────────

/**
 * GET /api/payment/payout-methods
 * List available payout methods
 */
router.get('/payout-methods', (req, res) => {
  res.json({ data: payoutMethods.getAvailableMethods() });
});

/**
 * GET /api/payment/my-payout-methods
 * Get user's configured payout methods
 */
router.get('/my-payout-methods', async (req, res) => {
  try {
    const methods = await payoutMethods.getPayoutMethods(req.user.id);
    res.json({ data: methods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payout methods' });
  }
});

/**
 * POST /api/payment/my-payout-methods
 * Save a payout method
 */
router.post('/my-payout-methods', async (req, res) => {
  try {
    const { method_id, details, is_default } = req.body;
    if (!method_id || !details) return res.status(400).json({ error: 'method_id and details required' });

    const result = await payoutMethods.savePayoutMethod(req.user.id, { method_id, details, is_default });
    res.json({ data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/payment/my-payout-methods/:id
 * Delete a payout method
 */
router.delete('/my-payout-methods/:id', async (req, res) => {
  try {
    const result = await payoutMethods.deletePayoutMethod(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete payout method' });
  }
});

module.exports = router;
