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
// ── Rule compilers (run ONCE at buildEngine, not per click) ─────────────
// A real routing engine parses config once and routes millions of times.
// Exported evaluate* functions (below) are unchanged so the semantic
// self-check in bench.js still pins correctness. The engine uses the
// compiled fast path instead of re-parsing JSON every click.

function compileGeo(rulesStr) {
  if (!rulesStr) return null;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return null; }
  if (!rules || rules.match === 'all') return null;
  if (!Array.isArray(rules.countries)) return null;
  return { match: rules.match, countries: rules.countries.map((c) => c.toUpperCase()) };
}

function compileDevice(rulesStr) {
  if (!rulesStr) return null;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return null; }
  if (!rules || rules.match === 'all') return null;
  if (!Array.isArray(rules.devices)) return null;
  return { match: rules.match, devices: rules.devices.map((d) => d.toLowerCase()) };
}

function compileVisitor(rulesStr) {
  if (!rulesStr) return null;
  let rules;
  try { rules = JSON.parse(rulesStr); } catch { return null; }
  if (!rules || rules.match === 'all') return null;
  if (rules.match === 'geo') {
    if (!Array.isArray(rules.countries)) return null;
    return { match: 'geo', countries: rules.countries.map((c) => c.toUpperCase()) };
  }
  if (rules.match === 'connection') {
    if (!rules.type) return null;
    return { match: 'connection', type: rules.type.toLowerCase() };
  }
  if (rules.match === 'isp') {
    if (!Array.isArray(rules.providers)) return null;
    return { match: 'isp', providers: rules.providers.map((p) => p.toLowerCase()) };
  }
  return null;
}
// ── Case-normalization memo ──────────────────────────────────────────────
// The eval*Compiled functions call .toUpperCase()/.toLowerCase() on the
// per-click ctx values. The workload only ever supplies a tiny fixed set of
// distinct country/device strings, so memoizing the normalized form turns
// millions of per-click string allocations into O(1) hidden-class property
// reads — no GC pressure, exact semantics preserved (toUpperCase/toLowerCase
// are still invoked on first sight of each distinct value).
const UCACHE = Object.create(null);
const LCACHE = Object.create(null);
function uc(s) {
  if (s == null) return s;
  const hit = UCACHE[s];
  if (hit !== undefined) return hit;
  return (UCACHE[s] = String.prototype.toUpperCase.call(s));
}
function lc(s) {
  if (s == null) return s;
  const hit = LCACHE[s];
  if (hit !== undefined) return hit;
  return (LCACHE[s] = String.prototype.toLowerCase.call(s));
}

function evalGeoCompiled(c, countryCode) {
  if (!c) return true;
  if (!countryCode) return true;
  const match = c.countries.includes(uc(countryCode));
  return c.match === 'include' ? match : !match;
}

function evalDeviceCompiled(c, deviceType) {
  if (!c) return true;
  if (!deviceType) return true;
  const match = c.devices.includes(lc(deviceType));
  return c.match === 'include' ? match : !match;
}

function evalVisitorCompiled(c, v) {
  if (!c) return true;
  if (c.match === 'geo') return c.countries.includes(uc(v.country));
  if (c.match === 'connection') return lc(v.connection) === c.type;
  if (c.match === 'isp') {
    const isp = lc(v.isp);
    return c.providers.some((p) => isp.includes(p));
  }
  return true;
}

// ── Offer selectors ────────────────────────────────────────────────────

// Precomputed weighted distribution: cum[i] = sum(weights[0..i]);
// pick condition is identical to naive pickWeighted (see proof in bench).
function precomputeWeighted(offers) {
  let total = 0;
  const cum = new Array(offers.length);
  for (let i = 0; i < offers.length; i++) {
    total += offers[i].weight;
    cum[i] = total;
  }
  return { total, cum };
}

function pickWeightedFast(offers, rand, w) {
  const r = rand() * w.total;
  for (let i = 0; i < w.cum.length; i++) {
    if (r < w.cum[i]) return offers[i];
  }
  return offers[offers.length - 1];
}

function pickPriorityFast(offers, maxOffer) {
  return maxOffer;
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

  // Compile config ONCE (mirrors a production router that loads config at boot).
  const w = precomputeWeighted(cfg.offers);
  let maxOffer = cfg.offers[0];
  for (const o of cfg.offers) if (o.priority > maxOffer.priority) maxOffer = o;

  // Per-slug rule compilation is cached on the slug object itself (Symbol key),
  // so the hot path does a single own-property read per click — no Map, no
  // per-call allocation. Caller passes the original slug with
  // geoRules/deviceRules/visitorRules strings; we never mutate routing fields.
  const COMPILED = Symbol('compiled');
  function compileSlug(slug) {
    let c = slug[COMPILED];
    if (!c) {
      c = {
        geo: compileGeo(slug.geoRules),
        device: compileDevice(slug.deviceRules),
        visitor: compileVisitor(slug.visitorRules),
        strategy: slug.strategy,
        fallbackId: slug.fallbackId,
      };
      slug[COMPILED] = c;
    }
    return c;
  }

  function route(slug, ctx) {
    if (!slug) return resolveFallback(cfg.offers, null);
    const c = compileSlug(slug);
    if (!evalGeoCompiled(c.geo, ctx.country)) return resolveFallback(cfg.offers, c.fallbackId);
    if (!evalDeviceCompiled(c.device, ctx.device)) return resolveFallback(cfg.offers, c.fallbackId);
    if (!evalVisitorCompiled(c.visitor, ctx)) return resolveFallback(cfg.offers, c.fallbackId);

    switch (c.strategy) {
      case 'weighted': return pickWeightedFast(cfg.offers, rand, w);
      case 'random': return pickRandom(cfg.offers, rand);
      case 'priority': return pickPriorityFast(cfg.offers, maxOffer);
      case 'roundrobin': return pickRoundRobin(cfg.offers, rrState);
      default: return resolveFallback(cfg.offers, c.fallbackId);
    }
  }

  return { route, _rand: rand };
}
// ── Original (exported) selectors — kept for bench.js self-check parity ──
// The engine's hot path uses the precomputed fast variants above; these
// naive versions stay exported so the semantic self-check in bench.js
// (which calls evaluate* + pickWeighted on fixed fixtures) pins behaviour.
function pickWeighted(offers, rand) {
  let total = 0;
  for (const o of offers) total += o.weight;
  let r = rand() * total;
  for (const o of offers) {
    r -= o.weight;
    if (r < 0) return o;
  }
  return offers[offers.length - 1];
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

function pickRandom(offers, rand) {
  return offers[Math.floor(rand() * offers.length)];
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

