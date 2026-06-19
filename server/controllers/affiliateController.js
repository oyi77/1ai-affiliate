const { asyncHandler } = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const createAffiliateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * GET /api/admin/affiliates
 * List all affiliates joined with user data.
 */
const getAffiliates = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const rows = await queryRows(
    `SELECT a.*, u.user_email, u.user_name, u.user_date_added
     FROM 1ai_affiliates a
     JOIN 1ai_users u ON a.user_id = u.user_id
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [limit]
  );
  const enriched = rows.map(a => ({
    ...a,
    username: a.user_name || a.user_email,
    joined_at: a.user_date_added,
  }));
  return success(res, { data: enriched });
});

/**
 * GET /api/admin/affiliates/earnings
 * List earnings with role-based filtering.
 * Affiliate sees own earnings; admin sees all.
 */
const getEarnings = asyncHandler(async (req, res) => {
  const { affiliate_id, status } = req.query;
  const role = req.user.role;
  let sql = `SELECT ae.*, a.affiliate_code, u.user_email, u.user_name
             FROM 1ai_affiliate_earnings ae
             JOIN 1ai_affiliates a ON ae.affiliate_id = a.id
             JOIN 1ai_users u ON a.user_id = u.user_id
             WHERE 1=1`;
  const params = [];

  if (role === 'affiliate') {
    sql += ' AND a.user_id = ?';
    params.push(req.user.id);
  } else if (affiliate_id) {
    sql += ' AND ae.affiliate_id = ?';
    params.push(parseInt(affiliate_id));
  }
  if (status) {
    sql += ' AND ae.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY ae.created_at DESC LIMIT 200';
  const rows = await queryRows(sql, params);
  const enriched = rows.map(e => ({
    ...e,
    affiliate_name: e.user_name || e.user_email,
    amount: e.payout_amount || e.amount || 0,
  }));
  return success(res, { data: enriched });
});

/**
 * POST /api/admin/affiliates/earnings/:id/approve
 * Approve a pending earning.
 */
const approveEarning = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return error(res, 'id required', 400);
  const [result] = await pool.query(
    `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
     WHERE id = ? AND status = 'pending'`,
    [req.user.id, id]
  );
  return success(res, { approved: result.affectedRows });
});

/**
 * POST /api/admin/affiliates
 * Create a user account + affiliate profile with random code.
 */
const createAffiliate = asyncHandler(async (req, res) => {
  const data = req.validated || req.body;
  const { name, email } = data;

  const affiliateCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const tempPass = crypto.randomBytes(8).toString('hex');
  const hashedPass = await bcrypt.hash(tempPass, 10);

  await pool.query(
    `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added)
     VALUES (?, ?, ?, 'affiliate', UNIX_TIMESTAMP())`,
    [name.trim(), email.trim(), hashedPass]
  );
  const userRow = await queryOne('SELECT LAST_INSERT_ID() AS id');

  await pool.query(
    `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, balance, created_at, updated_at)
     VALUES (?, ?, 'starter', 0.00, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [userRow.id, affiliateCode]
  );
  const affRow = await queryOne('SELECT LAST_INSERT_ID() AS id');

  return success(res, {
    success: true,
    id: affRow.id,
    user_id: userRow.id,
    affiliate_code: affiliateCode,
    name: name.trim(),
    email: email.trim(),
  });
});

module.exports = {
  getAffiliates,
  getEarnings,
  approveEarning,
  createAffiliate,
};
