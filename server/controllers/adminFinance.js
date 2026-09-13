'use strict';
/**
 * Earnings / stats / commissions / payments / margin handlers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');
const { queryRows, queryOne, toNumber, startExpression } = require('./adminShared');

async function getEarnings(req, res) {
  try {
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
    if (status) { sql += ' AND ae.status = ?'; params.push(status); }

    sql += ' ORDER BY ae.created_at DESC LIMIT 200';
    const [rows] = await pool.query(sql, params);
    const enriched = rows.map(e => ({
      ...e,
      affiliate_name: e.user_name || e.user_email,
      amount: e.payout_amount || e.amount || 0,
    }));
    res.json({ data: enriched });
  } catch (err) {
    console.error('getEarnings error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function approveEarning(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'id required' });
    const [result] = await pool.query(
      `UPDATE 1ai_affiliate_earnings SET status = 'approved', approved_by = ?, approved_at = UNIX_TIMESTAMP()
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, id]
    );
    res.json({ approved: result.affectedRows });
  } catch (err) {
    console.error('approveEarning error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getStats(req, res) {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    // Role-filtered queries
    if (role === 'affiliate') {
      // Affiliate sees only their own stats
      const [affRows] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [userId]);
      if (!affRows.length) return res.json({ clicks24h: 0, total_clicks: 0, unique_ips: 0, attributed_conversions: 0, revenueMtd: 0, revenue_mtd: 0, pendingPayout: 0, pending_payout: 0, pendingCount: 0, pending_count: 0, totalPaid: 0, total_paid: 0, avg_epc: 0, avg_ctr: 0, clickChange: 0, revenueGrowth: 0, revenue_growth: 0 });
      const affId = affRows[0].id;

      const [linkStats] = await pool.query(
        'SELECT COALESCE(SUM(clicks),0) AS total_clicks, COALESCE(SUM(conversions),0) AS total_conversions FROM 1ai_affiliate_links WHERE affiliate_id = ?',
        [affId]
      );
      const clicks24h = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))`);
      const myConversions = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_conversion_logs WHERE affiliate_id = ?`, [affId]);
      const pendingEarn = await queryOne(`SELECT COUNT(*) AS total, COALESCE(SUM(payout_amount), 0) AS pending_amount FROM 1ai_affiliate_earnings WHERE affiliate_id = ? AND status = 'pending'`, [affId]);
      const paidTotal = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS total_paid FROM 1ai_affiliate_earnings WHERE affiliate_id = ? AND status IN ('paid','approved')`, [affId]);
      const revMtd = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS mtd FROM 1ai_affiliate_earnings WHERE affiliate_id = ? AND created_at >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`, [affId]);

      return res.json({
        clicks24h: toNumber(clicks24h.total),
        total_clicks: toNumber(linkStats[0]?.total_clicks || 0),
        unique_ips: 0,
        attributed_conversions: toNumber(myConversions.total),
        revenueMtd: toNumber(revMtd.mtd),
        revenue_mtd: toNumber(revMtd.mtd),
        pendingPayout: toNumber(pendingEarn.pending_amount),
        pending_payout: toNumber(pendingEarn.pending_amount),
        pendingCount: toNumber(pendingEarn.total),
        pending_count: toNumber(pendingEarn.total),
        totalPaid: toNumber(paidTotal.total_paid),
        total_paid: toNumber(paidTotal.total_paid),
        avg_epc: 0, avg_ctr: 0, clickChange: 0, revenueGrowth: 0, revenue_growth: 0,
      });
    }

    if (role === 'advertiser') {
      // Advertiser sees stats for their offers/campaigns
      const offerIds = await queryRows('SELECT id FROM 1ai_offers WHERE advertiser_id = ?', [userId]);
      const oIds = offerIds.map(o => o.id);
      if (!oIds.length) return res.json({ clicks24h: 0, total_clicks: 0, unique_ips: 0, attributed_conversions: 0, revenueMtd: 0, revenue_mtd: 0, pendingPayout: 0, pending_payout: 0, pendingCount: 0, pending_count: 0, totalPaid: 0, total_paid: 0, avg_epc: 0, avg_ctr: 0, clickChange: 0, revenueGrowth: 0, revenue_growth: 0 });

      // Get campaign IDs linked to the advertiser's offers
      const campIds = await queryRows(`SELECT DISTINCT oc.aff_campaign_id FROM 1ai_offer_campaigns oc WHERE oc.offer_id IN (${oIds.join(',')})`);
      const cIds = campIds.map(c => c.aff_campaign_id);
      const campFilter = cIds.length ? `aff_campaign_id IN (${cIds.join(',')})` : '1=0';

      const clicks24h = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY)) AND ${campFilter}`);
      const myClicks = await queryOne(`SELECT COUNT(*) AS total, COUNT(DISTINCT click_ip) AS ips FROM 1ai_clicks WHERE ${campFilter}`);
      const myConversions = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_conversion_logs WHERE ${campFilter}`);
      const revMtd = await queryOne(`SELECT COALESCE(SUM(network_payout_snapshot), 0) AS mtd FROM 1ai_conversion_logs WHERE ${campFilter} AND conversion_time >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);

      return res.json({
        clicks24h: toNumber(clicks24h.total),
        total_clicks: toNumber(myClicks.total),
        unique_ips: toNumber(myClicks.ips),
        attributed_conversions: toNumber(myConversions.total),
        revenueMtd: toNumber(revMtd.mtd),
        revenue_mtd: toNumber(revMtd.mtd),
        pendingPayout: 0, pending_payout: 0, pendingCount: 0, pending_count: 0,
        totalPaid: 0, total_paid: 0,
        avg_epc: 0, avg_ctr: 0, clickChange: 0, revenueGrowth: 0, revenue_growth: 0,
      });
    }

    // Admin / Manager — full platform stats
    const affCount = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_affiliates`);
    const newAff7d = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_affiliates WHERE created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))`);
    const clicks24h = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))`);
    const clicksPrev = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks WHERE click_time BETWEEN UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 DAY)) AND UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))`);
    const totalClicks = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_clicks`);
    const uniqueIps = await queryOne(`SELECT COUNT(DISTINCT click_ip) AS total FROM 1ai_clicks`);
    const conversions = await queryOne(`SELECT COUNT(*) AS total FROM 1ai_conversion_logs`);
    const pendingEarn = await queryOne(`SELECT COUNT(*) AS total, COALESCE(SUM(payout_amount), 0) AS pending_amount FROM 1ai_affiliate_earnings WHERE status = 'pending'`);
    const paidTotal = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS total_paid FROM 1ai_affiliate_earnings WHERE status IN ('paid','approved')`);
    const revMtd = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS mtd FROM 1ai_affiliate_earnings WHERE created_at >= UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);
    const revPrev = await queryOne(`SELECT COALESCE(SUM(payout_amount), 0) AS prev FROM 1ai_affiliate_earnings WHERE created_at BETWEEN UNIX_TIMESTAMP(DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)) AND UNIX_TIMESTAMP(DATE_FORMAT(NOW(), '%Y-%m-01'))`);

    const totalClickCount = toNumber(totalClicks.total);
    const conversionCount = toNumber(conversions.total);
    const revenueMtd = toNumber(revMtd.mtd);
    const clickChange = toNumber(clicksPrev.total) > 0 ? (toNumber(clicks24h.total) - toNumber(clicksPrev.total)) / toNumber(clicksPrev.total) : 0;
    const revenueGrowth = toNumber(revPrev.prev) > 0 ? (revenueMtd - toNumber(revPrev.prev)) / toNumber(revPrev.prev) : 0;
    const avgEpc = totalClickCount > 0 ? revenueMtd / totalClickCount : 0;
    const avgCtr = totalClickCount > 0 ? (conversionCount / totalClickCount) * 100 : 0;

    // Daily chart data — merge spend + commission by date
    const [dailySpend] = await pool.query(`
      SELECT DATE(date) AS date, campaign_name, COALESCE(SUM(spend),0) AS spend, COALESCE(SUM(clicks),0) AS clicks
      FROM 1ai_daily_spend
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(date), campaign_name ORDER BY date ASC
    `).catch(() => [[]]);

    const [dailyCommission] = await pool.query(`
      SELECT DATE(FROM_UNIXTIME(created_at)) AS date, COALESCE(SUM(payout_amount),0) AS commission
      FROM 1ai_affiliate_earnings
      WHERE created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY))
      GROUP BY DATE(FROM_UNIXTIME(created_at)) ORDER BY date ASC
    `).catch(() => [[]]);

    // Merge by date
    const dateMap = {};
    dailySpend.forEach(d => {
      const parsed = d.date ? new Date(d.date) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      const ds = parsed.toISOString().split('T')[0];
      dateMap[ds] = { date: ds, spend: Number(d.spend), clicks: d.clicks, commission: 0, campaign_name: d.campaign_name || null };
    });
    dailyCommission.forEach(d => {
      const parsed = d.date ? new Date(d.date) : null;
      if (!parsed || Number.isNaN(parsed.getTime())) return;
      const ds = parsed.toISOString().split('T')[0];
      if (!dateMap[ds]) dateMap[ds] = { date: ds, spend: 0, clicks: 0, commission: 0 };
      dateMap[ds].commission = Number(d.commission);
    });
    const dailyData = Object.values(dateMap).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

    // Total spend
    const totalSpend = await queryOne(`SELECT COALESCE(SUM(spend), 0) AS total FROM 1ai_daily_spend`);
    const costMtd = toNumber(totalSpend.total);

    // Top taglink
    const topTag = await queryOne(`SELECT taglink FROM 1ai_campaign_taglinks ORDER BY id DESC LIMIT 1`);

    res.json({
      totalAffiliates: toNumber(affCount.total),
      newAffiliates7d: toNumber(newAff7d.total),
      clicks24h: toNumber(clicks24h.total),
      active_clicks_24h: toNumber(clicks24h.total),
      clicks_today: toNumber(clicks24h.total),
      total_clicks: totalClickCount,
      unique_ips: toNumber(uniqueIps.total),
      attributed_conversions: conversionCount,
      assisted_conversions: 0,
      avg_epc: avgEpc,
      avg_ctr: Number(avgCtr.toFixed(2)),
      clickChange,
      pendingPayout: toNumber(pendingEarn.pending_amount),
      pending_payout: toNumber(pendingEarn.pending_amount),
      pendingCount: toNumber(pendingEarn.total),
      pending_count: toNumber(pendingEarn.total),
      revenueMtd,
      revenue_mtd: revenueMtd,
      revenueGrowth,
      revenue_growth: revenueGrowth,
      totalPaid: toNumber(paidTotal.total_paid),
      total_paid: toNumber(paidTotal.total_paid),
      // Business data
      dailyData,
      cost: costMtd,
      costMtd,
      profit: revenueMtd - costMtd,
      ad_revenue: revenueMtd,
      organic_revenue: 0,
      best_taglink: topTag?.taglink || null,
      top_campaign: dailySpend.length ? dailySpend[0].campaign_name || null : null,
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getCommissions(_req, res) {
  try {
    const limit = Math.min(parseInt(_req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT cl.id, cl.affiliate_id, cl.offer_id, cl.commission, cl.commission AS amount, cl.tier, cl.status, cl.created_at,
              a.affiliate_code, u.user_name AS affiliate,
              o.name AS offer, o.name AS source
       FROM 1ai_commission_entries cl
       LEFT JOIN 1ai_affiliates a ON cl.affiliate_id = a.id
       LEFT JOIN 1ai_users u ON a.user_id = u.user_id
       LEFT JOIN 1ai_offers o ON cl.offer_id = o.id
       ORDER BY cl.created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getCommissions error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getPayments(_req, res) {
  try {
    const limit = Math.min(parseInt(_req.query.limit) || 50, 500);
    const [rows] = await pool.query(
      `SELECT id, user_id, reference, amount, status, tripay_ref, created_at, paid_at
       FROM 1ai_affiliate_payments
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getMargin(req, res) {
  try {
    const targetId = parseInt(req.params.userId) || req.user.id;
    const row = await queryOne('SELECT m.*, u.user_name, u.user_email FROM 1ai_margin_config m JOIN 1ai_users u ON m.user_id = u.user_id WHERE m.user_id = ?', [targetId]);
    if (!row || !row.user_id) return res.json({ user_id: targetId, margin_pct: 20.00, tier: 'starter', configured: false });
    res.json({ user_id: row.user_id, user_name: row.user_name, user_email: row.user_email, margin_pct: row.margin_pct, tier: row.tier, created_at: row.created_at, configured: true });
  } catch (err) {
    console.error('getMargin error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function setMargin(req, res) {
  try {
    const { user_id, margin_pct, tier } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const pct = Math.min(Math.max(parseFloat(margin_pct) || 20, 0), 100);
    const t = tier || 'starter';
    await pool.query(
      `INSERT INTO 1ai_margin_config (user_id, margin_pct, tier, created_at) VALUES (?, ?, ?, UNIX_TIMESTAMP())
       ON DUPLICATE KEY UPDATE margin_pct = VALUES(margin_pct), tier = VALUES(tier)`,
      [user_id, pct, t]
    );
    res.json({ success: true, user_id, margin_pct: pct, tier: t });
  } catch (err) {
    console.error('setMargin error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getEarnings,
  approveEarning,
  getStats,
  getCommissions,
  getPayments,
  getMargin,
  setMargin,

};
