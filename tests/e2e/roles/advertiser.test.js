/**
 * E2E Tests — ADVERTISER Role Scenarios
 * Zero mocks. Uses real MariaDB + real Express app.
 * Run: NODE_ENV=test node tests/e2e/roles/advertiser.test.js
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
process.env.DB_NAME = process.env.DB_NAME || 'prosper1ai_test';
process.env.PORT = process.env.TEST_PORT || '3099';
process.env.NODE_ENV = 'test';

const http = require('http');
const path = require('path');
const crypto = require('crypto');

const app = require('../../../server/app');
const db = require('../../../server/db/mysql');

// ── Test Helpers ────────────────────────────────

const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server = null;
let adminJwt = null;
let advertiserJwt = null;
let advertiser2Jwt = null;
let adminUserId = null;
let advertiserUserId = null;
let advertiser2UserId = null;
let omUserId = null;
let testOfferIds = [];

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
    console.log('\n=== ADVERTISER E2E SETUP: Creating test users & offers ===\n');

    // Clean up any existing test data
    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_links WHERE slug LIKE 'e2e-%'");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    // Create admin user
    const adminSuffix = makeid(4);
    const [adminResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'admin', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-admin-${adminSuffix}`, `admin-${adminSuffix}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    adminUserId = adminResult.insertId;

    // Create OM user (needed for approval tests)
    const [omResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'om', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-om-${makeid(4)}`, `om-${makeid(4)}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    omUserId = omResult.insertId;

    // Create advertiser 1
    const adv1Suffix = makeid(4);
    const [adv1Result] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-adv1-${adv1Suffix}`, `adv1-${adv1Suffix}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    advertiserUserId = adv1Result.insertId;

    // Create advertiser 2
    const adv2Suffix = makeid(4);
    const [adv2Result] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-adv2-${adv2Suffix}`, `adv2-${adv2Suffix}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    advertiser2UserId = adv2Result.insertId;

    // Generate JWTs
    adminJwt = generateJwtToken(adminUserId, 'admin', 'E2E-TEST-admin');
    advertiserJwt = generateJwtToken(advertiserUserId, 'advertiser', 'E2E-TEST-adv1');
    advertiser2Jwt = generateJwtToken(advertiser2UserId, 'advertiser', 'E2E-TEST-adv2');

    console.log(`  Created users: admin=${adminUserId}, om=${omUserId}, adv1=${advertiserUserId}, adv2=${advertiser2UserId}`);

    // Start server
    server = app.listen(TEST_PORT);
    console.log(`\n  Test server started on port ${TEST_PORT}`);
    await new Promise(r => setTimeout(r, 500));
}

// ── ADV-001: Create offer (advertiser) ──────────

async function testAdvCreateOffer() {
    console.log('\n=== ADV-001: POST /api/admin/offers as advertiser ===');

    const offerName = `E2E-TEST-AdvOffer-${makeid(4)}`;
    const res = await api('POST', '/api/admin/offers', {
        name: offerName,
        payout_amount: 7.50,
        network_payout: 15.00
    }, advertiserJwt);
    assert(res.status === 200, `Status ${res.status} (expected 200)`);
    assert(res.body.success === true, 'Offer creation success flag');
    assert(res.body.offer_id > 0, `Offer ID returned: ${res.body.offer_id}`);
    const offerId = res.body.offer_id;
    testOfferIds.push(offerId);

    // Verify in DB
    const [offers] = await db.query('SELECT id, name, advertiser_id, status FROM 1ai_offers WHERE id = ?', [offerId]);
    assert(offers.length === 1, 'Offer found in DB');
    assert(offers[0].name === offerName, 'Name matches');
    assert(Number(offers[0].advertiser_id) === advertiserUserId, 'advertiser_id set correctly');
    assert(offers[0].status === 'active', `Status = active (got ${offers[0].status})`);
}

// ── ADV-003: CPS payout model with revenue_share ─

async function testAdvCpsPayoutModel() {
    console.log('\n=== ADV-003: Offer with payout_model=cps, revenue_share_pct=30 ===');

    // Create via API, then update extra fields in DB
    const offerName = `E2E-TEST-CPS-${makeid(4)}`;
    const res = await api('POST', '/api/admin/offers', {
        name: offerName,
        payout_amount: 10.00,
        network_payout: 20.00
    }, advertiserJwt);
    assert(res.status === 200, `Status ${res.status}`);
    const offerId = res.body.offer_id;
    testOfferIds.push(offerId);

    // Set payout_model and revenue_share fields
    await db.query(
        `UPDATE 1ai_offers SET payout_model = 'cps', revenue_share_pct = 30.00 WHERE id = ?`,
        [offerId]
    );

    // Verify fields stored
    const [offers] = await db.query(
        'SELECT id, payout_model, revenue_share_pct FROM 1ai_offers WHERE id = ?', [offerId]
    );
    assert(offers.length === 1, 'Offer exists');
    assert(offers[0].payout_model === 'cps', `payout_model = cps (got ${offers[0].payout_model})`);
    assert(Number(offers[0].revenue_share_pct) === 30, `revenue_share_pct = 30 (got ${offers[0].revenue_share_pct})`);
}

// ── ADV-004: CPV payout model with view_duration ─

async function testAdvCpvViewDuration() {
    console.log('\n=== ADV-004: Offer with payout_model=cpv, view_duration stored ===');

    const offerName = `E2E-TEST-CPV-${makeid(4)}`;
    const res = await api('POST', '/api/admin/offers', {
        name: offerName,
        payout_amount: 0.50,
        network_payout: 1.00
    }, advertiserJwt);
    assert(res.status === 200, `Status ${res.status}`);
    const offerId = res.body.offer_id;
    testOfferIds.push(offerId);

    // Set payout_model and view_duration
    await db.query(
        `UPDATE 1ai_offers SET payout_model = 'cpv', view_duration = 30 WHERE id = ?`,
        [offerId]
    );

    // Verify
    const [offers] = await db.query(
        'SELECT id, payout_model, view_duration FROM 1ai_offers WHERE id = ?', [offerId]
    );
    assert(offers.length === 1, 'Offer exists');
    assert(offers[0].payout_model === 'cpv', `payout_model = cpv (got ${offers[0].payout_model})`);
    assert(Number(offers[0].view_duration) === 30, `view_duration = 30 (got ${offers[0].view_duration})`);
}

// ── ADV-005: Daily and monthly caps ─────────────

async function testAdvOfferCaps() {
    console.log('\n=== ADV-005: Offer with daily_cap and monthly_cap ===');

    const offerName = `E2E-TEST-CAPS-${makeid(4)}`;
    const res = await api('POST', '/api/admin/offers', {
        name: offerName,
        payout_amount: 3.00,
        network_payout: 6.00
    }, advertiserJwt);
    assert(res.status === 200, `Status ${res.status}`);
    const offerId = res.body.offer_id;
    testOfferIds.push(offerId);

    // Set cap fields
    await db.query(
        `UPDATE 1ai_offers SET cap_daily = 500, cap_monthly = 10000 WHERE id = ?`,
        [offerId]
    );

    // Verify
    const [offers] = await db.query(
        'SELECT id, cap_daily, cap_monthly FROM 1ai_offers WHERE id = ?', [offerId]
    );
    assert(offers.length === 1, 'Offer exists');
    assert(Number(offers[0].cap_daily) === 500, `cap_daily = 500 (got ${offers[0].cap_daily})`);
    assert(Number(offers[0].cap_monthly) === 10000, `cap_monthly = 10000 (got ${offers[0].cap_monthly})`);
}

// ── ADV-011: Advertiser2 cannot see advertiser1 offers ─

async function testAdvCannotSeeOtherOffers() {
    console.log('\n=== ADV-011: Advertiser2 cannot see advertiser1 offers ===');

    // Adv1 already created offers above — get one
    if (testOfferIds.length === 0) {
        console.log('  (skipped — no offers from previous tests)');
        return;
    }
    const adv1OfferId = testOfferIds[0];

    // Adv2 queries offers
    const res = await api('GET', '/api/admin/offers', null, advertiser2Jwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(Array.isArray(res.body.data), 'Response has data array');

    // Adv2 should NOT see Adv1's offer
    const foundAdv1Offer = res.body.data.find(o => Number(o.id) === adv1OfferId);
    assert(foundAdv1Offer === undefined, `Advertiser2 cannot see advertiser1 offer ID ${adv1OfferId}`);
}

// ── ADV-012: Advertiser cannot approve own offer ─

async function testAdvCannotApproveOwnOffer() {
    console.log('\n=== ADV-012: Advertiser cannot approve own offer (403) ===');

    // Create a pending offer owned by advertiser
    const offerName = `E2E-TEST-SelfApprove-${makeid(4)}`;
    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model, payout_currency,
                                 approval_status, margin_floor_pct, status, created_at)
         VALUES (?, ?, 3.00, 6.00, 'cpa', 'USD', 'pending', 5.00, 'paused', UNIX_TIMESTAMP())`,
        [offerName, advertiserUserId]
    );
    const offerId = offerResult.insertId;
    testOfferIds.push(offerId);

    // Advertiser tries to approve their own offer via OM endpoint
    const res = await api('POST', `/api/om/offers/${offerId}/approve`, {}, advertiserJwt);
    assert(res.status === 403 || res.status === 401,
        `Advertiser cannot approve own offer (got ${res.status}, expected 403 or 401)`);

    // Verify still pending
    const [offers] = await db.query('SELECT approval_status FROM 1ai_offers WHERE id = ?', [offerId]);
    assert(offers[0].approval_status === 'pending', `Offer still pending (status: ${offers[0].approval_status})`);
}

// ── ADV-006: Configure postback URL ─────────────

async function testAdvPostbackConfiguration() {
    console.log('\n=== ADV-006: POST /api/admin/offers/:id/postback configuration ===');

    // Create an offer first
    const offerName = `E2E-TEST-Postback-${makeid(4)}`;
    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model, payout_currency,
                                 approval_status, margin_floor_pct, status, created_at)
         VALUES (?, ?, 5.00, 10.00, 'cpa', 'USD', 'approved', 5.00, 'active', UNIX_TIMESTAMP())`,
        [offerName, advertiserUserId]
    );
    const offerId = offerResult.insertId;
    testOfferIds.push(offerId);

    // Set postback URL (requires admin token per route definition)
    const postbackUrl = 'https://example.com/postback?cid={click_id}&payout={payout}';
    const res = await api('POST', `/api/admin/offers/${offerId}/postback`, {
        postback_url: postbackUrl,
        postback_enabled: true,
        postback_method: 'POST',
        postback_timeout: 15,
        postback_retries: 3
    }, adminJwt);
    assert(res.status === 200, `Status ${res.status}`);
    assert(res.body.success === true, 'Postback config success flag');

    // Verify in DB
    const [offers] = await db.query(
        'SELECT postback_url, postback_enabled, postback_method, postback_retries FROM 1ai_offers WHERE id = ?',
        [offerId]
    );
    assert(offers.length === 1, 'Offer exists');
    assert(offers[0].postback_url === postbackUrl, 'postback_url stored correctly');
    assert(offers[0].postback_method === 'POST', 'postback_method = POST');
    assert(Number(offers[0].postback_retries) === 3, 'postback_retries = 3');
}

// ── ADV-014: Margin floor percent ───────────────

async function testAdvMarginFloorPct() {
    console.log('\n=== ADV-014: Offer with margin_floor_pct stored correctly ===');

    const offerName = `E2E-TEST-Margin-${makeid(4)}`;
    const res = await api('POST', '/api/admin/offers', {
        name: offerName,
        payout_amount: 6.00,
        network_payout: 10.00
    }, advertiserJwt);
    assert(res.status === 200, `Status ${res.status}`);
    const offerId = res.body.offer_id;
    testOfferIds.push(offerId);

    // Set margin_floor_pct
    const marginValue = 12.50;
    await db.query(
        `UPDATE 1ai_offers SET margin_floor_pct = ? WHERE id = ?`,
        [marginValue, offerId]
    );

    // Verify
    const [offers] = await db.query(
        'SELECT id, margin_floor_pct FROM 1ai_offers WHERE id = ?', [offerId]
    );
    assert(offers.length === 1, 'Offer exists');
    assert(Number(offers[0].margin_floor_pct) === marginValue,
        `margin_floor_pct = ${marginValue} (got ${offers[0].margin_floor_pct})`);
}

// ── Teardown ───────────────────────────────────

async function teardown() {
    console.log('\n=== ADVERTISER E2E TEARDOWN: Cleaning up ===\n');

    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_links WHERE slug LIKE 'e2e-%'");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    if (server) {
        await new Promise(r => server.close(r));
        console.log('  Test server stopped');
    }

    console.log(`\n=== ADVERTISER RESULTS: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) {
        console.error('FAILURES:');
        errors.forEach(e => console.error(`  ${e}`));
    }
}

// ── Run ────────────────────────────────────────

async function run() {
    console.log('═══════════════════════════════════════════════');
    console.log('  1AI Affiliate — ADVERTISER Role E2E Test Suite');
    console.log('  Zero Mocks · Real MariaDB · Real Express');
    console.log('═══════════════════════════════════════════════');

    try {
        const [dbCheck] = await db.query('SELECT 1 AS ok');
        console.log(`\n  DB connected: ${dbCheck[0].ok}`);

        await setup();

        await testAdvCreateOffer();
        await testAdvCpsPayoutModel();
        await testAdvCpvViewDuration();
        await testAdvOfferCaps();
        await testAdvCannotSeeOtherOffers();
        await testAdvCannotApproveOwnOffer();
        await testAdvPostbackConfiguration();
        await testAdvMarginFloorPct();

        await teardown();
    } catch (err) {
        console.error('\n❌ ADVERTISER TEST SUITE ERROR:', err.message);
        console.error(err.stack);
        if (server) {
            try { await new Promise(r => server.close(r)); } catch {}
        }
    }

    return { passed, failed, errors };
}

module.exports = { run };

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
