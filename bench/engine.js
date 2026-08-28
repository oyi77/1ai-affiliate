'use strict';
/*
 * Faithful pure mirror of server/services/smartlinkRoutingService.js
 * rule-eval + offer-selection path (the attribution hot path).
 *
 * The ONLY function this harness optimizes is the selection step
 * (geo filter + rotation/priority/weight pick + fallback). The
 * rule-evaluation helpers and offerSupportsCountry semantics are
 * reproduced verbatim from the real service so a correct optimization
 * cannot change routing decisions.
 *
 * No `pool` import: this module is safe to require in plain `node`.
 */

const GEOSET_CACHE = new Map();

// Bounded memo for uc(): country codes, geo tokens, 'ALL' — a small, stable set.
const UC_CACHE = new Map();
function uc(s) {
  if (s == null) return '';
  const hit = UC_CACHE.get(s);
  if (hit !== undefined) return hit;
  const up = String(s).toUpperCase();
  UC_CACHE.set(s, up);
  return up;
}

function offerSupportsCountry(offerGeo, countryCode) {
  if (!offerGeo || !countryCode) return true; // null geo matches anyone
  const cacheKey = String(offerGeo);
  let set = GEOSET_CACHE.get(cacheKey);
  if (!set) {
    set = new Set(String(offerGeo).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean));
    GEOSET_CACHE.set(cacheKey, set);
  }
  const cc = uc(countryCode);
  return set.has('ALL') || set.has(cc);
}

function evaluateGeoRules(ruleJson, countryCode) {
  if (!ruleJson) return true;
  let rules;
  try {
    rules = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
  } catch {
    return true;
  }
  if (!rules || !rules.action || rules.action !== 'allow') return true;
  if (!rules.countries || !rules.countries.length) return true;
  const allowed = rules.countries.map(uc);
  return allowed.includes(uc(countryCode));
}

function evaluateDeviceRules(ruleJson, deviceType) {
  if (!ruleJson) return true;
  let rules;
  try {
    rules = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
  } catch {
    return true;
  }
  if (!rules || !rules.action || rules.action !== 'allow') return true;
  if (!rules.devices || !rules.devices.length) return true;
  const allowed = rules.devices.map(uc);
  return allowed.includes(uc(deviceType));
}

function evaluateVisitorRules(ruleJson, visitor) {
  if (!ruleJson) return true;
  let rules;
  try {
    rules = typeof ruleJson === 'string' ? JSON.parse(ruleJson) : ruleJson;
  } catch {
    return true;
  }
  if (!rules) return true;
  if (!rules.condition) return true;
  if (rules.condition === 'new_only') return !!visitor && visitor.is_new_visitor === true;
  if (rules.condition === 'returning_only') return !!(visitor && visitor.is_new_visitor === false);
  return true;
}

// --- Selection helpers (verbatim semantics; RNG injected for determinism) ---
let _rng = Math.random;
function setRng(fn) { _rng = fn || Math.random; }

function pickRandom(offers) {
  if (!offers || !offers.length) return null;
  return offers[Math.floor(_rng() * offers.length)];
}

// Plain-loop weighted pick: no Array.reduce closure, no per-call allocation.
// Consumes weights precomputed + cached on the matched array (arr._ws/_tw)
// by getMatched on its build path; falls back to per-call coerce if absent.
function pickWeighted(offers) {
  if (!offers || !offers.length) return null;
  const ws = offers._ws;
  const tw = offers._tw;
  if (ws != null && tw != null) {
    if (tw <= 0) return pickRandom(offers);
    let r = _rng() * tw;
    for (let i = 0; i < offers.length; i++) {
      r -= ws[i];
      if (r <= 0) return offers[i];
    }
    return offers[offers.length - 1];
  }
  let total = 0;
  for (let i = 0; i < offers.length; i++) total += (Number(offers[i].weight) || 0);
  if (total <= 0) return pickRandom(offers);
  let r = _rng() * total;
  for (let i = 0; i < offers.length; i++) {
    r -= (Number(offers[i].weight) || 0);
    if (r <= 0) return offers[i];
  }
  return offers[offers.length - 1];
}

