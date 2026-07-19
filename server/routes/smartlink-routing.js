'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');
const { lookupIp } = require('./geoip');
const { getDeviceFingerprint } = require('../services/deviceTracker');
const { resolveBySlug, routeSmartlink, buildRedirectUrl } = require('../services/smartlinkRoutingService');

/**
 * GET /r/:slug
 *
 * Public smartlink routing endpoint.
 * Resolves a smartlink by slug, evaluates rules, picks the best offer,
 * logs the click, and redirects the visitor.
 */
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!slug) return res.status(400).send('Invalid link');

  try {
    const resolved = await resolveBySlug(slug);
    if (!resolved) return res.status(404).send('Link not found');
    const { sl, affiliate } = resolved;

    const clientIp = req.ip || req.connection?.remoteAddress ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
    const ua = req.headers['user-agent'] || '';
    const subid = req.query.subid || '';
    const referer = req.headers['referer'] || req.headers['referrer'] || '';

    const [geo, device] = await Promise.all([
      lookupIp(clientIp),
      Promise.resolve(getDeviceFingerprint(ua)),
    ]);

    const visitorData = {
      country_code: geo.country_code || '',
      device_type: device.device_type || 'unknown',
      connection_type: geo.connection_type || 'unknown',
      isp: geo.isp || '',
    };

    const { offer, redirectUrl } = await routeSmartlink(sl.id, visitorData, { subid });

    const clickId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const finalUrl = redirectUrl || (offer ? buildRedirectUrl(offer, clickId) : sl.default_url || '/');

    // Log click asynchronously (don't block redirect)
    logClick({ clickId, sl, affiliate, offer, clientIp, ua, subid, referer, geo, device })
      .catch(err => console.error('smartlink click_log err:', err.message));

    // Redirect visitor
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      return res.redirect(finalUrl);
    }
    return res.redirect('https://' + finalUrl);
  } catch (err) {
    console.error('smartlink routing error:', err);
    res.status(500).send('Routing error');
  }
});

/**
 * Asynchronously log a smartlink click to tracking tables.
 */
async function logClick(ctx) {
  const { clickId, sl, affiliate, offer, clientIp, ua, subid, geo, device } = ctx;

  await Promise.all([
    pool.query('UPDATE 1ai_smartlinks SET click_count = click_count + 1 WHERE id = ?', [sl.id]),

    pool.query(
      `INSERT INTO 1ai_click_log
       (click_id, smartlink_id, offer_id, affiliate_id, subid, ip, country_code, device_type, user_agent, payout, clicked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [
        clickId,
        sl.id,
        offer ? offer.offer_id : null,
        affiliate ? affiliate.id : sl.user_id,
        subid || '',
        clientIp,
        geo.country_code || '',
        device.device_type || 'unknown',
        ua.substring(0, 512),
        offer ? offer.payout : 0,
      ]
    ),

    pool.query(
      `INSERT INTO 1ai_click_enrichment
       (click_id, os_name, os_version, browser_name, browser_version, browser_engine,
        device_type, is_mobile, is_bot, country, country_code, city, region, timezone,
        latitude, longitude, isp, asn_number, connection_type, is_datacenter, is_vpn, is_proxy,
        enriched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [
        clickId,
        device.os.name || null, device.os.version || null,
        device.browser.name || null, device.browser.version || null, device.browser.engine || null,
        device.device_type || 'unknown', device.is_mobile ? 1 : 0, device.is_bot ? 1 : 0,
        geo.country || null, geo.country_code || null, geo.city || null, geo.region || null,
        geo.timezone || null, geo.latitude || null, geo.longitude || null,
        geo.isp || null, geo.asn_number || null,
        geo.connection_type || 'unknown', geo.is_datacenter ? 1 : 0, geo.is_vpn ? 1 : 0, geo.is_proxy ? 1 : 0,
      ]
    ),
  ]);
}

module.exports = router;
