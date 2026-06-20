const C = require('../utils/constants');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { queryRows, queryUpdate } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

const batchPayoutSchema = z.object({
  affiliate_ids: z.array(z.number().int().positive()).min(1, 'At least one affiliate_id required'),
  status: z.enum(['approved', 'paid']),
});

/**
 * POST /api/admin/payouts/batch
 * Bulk-update earnings status for a list of affiliates.
 * - 'approved' sets status + approved_by + approved_at for pending rows.
 * - 'paid' sets status + paid_at for approved rows.
 */
const batchPayout = asyncHandler(async (req, res) => {
  const { affiliate_ids, status } = req.validated;
  const now = Math.floor(Date.now() / 1000);

  let affectedRows = 0;

  if (status === 'approved') {
    const ids = affiliate_ids.map(() => '?').join(',');
    affectedRows = await queryUpdate(
      `UPDATE 1ai_affiliate_earnings
       SET status = 'approved',
           approved_by = ?,
           approved_at = ?
       WHERE affiliate_id IN (${ids})
         AND status = 'pending'`,
      [req.user.user_id, now, ...affiliate_ids],
    );
  } else {
    const ids = affiliate_ids.map(() => '?').join(',');
    affectedRows = await queryUpdate(
      `UPDATE 1ai_affiliate_earnings
       SET status = 'paid',
           paid_at = ?
       WHERE affiliate_id IN (${ids})
         AND status = 'approved'`,
      [now, ...affiliate_ids],
    );
  }

  return success(res, { affected: affectedRows, status });
});

/**
 * GET /api/admin/payouts/summary
 * Returns per-affiliate breakdown of pending / approved / paid totals.
 */
const getPayoutSummary = asyncHandler(async (_req, res) => {
  const rows = await queryRows(
    `SELECT
       affiliate_id,
       SUM(CASE WHEN status = 'pending'  THEN payout_amount ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'approved' THEN payout_amount ELSE 0 END) AS approved,
       SUM(CASE WHEN status = 'paid'     THEN payout_amount ELSE 0 END) AS paid,
       SUM(payout_amount) AS total
     FROM 1ai_affiliate_earnings
     GROUP BY affiliate_id
     ORDER BY affiliate_id`,
  );

  const data = rows.map(r => ({
    affiliate_id: r.affiliate_id,
    pending: Number(r.pending),
    approved: Number(r.approved),
    paid: Number(r.paid),
    total: Number(r.total),
  }));

  return success(res, { data });
});

const batchPayoutValidator = validate(batchPayoutSchema);

module.exports = { batchPayout, getPayoutSummary, batchPayoutValidator };
