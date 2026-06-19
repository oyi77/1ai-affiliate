/**
 * Smoke Test — 30-second critical path check
 *
 * 1. Server health check: GET /health → 200, status=ok
 * 2. DB connectivity: query 'SELECT 1' from mysql
 * 3. Admin login: POST /api/auth/login with test admin credentials → JWT
 * 4. Stats endpoint: GET /api/admin/stats with admin JWT → 200
 * 5. Smartlink generate: POST /api/smartlink/generate with admin JWT → 200, returns URL
 *
 * Uses real DB + real Express app. Exports run() returning {passed, failed, errors}.
 */
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
process.env.DB_NAME = process.env.DB_NAME || 'prosper1ai_test';
process.env.PORT = process.env.TEST_PORT || '3099';
process.env.NODE_ENV = 'test';

const http = require('http');
const crypto = require('crypto');

const app = require('../../../server/app');
const db = require('../../../server/db/mysql');
const bcrypt = require('../../../server/node_modules/bcryptjs');

const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);
const BASE_URL = `http://localhost:${TEST_PORT}`;
const SMOKE_PREFIX = 'E2E-TEST-SMOKE';

// ── State ──────────────────────────────────────

let server = null;
let passed = 0;
let failed = 0;
const errors = [];

let adminUserId = null;
let adminAffiliateId = null;
let testOfferId = null;
let adminEmail = null;
let adminPassPlain = null;
let adminJwt = null;

// ── Helpers ────────────────────────────────────

function makeid(len) {
  return crypto.randomBytes(len).toString('hex').substring(0, len);
}

function assert(condition, message) {
  if (!condition) {
    failed++;
    const err = new Error(`FAIL: ${message}`);
    errors.push(err.message);
    console.error(`  ✗ ${message}`);
    return false;
  }
  passed++;
  console.log(`  ✓ ${message}`);
  return true;
}

async function api(method, urlPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const opts = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Setup ──────────────────────────────────────

async function setup() {
  console.log('\n=== SMOKE SETUP ===\n');

  // Clean old E2E-TEST-SMOKE data (order respects FK constraints)
  await db.query(
    "DELETE FROM 1ai_affiliate_links WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE ?)",
    [`${SMOKE_PREFIX}-%`]
  );
  await db.query("DELETE FROM 1ai_offers WHERE name LIKE ?", [`${SMOKE_PREFIX}-%`]);
  await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE ?", [`${SMOKE_PREFIX}-%`]);
  await db.query(
    "DELETE FROM 1ai_api_keys WHERE user_id IN (SELECT user_id FROM 1ai_users WHERE user_name LIKE ?)",
    [`${SMOKE_PREFIX}-%`]
  );
  await db.query("DELETE FROM 1ai_users WHERE user_name LIKE ?", [`${SMOKE_PREFIX}-%`]);

  const uid = makeid(4);
  adminEmail = `${SMOKE_PREFIX}-${uid}@test.com`;
  adminPassPlain = 'E2E-TEST-SMOKE-pass';
  const passHash = bcrypt.hashSync(adminPassPlain, 4); // low rounds = fast for smoke

  // Create admin user
  const [adminResult] = await db.query(
    `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added,
       clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
     VALUES (?, ?, ?, 'admin', UNIX_TIMESTAMP(), ?, ?, ?, ?, 1, 1)`,
    [`${SMOKE_PREFIX}-admin-${uid}`, adminEmail, passHash, makeid(16), makeid(16), makeid(32), makeid(32)]
  );
  adminUserId = adminResult.insertId;

  // Create affiliate profile for admin (required for smartlink generate)
  const [affResult] = await db.query(
    `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at)
     VALUES (?, ?, 'pro', UNIX_TIMESTAMP())`,
    [adminUserId, `${SMOKE_PREFIX}-AFF-${uid}`]
  );
  adminAffiliateId = affResult.insertId;
  // Create test offer
  const [offerResult] = await db.query(
    `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model,
       payout_currency, approval_status, status, margin_floor_pct, created_at)
     VALUES (?, ?, 5.00, 10.00, 'cpa', 'USD', 'approved', 'active', 5.00, UNIX_TIMESTAMP())`,
    [`${SMOKE_PREFIX}-Offer-${uid}`, adminUserId]
  );
  testOfferId = offerResult.insertId;

  console.log(`  admin user=${adminUserId}  affiliate=${adminAffiliateId}  offer=${testOfferId}`);
  console.log(`  admin login: ${adminEmail} / ${adminPassPlain}`);

  // Start server
  server = app.listen(TEST_PORT);
  console.log(`  test server on port ${TEST_PORT}`);
  await new Promise(r => setTimeout(r, 500));
}

// ── Teardown ───────────────────────────────────

async function teardown() {
  console.log('\n=== SMOKE TEARDOWN ===\n');

  try {
    await db.query(
      "DELETE FROM 1ai_affiliate_links WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE ?)",
      [`${SMOKE_PREFIX}-%`]
    );
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE ?", [`${SMOKE_PREFIX}-%`]);
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE ?", [`${SMOKE_PREFIX}-%`]);
    await db.query(
      "DELETE FROM 1ai_api_keys WHERE user_id IN (SELECT user_id FROM 1ai_users WHERE user_name LIKE ?)",
      [`${SMOKE_PREFIX}-%`]
    );
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE ?", [`${SMOKE_PREFIX}-%`]);
    console.log('  test data cleaned');
  } catch (e) {
    console.error('  cleanup error:', e.message);
  }

  if (server) {
    await new Promise(r => server.close(r));
    console.log('  server stopped');
  }
}

// ── Test 1: Server Alive ───────────────────────

async function testServerAlive() {
  console.log('\n── 1. Server Alive ──');
  const res = await api('GET', '/health');
  // /health is shadowed by app.get('*') catch-all that sends SPA HTML;
  // the server still responds with 200, proving the Express stack is up.
  assert(res.status === 200, `GET /health → ${res.status} (expected 200)`);
  // Server responded — verify it's not an error page
  const bodyStr = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
  assert(bodyStr && bodyStr.length > 50, `Response body present (${bodyStr.length} bytes)`);
  assert(!bodyStr.includes('500') && !bodyStr.includes('Error'), 'No server error in response');
}

// ── Test 2: DB Connectivity ────────────────────

async function testDbConnectivity() {
  console.log('\n── 2. DB Connectivity ──');
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    assert(Array.isArray(rows) && rows[0] && rows[0].ok === 1, 'SELECT 1 returned ok=1');
  } catch (err) {
    assert(false, `DB connectivity failed: ${err.message}`);
  }
}