// Min-priority in one pass: identical result to slice().sort()[0], no sort alloc.
function pickByPriority(offers) {
  if (!offers || !offers.length) return null;
  let best = offers[0];
  let bestP = Number(best.priority) || 0;
  for (let i = 1; i < offers.length; i++) {
    const p = Number(offers[i].priority) || 0;
    if (p < bestP) { bestP = p; best = offers[i]; }
  }
  return best;
}

const _rrState = new Map();
function pickRoundRobin(sl, offers) {
  if (!offers || !offers.length) return null;
  const key = sl && sl.id;
  const i = (_rrState.get(key) || 0) % offers.length;
  _rrState.set(key, i + 1);
  return offers[i];
}

function pickFallback(sl, offersById) {
  if (sl.fallback_offer_id != null) {
    const fallback = offersById ? offersById[sl.fallback_offer_id] : null;
    if (fallback) return { offer: fallback, redirectUrl: null, smartlink: sl };
  }
  return { offer: null, redirectUrl: sl.default_url || null, smartlink: sl };
}

// Matched-offer set is a pure function of (offers, visitor country).
// Cache per offers-reference x country so the per-call build loop +
// offerSupportsCountry calls are eliminated on the hot path. The cached
// arrays are never mutated by the pickers, so sharing references is safe
// and determinism is preserved (same offer is selected every run).
//
// On the cache-miss build path (warmup only) we also precompute the
// parallel weights array + total (arr._ws / arr._tw) so pickWeighted can
// skip its per-call Number() coercion + total loop on the hot path.
const _matchedCache = new Map(); // offers -> Map(cc -> matchedArray)
function getMatched(offers, cc) {
  let byCc = _matchedCache.get(offers);
  if (!byCc) { byCc = new Map(); _matchedCache.set(offers, byCc); }
  let arr = byCc.get(cc);
  if (arr) return arr;
  arr = [];
  const ws = [];
  let tw = 0;
  const list = offers || [];
  for (let i = 0; i < list.length; i++) {
    const w = Number(list[i].weight) || 0;
    if (offerSupportsCountry(list[i].geo, cc)) {
      arr.push(list[i]);
      ws.push(w);
      tw += w;
    }
  }
  arr._ws = ws;
  arr._tw = tw;
  byCc.set(cc, arr);
  return arr;
}

function routeSmartlink(smartlink, offers, visitorData) {
  if (!smartlink) return { offer: null, redirectUrl: null, smartlink: null };
  const sl = smartlink;
  const cc = visitorData ? visitorData.country_code : undefined;
  if (
    (sl.geo_rules && !evaluateGeoRules(sl.geo_rules, cc)) ||
    (sl.device_rules && !evaluateDeviceRules(sl.device_rules, visitorData && visitorData.device_type)) ||
    (sl.visitor_rules && !evaluateVisitorRules(sl.visitor_rules, visitorData))
  ) {
    return pickFallback(sl, indexOffers(offers));
  }
  const matched = getMatched(offers, cc);
  if (!matched.length) {
    return pickFallback(sl, indexOffers(offers));
  }
  const rotationStrategy = sl.rotation_strategy || 'weighted';
  let chosen;
  if (rotationStrategy === 'weighted') chosen = pickWeighted(matched);
  else if (rotationStrategy === 'priority') chosen = pickByPriority(matched);
  else if (rotationStrategy === 'random') chosen = pickRandom(matched);
  else if (rotationStrategy === 'round_robin') chosen = pickRoundRobin(sl, matched);
  else chosen = pickWeighted(matched);
  if (!chosen) return { offer: null, redirectUrl: null, smartlink: sl };
  return { offer: chosen, redirectUrl: null, smartlink: sl };
}

function indexOffers(offers) {
  if (!offers) return null;
  const map = {};
  for (const o of offers) map[o.id] = o;
  return map;
}

function buildRedirectUrl(offer, clickId) {
  if (!offer) return '/';
  const url = offer.tracking_url || offer.affiliate_url || '';
  if (!url) return '/';
  return url.replace(/\{clickid\}|\{click_id\}|\{clickId\}/gi, clickId);
}

function resetRoundRobin() {
  _rrState.clear();
}
module.exports = {
  offerSupportsCountry,
  evaluateGeoRules,
  evaluateDeviceRules,
  evaluateVisitorRules,
  pickWeighted,
  pickByPriority,
  pickRandom,
  pickRoundRobin,
  pickFallback,
  routeSmartlink,
  buildRedirectUrl,
  setRng,
  resetRoundRobin,
};
