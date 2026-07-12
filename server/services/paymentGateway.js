'use strict';

/**
 * Unified Payment Service
 * Uses 1ai-payment aggregator API (http://localhost:3100/api/payments)
 * 
 * Replaces direct gateway SDK calls with HTTP API:
 * - Tripay (ID bank/e-wallet)
 * - Midtrans (ID gateway)
 * - NowPayments (crypto)
 * 
 * Handles:
 * - Advertiser deposits (pay platform for campaigns)
 * - Affiliate payouts (platform pays affiliates)
 */

const crypto = require('crypto');
const pool = require('../db/mysql');

// ── Configuration ────────────────────────────────────────────

const paymentConfig = {
  aggregatorUrl: process.env.PAYMENT_AGGREGATOR_URL || process.env.PAYMENT_API_URL || 'http://localhost:3100',
  aggregatorApiKey: process.env.PAYMENT_AGGREGATOR_API_KEY || process.env.PAYMENT_API_KEY,
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
  baseUrl: process.env.APP_URL || 'http://localhost:3001',
};

const gateways = {
  tripay: {
    name: 'Tripay',
    icon: '🏦',
    methods: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'BSI', 'DANA', 'OVO', 'GOPAY', 'QRIS'],
    currencies: ['IDR'],
    type: 'fiat',
    get isConfigured() {
      return !!(paymentConfig.aggregatorUrl && paymentConfig.aggregatorApiKey);
    },
  },

  midtrans: {
    name: 'Midtrans',
    icon: '💳',
    methods: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'GOPAY', 'OVO', 'DANA', 'QRIS', 'CREDIT_CARD'],
    currencies: ['IDR'],
    type: 'fiat',
    get isConfigured() {
      return !!(paymentConfig.aggregatorUrl && paymentConfig.aggregatorApiKey);
    },
  },

  nowpayments: {
    name: 'NowPayments',
    icon: '₿',
    methods: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB', 'XRP', 'DOGE'],
    currencies: ['USD', 'EUR', 'IDR'],
    type: 'crypto',
    get isConfigured() {
      return !!(paymentConfig.aggregatorUrl && paymentConfig.aggregatorApiKey);
    },
  },
};

// ── Get Available Gateways ──────────────────────────────────────

function getAvailableGateways() {
  return Object.entries(gateways).map(([key, gw]) => ({
    id: key,
    name: gw.name,
    icon: gw.icon,
    methods: gw.methods,
    currencies: gw.currencies,
    type: gw.type,
    available: gw.isConfigured,
  }));
}

// ── Create Payment ──────────────────────────────────────────

async function createPayment({ gateway, amount, currency, method, userId, purpose, metadata }) {
  const gw = gateways[gateway];
  if (!gw) throw new Error(`Unknown gateway: ${gateway}`);
  if (!gw.isConfigured) throw new Error(`${gw.name} is not configured`);

  const reference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  // Record payment in DB
  await pool.query(
    `INSERT INTO 1ai_payments (reference, user_id, gateway, amount, currency, method, purpose, metadata, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
    [reference, userId, gateway, amount, currency || 'IDR', method, purpose || 'deposit', JSON.stringify(metadata || {})]
  ).catch(async () => {
    // Table may not exist, create it
    await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_payments (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      reference VARCHAR(64) NOT NULL UNIQUE,
      user_id INT UNSIGNED NOT NULL,
      gateway VARCHAR(50) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
      method VARCHAR(50),
      purpose VARCHAR(50) DEFAULT 'deposit',
      metadata TEXT,
      status ENUM('pending','paid','expired','failed','refunded') DEFAULT 'pending',
      gateway_ref VARCHAR(255),
      paid_at INT UNSIGNED,
      created_at INT UNSIGNED NOT NULL,
      INDEX idx_user (user_id),
      INDEX idx_status (status),
      INDEX idx_reference (reference)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    return pool.query(
      `INSERT INTO 1ai_payments (reference, user_id, gateway, amount, currency, method, purpose, metadata, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UNIX_TIMESTAMP())`,
      [reference, userId, gateway, amount, currency || 'IDR', method, purpose || 'deposit', JSON.stringify(metadata || {})]
    );
  });

  // Call 1ai-payment API to create payment
  const resp = await fetch(`${paymentConfig.aggregatorUrl}/api/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': paymentConfig.aggregatorApiKey,
    },
    body: JSON.stringify({
      gateway,
      amount: Math.round(Number(amount)),
      currency: currency || 'IDR',
      payment_method: method || 'QRIS',
      callback_url: `${paymentConfig.baseUrl}/api/payment/${gateway}/callback`,
      idempotency_key: reference,
      metadata: {
        project: 'affiliate',
        user_id: userId,
        reference,
      },
    }),
  });

  const result = await resp.json();
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Payment creation failed');
  }

  await pool.query('UPDATE 1ai_payments SET gateway_ref = ? WHERE reference = ?', [
    result.data.id,
    reference,
  ]);

  return {
    reference,
    gateway,
    checkout_url: result.data.payment_url || result.data.checkout_url || null,
    qr_url: result.data.qr_url || null,
    amount: result.data.amount || amount,
    method: result.data.payment_method || method,
  };
}

