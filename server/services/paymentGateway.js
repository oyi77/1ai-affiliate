'use strict';

/**
 * Multi-Gateway Payment Service
 * Supports: Tripay (ID bank/e-wallet), Midtrans (ID gateway), NowPayments (crypto)
 * 
 * Handles:
 * - Advertiser deposits (pay platform for campaigns)
 * - Affiliate payouts (platform pays affiliates)
 */

const crypto = require('crypto');
const pool = require('../db/mysql');

// ── Gateway Configurations ──────────────────────────────────────

const gateways = {
  tripay: {
    name: 'Tripay',
    icon: '🏦',
    methods: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'BSI', 'DANA', 'OVO', 'GOPAY', 'QRIS'],
    currencies: ['IDR'],
    type: 'fiat',
    get config() {
      return {
        apiKey: process.env.TRIPAY_API_KEY,
        privateKey: process.env.TRIPAY_PRIVATE_KEY,
        merchantCode: process.env.TRIPAY_MERCHANT_CODE,
        endpoint: process.env.TRIPAY_ENDPOINT || 'https://tripay.co.id/api',
      };
    },
    get isConfigured() {
      const c = this.config;
      return !!(c.apiKey && c.privateKey && c.merchantCode);
    },
  },

  midtrans: {
    name: 'Midtrans',
    icon: '💳',
    methods: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'GOPAY', 'OVO', 'DANA', 'QRIS', 'CREDIT_CARD'],
    currencies: ['IDR'],
    type: 'fiat',
    get config() {
      return {
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
        merchantId: process.env.MIDTRANS_MERCHANT_ID,
        isProduction: process.env.MIDTRANS_PRODUCTION === 'true',
        get endpoint() {
          return this.isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
        },
      };
    },
    get isConfigured() {
      const c = this.config;
      return !!(c.serverKey && c.clientKey);
    },
  },

  nowpayments: {
    name: 'NowPayments',
    icon: '₿',
    methods: ['BTC', 'ETH', 'USDT', 'USDC', 'SOL', 'BNB', 'XRP', 'DOGE'],
    currencies: ['USD', 'EUR', 'IDR'],
    type: 'crypto',
    get config() {
      return {
        apiKey: process.env.NOWPAYMENTS_API_KEY,
        ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET,
        endpoint: process.env.NOWPAYMENTS_ENDPOINT || 'https://api.nowpayments.io/v1',
        sandboxEndpoint: 'https://api-sandbox.nowpayments.io/v1',
        isSandbox: process.env.NOWPAYMENTS_SANDBOX === 'true',
        get activeEndpoint() {
          return this.isSandbox ? this.sandboxEndpoint : this.endpoint;
        },
      };
    },
    get isConfigured() {
      return !!this.config.apiKey;
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

// ── Create Payment ──────────────────────────────────────────────

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

  // Create payment with specific gateway
  if (gateway === 'tripay') {
    return await createTripayPayment({ reference, amount, currency, method, userId });
  } else if (gateway === 'midtrans') {
    return await createMidtransPayment({ reference, amount, currency, method, userId });
  } else if (gateway === 'nowpayments') {
    return await createNowPaymentsPayment({ reference, amount, currency, method, userId });
  }
}

// ── Tripay ──────────────────────────────────────────────────────

async function createTripayPayment({ reference, amount, method, userId }) {
  const cfg = gateways.tripay.config;
  const rawSignature = cfg.merchantCode + reference + parseInt(amount);
  const signature = crypto.createHmac('sha256', cfg.privateKey).update(rawSignature).digest('hex');

  const resp = await fetch(`${cfg.endpoint}/transaction/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: method || 'QRIS',
      merchant_ref: reference,
      amount: parseInt(amount),
      customer_name: 'User',
      customer_email: 'user@example.com',
      expired_time: Math.floor(Date.now() / 1000) + 86400,
      signature,
    }),
  });

  const result = await resp.json();
  if (!result.success) throw new Error(result.message || 'Tripay payment failed');

  await pool.query('UPDATE 1ai_payments SET gateway_ref = ? WHERE reference = ?', [result.data.reference, reference]);

  return {
    reference,
    gateway: 'tripay',
    checkout_url: result.data.checkout_url,
    qr_url: result.data.qr_url || null,
    amount: result.data.amount,
    method,
  };
}

// ── Midtrans ────────────────────────────────────────────────────

async function createMidtransPayment({ reference, amount, method, userId }) {
  const cfg = gateways.midtrans.config;
  const auth = Buffer.from(cfg.serverKey + ':').toString('base64');

  const resp = await fetch(`${cfg.endpoint}/charge`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment_type: mapMidtransMethod(method),
      transaction_details: { order_id: reference, gross_amount: parseInt(amount) },
      customer_details: { first_name: 'User' },
    }),
  });

  const result = await resp.json();
  if (result.error_messages) throw new Error(result.error_messages.join(', '));

  await pool.query('UPDATE 1ai_payments SET gateway_ref = ? WHERE reference = ?', [result.transaction_id || reference, reference]);

  return {
    reference,
    gateway: 'midtrans',
    checkout_url: result.redirect_url || result.payment_url || null,
    qr_url: result.qr_code || null,
    amount: parseInt(amount),
    method,
    token: result.token || null,
  };
}

function mapMidtransMethod(method) {
  const map = {
    'BCA': 'bank_transfer', 'BNI': 'bank_transfer', 'BRI': 'bank_transfer',
    'MANDIRI': 'echannel', 'GOPAY': 'gopay', 'OVO': 'ovo', 'DANA': 'dana',
    'QRIS': 'qris', 'CREDIT_CARD': 'credit_card',
  };
  return map[method] || 'bank_transfer';
}

// ── NowPayments ─────────────────────────────────────────────────

async function createNowPaymentsPayment({ reference, amount, currency, method }) {
  const cfg = gateways.nowpayments.config;

  // Get price estimate
  const priceResp = await fetch(`${cfg.activeEndpoint}/estimate`, {
    method: 'GET',
    headers: { 'x-api-key': cfg.apiKey },
  });
  const priceData = await priceResp.json();

  // Create invoice
  const resp = await fetch(`${cfg.activeEndpoint}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': cfg.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: parseFloat(amount),
      price_currency: currency || 'USD',
      pay_currency: method || 'BTC',
      order_id: reference,
      ipn_callback_url: `${process.env.APP_URL || 'https://affiliate.berkahkarya.org'}/api/payment/nowpayments/callback`,
      success_url: `${process.env.APP_URL || 'https://affiliate.berkahkarya.org'}/payment/success`,
      cancel_url: `${process.env.APP_URL || 'https://affiliate.berkahkarya.org'}/payment/cancel`,
    }),
  });

  const result = await resp.json();
  if (result.message && !result.invoice_url) throw new Error(result.message);

  await pool.query('UPDATE 1ai_payments SET gateway_ref = ? WHERE reference = ?', [result.id || reference, reference]);

  return {
    reference,
    gateway: 'nowpayments',
    checkout_url: result.invoice_url,
    amount: parseFloat(amount),
    currency: currency || 'USD',
    pay_currency: method || 'BTC',
    pay_address: result.pay_address || null,
  };
}

