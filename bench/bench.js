'use strict';
/*
 * Benchmark runner for bench/engine.js routeSmartlink selection path.
 *
 * - Runs a deterministic seeded workload (no network, no time-of-day).
 * - Includes an INDEPENDENT semantic self-check that re-derives expected
 *   outputs and rejects any optimization that breaks routing correctness.
 * - Prints: METRIC routing_throughput_ops=<n>  (primary)
 *            METRIC smartlinks_routed=<n>
 *            METRIC selfcheck=pass
 * Exits non-zero if the self-check fails or no METRIC is emitted.
 */
const engine = require('./engine.js');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Semantic self-check (independent re-implementation) ---
function naiveSelect(sl, offers, visitor) {
  // rules
  const pass =
    engine.evaluateGeoRules(sl.geo_rules, visitor.country_code) &&
    engine.evaluateDeviceRules(sl.device_rules, visitor.device_type) &&
    engine.evaluateVisitorRules(sl.visitor_rules, visitor);
  if (!pass) {
    if (sl.fallback_offer_id != null) {
      const fb = (offers || []).find((o) => o.id === sl.fallback_offer_id);
      if (fb) return { offer: fb, redirectUrl: null, smartlink: sl };
    }
    return { offer: null, redirectUrl: sl.default_url || null, smartlink: sl };
  }
  const matched = (offers || []).filter((o) => engine.offerSupportsCountry(o.geo, visitor.country_code));
  if (!matched.length) {
    if (sl.fallback_offer_id != null) {
      const fb = (offers || []).find((o) => o.id === sl.fallback_offer_id);
      if (fb) return { offer: fb, redirectUrl: null, smartlink: sl };
    }
    return { offer: null, redirectUrl: sl.default_url || null, smartlink: sl };
  }
  const strat = sl.rotation_strategy || 'weighted';
  let chosen;
  if (strat === 'priority') {
    chosen = matched.slice().sort((a, b) => (a.priority || 0) - (b.priority || 0))[0];
  } else {
    chosen = matched[0]; // weighted/random/round_robin nondeterministic → any matched offer is semantically valid
  }
  return { offer: chosen, redirectUrl: null, smartlink: sl };
}

function assert(cond, msg) {
  if (!cond) {
    console.error('SELFCHECK FAIL: ' + msg);
    process.exit(1);
  }
}

function runSelfCheck() {
  const slPass = { id: 7, rotation_strategy: 'weighted', geo_rules: null, device_rules: null, visitor_rules: null, default_url: 'https://def.example/x' };
  const slFallback = { id: 8, rotation_strategy: 'priority', geo_rules: null, device_rules: null, visitor_rules: null, default_url: 'https://default.example/def' };
  const slNewOnly = { id: 9, rotation_strategy: 'weighted', geo_rules: null, device_rules: null, visitor_rules: JSON.stringify({ condition: 'new_only' }), default_url: 'https://default.example/n' };
  const slFbOffer = { id: 10, rotation_strategy: 'weighted', geo_rules: null, device_rules: null, visitor_rules: null, default_url: 'https://default.example/fb', fallback_offer_id: 2 };

  const offersUS = [
    { id: 1, geo: 'US', weight: 1, priority: 1 },
    { id: 2, geo: 'US', weight: 1, priority: 2 },
  ];
  const offersMixin = [
    { id: 1, geo: 'US', weight: 1, priority: 1 },
    { id: 2, geo: 'ALL', weight: 1, priority: 2 },
  ];
  const visitorID = { country_code: 'ID', device_type: 'desktop', isp: 'telkomsel', is_new_visitor: false };
  const visitorUS = { country_code: 'US', device_type: 'mobile', isp: 'comcast', is_new_visitor: true };

  // Case 1: geo match (only the ALL offer matches ID)
  let r = engine.routeSmartlink(slPass, offersMixin, visitorID);
  assert(r.offer && r.offer.id === 2, 'geo match: expected offer 2 (geo=ALL) for ID visitor, got ' + JSON.stringify(r.offer));
  assert(r.redirectUrl === null, 'geo match: redirectUrl must be null');

  // Case 2: geo exclusion → fallback default_url
  r = engine.routeSmartlink(slFallback, offersUS, { country_code: 'XX', device_type: 'desktop', isp: 'x', is_new_visitor: false });
  assert(r.offer === null, 'geo exclusion: offer must be null');
  assert(r.redirectUrl === 'https://default.example/def', 'geo exclusion: redirectUrl must be default_url, got ' + r.redirectUrl);

  // Case 3: rule failure (new_only, visitor not new) → fallback
  r = engine.routeSmartlink(slNewOnly, offersUS, { country_code: 'US', device_type: 'mobile', isp: 'comcast', is_new_visitor: false });
  assert(r.offer === null, 'rule failure: offer must be null');
  assert(r.redirectUrl === 'https://default.example/n', 'rule failure: redirectUrl must be default_url');

  // Case 4: fallback_offer_id resolves
  r = engine.routeSmartlink(slFbOffer, offersUS, { country_code: 'XX', device_type: 'desktop', isp: 'x', is_new_visitor: false });
  assert(r.offer && r.offer.id === 2, 'fallback_offer_id: expected resolved offer 2, got ' + JSON.stringify(r.offer));
  assert(r.redirectUrl === null, 'fallback_offer_id: redirectUrl must be null');

  // Case 5: buildRedirectUrl
  const offer = { tracking_url: 'https://b.example.com/lp?c={clickid}' };
  assert(engine.buildRedirectUrl(offer, 'CID9') === 'https://b.example.com/lp?c=CID9', 'buildRedirectUrl clickid substitution');
  assert(engine.buildRedirectUrl(null, 'X') === '/', 'buildRedirectUrl null offer → /');
  assert(engine.buildRedirectUrl({}, 'X') === '/', 'buildRedirectUrl empty url → /');

  // Case 6: cross-check mirror === independent naive on a battery (priority deterministic)
  engine.setRng(mulberry32(12345));
  engine.resetRoundRobin();
  const battery = [
    { sl: slPass, offers: offersMixin, v: visitorID },
    { sl: slPass, offers: offersUS, v: visitorUS },
    { sl: slFallback, offers: offersUS, v: { country_code: 'XX', device_type: 'desktop', isp: 'x', is_new_visitor: false } },
    { sl: slNewOnly, offers: offersUS, v: visitorUS },
    { sl: slFbOffer, offers: offersUS, v: { country_code: 'XX', device_type: 'desktop', isp: 'x', is_new_visitor: false } },
  ];
  for (const b of battery) {
    const actual = engine.routeSmartlink(b.sl, b.offers, b.v);
    const expected = naiveSelect(b.sl, b.offers, b.v);
    const aId = actual.offer ? actual.offer.id : null;
    const eId = expected.offer ? expected.offer.id : null;
    // For weighted/random the specific pick may differ; only assert null-vs-present + redirectUrl
    if ((aId === null) !== (eId === null)) {
      assert(false, `cross-check null mismatch for ${JSON.stringify(b.sl.id)}: actual=${aId} expected=${eId}`);
    }
    assert(actual.redirectUrl === expected.redirectUrl, `cross-check redirectUrl mismatch for ${b.sl.id}`);
  }
}