// ── Handle Webhook ──────────────────────────────────────────

async function verifyWebhookSignature(body, signature) {
  if (!paymentConfig.webhookSecret) {
    throw new Error('Webhook secret not configured');
  }

  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha256', paymentConfig.webhookSecret)
    .update(bodyStr)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }
}

async function handleWebhook(body, signature) {
  // Verify 1ai-payment signature
  await verifyWebhookSignature(body, signature);

  const { order_id, status, gateway, amount, currency, payment_method, paid_at, metadata } = body;

  // Map normalized status to local status
  const statusMap = {
    success: 'paid',
    pending: 'pending',
    expired: 'expired',
    failed: 'failed',
    cancelled: 'expired',
  };
  const localStatus = statusMap[status] || 'pending';

  // Update payment record
  if (status === 'success') {
    await pool.query(
      'UPDATE 1ai_payments SET status = ?, paid_at = UNIX_TIMESTAMP(), gateway_ref = ? WHERE reference = ?',
      [localStatus, order_id, order_id]
    );
    await creditUserBalance(order_id);
  } else if (status === 'expired' || status === 'failed' || status === 'cancelled') {
    await pool.query(
      'UPDATE 1ai_payments SET status = ?, gateway_ref = ? WHERE reference = ?',
      [localStatus, order_id, order_id]
    );
  }

  return { success: true };
}

// ── Credit User Balance ─────────────────────────────────────────

async function creditUserBalance(reference) {
  const [[payment]] = await pool.query('SELECT * FROM 1ai_payments WHERE reference = ?', [reference]);
  if (!payment || payment.status !== 'paid') return;

  // Credit advertiser balance (for deposits)
  if (payment.purpose === 'deposit') {
    const [[adv]] = await pool.query('SELECT id FROM 1ai_advertisers WHERE user_id = ?', [payment.user_id]);
    if (adv) {
      // Add to advertiser's credit balance
      await pool.query(
        `UPDATE 1ai_advertisers SET notes = CONCAT(COALESCE(notes, ''), '\\nDeposit: ', ?, ' ', ?, ' via ', ?) WHERE id = ?`,
        [payment.amount, payment.currency, payment.gateway, adv.id]
      );
    }
  }

  // Record in balance ledger
  await pool.query(
    'INSERT INTO 1ai_balance_ledger (user_id, amount, type, note, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
    [payment.user_id, payment.amount, 'deposit', `Payment via ${payment.gateway}: ${payment.reference}`]
  );
}

// ── Payment History ─────────────────────────────────────────────

async function getPaymentHistory(userId, limit = 50) {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

module.exports = {
  getAvailableGateways,
  createPayment,
  handleWebhook,
  verifyWebhookSignature,
  getPaymentHistory,
  gateways,
};
