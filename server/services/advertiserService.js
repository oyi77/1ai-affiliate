/**
 * Advertiser business logic service.
 * Creates users + advertiser profiles in transactions, handles Shopee CSV uploads.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const shopeeService = require('./shopeeService');

/**
 * Create a new user (role='advertiser') and corresponding advertiser profile
 * inside a database transaction.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.name]
 * @param {string} [data.company_name]
 * @param {string} [data.website]
 * @param {string} [data.status]
 * @param {string} [data.platform_type]
 * @param {string} [data.commission_type]
 * @param {number} [data.default_commission_rate]
 * @param {string} [data.notes]
 * @returns {Promise<{user_id: number, email: string, role: string}>}
 */
async function createAdvertiserWithUser(pool, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check for duplicate email
    const [existing] = await conn.query(
      'SELECT user_id FROM 1ai_users WHERE user_email = ? LIMIT 1',
      [data.email]
    );
    if (existing.length > 0) {
      throw Object.assign(new Error('Email already registered'), { status: 409 });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const appKey = crypto.randomBytes(16).toString('hex');

    const [userResult] = await conn.query(
      `INSERT INTO 1ai_users
         (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          user_api_key, clickserver_api_key, customer_api_key)
       VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?)`,
      [data.name || data.email.split('@')[0], data.email, hash, appKey, appKey, appKey]
    );
    const userId = userResult.insertId;

    await conn.query(
      `INSERT INTO 1ai_advertisers
         (user_id, company_name, website, status, platform_type, commission_type,
          default_commission_rate, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [
        userId,
        data.company_name || null,
        data.website || null,
        data.status || 'active',
        data.platform_type || null,
        data.commission_type || 'percentage',
        data.default_commission_rate || null,
        data.notes || null,
      ]
    );

    await conn.commit();
    return { user_id: userId, email: data.email, role: 'advertiser' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Update advertiser profile with COALESCE pattern — only non-null fields are updated.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} id — advertiser user_id
 * @param {object} data — fields to update (null/undefined fields are skipped)
 * @returns {Promise<number>} — affected rows
 */
async function updateAdvertiserProfile(pool, id, data) {
  const fields = [];
  const values = [];

  const allowedFields = [
    'company_name', 'website', 'status', 'platform_type',
    'commission_type', 'default_commission_rate', 'notes',
  ];

  for (const key of allowedFields) {
    if (data[key] !== undefined && data[key] !== null) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return 0;

  fields.push('updated_at = UNIX_TIMESTAMP()');
  values.push(id);

  const [result] = await pool.query(
    `UPDATE 1ai_advertisers SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
  return result.affectedRows;
}

/**
 * Process a Shopee CSV upload: parse, map rows, and bulk insert reports.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {number} advertiserId
 * @param {number} userId
 * @param {Buffer} fileBuffer — raw CSV file buffer
 * @param {object} [options]
 * @param {string|null} [options.shopeeAccountId]
 * @param {string|null} [options.shopeeAccountName]
 * @returns {Promise<{format: string, inserted: number, errors: string[]}>}
 */
async function processShopeeUpload(pool, advertiserId, userId, fileBuffer, options = {}) {
  const { format, rows } = shopeeService.parseShopeeCsv(fileBuffer);
  const errors = [];
  const { shopeeAccountId = null, shopeeAccountName = null } = options;

  if (format === 'payout') {
    // Payout format doesn't map to commission rows — return format info only
    return { format, inserted: 0, errors: [] };
  }

  // Map all commission rows
  const mapped = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = shopeeService.mapCommissionRow(rows[i], advertiserId, userId, shopeeAccountId, shopeeAccountName);
      if (row.order_id) {
        mapped.push(row);
      }
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  const inserted = await shopeeService.bulkInsertReports(pool, mapped);
  return { format, inserted, errors };
}

module.exports = { createAdvertiserWithUser, updateAdvertiserProfile, processShopeeUpload };