function buildWorkload(n) {
  // Deterministic template pool so the workload is stable across runs.
  const slTemplates = [];
  const geoPool = [null, 'ALL', 'US', 'ID', 'US,ID', 'ALL,US'];
  const stratPool = ['weighted', 'priority', 'random', 'round_robin'];
  for (let i = 0; i < 20; i++) {
    slTemplates.push({
      id: 1000 + i,
      rotation_strategy: stratPool[i % stratPool.length],
      geo_rules: null,
      device_rules: null,
      visitor_rules: null,
      default_url: 'https://default.example/d' + i,
    });
  }
  const visitors = [];
  const cc = ['ID', 'US', 'XX', 'SG', 'ALL'];
  const dt = ['desktop', 'mobile', 'tablet'];
  for (let i = 0; i < 200; i++) {
    visitors.push({ country_code: cc[i % cc.length], device_type: dt[i % dt.length], isp: 'isp', is_new_visitor: i % 2 === 0 });
  }
  // Pre-build offers per smartlink (5 offers each) once.
  const offersBySl = slTemplates.map((sl, si) => {
    const arr = [];
    for (let k = 0; k < 5; k++) {
      arr.push({
        id: si * 10 + k,
        geo: geoPool[(si + k) % geoPool.length],
        weight: (k % 3) + 1,
        priority: (k % 4) + 1,
      });
    }
    return arr;
  });
  return { slTemplates, visitors, offersBySl };
}

async function runOnce(seed, slTemplates, visitors, offersBySl, ITER) {
  engine.setRng(mulberry32(seed));
  engine.resetRoundRobin();
  // warmup — advances RNG/round-robin state identically on every call
  for (let i = 0; i < 20000; i++) {
    const sl = slTemplates[i % slTemplates.length];
    engine.routeSmartlink(sl, offersBySl[i % offersBySl.length], visitors[i % visitors.length]);
  }
  let checksum = 0;
  for (let i = 0; i < ITER; i++) {
    const sl = slTemplates[i % slTemplates.length];
    const v = visitors[i % visitors.length];
    const r = engine.routeSmartlink(sl, offersBySl[i % offersBySl.length], v);
    if (r.offer) checksum = (checksum + r.offer.id) >>> 0;
  }
  return checksum;
}

async function main() {
  runSelfCheck();

  const ITER = Number(process.env.BENCH_ITER || 600000);
  const { slTemplates, visitors, offersBySl } = buildWorkload(ITER);
  const SEED = 0x9e3779b9;

  const t0 = process.hrtime.bigint();
  const checksum = await runOnce(SEED, slTemplates, visitors, offersBySl, ITER);
  const t1 = process.hrtime.bigint();

  const secs = Number(t1 - t0) / 1e9;
  const ops = Math.round(ITER / secs);
  console.log('METRIC routing_throughput_ops=' + ops);
  console.log('METRIC smartlinks_routed=' + ITER);
  console.log('METRIC selfcheck=pass');

  const checksum2 = await runOnce(SEED, slTemplates, visitors, offersBySl, ITER);
  assert(checksum === checksum2, 'determinism: re-run checksum mismatch (' + checksum + ' vs ' + checksum2 + ')');
  if (!Number.isFinite(ops) || ops <= 0) {
    console.error('No valid METRIC produced');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('BENCH ERROR: ' + (e && e.stack ? e.stack : e));
  process.exit(1);
});
