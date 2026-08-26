'use strict';

/**
 * Faithful re-implementation of 1ai-affiliate smartlink routing decision logic.
 *
 * Mirrors server/services/smartlinkRoutingService.js semantics:
 *   - evaluateGeoRules / evaluateDeviceRules / evaluateVisitorRules
 *   - offer selection: weighted (cumulative), random, round-robin, priority, fallback
 *
 * This module is the AUTORESEARCH TARGET. The baseline is intentionally
 * "obvious" (parse-per-click, linear scans, cumulative-sum-per-call) so the
 * optimization loop has real headroom. Correctness is pinned by bench.js.
 */

// ── Rule evaluators ────────────────────────────────────────────────────

function evaluateGeoRules(rulesStr, countryCode) {
  if (!rulesStr || !countryCode) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules || rules.match === 'all') return true;
  if (!Array.isArray(rules.countries)) return true;
  const match = rules.countries.some((c) => c.toUpperCase() === countryCode.toUpperCase());
  if (rules.match === 'include') return match;
  if (rules.match === 'exclude') return !match;
  return true;
}

function evaluateDeviceRules(rulesStr, deviceType) {
  if (!rulesStr || !deviceType) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules || rules.match === 'all') return true;
  if (!Array.isArray(rules.devices)) return true;
  const match = rules.devices.some((d) => d.toLowerCase() === deviceType.toLowerCase());
  if (rules.match === 'include') return match;
  if (rules.match === 'exclude') return !match;
  return true;
}

function evaluateVisitorRules(rulesStr, v) {
  if (!rulesStr) return true;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return true; }
  if (!rules || rules.match === 'all') return true;
  if (rules.match === 'geo') {
    if (!Array.isArray(rules.countries)) return true;
    return rules.countries.some((c) => c.toUpperCase() === (v.country || '').toUpperCase());
  }
  if (rules.match === 'connection') {
    if (!rules.type) return true;
    return (v.connection || '').toLowerCase() === rules.type.toLowerCase();
  }
  if (rules.match === 'isp') {
    if (!Array.isArray(rules.providers)) return true;
    const isp = (v.isp || '').toLowerCase();
    return rules.providers.some((p) => isp.includes(p.toLowerCase()));
  }
  return true;
}

// ── Offer selectors ────────────────────────────────────────────────────

function pickWeighted(offers, rand) {
  // naive: recompute cumulative distribution every call
  let total = 0;
  for (const o of offers) total += o.weight;
  let r = rand() * total;
  for (const o of offers) {
    r -= o.weight;
    if (r < 0) return o;
  }
  return offers[offers.length - 1];
}

function pickRandom(offers, rand) {
  return offers[Math.floor(rand() * offers.length)];
}

function pickByPriority(offers) {
  let best = null;
  for (const o of offers) {
    if (!best || o.priority > best.priority) best = o;
  }
  return best;
}

function pickRoundRobin(offers, state) {
  const idx = state.idx % offers.length;
  state.idx++;
  return offers[idx];
}

function resolveFallback(offers, fallbackId) {
  if (fallbackId == null) return offers.length ? offers[0] : null;
  const f = offers.find((o) => o.id === fallbackId);
  return f || (offers.length ? offers[0] : null);
}

// ── Engine ─────────────────────────────────────────────────────────────

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a routing engine over a fixed set of slugs.
 * @param {object} cfg { offers, slugs, seed }
 *   offers: [{id, weight, priority}]
 *   slugs:  [{ id, geoRules, deviceRules, visitorRules, strategy, fallbackId }]
 */
function buildEngine(cfg) {
  const rand = mulberry32(cfg.seed || 1);
  const rrState = { idx: 0 };

  function eligibleOffers(slug) {
    return cfg.offers.filter((o) => true); // base set; rules applied via context
  }

  function route(slug, ctx) {
    if (!slug) return resolveFallback(cfg.offers, null);
    if (!evaluateGeoRules(slug.geoRules, ctx.country)) return resolveFallback(cfg.offers, slug.fallbackId);
    if (!evaluateDeviceRules(slug.deviceRules, ctx.device)) return resolveFallback(cfg.offers, slug.fallbackId);
    if (!evaluateVisitorRules(slug.visitorRules, ctx)) return resolveFallback(cfg.offers, slug.fallbackId);

    const pool = eligibleOffers(slug);
    switch (slug.strategy) {
      case 'weighted': return pickWeighted(pool, rand);
      case 'random': return pickRandom(pool, rand);
      case 'priority': return pickByPriority(pool);
      case 'roundrobin': return pickRoundRobin(pool, rrState);
      default: return resolveFallback(pool, slug.fallbackId);
    }
  }

  return { route, _rand: rand };
}

module.exports = {
  buildEngine,
  evaluateGeoRules,
  evaluateDeviceRules,
  evaluateVisitorRules,
  pickWeighted,
  pickRandom,
  pickByPriority,
  pickRoundRobin,
  resolveFallback,
  mulberry32,
};
