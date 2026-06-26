'use strict';

/**
 * Affiliate Payout Methods Service
 * Allows affiliates to configure how they receive payouts.
 * 
 * Supported methods:
 * - Bank Transfer (Indonesian banks)
 * - PayPal
 * - Crypto Wallet (BTC, ETH, USDT, USDC)
 * - Tripay Payout
 */

const pool = require('../db/mysql');

// ── Available Payout Methods ────────────────────────────────────

const PAYOUT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    currencies: ['IDR'],
    fields: [
      { key: 'bank_name', label: 'Bank Name', type: 'select', options: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'BSI', 'CIMB', 'Danamon', 'Permata', 'Other'], required: true },
      { key: 'account_number', label: 'Account Number', type: 'text', required: true },
      { key: 'account_name', label: 'Account Holder Name', type: 'text', required: true },
    ],
    minPayout: 50000,
    currency: 'IDR',
    processingDays: '1-2',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    currencies: ['USD', 'EUR'],
    fields: [
      { key: 'email', label: 'PayPal Email', type: 'email', required: true },
    ],
    minPayout: 50,
    currency: 'USD',
    processingDays: '1-3',
  },
  {
    id: 'crypto_btc',
    name: 'Bitcoin (BTC)',
    icon: '₿',
    currencies: ['BTC'],
    fields: [
      { key: 'wallet_address', label: 'BTC Wallet Address', type: 'text', required: true },
      { key: 'network', label: 'Network', type: 'select', options: ['Bitcoin', 'Lightning'], required: true },
    ],
    minPayout: 0.001,
    currency: 'BTC',
    processingDays: '0-1',
  },
  {
    id: 'crypto_eth',
    name: 'Ethereum (ETH)',
    icon: 'Ξ',
    currencies: ['ETH', 'USDT', 'USDC'],
    fields: [
      { key: 'wallet_address', label: 'Wallet Address', type: 'text', required: true },
      { key: 'network', label: 'Network', type: 'select', options: ['Ethereum (ERC-20)', 'Polygon', 'Arbitrum', 'Base'], required: true },
    ],
    minPayout: 0.01,
    currency: 'ETH',
    processingDays: '0-1',
  },
  {
    id: 'crypto_usdt',
    name: 'USDT (Tether)',
    icon: '₮',
    currencies: ['USDT'],
    fields: [
      { key: 'wallet_address', label: 'USDT Wallet Address', type: 'text', required: true },
      { key: 'network', label: 'Network', type: 'select', options: ['TRC-20 (Tron)', 'ERC-20 (Ethereum)', 'BEP-20 (BSC)', 'Polygon'], required: true },
    ],
    minPayout: 10,
    currency: 'USDT',
    processingDays: '0-1',
  },
  {
    id: 'tripay',
    name: 'Tripay Payout',
    icon: '🇮🇩',
    currencies: ['IDR'],
    fields: [
      { key: 'bank_name', label: 'Bank/E-Wallet', type: 'select', options: ['BCA', 'BNI', 'BRI', 'MANDIRI', 'DANA', 'OVO', 'GOPAY'], required: true },
      { key: 'account_number', label: 'Account Number / Phone', type: 'text', required: true },
      { key: 'account_name', label: 'Account Holder Name', type: 'text', required: true },
    ],
    minPayout: 10000,
    currency: 'IDR',
    processingDays: 'instant',
  },
];

// ── Get Available Methods ───────────────────────────────────────

function getAvailableMethods() {
  return PAYOUT_METHODS;
}

// ── Save Payout Method ──────────────────────────────────────────

async function savePayoutMethod(userId, { method_id, details, is_default }) {
  const method = PAYOUT_METHODS.find(m => m.id === method_id);
  if (!method) throw new Error(`Unknown payout method: ${method_id}`);

  // Validate required fields
  for (const field of method.fields) {
    if (field.required && !details[field.key]) {
      throw new Error(`${field.label} is required`);
    }
  }

  // Ensure table exists
  await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_affiliate_payout_methods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    method_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    is_default TINYINT(1) DEFAULT 0,
    verified TINYINT(1) DEFAULT 0,
    created_at INT UNSIGNED NOT NULL,
    updated_at INT UNSIGNED NOT NULL,
    INDEX idx_user (user_id),
    UNIQUE KEY uk_user_method (user_id, method_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // Check if method already exists
  const [existingRows] = await pool.query(
    'SELECT id FROM 1ai_affiliate_payout_methods WHERE user_id = ? AND method_id = ?',
    [userId, method_id]
  );
  const existing = existingRows[0] || null;

  if (existing) {
    await pool.query(
      'UPDATE 1ai_affiliate_payout_methods SET details = ?, is_default = ?, updated_at = UNIX_TIMESTAMP() WHERE id = ?',
      [JSON.stringify(details), is_default ? 1 : 0, existing.id]
    );
    return { id: existing.id, method_id, updated: true };
  }

  // If setting as default, unset other defaults
  if (is_default) {
    await pool.query('UPDATE 1ai_affiliate_payout_methods SET is_default = 0 WHERE user_id = ?', [userId]);
  }

  const [result] = await pool.query(
    `INSERT INTO 1ai_affiliate_payout_methods (user_id, method_id, details, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [userId, method_id, JSON.stringify(details), is_default ? 1 : 0]
  );

  return { id: result.insertId, method_id, created: true };
}

// ── Get User Payout Methods ─────────────────────────────────────

async function getPayoutMethods(userId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM 1ai_affiliate_payout_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details,
    }));
  } catch {
    return [];
  }
}

// ── Delete Payout Method ────────────────────────────────────────

async function deletePayoutMethod(userId, methodId) {
  const [result] = await pool.query(
    'DELETE FROM 1ai_affiliate_payout_methods WHERE id = ? AND user_id = ?',
    [methodId, userId]
  );
  return { deleted: result.affectedRows > 0 };
}

// ── Get Default Payout Method ───────────────────────────────────

async function getDefaultPayoutMethod(userId) {
  const [[row]] = await pool.query(
    'SELECT * FROM 1ai_affiliate_payout_methods WHERE user_id = ? AND is_default = 1',
    [userId]
  ).catch(() => [null]);
  if (row) {
    row.details = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
  }
  return row || null;
}

module.exports = {
  getAvailableMethods,
  savePayoutMethod,
  getPayoutMethods,
  deletePayoutMethod,
  getDefaultPayoutMethod,
  PAYOUT_METHODS,
};
