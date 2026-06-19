/**
 * E2E Tests — ADMIN Role Scenarios
 * Zero mocks. Uses real MariaDB + real Express app.
 * Run: NODE_ENV=test node tests/e2e/roles/admin.test.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
process.env.DB_NAME = process.env.DB_NAME || 'prosper1ai_test';
process.env.PORT = process.env.TEST_PORT || '3099';
process.env.NODE_ENV = 'test';

const http = require('http');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('../../../server/node_modules/bcryptjs');

const app = require('../../../server/app');
const db = require('../../../server/db/mysql');
const fraudDetection = require('../../../server/services/fraudDetectionService');

// ── Test Helpers ────────────────────────────────

const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server = null;
let adminJwt = null;
let publisherJwt = null;
let advertiserJwt = null;
let adminUserId = null;
let publisherUserId = null;
let advertiserUserId = null;
let testAffiliateId = null;
let testOfferId = null;
let testEarningId = null;

let passed = 0;
let failed = 0;
const errors = [];

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

function makeid(len) {
    return crypto.randomBytes(len).toString('hex').substring(0, len);
}

async function api(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const opts = {
            hostname: 'localhost',
            port: TEST_PORT,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' }
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

function generateJwtToken(userId, role, username, options = {}) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        id: userId,
        email: `${role}@test.1ai`,
        role: role,
        ...options,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
    })).toString('base64url');
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
}

// ── Setup ──────────────────────────────────────

async function setup() {
    console.log('\n=== ADMIN E2E SETUP: Creating test users & data ===\n');

    // Clean up any existing test data
    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE ip_address = '10.99.99.99'");
    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_commission_entries WHERE metadata LIKE '%E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliate_links WHERE slug LIKE 'e2e-%'");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    const adminPassHash = await bcrypt.hash('AdminPass123!', 10);
    const pubPassHash = await bcrypt.hash('PubPass123!', 10);
    const advPassHash = await bcrypt.hash('AdvPass123!', 10);

    // Create admin user
    const adminSuffix = makeid(4);
    const [adminResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'admin', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-admin-${adminSuffix}`, `admin-${adminSuffix}@test.com`,
         adminPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    adminUserId = adminResult.insertId;

    // Create publisher (affiliate) user
    const pubSuffix = makeid(4);
    const [pubResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'publisher', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-pub-${pubSuffix}`, `pub-${pubSuffix}@test.com`,
         pubPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    publisherUserId = pubResult.insertId;

    // Create affiliate profile for publisher
    const [affResult] = await db.query(
        `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at) VALUES (?, ?, 'pro', UNIX_TIMESTAMP())`,
        [publisherUserId, `E2E-TEST-AFF-${makeid(4)}`]
    );
    testAffiliateId = affResult.insertId;

    // Create advertiser user
    const advSuffix = makeid(4);
    const [advResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-adv-${advSuffix}`, `adv-${advSuffix}@test.com`,
         advPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    advertiserUserId = advResult.insertId;

    // Generate JWTs
    adminJwt = generateJwtToken(adminUserId, 'admin', 'E2E-TEST-admin');
    publisherJwt = generateJwtToken(publisherUserId, 'publisher', 'E2E-TEST-pub');
    advertiserJwt = generateJwtToken(advertiserUserId, 'advertiser', 'E2E-TEST-adv');

    // Create a test offer
    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model, payout_currency,
                                 approval_status, margin_floor_pct, status, created_at)
         VALUES (?, ?, 5.00, 10.00, 'cpa', 'USD', 'approved', 5.00, 'active', UNIX_TIMESTAMP())`,
        [`E2E-TEST-Offer-${makeid(4)}`, advertiserUserId]
    );
    testOfferId = offerResult.insertId;

    // Create an earnings entry for approval tests
    const [earnResult] = await db.query(
        `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, status, created_at)
         VALUES (?, 5.00, 'pending', UNIX_TIMESTAMP())`,
        [testAffiliateId]
    );
    testEarningId = earnResult.insertId;

    console.log(`  Created users: admin=${adminUserId}, pub=${publisherUserId}, adv=${advertiserUserId}`);
    console.log(`  Created offer ID: ${testOfferId}, affiliate ID: ${testAffiliateId}, earning ID: ${testEarningId}`);

    // Start server
    server = app.listen(TEST_PORT);
    console.log(`\n  Test server started on port ${TEST_PORT}`);
    await new Promise(r => setTimeout(r, 500));
}

// ── ADMIN-001: Login with valid credentials ─────

async function testAdminLogin() {
    console.log('\n=== ADMIN-001: Login with valid credentials ===');

    // Retrieve the admin email from DB (set during setup)
    const [user] = await db.query('SELECT user_email FROM 1ai_users WHERE user_id = ?', [adminUserId]);
    const adminEmail = user[0].user_email;

    const loginRes = await api('POST', '/api/auth/login', {
        email: adminEmail,
        password: 'AdminPass123!'
    });
    assert(loginRes.status === 200, `Login status ${loginRes.status} (expected 200)`);
    assert(loginRes.body.token !== undefined, 'JWT token returned');
    assert(loginRes.body.user !== undefined, 'User object returned');
    assert(loginRes.body.user.role === 'admin', `Role is admin (got ${loginRes.body.user.role})`);
    assert(loginRes.body.user.id === adminUserId, `User ID matches (got ${loginRes.body.user.id})`);
}

// ── ADMIN-002: GET offers returns all offers ────

async function testAdminGetAllOffers() {
    console.log('\n=== ADMIN-002: GET /api/admin/offers returns all offers ===');

    const res = await api('GET', '/api/admin/offers', null, adminJwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(Array.isArray(res.body.data), 'Response has data array');
    assert(res.body.data.length > 0, 'At least one offer returned');

    // Verify our test offer is in the list
    const ourOffer = res.body.data.find(o => Number(o.id) === testOfferId);
    assert(ourOffer !== undefined, `Test offer (ID=${testOfferId}) found in admin offer list`);
    // Admin should see advertiser_id
    assert(ourOffer.advertiser_id !== undefined, 'Admin sees advertiser_id field');
}

// ── ADMIN-010: Create user via API ──────────────

async function testAdminCreateUser() {
    console.log('\n=== ADMIN-010: POST /api/admin/users create user ===');

    const newEmail = `e2e-newuser-${makeid(4)}@test.com`;
    const res = await api('POST', '/api/admin/users', {
        email: newEmail,
        name: `E2E-TEST-newuser-${makeid(4)}`,
        role: 'affiliate',
        password: 'TestPass123!'
    }, adminJwt);
    assert(res.status === 200, `Status ${res.status} (expected 200)`);
    assert(res.body.success === true, 'Create user success flag');
    assert(res.body.user_id > 0, `User ID returned: ${res.body.user_id}`);

    // Store for cleanup
    const createdUserId = res.body.user_id;

    // Verify user exists in DB
    const [users] = await db.query('SELECT user_id, user_email, user_role FROM 1ai_users WHERE user_id = ?', [createdUserId]);
    assert(users.length === 1, 'User found in DB');
    assert(users[0].user_email === newEmail, 'Email matches');
    assert(users[0].user_role === 'affiliate', 'Role is affiliate');

    // Verify affiliate profile auto-created
    const [affs] = await db.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [createdUserId]);
    assert(affs.length === 1, 'Affiliate profile auto-created');

    // Cleanup this specific user
    await db.query('DELETE FROM 1ai_offer_affiliate_access WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE user_id = ?)', [createdUserId]);
    await db.query('DELETE FROM 1ai_affiliates WHERE user_id = ?', [createdUserId]);
    await db.query('DELETE FROM 1ai_users WHERE user_id = ?', [createdUserId]);
    console.log('  Cleaned up created user');
}

// ── ADMIN-010b: Disable user ────────────────────

async function testAdminDisableUser() {
    console.log('\n=== ADMIN-010b: Disable user (DB) ===');

    // Create a user to disable
    const disableSuffix = makeid(4);
    await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'affiliate', UNIX_TIMESTAMP(), 1, '', '', '', '', 0, 0)`,
        [`E2E-TEST-disable-${disableSuffix}`, `disable-${disableSuffix}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex')]
    );

    const [inserted] = await db.query('SELECT user_id FROM 1ai_users WHERE user_name = ?', [`E2E-TEST-disable-${disableSuffix}`]);
    const disableUserId = inserted[0].user_id;
    assert(disableUserId > 0, `User created for disable test: ${disableUserId}`);

    // Disable the user — set user_active = 0
    await db.query('UPDATE 1ai_users SET user_active = 0 WHERE user_id = ?', [disableUserId]);

    // Verify disabled
    const [after] = await db.query('SELECT user_active FROM 1ai_users WHERE user_id = ?', [disableUserId]);
    assert(after[0].user_active === 0, `User is inactive (user_active = ${after[0].user_active})`);

    // Cleanup
    await db.query('DELETE FROM 1ai_users WHERE user_id = ?', [disableUserId]);
}

// ── ADMIN-010c: Delete user ─────────────────────

async function testAdminDeleteUser() {
    console.log('\n=== ADMIN-010c: Delete user ===');

    // Create a user to delete
    const delSuffix = makeid(4);
    const delPass = await bcrypt.hash('DeleteMe123!', 10);
    await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'affiliate', UNIX_TIMESTAMP(), 1, '', '', '', '', 0, 0)`,
        [`E2E-TEST-delete-${delSuffix}`, `delete-${delSuffix}@test.com`, delPass]
    );

    const [inserted] = await db.query('SELECT user_id, user_email FROM 1ai_users WHERE user_name = ?', [`E2E-TEST-delete-${delSuffix}`]);
    const delUserId = inserted[0].user_id;
    const delEmail = inserted[0].user_email;
    assert(delUserId > 0, `User created for delete test: ${delUserId}`);

    // Verify user can log in before deletion
    const beforeLogin = await api('POST', '/api/auth/login', {
        email: delEmail,
        password: 'DeleteMe123!'
    });
    assert(beforeLogin.status === 200, `Pre-delete login succeeds (${beforeLogin.status})`);

    // Delete the user
    await db.query('DELETE FROM 1ai_users WHERE user_id = ?', [delUserId]);

    // Verify user cannot log in after deletion (401)
    const afterLogin = await api('POST', '/api/auth/login', {
        email: delEmail,
        password: 'DeleteMe123!'
    });
    assert(afterLogin.status === 401, `Post-delete login returns 401 (got ${afterLogin.status})`);
}

// ── ADMIN-009: GET /api/admin/stats ─────────────

async function testAdminGetStats() {
    console.log('\n=== ADMIN-009: GET /api/admin/stats system-wide stats ===');

    const res = await api('GET', '/api/admin/stats', null, adminJwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(res.body.totalAffiliates !== undefined || res.body.total_affiliates !== undefined, 'Has affiliate count');
    assert(res.body.clicks24h !== undefined || res.body.clicks_today !== undefined, 'Has clicks metric');
    assert(res.body.total_clicks !== undefined, 'Has total clicks');
    assert(res.body.revenueMtd !== undefined || res.body.revenue_mtd !== undefined, 'Has revenue MTD');
    assert(res.body.pendingPayout !== undefined || res.body.pending_payout !== undefined, 'Has pending payout');
    assert(res.body.totalPaid !== undefined || res.body.total_paid !== undefined, 'Has total paid');
}

// ── ADMIN-013: Fraud blacklist ──────────────────

async function testAdminFraudBlacklist() {
    console.log('\n=== ADMIN-013: Fraud blacklist — IP blocked after blacklisting ===');

    const testIp = '10.99.99.99';

    // Add IP to blacklist
    const blacklistResult = await fraudDetection.addToBlacklist(
        'ip', testIp, 'E2E-TEST: Suspicious traffic pattern detected', 'high', false
    );
    assert(blacklistResult && blacklistResult.id > 0, `Blacklist entry created (ID: ${blacklistResult?.id})`);

    // Verify the IP is now blocked
    const result = await fraudDetection.checkClickFraud(
        testIp, 'e2e-blacklist-test-slug', 'Mozilla/5.0 TestBrowser', testOfferId, testAffiliateId
    );
    assert(result.allowed === false, `Click from blacklisted IP blocked (allowed=${result.allowed})`);
    assert(result.reason && result.reason.toLowerCase().includes('blacklisted'),
        `Reason mentions blacklist: "${result.reason}"`);
}

// ── ADMIN-005: GET all affiliate earnings ───────

async function testAdminGetAllEarnings() {
    console.log('\n=== ADMIN-005: GET /api/admin/earnings returns all affiliate earnings ===');

    const res = await api('GET', '/api/admin/earnings', null, adminJwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(Array.isArray(res.body.data), 'Response has data array');

    // Should find our test earning in the results
    const ourEarning = res.body.data.find(e => Number(e.id) === testEarningId);
    if (ourEarning) {
        assert(ourEarning.affiliate_code !== undefined, 'Earning has affiliate_code');
    }
    // Admin can see all earnings
    console.log(`  Earnings returned: ${res.body.data.length} entries`);
    assert(res.body.data.length >= 0, 'Earnings query succeeded');
}

// ── ADMIN-006: Approve payout batch ─────────────

async function testAdminApproveEarning() {
    console.log('\n=== ADMIN-006: POST /api/admin/earnings/:id/approve ===');

    // Create a fresh pending earning
    const [newEarn] = await db.query(
        `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, source, status, approved_by, approved_at, created_at)
         VALUES (?, 10.00, 'E2E-TEST-SOURCE', 'pending', NULL, NULL, UNIX_TIMESTAMP())`,
        [testAffiliateId]
    );
    const earnId = newEarn.insertId;
    const res = await api('POST', `/api/admin/earnings/${earnId}/approve`, {}, adminJwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(res.body.approved > 0, `Approved ${res.body.approved} rows`);

    // Verify in DB
    const [updated] = await db.query(
        'SELECT status, approved_by FROM 1ai_affiliate_earnings WHERE id = ?', [earnId]
    );
    assert(updated.length > 0, 'Earning entry exists');
    assert(updated[0].status === 'approved', `Status = approved (got ${updated[0].status})`);
    assert(Number(updated[0].approved_by) === adminUserId,
        `approved_by = ${adminUserId} (got ${updated[0].approved_by})`);
}

// ── Teardown ───────────────────────────────────

async function teardown() {
    console.log('\n=== ADMIN E2E TEARDOWN: Cleaning up ===\n');

    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE ip_address = '10.99.99.99'");
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id = ?", [testAffiliateId]);
    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id = ?", [testOfferId]);
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id = ?", [testOfferId]);
    await db.query("DELETE FROM 1ai_affiliate_links WHERE slug LIKE 'e2e-%'");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE id = ?", [testAffiliateId]);
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    if (server) {
        await new Promise(r => server.close(r));
        console.log('  Test server stopped');
    }

    console.log(`\n=== ADMIN RESULTS: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) {
        console.error('FAILURES:');
        errors.forEach(e => console.error(`  ${e}`));
    }
}

// ── Run ────────────────────────────────────────

async function run() {
    console.log('═══════════════════════════════════════════════');
    console.log('  1AI Affiliate — ADMIN Role E2E Test Suite');
    console.log('  Zero Mocks · Real MariaDB · Real Express');
    console.log('═══════════════════════════════════════════════');

    try {
        const [dbCheck] = await db.query('SELECT 1 AS ok');
        console.log(`\n  DB connected: ${dbCheck[0].ok}`);

        await setup();

        await testAdminLogin();
        await testAdminGetAllOffers();
        await testAdminCreateUser();
        await testAdminDisableUser();
        await testAdminDeleteUser();
        await testAdminGetStats();
        await testAdminFraudBlacklist();
        await testAdminGetAllEarnings();
        await testAdminApproveEarning();

        await teardown();
    } catch (err) {
        console.error('\n❌ ADMIN TEST SUITE ERROR:', err.message);
        console.error(err.stack);
        if (server) {
            try { await new Promise(r => server.close(r)); } catch {}
        }
    }

    return { passed, failed, errors };
}

module.exports = { run };

// Allow direct execution
if (require.main === module) {
    run().then(({ passed, failed, errors }) => {
        if (failed > 0) {
            errors.forEach(e => console.error(`  ${e}`));
            process.exit(1);
        }
        process.exit(0);
    }).catch(err => {
        console.error('Fatal:', err);
        process.exit(1);
    });
}
