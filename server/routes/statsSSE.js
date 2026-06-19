/**
 * Real-time stats via Server-Sent Events (SSE).
 *
 * GET /api/admin/stats/stream — SSE stream of live dashboard metrics.
 * Auth: admin JWT.
 *
 * Every 5 seconds, pushes a JSON payload:
 *   { clicks_1h, conversions_1h, revenue_1h, active_affiliates,
 *     pending_postbacks, timestamp }
 */
const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/daily', requireAdmin, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;

    const [rows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(click_time)) AS date,
              COUNT(*) AS clicks,
              COALESCE(SUM(click_payout), 0) AS revenue
       FROM 1ai_clicks
       WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY))
       GROUP BY DATE(FROM_UNIXTIME(click_time))
       ORDER BY date ASC`,
      [days]
    );

    const [convRows] = await pool.query(
      `SELECT DATE(FROM_UNIXTIME(conversion_time)) AS date,
              COUNT(*) AS conversions
       FROM 1ai_conversion_logs
       WHERE conversion_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY))
       GROUP BY DATE(FROM_UNIXTIME(conversion_time))
       ORDER BY date ASC`,
      [days]
    );

    const convMap = {};
    for (const r of convRows) {
      convMap[r.date] = Number(r.conversions);
    }

    const result = rows.map(r => ({
      date: r.date,
      clicks: Number(r.clicks),
      conversions: convMap[r.date] || 0,
      revenue: Number(r.revenue),
      spend: 0,
    }));

    res.json({ data: result });
  } catch (err) {
    console.error('getDailyStats error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = async () => {
    try {
      const [[clickRow]] = await pool.query(
        `SELECT COUNT(*) AS clicks_1h FROM 1ai_clicks
         WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`
      );
      const [[convRow]] = await pool.query(
        `SELECT COUNT(*) AS conversions_1h FROM 1ai_conversion_logs
         WHERE conversion_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`
      );
      const [[revRow]] = await pool.query(
        `SELECT COALESCE(SUM(payout_amount), 0) AS revenue_1h
         FROM 1ai_affiliate_earnings WHERE created_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`
      );
      const [[affRow]] = await pool.query(
        `SELECT COUNT(DISTINCT a.id) AS active_affiliates
         FROM 1ai_affiliates a
         JOIN 1ai_affiliate_sessions s ON a.id = (SELECT affiliate_id FROM 1ai_affiliate_links WHERE link_token = s.link_token LIMIT 1)
         WHERE s.tracked_at >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))`
      );
      const [[postRow]] = await pool.query(
        `SELECT COUNT(*) AS pending_postbacks FROM 1ai_postback_queue WHERE status IN ('queued', 'retry')`
      );

      const data = {
        clicks_1h: clickRow?.clicks_1h ?? 0,
        conversions_1h: convRow?.conversions_1h ?? 0,
        revenue_1h: revRow?.revenue_1h ?? 0,
        active_affiliates: affRow?.active_affiliates ?? 0,
        pending_postbacks: postRow?.pending_postbacks ?? 0,
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('[SSE] stats error:', err.message);
      res.write(`data: ${JSON.stringify({ error: err.message, timestamp: new Date().toISOString() })}\n\n`);
    }
  };

  // Initial push
  await send();
  // Push every 5 seconds
  const interval = setInterval(send, 5000);
  req.on('close', () => clearInterval(interval));
});

module.exports = router;
