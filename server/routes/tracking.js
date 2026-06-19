'use strict';

/**
 * Tracking pixel endpoint — receives first-party tracking beacons from t.js.
 * ponytail: minimal handler, no auth needed (public endpoint).
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');

// GET /api/t/click — receive click beacon from tracking script
router.get('/click', async (req, res) => {
  const { c: campaignId, a: affiliateId, fp: fingerprint, ref: referrer, url, sw, sh, cid: existingClickId } = req.query;
  const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
  const ua = req.headers['user-agent'] || '';

  try {
    // If we have an existing click_id from cookie, just update
    if (existingClickId) {
      await pool.query(
        'UPDATE 1ai_clicks SET click_count = click_count + 1 WHERE id = ?',
        [existingClickId]
      ).catch(() => {});
      return res.status(204).end();
    }

    // New click — insert
    const [result] = await pool.query(
      `INSERT INTO 1ai_clicks (affiliate_id, offer_id, campaign_id, click_ip, user_agent, referer, country, device_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '', '', NOW())`,
      [affiliateId || 0, 0, campaignId || 0, ip, ua, referrer || '']
    );

    // Set first-party cookie with click_id
    const clickId = result.insertId;
    res.cookie('_1ai_click', clickId, { maxAge: 30 * 86400 * 1000, httpOnly: false, sameSite: 'lax' });
    res.status(204).end();
  } catch (err) {
    // Silent fail — tracking should never break the page
    res.status(204).end();
  }
});

module.exports = router;
