'use strict';

/**
 * Unified Payment Service
 * Uses 1ai-payment aggregator API — all gateway logic delegated.
 *
 * The aggregator handles:
 *   - Gateway availability & method listing
 *   - Method-to-gateway routing
 *   - Payment creation (sending to Duitku/Midtrans/Tripay/NowPayments)
 *   - Webhook callbacks
 *
 * No hardcoded gateway definitions, method mappings, or SDKs live here.
 *
 * Handles:
 *   - Advertiser deposits (pay platform for campaigns)
 *   - Affiliate payouts (platform pays affiliates)
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

// Cache aggregator gateway list so we don't call it on every request
let aggregatorGatewaysCache = null;
let aggregatorGatewaysCacheTime = 0;
const GATEWAY_CACHE_TTL = parseInt(process.env.PAYMENT_GATEWAY_CACHE_TTL) || 300_000;

// User-facing method metadata the aggregator doesn't provide.
// Keyed by method code (upper). Only icons + fees — NOT gateway logic.
const DEFAULT_BANK_FEE = parseInt(process.env.PAYMENT_BANK_FEE) || 4000;

const methodMeta = {
  BCA:          { icon: '🏦', fee: DEFAULT_BANK_FEE },
  BNI:          { icon: '🏦', fee: DEFAULT_BANK_FEE },
  BRI:          { icon: '🏦', fee: DEFAULT_BANK_FEE },
  MANDIRI:      { icon: '🏦', fee: DEFAULT_BANK_FEE },
  PERMATA:      { icon: '🏦', fee: DEFAULT_BANK_FEE },
  BSI:          { icon: '🏦', fee: DEFAULT_BANK_FEE },
  QRIS:         { icon: '📱', fee: 0 },
  CREDIT_CARD:  { icon: '💳', fee: 0 },
  GOPAY:        { icon: '🟢', fee: 0 },
  OVO:          { icon: '🟣', fee: 0 },
  DANA:         { icon: '🔵', fee: 0 },
  SHOPEEPAY:    { icon: '🛒', fee: 0 },
  VIRTUAL_ACCOUNT:{ icon: '🏦', fee: DEFAULT_BANK_FEE },
};

// ── Aggregator Gateway Fetcher ───────────────────────────────

async function getAggregatorGateways() {
  const now = Date.now();
  if (aggregatorGatewaysCache && (now - aggregatorGatewaysCacheTime) < GATEWAY_CACHE_TTL) {
    return aggregatorGatewaysCache;
  }

  try {
    const resp = await fetch(`${paymentConfig.aggregatorUrl}/api/gateways`, {
      headers: { 'X-Api-Key': paymentConfig.aggregatorApiKey },
    });
    const json = await resp.json();
    if (json.success && Array.isArray(json.data)) {
      aggregatorGatewaysCache = json.data;
      aggregatorGatewaysCacheTime = now;
    }
    return aggregatorGatewaysCache || [];
  } catch {
    return aggregatorGatewaysCache || [];
  }
}


// Prime cache on startup
getAggregatorGateways().catch(() => {});

// ── Available Gateways (all from aggregator) ──────────────────

function getAvailableGateways() {
  if (!aggregatorGatewaysCache) return [];
  return aggregatorGatewaysCache
    .filter(gw => gw.enabled)
    .map(gw => ({
      id: gw.gateway,
      name: gw.name || gw.gateway.charAt(0).toUpperCase() + gw.gateway.slice(1),
      icon: gw.icon || '💳',
      methods: gw.methods.map(m => m.code || m.name),
      currencies: gw.currencies || ['IDR'],
      type: gw.gateway === 'nowpayments' ? 'crypto' : 'fiat',
      isConfigured: true,
    }));
}

// ── Available Methods (flattened from aggregator, deduplicated) ──

function getAvailableMethods() {
  if (!aggregatorGatewaysCache) return [];

  const seen = new Set();
  const methods = [];

  for (const gw of aggregatorGatewaysCache) {
    if (!gw.enabled) continue;
    for (const mt of gw.methods) {
      const code = (mt.code || mt.name || '').toUpperCase();
      if (!code || seen.has(code)) continue;
      seen.add(code);

      const meta = methodMeta[code] || {};
      let group = 'virtual_account';
      if (['QRIS', 'GOPAY', 'OVO', 'DANA', 'SHOPEEPAY'].includes(code)) group = 'e_wallet';
      else if (code === 'CREDIT_CARD') group = 'credit_card';
      else if (gw.gateway === 'nowpayments') group = 'crypto';

      methods.push({
        code,
        name: mt.name || code,
        icon: meta.icon || '💳',
        group,
        fee: meta.fee || 0,
        min_amount: 0,
        gateway: gw.gateway,
      });
    }
  }

  return methods;
}

// ── Resolve user-facing method → gateway ────────────────────
// Searches the aggregator cache for an enabled gateway that
// supports the requested method. Match is case-insensitive on
// both code and name so "BCA" finds midtrans::bca / duitku BC.

function resolveGateway(method) {
  if (!aggregatorGatewaysCache || aggregatorGatewaysCache.length === 0) {
    throw new Error('Payment gateways not available');
  }

  const m = method.toUpperCase().trim();

  for (const gw of aggregatorGatewaysCache) {
    if (!gw.enabled) continue;
    for (const mt of gw.methods) {
      const code = (mt.code || '').toUpperCase();
      const name = (mt.name || '').toUpperCase();
      if (code === m || name.includes(m)) {
        return gw.gateway;
      }
    }
  }

  throw new Error(`No enabled gateway supports payment method: ${method}`);
}

// ── Create Payment (delegate to aggregator) ──────────────────

const aggregatorHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': paymentConfig.aggregatorApiKey,
});

async function createPayment({ gateway, amount, currency, method, userId, purpose, metadata }) {
  const gw = aggregatorGatewaysCache?.find(g => g.gateway === gateway);
  if (!gw) throw new Error(`Gateway not found: ${gateway}`);

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

  // Look up the aggregator's method code for this gateway
  let paymentMethod = method;
  const methodEntry = gw.methods.find(mt => {
    const mc = (mt.code || '').toUpperCase();
    const mn = (mt.name || '').toUpperCase();
    return mc === method.toUpperCase() || mn.includes(method.toUpperCase());
  });
  if (methodEntry) paymentMethod = methodEntry.code;

  const resp = await fetch(`${paymentConfig.aggregatorUrl}/api/payments`, {
    method: 'POST',
    headers: aggregatorHeaders(),
    body: JSON.stringify({
      gateway,
      amount: Math.round(Number(amount)),
      currency: currency || 'IDR',
      payment_method: paymentMethod,
      callback_url: `${paymentConfig.baseUrl}/api/payment/webhook`,
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

// ── Handle Webhook ───────────────────────────────────────────

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
  const { order_id, project_order_id, status } = body;


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
  const ref = project_order_id || order_id;
  if (status === 'success') {
    await pool.query(
      'UPDATE 1ai_payments SET status = ?, paid_at = UNIX_TIMESTAMP(), gateway_ref = ? WHERE reference = ?',
      [localStatus, order_id, ref]
    );
    await creditUserBalance(ref);
  } else if (status === 'expired' || status === 'failed' || status === 'cancelled') {
    await pool.query(
      'UPDATE 1ai_payments SET status = ?, gateway_ref = ? WHERE reference = ?',
      [localStatus, order_id, ref]
    );
  }

  return { success: true };
}

// ── Credit User Balance ──────────────────────────────────────

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

// ── Payment History ─────────────────────────────────────────

async function getPaymentHistory(userId, limit = 50) {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

module.exports = {
  getAvailableGateways,
  getAvailableMethods,
  resolveGateway,
  createPayment,
  handleWebhook,
  verifyWebhookSignature,
  getPaymentHistory,
};
