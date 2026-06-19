const pool = require('../db/mysql');

/**
 * Affiliate dashboard controller — self-service data for logged-in affiliates.
 */

async function queryRows(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function queryOne(sql, params = []) {
  const rows = await queryRows(sql, params);
  return rows[0] || null;
}

/**
 * Get aggregate stats for the authenticated affiliate.
 */
async function getMyStats(req, res) {
  try {
    const userId = req.user.id;

    // Get affiliate profile
    const affiliate = await queryOne(
      'SELECT id, balance, tier FROM 1ai_affiliates WHERE user_id = ?',
      [userId]
    );
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate profile not found' });
    }

    // Total clicks (from smartlinks owned by this user)
    const clickStats = await queryOne(
      'SELECT COALESCE(SUM(click_count), 0) AS total_clicks FROM 1ai_smartlinks WHERE user_id = ?',
      [userId]
    );

    // Earnings breakdown
    const earnings = await queryOne(
      `SELECT
         COUNT(*) AS total_conversions,
         COALESCE(SUM(payout_amount), 0) AS total_earnings,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN payout_amount ELSE 0 END), 0) AS pending,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN payout_amount ELSE 0 END), 0) AS approved,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN payout_amount ELSE 0 END), 0) AS paid
       FROM 1ai_affiliate_earnings
       WHERE affiliate_id = ?`,
      [affiliate.id]
    );

    // This month earnings
    const monthStart = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
    const thisMonth = await queryOne(
      `SELECT COALESCE(SUM(payout_amount), 0) AS amount
       FROM 1ai_affiliate_earnings
       WHERE affiliate_id = ? AND created_at >= ?`,
      [affiliate.id, monthStart]
    );

    res.json({
      data: {
        total_clicks: Number(clickStats?.total_clicks || 0),
        total_conversions: Number(earnings?.total_conversions || 0),
        total_earnings: Number(earnings?.total_earnings || 0),
        pending: Number(earnings?.pending || 0),
        approved: Number(earnings?.approved || 0),
        paid: Number(earnings?.paid || 0),
        balance: Number(affiliate.balance),
        this_month: Number(thisMonth?.amount || 0),
        tier: affiliate.tier,
      },
    });
  } catch (err) {
    console.error('getMyStats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get smartlinks for the authenticated affiliate.
 */
async function getMyLinks(req, res) {
  try {
    const userId = req.user.id;
    const rows = await queryRows(
      `SELECT id, slug, hash, status, default_url, click_count, created_at
       FROM 1ai_smartlinks
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getMyLinks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get paginated earnings for the authenticated affiliate.
 */
async function getMyEarnings(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const affiliate = await queryOne(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [userId]
    );
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate profile not found' });
    }

    const countRow = await queryOne(
      'SELECT COUNT(*) AS total FROM 1ai_affiliate_earnings WHERE affiliate_id = ?',
      [affiliate.id]
    );
    const total = Number(countRow?.total || 0);

    const rows = await queryRows(
      `SELECT id, payout_amount, status, created_at, approved_at, paid_at
       FROM 1ai_affiliate_earnings
       WHERE affiliate_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [affiliate.id, limit, offset]
    );

    res.json({
      data: rows,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('getMyEarnings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getMyStats, getMyLinks, getMyEarnings };
