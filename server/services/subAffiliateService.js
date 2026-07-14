const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Create a sub-affiliate relationship.
 * @param {number} parentId - parent affiliate id
 * @param {number} subId - sub affiliate id
 * @param {number} commissionRate - percentage shared to sub-affiliate
 * @returns {Promise<number>} insertId
 */
async function createRelationship(parentId, subId, commissionRate) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_sub_affiliates
     (parent_affiliate_id, sub_affiliate_id, commission_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [parentId, subId, commissionRate, now, now]
  );
}

/**
 * List sub-affiliates (children) of a parent affiliate.
 * @param {number} affiliateId - parent affiliate id
 * @returns {Promise<Array>}
 */
async function getSubAffiliates(affiliateId) {
  return queryRows(
    `SELECT sa.*, a.affiliate_code, u.user_email, u.user_name
     FROM 1ai_sub_affiliates sa
     JOIN 1ai_affiliates a ON sa.sub_affiliate_id = a.id
     JOIN 1ai_users u ON a.user_id = u.user_id
     WHERE sa.parent_affiliate_id = ?
     ORDER BY sa.created_at DESC`,
    [affiliateId]
  );
}

/**
 * List parent affiliates of a sub-affiliate.
 * @param {number} affiliateId - sub affiliate id
 * @returns {Promise<Array>}
 */
async function getParentAffiliates(affiliateId) {
  return queryRows(
    `SELECT sa.*, a.affiliate_code, u.user_email, u.user_name
     FROM 1ai_sub_affiliates sa
     JOIN 1ai_affiliates a ON sa.parent_affiliate_id = a.id
     JOIN 1ai_users u ON a.user_id = u.user_id
     WHERE sa.sub_affiliate_id = ?
     ORDER BY sa.created_at DESC`,
    [affiliateId]
  );
}

/**
 * Distribute commission from a parent earning to all active sub-affiliates.
 * Each sub gets commission_rate % of the gross amount.
 * @param {number} earningId - parent 1ai_affiliate_earnings.id
 * @param {number} parentId - parent affiliate id
 * @param {number} grossAmount - original commission earned
 * @returns {Promise<Array<{id: number, sub_affiliate_id: number, commission_amount: number}>>}
 */
async function distributeCommission(earningId, parentId, grossAmount) {
  const subs = await queryRows(
    `SELECT id, sub_affiliate_id, commission_rate
     FROM 1ai_sub_affiliates
     WHERE parent_affiliate_id = ? AND status = 'active'`,
    [parentId]
  );

  if (subs.length === 0) return [];

  const now = Math.floor(Date.now() / 1000);
  const results = [];

  for (const sub of subs) {
    const rate = Number(sub.commission_rate);
    const commissionAmount = (Number(grossAmount) * rate) / 100;
    const parentNet = Number(grossAmount) - commissionAmount;

    const insertId = await queryInsert(
      `INSERT INTO 1ai_sub_affiliate_earnings
       (earning_id, parent_affiliate_id, sub_affiliate_id, gross_amount, commission_amount, parent_net_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [earningId, parentId, sub.sub_affiliate_id, grossAmount, commissionAmount, parentNet, now]
    );

    results.push({ id: insertId, sub_affiliate_id: sub.sub_affiliate_id, commission_amount: commissionAmount });
  }

  return results;
}

/**
 * Update commission rate for a sub-affiliate relationship.
 * @param {number} id - 1ai_sub_affiliates.id
 * @param {number} rate - new commission rate
 * @returns {Promise<number>} affected rows
 */
async function updateCommissionRate(id, rate) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_sub_affiliates SET commission_rate = ?, updated_at = ? WHERE id = ?',
    [rate, now, id]
  );
}

/**
 * Get paginated earnings for a sub-affiliate relationship.
 * @param {number} subAffiliateId - id from 1ai_sub_affiliates or sub_affiliate_id
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{rows: Array, total: number, page: number, limit: number}>}
 */
async function getEarnings(subAffiliateId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const totalRow = await queryOne(
    'SELECT COUNT(*) AS count FROM 1ai_sub_affiliate_earnings WHERE sub_affiliate_id = ?',
    [subAffiliateId]
  );
  const total = totalRow ? totalRow.count : 0;

  const rows = await queryRows(
    `SELECT sse.*, ae.payout_amount, ae.status AS earning_status
     FROM 1ai_sub_affiliate_earnings sse
     LEFT JOIN 1ai_affiliate_earnings ae ON sse.earning_id = ae.id
     WHERE sse.sub_affiliate_id = ?
     ORDER BY sse.created_at DESC
     LIMIT ? OFFSET ?`,
    [subAffiliateId, limit, offset]
  );

  return { rows, total, page, limit };
}

module.exports = {
  createRelationship,
  getSubAffiliates,
  getParentAffiliates,
  distributeCommission,
  updateCommissionRate,
  getEarnings,
};
