'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// ── AI Co-Pilot: Suggest campaign settings based on historical data ──
router.post('/suggest', async (req, res) => {
  try {
    const { offer_id, traffic_source, geo } = req.body;

    // Gather historical data
    const [topOffers] = await pool.query(
      `SELECT o.name, o.payout, o.type, COUNT(cv.id) as conversions, COALESCE(SUM(cv.revenue), 0) as revenue
       FROM 1ai_offers o LEFT JOIN 1ai_conversions cv ON cv.offer_id = o.id
       WHERE o.status = 'active' GROUP BY o.id ORDER BY conversions DESC LIMIT 5`
    );

    const [recentClicks] = await pool.query(
      `SELECT COUNT(*) as total, AVG(click_payout) as avg_payout FROM 1ai_clicks WHERE click_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY))`
    );

    const [topSources] = await pool.query(
      `SELECT name, platform_type FROM 1ai_traffic_sources WHERE is_active = 1 ORDER BY id DESC LIMIT 5`
    );

    const context = {
      top_offers: topOffers,
      recent_clicks: recentClicks[0],
      traffic_sources: topSources,
      request: { offer_id, traffic_source, geo }
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      const bestOffer = topOffers[0];
      return res.json({
        suggestions: {
          recommended_offer: bestOffer ? { name: bestOffer.name, reason: 'Highest conversions' } : null,
          suggested_payout: bestOffer ? bestOffer.payout : 0,
          suggested_daily_cap: 100,
          suggested_traffic_source: topSources[0]?.name || 'Direct',
          ad_copy: bestOffer ? `Check out ${bestOffer.name}! Limited time offer.` : 'Create your first campaign to get AI suggestions.',
          targeting: { geo: geo || 'All', device: 'All', os: 'All' },
          estimated_cpc: recentClicks[0]?.avg_payout || 0.01,
          optimization_tips: ['Start with a small daily cap and scale winners', 'Test multiple traffic sources', 'Monitor fraud scores closely']
        },
        data_context: context,
        ai_powered: false
      });
    }

    const prompt = `You are an AI co-pilot for affiliate marketing. Based on this historical data, suggest optimal campaign settings.

Data:
${JSON.stringify(context, null, 2)}

Return a JSON object with these fields:
- recommended_offer: object with name and reason
- suggested_payout: number
- suggested_daily_cap: number
- suggested_traffic_source: string
- ad_copy: string (compelling, 2-3 sentences)
- targeting: object with geo, device, os
- estimated_cpc: number
- optimization_tips: array of 3 strings`;

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).json({ error: `Gemini API error: ${t}` });
    }

    const aiData = await resp.json();
    const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let suggestions = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) suggestions = JSON.parse(jsonMatch[0]);
    } catch {}

    res.json({ suggestions, data_context: context, ai_powered: true, raw_response: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
