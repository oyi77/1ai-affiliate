'use strict';
// Engine-only profiler: measures routeSmartlink selection cost WITHOUT the
// benchmark harness `await` (so we see pure engine hot-path time).
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

function buildWorkload() {
  const slTemplates = [];
  const geoPool = [null, 'ALL', 'US', 'ID', 'US,ID', 'ALL,US'];
  const stratPool = ['weighted', 'priority', 'random', 'round_robin'];
  for (let i = 0; i < 20; i++) {
    slTemplates.push({
      id: 1000 + i,
      rotation_strategy: stratPool[i % stratPool.length],
      geo_rules: null, device_rules: null, visitor_rules: null,
      default_url: 'https://default.example/d' + i,
    });
  }
  const visitors = [];
  const cc = ['ID', 'US', 'XX', 'SG', 'ALL'];
  const dt = ['desktop', 'mobile', 'tablet'];
  for (let i = 0; i < 200; i++) {
    visitors.push({ country_code: cc[i % cc.length], device_type: dt[i % dt.length], isp: 'isp', is_new_visitor: i % 2 === 0 });
  }
  const offersBySl = slTemplates.map((sl, si) => {
    const arr = [];
    for (let k = 0; k < 5; k++) {
      arr.push({ id: si * 10 + k, geo: geoPool[(si + k) % geoPool.length], weight: (k % 3) + 1, priority: (k % 4) + 1 });
    }
    return arr;
  });
  return { slTemplates, visitors, offersBySl };
}

const { slTemplates, visitors, offersBySl } = buildWorkload();
const ITER = 600000;
const SEED = 0x9e3779b9;

function runOnceSync() {
  engine.setRng(mulberry32(SEED));
  engine.resetRoundRobin();
  for (let i = 0; i < 20000; i++) {
    const sl = slTemplates[i % slTemplates.length];
    engine.routeSmartlink(sl, offersBySl[i % offersBySl.length], visitors[i % visitors.length]);
  }
  let checksum = 0;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < ITER; i++) {
    const sl = slTemplates[i % slTemplates.length];
    const v = visitors[i % visitors.length];
    const r = engine.routeSmartlink(sl, offersBySl[i % offersBySl.length], v); // NO await
    if (r.offer) checksum = (checksum + r.offer.id) >>> 0;
  }
  const t1 = process.hrtime.bigint();
  return { secs: Number(t1 - t0) / 1e9, checksum };
}

// 3 bands for noise estimate
for (let b = 0; b < 3; b++) {
  const { secs, checksum } = runOnceSync();
  console.log(`band${b}: sync_engine_ops=${Math.round(ITER / secs)}  checksum=${checksum}`);
}
console.log('dominant note: compare to benchmark 8.9M (which awaits). If sync >> 8.9M, await is the cost.');
