const { recordToTreasury } = require('./treasuryClient');

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Process automatic payouts for all users with enabled rules.
 * Scans approved earnings above each user's threshold and creates payout records.
 */
async function processAutoPayouts(pool) {
  const rules = await queryRows(
    'SELECT * FROM 1ai_payout_rules WHERE enabled = 1 AND auto_approve = 1'
  );

  const results = [];

  for (const rule of rules) {
    const eligible = await queryRows(
      `SELECT ae.id AS earning_id, ae.payout_amount, a.user_id, a.id AS affiliate_id
       FROM 1ai_affiliate_earnings ae
       JOIN 1ai_affiliates a ON ae.affiliate_id = a.id
       WHERE a.user_id = ? AND ae.status = 'approved' AND ae.payout_amount >= ?`,
      [rule.user_id, rule.min_amount]
    );

    if (eligible.length === 0) {
      results.push({ user_id: rule.user_id, processed: 0 });
      continue;
    }

    const totalAmount = eligible.reduce((sum, e) => sum + Number(e.payout_amount), 0);
    const now = Math.floor(Date.now() / 1000);

    // Update earnings to 'paid'
    const earningIds = eligible.map(e => e.earning_id);
    await pool.query(
      `UPDATE 1ai_affiliate_earnings SET status = 'paid', paid_at = UNIX_TIMESTAMP() WHERE id IN (${earningIds.map(() => '?').join(',')})`,
      earningIds
    );

    // Deduct from affiliate balance
    await pool.query(
      'UPDATE 1ai_affiliates SET balance = GREATEST(balance - ?, 0), updated_at = ? WHERE user_id = ?',
      [totalAmount, now, rule.user_id]
    );

    // Fire-and-forget: record revenue in Capital Pool (1ai-hub treasury)
    recordToTreasury({
      source: '1ai-affiliate',
      amount_usd: totalAmount,
      direction: 'in',
      note: `Auto-payout: ${eligible.length} earnings for user ${rule.user_id}`,
      workflow: 'wf6_affiliate_payout',
      metadata: {
        user_id: rule.user_id,
        earning_ids: earningIds,
        payment_method: rule.payment_method,
      },
    }).catch((err) => {
      // Non-fatal — payout already processed, treasury is best-effort
      require('../logger').warn({ err }, '[payoutService] Treasury record failed');
    });

    results.push({
      user_id: rule.user_id,
      processed: eligible.length,
      total: totalAmount,
      payment_method: rule.payment_method,
    });
  }

  return results;
}

/**
 * Get payout rules for a user.
 */
async function getPayoutRules(pool, userId) {
  return queryOne('SELECT * FROM 1ai_payout_rules WHERE user_id = ?', [userId]);
}

/**
 * Save (upsert) payout rules for a user.
 */
async function savePayoutRules(pool, userId, data) {
  const existing = await getPayoutRules(pool, userId);
  const now = Math.floor(Date.now() / 1000);

  if (existing) {
    await pool.query(
      `UPDATE 1ai_payout_rules SET
         min_amount = ?, auto_approve = ?, payment_method = ?,
         payment_schedule = ?, enabled = ?, updated_at = ?
       WHERE user_id = ?`,
      [
        data.min_amount ?? existing.min_amount,
        data.auto_approve ?? existing.auto_approve,
        data.payment_method ?? existing.payment_method,
        data.payment_schedule ?? existing.payment_schedule,
        data.enabled ?? existing.enabled,
        now,
        userId,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO 1ai_payout_rules
         (user_id, min_amount, auto_approve, payment_method, payment_schedule, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.min_amount || 50000,
        data.auto_approve ? 1 : 0,
        data.payment_method || 'bank_transfer',
        data.payment_schedule || 'monthly',
        data.enabled !== undefined ? (data.enabled ? 1 : 0) : 1,
        now,
        now,
      ]
    );
  }

  return getPayoutRules(pool, userId);
}

module.exports = { processAutoPayouts, getPayoutRules, savePayoutRules };
