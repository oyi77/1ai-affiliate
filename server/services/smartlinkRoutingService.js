'use strict';

/**
 * Smartlink Routing Service
 * Evaluates geo/device/visitor rules, filters offers, applies rotation,
 * and builds the redirect URL for a smartlink.
 */

const pool = require('../db/mysql');
const { lookupIp } = require('../routes/geoip');
const { getDeviceFingerprint } = require('./deviceTracker');

// Re-export the existing rotation helpers from smartlinkService
const {
  getSmartlinkOffers,
  pickWeighted,
  pickRandom,
  pickRoundRobin,
  pickByPriority,
  resolveFallback,
} = require('./smartlinkService');

// ── Rule evaluation helpers ────────────────────────────────────────

/**
 * Evaluate geo_rules JSON against a country code.
 *
 * Supported formats:
 *   {"match":"include","countries":["ID","MY"]}  — only these
 *   {"match":"exclude","countries":["US"]}        — exclude these
 *   {"match":"all"}  / null / undefined           — pass through
 *
 * @param {string|null} rulesStr    JSON string from geo_rules column
 * @param {string}      countryCode 2-letter ISO country code
 * @returns {boolean}
 */
function evaluateGeoRules(rulesStr, countryCode) {
  if (!rulesStr || !countryCode) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules || rules.match === 'all') return true;
  if (!Array.isArray(rules.countries)) return true;

  const match = rules.countries.some(c => c.toUpperCase() === countryCode.toUpperCase());

  if (rules.match === 'include') return match;
  if (rules.match === 'exclude') return !match;
  return true;
}

/**
 * Evaluate device_rules JSON against a device type.
 *
 * Supported formats:
 *   {"match":"include","devices":["mobile","desktop"]}
 *   {"match":"exclude","devices":["tablet"]}
 *   {"match":"all"} / null / undefined   — pass through
 *
 * @param {string|null} rulesStr   JSON string from device_rules column
 * @param {string}      deviceType e.g. 'mobile', 'desktop', 'tablet', 'unknown'
 * @returns {boolean}
 */
function evaluateDeviceRules(rulesStr, deviceType) {
  if (!rulesStr || !deviceType) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules || rules.match === 'all') return true;
  if (!Array.isArray(rules.devices)) return true;

  const match = rules.devices.some(d => d.toLowerCase() === deviceType.toLowerCase());

  if (rules.match === 'include') return match;
  if (rules.match === 'exclude') return !match;
  return true;
}

/**
 * Evaluate visitor_rules JSON against enriched visitor data.
 *
 * Supported formats:
 *   {"match":"geo","countries":["ID"]}               — visitor from ID
 *   {"match":"connection","type":"residential"}      — connection type
 *   {"match":"isp","providers":["telkomsel"]}         — ISP name contains
 *   null / undefined                                  — pass through
 *
 * @param {string|null} rulesStr    JSON from visitor_rules column
 * @param {object}      visitorData { country_code, connection_type, isp, device_type, … }
 * @returns {boolean}
 */
function evaluateVisitorRules(rulesStr, visitorData) {
  if (!rulesStr) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules) return true;

  switch (rules.match) {
    case 'geo': {
      if (!Array.isArray(rules.countries) || !visitorData.country_code) return true;
      return rules.countries.some(c => c.toUpperCase() === visitorData.country_code.toUpperCase());
    }
    case 'connection': {
      if (!rules.type || !visitorData.connection_type) return true;
      return rules.type.toLowerCase() === visitorData.connection_type.toLowerCase();
    }
    case 'isp': {
      if (!Array.isArray(rules.providers) || !visitorData.isp) return true;
      const isp = visitorData.isp.toLowerCase();
      return rules.providers.some(p => isp.includes(p.toLowerCase()));
    }
    default:
      return true;
  }
}

// ── Offer filtering by offer's own geo target ──────────────────────

/**
 * Check if an offer's geo field includes the visitor's country.
 * Offer geo is a comma-separated list like "ID,US,SG" or null/empty.
 */
function offerSupportsCountry(offerGeo, countryCode) {
  if (!offerGeo || !countryCode) return true;
  const countries = offerGeo.split(',').map(c => c.trim().toUpperCase());
  return countries.some(c => c === 'ALL' || c === countryCode.toUpperCase());
}

// ── Full routing pipeline ──────────────────────────────────────────

/**
 * Resolve a smartlink by slug and get its owner (affiliate).
 *
 * @param {string} slug
 * @returns {Promise<{sl:object, affiliate:object|null}|null>}
 */