// ── Handle Callbacks ────────────────────────────────────────────

async function handleTripayCallback(body, headers) {
  const { reference, status } = body;
  if (status === 'PAID') {
    await pool.query("UPDATE 1ai_payments SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE reference = ?", [reference]);
    await creditUserBalance(reference);
  } else if (status === 'EXPIRED') {
    await pool.query("UPDATE 1ai_payments SET status = 'expired' WHERE reference = ?", [reference]);
  }
  return { success: true };
}

async function handleMidtransCallback(body) {
  const { order_id, transaction_status } = body;
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    await pool.query("UPDATE 1ai_payments SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE reference = ?", [order_id]);
    await creditUserBalance(order_id);
  } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
    await pool.query("UPDATE 1ai_payments SET status = 'expired' WHERE reference = ?", [order_id]);
  }
  return { success: true };
}

async function handleNowPaymentsCallback(body) {
  const { order_id, payment_status } = body;
  if (payment_status === 'finished' || payment_status === 'confirmed') {
    await pool.query("UPDATE 1ai_payments SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE reference = ?", [order_id]);
    await creditUserBalance(order_id);
  } else if (payment_status === 'failed' || payment_status === 'expired') {
    await pool.query("UPDATE 1ai_payments SET status = 'failed' WHERE reference = ?", [order_id]);
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
  handleTripayCallback,
  handleMidtransCallback,
  handleNowPaymentsCallback,
  getPaymentHistory,
  gateways,
};
