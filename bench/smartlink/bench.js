'use strict';

/**
 * Autoresearch benchmark: smartlink routing throughput + correctness.
 *
 * Primary metric: routing throughput (ops/sec) — the per-click hot path that
 *   determines how many concurrent clicks/second the platform can attribute.
 * Secondary:   rule-eval correctness (self-check must pass or exit non-zero).
 *
 * Deterministic: workload is seeded; no network, no clock-of-day, no DB.
 */

const { buildEngine, evaluateGeoRules, evaluateDeviceRules, evaluateVisitorRules, pickWeighted } = require('./engine');

// ── Deterministic workload generation ──────────────────────────────────────

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNTRIES = ['ID', 'MY', 'US', 'SG', 'PH', 'GB', 'JP', 'BR'];
const DEVICES = ['mobile', 'desktop', 'tablet', 'unknown'];
const ISPS = ['telkomsel', 'singtel', 'vodafone', 'comcast', 'unknown'];
const CONNS = ['residential', 'datacenter', 'mobile', 'unknown'];

function buildWorkload(n, seed) {
  const r = mulberry32(seed);
  const slugs = [];
  const strategies = ['weighted', 'random', 'priority', 'roundrobin', 'fallback'];
  for (let i = 0; i < 64; i++) {
    const g = r();
    slugs.push({
      id: 's' + i,
      geoRules: g < 0.4 ? JSON.stringify({ match: 'include', countries: ['ID', 'MY'] }) :
                 g < 0.7 ? JSON.stringify({ match: 'exclude', countries: ['US'] }) : null,
      deviceRules: r() < 0.5 ? JSON.stringify({ match: 'include', devices: ['mobile', 'desktop'] }) : null,
      visitorRules: r() < 0.5 ? JSON.stringify({ match: 'geo', countries: ['ID', 'PH'] }) : null,
      strategy: strategies[i % strategies.length],
      fallbackId: i % 8,
    });
  }
  const offers = [];
  for (let i = 0; i < 24; i++) offers.push({ id: i, weight: 1 + (i % 5), priority: i });

  const reqs = new Array(n);
  for (let i = 0; i < n; i++) {
    const sidx = Math.floor(r() * slugs.length);
    reqs[i] = {
      slug: slugs[sidx],
      ctx: {
        country: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
        device: DEVICES[Math.floor(r() * DEVICES.length)],
        isp: ISPS[Math.floor(r() * ISPS.length)],
        connection: CONNS[Math.floor(r() * CONNS.length)],
      },
    };
  }
  return { slugs, offers, reqs };
}

// ── Semantic self-check (must pass or we declare a broken optimization) ────

function selfCheck() {
  let ok = true;
  const fail = (m) => { ok = false; process.stderr.write('SELFCHECK FAIL: ' + m + '\n'); };

  // geo include/exclude
  if (!evaluateGeoRules(JSON.stringify({ match: 'include', countries: ['ID'] }), 'ID')) fail('geo include ID');
  if (evaluateGeoRules(JSON.stringify({ match: 'include', countries: ['ID'] }), 'US')) fail('geo include US blocked');
  if (evaluateGeoRules(JSON.stringify({ match: 'exclude', countries: ['US'] }), 'US')) fail('geo exclude US blocked');
  if (!evaluateGeoRules(JSON.stringify({ match: 'exclude', countries: ['US'] }), 'ID')) fail('geo exclude ID pass');

  // device
  if (!evaluateDeviceRules(JSON.stringify({ match: 'include', devices: ['mobile'] }), 'mobile')) fail('device include mobile');
  if (evaluateDeviceRules(JSON.stringify({ match: 'include', devices: ['mobile'] }), 'desktop')) fail('device include desktop blocked');

  // visitor isp contains
  if (!evaluateVisitorRules(JSON.stringify({ match: 'isp', providers: ['telkomsel'] }), { isp: 'PT telkomsel' })) fail('visitor isp contains');

  // weighted selection respects weights (heaviest should dominate)
  const r = mulberry32(42);
  let big = 0, small = 0;
  const woffers = [{ id: 'big', weight: 99 }, { id: 'small', weight: 1 }];
  for (let i = 0; i < 5000; i++) {
    const p = pickWeighted(woffers, r);
    if (p.id === 'big') big++; else small++;
  }
  if (big < small) fail('weighted favors heavier offer');

  return ok;
}

// ── Main benchmark ────────────────────────────────────────────────────────

function main() {
  const N = parseInt(process.env.BENCH_N || '120000', 10);
  const WARM = parseInt(process.env.BENCH_WARM || '5000', 10);

  if (!selfCheck()) {
    process.stderr.write('Self-check failed — engine semantics broken.\n');
    process.exit(2);
  }

  const wl = buildWorkload(N + WARM, 12345);
  const engine = buildEngine({ offers: wl.offers, slugs: wl.slugs, seed: 999 });

  // warmup (excluded from timing)
  for (let i = 0; i < WARM; i++) {
    const req = wl.reqs[i];
    engine.route(req.slug, req.ctx);
  }

  const start = process.hrtime.bigint();
  let selected = 0;
  for (let i = WARM; i < N + WARM; i++) {
    const req = wl.reqs[i];
    const o = engine.route(req.slug, req.ctx);
    if (o) selected += o.id; // touch to prevent dead-code elimination
  }
  const end = process.hrtime.bigint();

  const ns = Number(end - start);
  const secs = ns / 1e9;
  const ops = N / secs;

  // determinism + sanity: selected must be stable across runs with same seed
  console.log('METRIC throughput_ops=' + Math.round(ops));
  console.log('METRIC elapsed_sec=' + secs.toFixed(4));
  console.log('METRIC routed=' + N);
  console.log('METRIC selection_checksum=' + (selected >>> 0));
  console.log('METRIC selfcheck=1');
  process.exit(0);
}

main();
