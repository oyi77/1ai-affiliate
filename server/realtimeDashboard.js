'use strict';

/**
 * Real-Time Dashboard Service — SSE (Server-Sent Events) for live metrics.
 * 
 * Competitors: Voluum has real-time dashboard, RedTrack has streaming.
 * We provide SSE-based real-time metrics with configurable intervals.
 */

const pool = require('../db/mysql');

/**
 * Get live dashboard metrics.
 * Returns current snapshot of key metrics.
 */
async function getLiveMetrics() {
  try {
    // Clicks in last hour
    const [[clicks1h]] = await pool.query(
      'SELECT COUNT(*) as total FROM 1ai_clicks WHERE click_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))'
    );

    // Clicks in last 24h
    const [[clicks24h]] = await pool.query(
      'SELECT COUNT(*) as total FROM 1ai_clicks WHERE click_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))'
    );

    // Conversions in last hour
    const [[convs1h]] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(affiliate_payout_snapshot), 0) as revenue FROM 1ai_conversion_logs WHERE conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))'
    );

    // Conversions in last 24h
    const [[convs24h]] = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(affiliate_payout_snapshot), 0) as revenue FROM 1ai_conversion_logs WHERE conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))'
    );

    // Active campaigns
    const [[activeCampaigns]] = await pool.query(
      "SELECT COUNT(*) as total FROM 1ai_aff_campaigns WHERE aff_campaign_status = 'active'"
    );

    // Active affiliates
    const [[activeAffiliates]] = await pool.query(
      'SELECT COUNT(DISTINCT affiliate_id) as total FROM 1ai_clicks WHERE click_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))'
    );

    // Pending conversions
    const [[pendingConvs]] = await pool.query(
      "SELECT COUNT(*) as total FROM 1ai_conversion_logs WHERE status = 'pending'"
    );

    // Fraud blocks in last hour
    const [[fraudBlocks]] = await pool.query(
      "SELECT COUNT(*) as total FROM 1ai_fraud_log WHERE verdict = 'block' AND created_at > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))"
    ).catch(() => [[{ total: 0 }]]);

    // Top performing campaigns
    const [topCampaigns] = await pool.query(
      `SELECT ac.aff_campaign_name, COUNT(cl.conversion_id) as conversions, 
              COALESCE(SUM(cl.affiliate_payout_snapshot), 0) as revenue
       FROM 1ai_aff_campaigns ac
       LEFT JOIN 1ai_conversion_logs cl ON cl.aff_campaign_id = ac.aff_campaign_id
         AND cl.conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))
       WHERE ac.aff_campaign_status = 'active'
       GROUP BY ac.aff_campaign_id
       ORDER BY revenue DESC LIMIT 5`
    );

    return {
      clicks_1h: clicks1h?.total || 0,
      clicks_24h: clicks24h?.total || 0,
      conversions_1h: convs1h?.total || 0,
      conversions_24h: convs24h?.total || 0,
      revenue_1h: parseFloat(convs1h?.revenue || 0),
      revenue_24h: parseFloat(convs24h?.revenue || 0),
      active_campaigns: activeCampaigns?.total || 0,
      active_affiliates: activeAffiliates?.total || 0,
      pending_conversions: pendingConvs?.total || 0,
      fraud_blocks_1h: fraudBlocks?.total || 0,
      top_campaigns: topCampaigns,
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('getLiveMetrics error:', err.message);
    return { error: err.message, timestamp: Date.now() };
  }
}

// ── Shared Metrics Cache ─────────────────────────────────────────
// Single background job fetches metrics, all SSE clients read from cache.
// Prevents N+1 DB queries when N clients are connected.

let cachedMetrics = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

async function getCachedMetrics() {
  const now = Date.now();
  if (cachedMetrics && now < cacheExpiry) return cachedMetrics;
  cachedMetrics = await getLiveMetrics();
  cacheExpiry = now + CACHE_TTL_MS;
  return cachedMetrics;
}

/**
 * SSE middleware for real-time dashboard.
 * Uses shared cache — all clients get same data from single DB query per interval.
 */
function createSSEHandler(intervalMs = 5000) {
  return async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send initial data from cache
    const initial = await getCachedMetrics();
    res.write(`data: ${JSON.stringify(initial)}\n\n`);

    // Send updates at interval — reads from shared cache
    const interval = setInterval(async () => {
      try {
        const metrics = await getCachedMetrics();
        res.write(`data: ${JSON.stringify(metrics)}\n\n`);
      } catch (err) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      }
    }, intervalMs);

    req.on('close', () => clearInterval(interval));
  };
}

module.exports = {
  getLiveMetrics,
  getCachedMetrics,
  createSSEHandler,
};