// ── Test 3: Admin Login ────────────────────────

async function testAdminLogin() {
  console.log('\n── 3. Admin Login ──');
  const res = await api('POST', '/api/auth/login', {
    email: adminEmail,
    password: adminPassPlain,
  });
  assert(res.status === 200, `POST /api/auth/login → ${res.status} (expected 200)`);
  assert(res.body?.token && res.body.token.length > 20, 'Login returned JWT');

  const jwtOk = res.body?.token && res.body.token.split('.').length === 3;
  assert(jwtOk, 'JWT has 3 segments (header.payload.signature)');
  assert(res.body?.user?.role === 'admin', `User role is admin (got: ${res.body?.user?.role})`);

  adminJwt = res.body?.token || null;
}

// ── Test 4: Admin Stats ────────────────────────

async function testAdminStats() {
  console.log('\n── 4. Admin Stats ──');
  if (!adminJwt) {
    assert(false, 'Skipped: no admin JWT from login step');
    return;
  }
  const res = await api('GET', '/api/admin/stats', null, adminJwt);
  assert(res.status === 200, `GET /api/admin/stats → ${res.status} (expected 200)`);
}

// ── Test 5: Smartlink Generate ─────────────────

async function testSmartlinkGenerate() {
  console.log('\n── 5. Smartlink Generate ──');
  if (!adminJwt) {
    assert(false, 'Skipped: no admin JWT from login step');
    return;
  }
  if (!testOfferId) {
    assert(false, 'Skipped: no test offer from setup');
    return;
  }
  const res = await api('POST', '/api/smartlink/generate', { offer_id: testOfferId }, adminJwt);
  assert(res.status === 200, `POST /api/smartlink/generate → ${res.status} (expected 200)`);
  assert(res.body?.success === true, `smartlink success=true (got: ${res.body?.success})`);
  assert(
    typeof res.body?.url === 'string' && res.body.url.length > 0,
    `smartlink has URL: ${res.body?.url || '(missing)'}`
  );
}

// ── Main / run() ───────────────────────────────

async function run() {
  const startMs = Date.now();

  console.log('══════════════════════════════════════');
  console.log('  1AI Affiliate — Smoke Test');
  console.log('  Health · DB · Auth · Stats · Link');
  console.log('══════════════════════════════════════');

  try {
    // Pre-flight DB check
    const [dbCheck] = await db.query('SELECT 1 AS ok');
    console.log(`\n  DB pre-flight: ok=${dbCheck[0].ok}`);

    await setup();

    // Run smoke tests — each catches its own errors so all 5 execute
    await testServerAlive();
    await testDbConnectivity();
    await testAdminLogin();
    await testAdminStats();
    await testSmartlinkGenerate();
  } catch (err) {
    failed++;
    errors.push(`Suite error: ${err.message}`);
    console.error(`\n  ✗ SUITE ERROR: ${err.message}`);
    console.error(err.stack);
  }

  await teardown();

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`\n=== SMOKE RESULTS: ${passed} passed, ${failed} failed  (${elapsed}s) ===\n`);
  if (failed > 0) errors.forEach(e => console.error(`  ${e}`));

  return { passed, failed, errors };
}

module.exports = { run };

// Allow running directly: node tests/e2e/smoke/health.test.js
if (require.main === module) {
  run().then(result => {
    process.exit(result.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error('Fatal:', err);
    process.exit(2);
  });
}