async function resolveBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT s.id, s.user_id, s.campaign_id, s.slug, s.hash,
            s.geo_rules, s.device_rules, s.visitor_rules,
            s.rotation_strategy, s.status,
            s.default_url, s.fallback_offer_id, s.click_count,
            a.id AS affiliate_id, a.affiliate_code, a.affiliate_code AS affiliate_name
     FROM 1ai_smartlinks s
     LEFT JOIN 1ai_affiliates a ON a.id = s.user_id
     WHERE s.slug = ? AND s.status = 'active'`,
    [slug]
  );
  if (!rows.length) return null;
  return { sl: rows[0], affiliate: rows[0].affiliate_id ? { id: rows[0].affiliate_id, code: rows[0].affiliate_code, name: rows[0].affiliate_name } : null };
}

/**
 * Full smartlink routing pipeline:
 *   1. Evaluate smartlink-level rules (geo, device, visitor)
 *   2. Fetch offers and filter by their native geo target
 *   3. Apply rotation strategy
 *   4. Fall back → fallback_offer_id → default_url
 *
 * @param {number} smartlinkId
 * @param {object} visitorData  { country_code, device_type, connection_type, isp }
 * @param {object} [options]
 * @param {string|null} [options.subid]
 * @returns {Promise<{offer:object|null, redirectUrl:string, smartlink:object}>}
 */
async function routeSmartlink(smartlinkId, visitorData, options = {}) {
  const [smartlinks] = await pool.query(
    `SELECT id, user_id, campaign_id, slug, hash,
            geo_rules, device_rules, visitor_rules,
            rotation_strategy, fallback_offer_id, default_url
     FROM 1ai_smartlinks
     WHERE id = ? AND status = 'active'`,
    [smartlinkId]
  );
  if (!smartlinks.length) return { offer: null, redirectUrl: null, smartlink: null };

  const sl = smartlinks[0];

  // ── Evaluate smartlink-level rules ─────────────────────────────
  const geoOk = evaluateGeoRules(sl.geo_rules, visitorData.country_code);
  const deviceOk = evaluateDeviceRules(sl.device_rules, visitorData.device_type);
  const visitorOk = evaluateVisitorRules(sl.visitor_rules, visitorData);

  if (!geoOk || !deviceOk || !visitorOk) {
    // Rules didn't match — skip to fallback
    return pickFallback(sl);
  }

  // ── Fetch & filter offers ──────────────────────────────────────
  const allOffers = await getSmartlinkOffers(smartlinkId);
  const matchedOffers = allOffers.filter(o =>
    offerSupportsCountry(o.geo, visitorData.country_code)
  );

  if (!matchedOffers.length) return pickFallback(sl);

  // ── Apply rotation ─────────────────────────────────────────────
  const strategy = sl.rotation_strategy || 'weighted';
  let picked;
  switch (strategy) {
    case 'random':
      picked = pickRandom(matchedOffers);
      break;
    case 'round_robin':
      picked = await pickRoundRobin(smartlinkId, matchedOffers);
      break;
    case 'priority':
      picked = pickByPriority(matchedOffers);
      break;
    case 'weighted':
    default:
      picked = pickWeighted(matchedOffers);
      break;
  }

  if (!picked) return pickFallback(sl);
  return { offer: picked, redirectUrl: null, smartlink: sl };
}

/**
 * Pick fallback: try fallback_offer_id, then default_url.
 */
async function pickFallback(sl) {
  if (sl.fallback_offer_id) {
    const fallback = await resolveFallback(sl.fallback_offer_id);
    if (fallback) return { offer: fallback, redirectUrl: null, smartlink: sl };
  }
  return { offer: null, redirectUrl: sl.default_url || null, smartlink: sl };
}

// ── Build redirect URL with clickId placeholder ────────────────────

/**
 * Build the final redirect URL by substituting placeholders.
 */
function buildRedirectUrl(offer, clickId) {
  if (!offer) return '/';
  const url = offer.tracking_url || offer.affiliate_url || '';
  if (!url) return '/';
  return url.replace(/\{clickid\}|\{click_id\}|\{clickId\}/gi, clickId);
}

module.exports = {
  evaluateGeoRules,
  evaluateDeviceRules,
  evaluateVisitorRules,
  offerSupportsCountry,
  resolveBySlug,
  routeSmartlink,
  buildRedirectUrl,
};
