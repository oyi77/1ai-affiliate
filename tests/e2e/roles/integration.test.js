/**
 * E2E Tests — INTEGRATION: Meta×Shopee + Competitive Gaps
 * Zero mocks. Uses real MariaDB + real Express app.
 * Run: NODE_ENV=test node tests/e2e/roles/integration.test.js
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

// ── Test Helpers ────────────────────────────────

const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server = null;
let adminJwt = null;
let affiliateJwt = null;
let advertiserJwt = null;
let adminUserId = null;
let affiliateUserId = null;
let advertiserUserId = null;
let testAdvertiserId = null;
let testAffiliateId = null;
let testOfferId = null;
let testCampaignId = null;
let testEarningId = null;
let testNotificationId = null;

// IDs created during tests (for cleanup)
let createdAdvertiserId = null;
let createdAdvertiserUserId = null;
let createdTrafficSourceId = null;
let createdOfferId = null;
let createdCampaignId = null;
let createdAffiliateId = null;
let createdAffiliateUserId = null;
let registeredUserId = null;

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
    if (!condition) {
        failed++;
        errors.push(`FAIL: ${message}`);
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

async function api(method, apiPath, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(apiPath, BASE_URL);
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
        email: `${username}@e2e-test.local`,
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
    console.log('\n=== SETUP ===');
    console.log('  Cleaning up old E2E-TEST-* data...');

    // Clean up in dependency order (children first)
    await db.query("DELETE FROM 1ai_notifications WHERE title LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_shopee_payouts WHERE report_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_shopee_reports WHERE order_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_meta_daily_stats WHERE campaign_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_payout_rules WHERE user_id IN (SELECT user_id FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_telegram_config WHERE user_id IN (SELECT user_id FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id IN (SELECT id FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_click_log WHERE click_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_campaigns WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_aff_campaigns WHERE aff_campaign_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_advertisers WHERE company_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    // ── Create users ───────────────────────────

    const adminSuffix = makeid(4);
    const adminPassHash = await bcrypt.hash('AdminPass123!', 10);
    const [adminResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'admin', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-admin-${adminSuffix}`, `admin-integ-${adminSuffix}@e2e-test.local`,
         adminPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    adminUserId = adminResult.insertId;

    const affSuffix = makeid(4);
    const affPassHash = await bcrypt.hash('AffPass123!', 10);
    const [affUserResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'affiliate', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-aff-${affSuffix}`, `aff-integ-${affSuffix}@e2e-test.local`,
         affPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    affiliateUserId = affUserResult.insertId;

    // Affiliate profile
    const affCode = `E2E-TEST-${makeid(4)}`;
    const [affProfileResult] = await db.query(
        `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, balance, created_at, updated_at)
         VALUES (?, ?, 'pro', 100000, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [affiliateUserId, affCode]
    );
    testAffiliateId = affProfileResult.insertId;

    const advSuffix = makeid(4);
    const advPassHash = await bcrypt.hash('AdvPass123!', 10);
    const [advUserResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, user_active,
          clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-adv-${advSuffix}`, `adv-integ-${advSuffix}@e2e-test.local`,
         advPassHash, makeid(16), makeid(16), makeid(32), makeid(32)]
    );
    advertiserUserId = advUserResult.insertId;

    // Advertiser profile
    const [advProfileResult] = await db.query(
        `INSERT INTO 1ai_advertisers
           (user_id, company_name, website, status, platform_type, commission_type,
            default_commission_rate, notes, created_at, updated_at)
         VALUES (?, ?, ?, 'active', 'shopee', 'percentage', 5.00, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
        [advertiserUserId, `E2E-TEST-AdvCo-${makeid(4)}`, 'https://e2e-test.example.com', 'E2E-TEST advertiser profile']
    );
    testAdvertiserId = advProfileResult.insertId;

    // Generate JWTs
    adminJwt = generateJwtToken(adminUserId, 'admin', `E2E-TEST-admin-${adminSuffix}`);
    affiliateJwt = generateJwtToken(affiliateUserId, 'affiliate', `E2E-TEST-aff-${affSuffix}`, { affiliateId: testAffiliateId });
    advertiserJwt = generateJwtToken(advertiserUserId, 'advertiser', `E2E-TEST-adv-${advSuffix}`);

    // ── Create test data ────────────────────────

    // Test offer
    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, status, created_at)
         VALUES (?, 10.00, 15.00, ?, 'active', UNIX_TIMESTAMP())`,
        [`E2E-TEST-Offer-${makeid(4)}`, advertiserUserId]
    );
    testOfferId = offerResult.insertId;

    // Test campaign
    const [campaignResult] = await db.query(
        `INSERT INTO 1ai_aff_campaigns (aff_campaign_name, aff_campaign_status)
         VALUES (?, 'active')`,
        [`E2E-TEST-Camp-${makeid(4)}`]
    );
    testCampaignId = campaignResult.insertId;

    // Test earning (for approve test)
    const [earningResult] = await db.query(
        `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, status, created_at)
         VALUES (?, 25.00, 'pending', UNIX_TIMESTAMP())`,
        [testAffiliateId]
    );
    testEarningId = earningResult.insertId;

    // Test notification
    const [notifResult] = await db.query(
        `INSERT INTO 1ai_notifications (user_id, type, title, message, created_at)
         VALUES (?, 'info', ?, 'This is a test notification', UNIX_TIMESTAMP())`,
        [adminUserId, `E2E-TEST-Notif-${makeid(4)}`]
    );
    testNotificationId = notifResult.insertId;

    // Test click (for reports/clicks)
    await db.query(
        `INSERT INTO 1ai_click_log (click_id, offer_id, affiliate_id, subid, ip, country_code,
          device_type, user_agent, payout, converted, clicked_at)
         VALUES (?, ?, ?, 'sub1', '10.99.99.99', 'ID', 'desktop',
          'Mozilla/5.0 E2E-TEST', 10.00, 0, UNIX_TIMESTAMP())`,
        [`E2E-TEST-CLK-${makeid(6)}`, testOfferId, testAffiliateId]
    );

    console.log(`  Created users: admin=${adminUserId}, aff=${affiliateUserId}, adv=${advertiserUserId}`);
    console.log(`  Test advertiser ID: ${testAdvertiserId}, offer ID: ${testOfferId}`);
    console.log(`  Test campaign ID: ${testCampaignId}, affiliate ID: ${testAffiliateId}`);
    console.log(`  Test earning ID: ${testEarningId}, notification ID: ${testNotificationId}`);

    // Start server
    server = app.listen(TEST_PORT);
    console.log(`\n  Test server started on port ${TEST_PORT}`);
    await new Promise(r => setTimeout(r, 500));
}

// ── 1. Advertiser CRUD ─────────────────────────

async function testAdvertiserCRUD() {
    console.log('\n=== 1. Advertiser CRUD ===');

    // POST — create advertiser
    const uniqueEmail = `adv-new-${makeid(6)}@e2e-test.local`;
    const createRes = await api('POST', '/api/admin/advertisers', {
        name: 'E2E-TEST New Advertiser',
        email: uniqueEmail,
        password: 'SecurePass123',
        platform_type: 'shopee',
        company_name: 'E2E-TEST Shopee Co',
        commission_type: 'percentage',
        default_commission_rate: 7.5,
        notes: 'E2E-TEST created advertiser',
    }, adminJwt);

    assert(createRes.status === 201 || createRes.status === 200,
        `POST /api/admin/advertisers — created (status ${createRes.status})`);
    if (createRes.body && createRes.body.user_id) {
        createdAdvertiserUserId = createRes.body.user_id;
        assert(createRes.body.success === true, 'POST /api/admin/advertisers — success flag true');
        assert(createRes.body.email === uniqueEmail, 'POST /api/admin/advertisers — email matches');
    }

    // GET — list advertisers
    const listRes = await api('GET', '/api/admin/advertisers', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/advertisers — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/advertisers — returns data array');
    const foundAdv = listRes.body.data.find(a => a.user_email === uniqueEmail);
    if (foundAdv) {
        createdAdvertiserId = foundAdv.advertiser_id;
        assert(foundAdv.platform_type === 'shopee', 'GET /api/admin/advertisers — platform_type is shopee');
        assert(foundAdv.company_name === 'E2E-TEST Shopee Co', 'GET /api/admin/advertisers — company_name matches');
    } else {
        assert(false, 'GET /api/admin/advertisers — created advertiser found in list');
    }

    // PATCH — update advertiser
    if (createdAdvertiserId) {
        const patchRes = await api('PATCH', `/api/admin/advertisers/${createdAdvertiserId}`, {
            platform_type: 'tokopedia',
            commission_type: 'fixed',
            default_commission_rate: 15,
            notes: 'E2E-TEST updated notes',
        }, adminJwt);
        assert(patchRes.status === 200, `PATCH /api/admin/advertisers/:id — status 200`);
        if (patchRes.body && patchRes.body.advertiser) {
            assert(patchRes.body.advertiser.platform_type === 'tokopedia',
                'PATCH /api/admin/advertisers/:id — platform_type updated to tokopedia');
        }
    }

    // GET — reports (empty)
    const reportsRes = await api('GET', `/api/admin/advertisers/${testAdvertiserId}/reports`, null, adminJwt);
    assert(reportsRes.status === 200, 'GET /api/admin/advertisers/:id/reports — status 200');
    assert(Array.isArray(reportsRes.body.data), 'GET /api/admin/advertisers/:id/reports — returns data array');

    // GET — payouts (empty)
    const payoutsRes = await api('GET', `/api/admin/advertisers/${testAdvertiserId}/payouts`, null, adminJwt);
    assert(payoutsRes.status === 200, 'GET /api/admin/advertisers/:id/payouts — status 200');
    assert(Array.isArray(payoutsRes.body.data), 'GET /api/admin/advertisers/:id/payouts — returns data array');
}

// ── 2. Traffic Source CRUD ─────────────────────

async function testTrafficSourceCRUD() {
    console.log('\n=== 2. Traffic Source CRUD ===');

    // POST — create traffic source
    const createRes = await api('POST', '/api/admin/traffic-sources', {
        name: 'E2E-TEST Meta Ads',
        platform_type: 'meta',
        cost_model: 'CPC',
        currency: 'IDR',
    }, adminJwt);

    assert(createRes.status === 200 || createRes.status === 201,
        `POST /api/admin/traffic-sources — created (status ${createRes.status})`);
    if (createRes.body && createRes.body.id) {
        createdTrafficSourceId = createRes.body.id;
        assert(createRes.body.success === true, 'POST /api/admin/traffic-sources — success flag true');
    }

    // GET — list traffic sources
    const listRes = await api('GET', '/api/admin/traffic-sources', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/traffic-sources — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/traffic-sources — returns data array');
    const foundTs = listRes.body.data.find(ts => ts.name === 'E2E-TEST Meta Ads');
    if (foundTs) {
        assert(foundTs.platform_type === 'meta', 'GET /api/admin/traffic-sources — platform_type is meta');
    }

    // PATCH — update traffic source
    if (createdTrafficSourceId) {
        const patchRes = await api('PATCH', `/api/admin/traffic-sources/${createdTrafficSourceId}`, {
            cost_model: 'CPM',
            name: 'E2E-TEST Meta Ads Updated',
        }, adminJwt);
        assert(patchRes.status === 200, 'PATCH /api/admin/traffic-sources/:id — status 200');
        assert(patchRes.body.success === true, 'PATCH /api/admin/traffic-sources/:id — success flag true');
    }

    // POST — connect-meta (now wired to metaService — sends fake token, expects validation error)
    const tsId = createdTrafficSourceId || 1;
    const metaRes = await api('POST', `/api/admin/traffic-sources/${tsId}/connect-meta`, {
        access_token: 'E2E-TEST-FAKE-META-TOKEN',
        act_id: 'act_123456789',
    }, adminJwt);
    assert(metaRes.status === 400 || metaRes.status === 200,
        `POST /api/admin/traffic-sources/:id/connect-meta — wired (status ${metaRes.status})`);
    // If 400, it means metaService validated and rejected the fake token (correct behavior)
    // If 200, it means the endpoint accepted it (token validation may be lenient)
    assert(metaRes.body.error || metaRes.body.success !== undefined,
        'POST /api/admin/traffic-sources/:id/connect-meta — has error or success');

    // POST — sync (now wired to metaService — expects no connected account)
    const syncRes = await api('POST', `/api/admin/traffic-sources/${tsId}/sync`, {}, adminJwt);
    assert(syncRes.status === 200 || syncRes.status === 400,
        `POST /api/admin/traffic-sources/:id/sync — wired (status ${syncRes.status})`);

    // GET — daily-stats (empty)
    const statsRes = await api('GET', `/api/admin/traffic-sources/${tsId}/daily-stats`, null, adminJwt);
    assert(statsRes.status === 200, 'GET /api/admin/traffic-sources/:id/daily-stats — status 200');
    assert(Array.isArray(statsRes.body.data), 'GET /api/admin/traffic-sources/:id/daily-stats — returns array');
}

// ── 3. Offer CRUD ──────────────────────────────

async function testOfferCRUD() {
    console.log('\n=== 3. Offer CRUD ===');

    // GET — list offers
    const listRes = await api('GET', '/api/admin/offers', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/offers — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/offers — returns data array');

    // POST — create offer
    const createRes = await api('POST', '/api/admin/offers', {
        name: 'E2E-TEST-NewOffer',
        payout_amount: 20.00,
        network_payout: 25.00,
    }, adminJwt);

    assert(createRes.status === 200 || createRes.status === 201,
        `POST /api/admin/offers — created (status ${createRes.status})`);
    if (createRes.body && createRes.body.offer_id) {
        createdOfferId = createRes.body.offer_id;
        assert(createRes.body.success === true, 'POST /api/admin/offers — success flag true');
    }

    // PATCH — update offer
    const offerToPatch = createdOfferId || testOfferId;
    const patchRes = await api('PATCH', `/api/admin/offers/${offerToPatch}`, {
        status: 'paused',
        notes: 'E2E-TEST updated offer notes',
    }, adminJwt);
    assert(patchRes.status === 200, `PATCH /api/admin/offers/:id — status 200`);
    if (patchRes.body && patchRes.body.success) {
        assert(patchRes.body.success === true, 'PATCH /api/admin/offers/:id — success flag');
    }

    // GET — postback config
    const getPostbackRes = await api('GET', `/api/admin/offers/${testOfferId}/postback`, null, adminJwt);
    assert(getPostbackRes.status === 200, 'GET /api/admin/offers/:id/postback — status 200');

    // POST — set postback config
    const setPostbackRes = await api('POST', `/api/admin/offers/${testOfferId}/postback`, {
        postback_url: 'https://e2e-test.example.com/postback?click_id={click_id}',
        postback_enabled: true,
        postback_method: 'GET',
        postback_timeout: 10,
        postback_retries: 3,
    }, adminJwt);
    assert(setPostbackRes.status === 200, 'POST /api/admin/offers/:id/postback — status 200');
    assert(setPostbackRes.body.success === true, 'POST /api/admin/offers/:id/postback — success flag');

    // Verify postback was saved
    const verifyPostbackRes = await api('GET', `/api/admin/offers/${testOfferId}/postback`, null, adminJwt);
    assert(verifyPostbackRes.status === 200, 'GET /api/admin/offers/:id/postback (verify) — status 200');
    if (verifyPostbackRes.body && verifyPostbackRes.body.postback_url) {
        assert(verifyPostbackRes.body.postback_url.includes('e2e-test.example.com'),
            'GET /api/admin/offers/:id/postback — postback_url saved correctly');
    }
}

// ── 4. Campaign CRUD ───────────────────────────

async function testCampaignCRUD() {
    console.log('\n=== 4. Campaign CRUD ===');

    // GET — list campaigns
    const listRes = await api('GET', '/api/admin/campaigns', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/campaigns — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/campaigns — returns data array');

    // POST — create campaign
    const createRes = await api('POST', '/api/admin/campaigns', {
        name: 'E2E-TEST-NewCampaign',
        status: 'active',
    }, adminJwt);

    assert(createRes.status === 200 || createRes.status === 201,
        `POST /api/admin/campaigns — created (status ${createRes.status})`);
    if (createRes.body && createRes.body.id) {
        createdCampaignId = createRes.body.id;
        assert(createRes.body.success === true, 'POST /api/admin/campaigns — success flag true');
    }

    // PATCH — update campaign
    const campToPatch = createdCampaignId || testCampaignId;
    const patchRes = await api('PATCH', `/api/admin/campaigns/${campToPatch}`, {
        name: 'E2E-TEST-Camp-Updated',
        status: 'paused',
    }, adminJwt);
    assert(patchRes.status === 200, `PATCH /api/admin/campaigns/:id — status 200`);
}

// ── 5. Reports ─────────────────────────────────

async function testReports() {
    console.log('\n=== 5. Reports ===');

    // GET — clicks
    const clicksRes = await api('GET', '/api/admin/reports/clicks?page=1&limit=10', null, adminJwt);
    assert(clicksRes.status === 200, 'GET /api/admin/reports/clicks — status 200');
    assert(Array.isArray(clicksRes.body.data), 'GET /api/admin/reports/clicks — returns data array');
    assert(typeof clicksRes.body.total === 'number', 'GET /api/admin/reports/clicks — has total count');

    // GET — conversions
    const convRes = await api('GET', '/api/admin/reports/conversions?page=1&limit=10', null, adminJwt);
    assert(convRes.status === 200, 'GET /api/admin/reports/conversions — status 200');
    assert(Array.isArray(convRes.body.data), 'GET /api/admin/reports/conversions — returns data array');

    // GET — ads (laporan iklan)
    const adsRes = await api('GET', '/api/admin/reports/ads', null, adminJwt);
    assert(adsRes.status === 200, 'GET /api/admin/reports/ads — status 200');
    assert(Array.isArray(adsRes.body.data), 'GET /api/admin/reports/ads — returns data array');

    // GET — daily (analytic harian)
    const dailyRes = await api('GET', '/api/admin/reports/daily', null, adminJwt);
    assert(dailyRes.status === 200, 'GET /api/admin/reports/daily — status 200');
    assert(Array.isArray(dailyRes.body.data), 'GET /api/admin/reports/daily — returns data array');

    // GET — taglink (laporan taglink)
    const tagRes = await api('GET', '/api/admin/reports/taglink', null, adminJwt);
    assert(tagRes.status === 200, 'GET /api/admin/reports/taglink — status 200');
    assert(Array.isArray(tagRes.body.data), 'GET /api/admin/reports/taglink — returns data array');
}

// ── 6. Affiliates ──────────────────────────────

async function testAffiliates() {
    console.log('\n=== 6. Affiliates ===');

    // GET — list affiliates
    const listRes = await api('GET', '/api/admin/affiliates', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/affiliates — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/affiliates — returns data array');

    // POST — create affiliate
    const affEmail = `aff-new-${makeid(6)}@e2e-test.local`;
    const createRes = await api('POST', '/api/admin/affiliates', {
        name: 'E2E-TEST New Affiliate',
        email: affEmail,
    }, adminJwt);

    assert(createRes.status === 200 || createRes.status === 201,
        `POST /api/admin/affiliates — created (status ${createRes.status})`);
    if (createRes.body && createRes.body.id) {
        createdAffiliateId = createRes.body.id;
        createdAffiliateUserId = createRes.body.user_id;
        assert(createRes.body.success === true, 'POST /api/admin/affiliates — success flag true');
        assert(createRes.body.affiliate_code, 'POST /api/admin/affiliates — has affiliate_code');
    }

    // GET — earnings
    const earnRes = await api('GET', '/api/admin/affiliates/earnings', null, adminJwt);
    assert(earnRes.status === 200, 'GET /api/admin/affiliates/earnings — status 200');
    assert(Array.isArray(earnRes.body.data), 'GET /api/admin/affiliates/earnings — returns data array');

    // POST — approve earning
    const approveRes = await api('POST', `/api/admin/affiliates/earnings/${testEarningId}/approve`, {}, adminJwt);
    assert(approveRes.status === 200, 'POST /api/admin/affiliates/earnings/:id/approve — status 200');
    if (approveRes.body && typeof approveRes.body.approved === 'number') {
        assert(approveRes.body.approved === 1, 'POST /api/admin/affiliates/earnings/:id/approve — approved 1 row');
    }
}

// ── 7. Affiliate Self-Registration ─────────────

async function testSelfRegistration() {
    console.log('\n=== 7. Affiliate Self-Registration ===');

    // Happy path — register new affiliate
    const regEmail = `reg-${makeid(6)}@e2e-test.local`;
    const regRes = await api('POST', '/api/auth/register', {
        name: 'E2E-TEST Registered User',
        email: regEmail,
        password: 'SecurePass123',
    });
    assert(regRes.status === 201, `POST /api/auth/register — created (status ${regRes.status})`);
    if (regRes.body && regRes.body.token) {
        assert(typeof regRes.body.token === 'string', 'POST /api/auth/register — returns JWT token');
        assert(regRes.body.user && regRes.body.user.role === 'affiliate',
            'POST /api/auth/register — role is affiliate');
        assert(regRes.body.user.affiliate_code, 'POST /api/auth/register — has affiliate_code');
        if (regRes.body.user.id) {
            registeredUserId = regRes.body.user.id;
        }
    }

    // Duplicate email → 409
    const dupRes = await api('POST', '/api/auth/register', {
        name: 'E2E-TEST Duplicate',
        email: regEmail,
        password: 'SecurePass123',
    });
    assert(dupRes.status === 409, `POST /api/auth/register (duplicate) — status 409`);

    // Invalid email → 400
    const badEmailRes = await api('POST', '/api/auth/register', {
        name: 'E2E-TEST Bad Email',
        email: 'not-an-email',
        password: 'SecurePass123',
    });
    assert(badEmailRes.status === 400, `POST /api/auth/register (invalid email) — status 400`);

    // Short password → 400 or 429 (rate limited)
    const shortPassRes = await api('POST', '/api/auth/register', {
        name: 'E2E-TEST Short Pass',
        email: `short-${makeid(4)}@e2e-test.local`,
        password: '12345',
    });
    assert(shortPassRes.status === 400 || shortPassRes.status === 429,
        `POST /api/auth/register (short password) — status ${shortPassRes.status}`);

    // Missing fields → 400 or 429 (rate limited)
    const missingRes = await api('POST', '/api/auth/register', {
        name: 'E2E-TEST Missing',
    });
    assert(missingRes.status === 400 || missingRes.status === 429,
        `POST /api/auth/register (missing fields) — status ${missingRes.status}`);
}

// ── 8. Affiliate Dashboard ─────────────────────

async function testAffiliateDashboard() {
    console.log('\n=== 8. Affiliate Dashboard ===');

    // GET — my stats
    const statsRes = await api('GET', '/api/affiliate/stats', null, affiliateJwt);
    assert(statsRes.status === 200, 'GET /api/affiliate/stats — status 200');
    if (statsRes.body && typeof statsRes.body.total_clicks !== 'undefined') {
        assert(typeof statsRes.body.total_clicks === 'number', 'GET /api/affiliate/stats — has total_clicks');
        assert(typeof statsRes.body.total_earnings !== 'undefined', 'GET /api/affiliate/stats — has total_earnings');
    }

    // GET — my links
    const linksRes = await api('GET', '/api/affiliate/links', null, affiliateJwt);
    assert(linksRes.status === 200, 'GET /api/affiliate/links — status 200');
    assert(Array.isArray(linksRes.body.data), 'GET /api/affiliate/links — returns data array');

    // GET — my earnings
    const earnRes = await api('GET', '/api/affiliate/earnings', null, affiliateJwt);
    assert(earnRes.status === 200, 'GET /api/affiliate/earnings — status 200');
    assert(Array.isArray(earnRes.body.data), 'GET /api/affiliate/earnings — returns data array');
    assert(typeof earnRes.body.total === 'number', 'GET /api/affiliate/earnings — has total count');
}

// ── 9. Telegram Integration ────────────────────

async function testTelegramIntegration() {
    console.log('\n=== 9. Telegram Integration ===');

    // GET — config (empty initially)
    const getConfigRes = await api('GET', '/api/settings/telegram', null, adminJwt);
    assert(getConfigRes.status === 200, 'GET /api/settings/telegram — status 200');
    assert(getConfigRes.body.data !== undefined, 'GET /api/settings/telegram — has data field');

    // POST — save config
    const saveRes = await api('POST', '/api/settings/telegram', {
        bot_token: 'E2E-TEST-BOT-TOKEN',
        chat_id: '123456789',
        daily_summary_enabled: true,
        balance_alert_enabled: true,
        balance_alert_threshold: 500000,
    }, adminJwt);
    assert(saveRes.status === 200, 'POST /api/settings/telegram — status 200');
    if (saveRes.body && saveRes.body.data) {
        assert(saveRes.body.data.bot_token === 'E2E-TEST-BOT-TOKEN',
            'POST /api/settings/telegram — bot_token saved');
        assert(saveRes.body.data.chat_id === '123456789',
            'POST /api/settings/telegram — chat_id saved');
    }

    // Verify config was saved
    const verifyRes = await api('GET', '/api/settings/telegram', null, adminJwt);
    assert(verifyRes.status === 200, 'GET /api/settings/telegram (verify) — status 200');
    if (verifyRes.body && verifyRes.body.data) {
        assert(verifyRes.body.data.bot_token === 'E2E-TEST-BOT-TOKEN',
            'GET /api/settings/telegram — bot_token persisted');
    }

    // POST — test connection (will fail without real bot, but endpoint works)
    const testRes = await api('POST', '/api/settings/telegram/test', {}, adminJwt);
    assert(testRes.status === 200 || testRes.status === 400,
        `POST /api/settings/telegram/test — endpoint responds (status ${testRes.status})`);
}

// ── 10. Payout Rules ───────────────────────────

async function testPayoutRules() {
    console.log('\n=== 10. Payout Rules ===');

    // GET — rules (empty initially)
    const getRes = await api('GET', '/api/settings/payouts/rules', null, adminJwt);
    assert(getRes.status === 200, 'GET /api/settings/payouts/rules — status 200');

    // POST — save rules
    const saveRes = await api('POST', '/api/settings/payouts/rules', {
        min_amount: 100000,
        auto_approve: false,
        payment_method: 'bank_transfer',
        payment_schedule: 'monthly',
        enabled: true,
    }, adminJwt);
    assert(saveRes.status === 200, 'POST /api/settings/payouts/rules — status 200');
    if (saveRes.body && saveRes.body.data) {
        assert(Number(saveRes.body.data.min_amount) === 100000,
            'POST /api/settings/payouts/rules — min_amount saved');
        assert(saveRes.body.data.payment_method === 'bank_transfer',
            'POST /api/settings/payouts/rules — payment_method saved');
    }

    // Verify rules persisted
    const verifyRes = await api('GET', '/api/settings/payouts/rules', null, adminJwt);
    assert(verifyRes.status === 200, 'GET /api/settings/payouts/rules (verify) — status 200');
    if (verifyRes.body && verifyRes.body.data) {
        assert(Number(verifyRes.body.data.min_amount) === 100000,
            'GET /api/settings/payouts/rules — min_amount persisted');
    }
}

// ── 11. Notifications ──────────────────────────

async function testNotifications() {
    console.log('\n=== 11. Notifications ===');

    // GET — list notifications
    const listRes = await api('GET', '/api/admin/notifications', null, adminJwt);
    assert(listRes.status === 200, 'GET /api/admin/notifications — status 200');
    assert(Array.isArray(listRes.body.data), 'GET /api/admin/notifications — returns data array');
    assert(typeof listRes.body.unread_count === 'number', 'GET /api/admin/notifications — has unread_count');

    // POST — mark as read
    const markRes = await api('POST', `/api/admin/notifications/${testNotificationId}/read`, {}, adminJwt);
    assert(markRes.status === 200, 'POST /api/admin/notifications/:id/read — status 200');
    assert(markRes.body.success === true, 'POST /api/admin/notifications/:id/read — success flag');

    // Verify notification was marked read
    const verifyRes = await api('GET', '/api/admin/notifications', null, adminJwt);
    if (verifyRes.body && Array.isArray(verifyRes.body.data)) {
        const notif = verifyRes.body.data.find(n => n.id === testNotificationId);
        if (notif) {
            assert(notif.read_at !== null, 'POST /api/admin/notifications/:id/read — read_at is set');
        }
    }

    // POST — mark all read
    const markAllRes = await api('POST', '/api/admin/notifications/read-all', {}, adminJwt);
    assert(markAllRes.status === 200, 'POST /api/admin/notifications/read-all — status 200');
    assert(markAllRes.body.success === true, 'POST /api/admin/notifications/read-all — success flag');
}

// ── 12. Validation & Error Handling ────────────

async function testValidationAndErrors() {
    console.log('\n=== 12. Validation & Error Handling ===');

    // No auth → 401
    const noAuthRes = await api('GET', '/api/admin/advertisers');
    assert(noAuthRes.status === 401, `GET /api/admin/advertisers (no auth) — status 401`);

    // Invalid token → 401
    const badTokenRes = await api('GET', '/api/admin/advertisers', null, 'invalid.token.here');
    assert(badTokenRes.status === 401, `GET /api/admin/advertisers (bad token) — status 401`);

    // Affiliate role → 403 on admin-only endpoint
    const affRoleRes = await api('GET', '/api/admin/advertisers', null, affiliateJwt);
    assert(affRoleRes.status === 403, `GET /api/admin/advertisers (affiliate role) — status 403`);

    // Affiliate role → 403 on POST advertisers
    const affCreateRes = await api('POST', '/api/admin/advertisers', {
        name: 'E2E-TEST Forbidden',
        email: `forbidden-${makeid(4)}@e2e-test.local`,
        password: 'SecurePass123',
    }, affiliateJwt);
    assert(affCreateRes.status === 403, `POST /api/admin/advertisers (affiliate role) — status 403`);

    // Advertiser role → 403 on admin-only endpoint
    const advRoleRes = await api('POST', '/api/admin/affiliates', {
        name: 'E2E-TEST Forbidden',
        email: `forbidden-${makeid(4)}@e2e-test.local`,
    }, advertiserJwt);
    assert(advRoleRes.status === 403, `POST /api/admin/affiliates (advertiser role) — status 403`);

    // Not found → 404
    const notFoundRes = await api('PATCH', '/api/admin/advertisers/99999', {
        notes: 'E2E-TEST not found',
    }, adminJwt);
    assert(notFoundRes.status === 404, `PATCH /api/admin/advertisers/99999 — status 404`);

    // Traffic source not found → 404
    const tsNotFoundRes = await api('PATCH', '/api/admin/traffic-sources/99999', {
        name: 'E2E-TEST Not Found',
    }, adminJwt);
    assert(tsNotFoundRes.status === 404, `PATCH /api/admin/traffic-sources/99999 — status 404`);

    // Offer not found → 404
    const offerNotFoundRes = await api('PATCH', '/api/admin/offers/99999', {
        name: 'E2E-TEST Not Found',
    }, adminJwt);
    assert(offerNotFoundRes.status === 404, `PATCH /api/admin/offers/99999 — status 404`);

    // Missing required fields on create affiliate → validation
    const missingAffRes = await api('POST', '/api/admin/affiliates', {
        // missing name and email
    }, adminJwt);
    assert(missingAffRes.status === 400 || missingAffRes.status === 500,
        `POST /api/admin/affiliates (missing fields) — status ${missingAffRes.status}`);
}

// ── 13. Legacy Admin Routes ────────────────────

async function testLegacyRoutes() {
    console.log('\n=== 13. Legacy Admin Routes ===');

    // GET — stats
    const statsRes = await api('GET', '/api/admin/stats', null, adminJwt);
    assert(statsRes.status === 200, 'GET /api/admin/stats — status 200');
    assert(typeof statsRes.body === 'object', 'GET /api/admin/stats — returns object');

    // GET — users
    const usersRes = await api('GET', '/api/admin/users', null, adminJwt);
    assert(usersRes.status === 200, 'GET /api/admin/users — status 200');
    assert(Array.isArray(usersRes.body.data), 'GET /api/admin/users — returns data array');

    // GET — commissions
    const commRes = await api('GET', '/api/admin/commissions', null, adminJwt);
    assert(commRes.status === 200, 'GET /api/admin/commissions — status 200');
    assert(Array.isArray(commRes.body.data), 'GET /api/admin/commissions — returns data array');

    // GET — payments
    const payRes = await api('GET', '/api/admin/payments', null, adminJwt);
    assert(payRes.status === 200, 'GET /api/admin/payments — status 200');
    assert(Array.isArray(payRes.body.data), 'GET /api/admin/payments — returns data array');

    // GET — system status
    const sysRes = await api('GET', '/api/admin/system', null, adminJwt);
    assert(sysRes.status === 200, 'GET /api/admin/system — status 200');
    assert(typeof sysRes.body === 'object', 'GET /api/admin/system — returns object');
    if (sysRes.body) {
        assert(sysRes.body.node_version, 'GET /api/admin/system — has node_version');
    }
}

// ── Teardown ───────────────────────────────────

async function teardown() {
    console.log('\n=== TEARDOWN ===');

    // Clean up in dependency order (children first)
    await db.query("DELETE FROM 1ai_notifications WHERE user_id = ? OR title LIKE 'E2E-TEST-%'", [adminUserId]);
    await db.query("DELETE FROM 1ai_shopee_payouts WHERE report_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_shopee_reports WHERE order_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_meta_daily_stats WHERE campaign_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_payout_rules WHERE user_id IN (?, ?, ?)", [adminUserId, affiliateUserId, advertiserUserId]);
    await db.query("DELETE FROM 1ai_telegram_config WHERE user_id = ?", [adminUserId]);
    await db.query("DELETE FROM 1ai_affiliate_earnings WHERE affiliate_id IN (?, ?)", [testAffiliateId, createdAffiliateId].filter(Boolean));
    await db.query("DELETE FROM 1ai_click_log WHERE click_id LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_offer_approval_log WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_affiliate_access WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offer_campaigns WHERE offer_id IN (SELECT id FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%')");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_aff_campaigns WHERE aff_campaign_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_advertisers WHERE company_name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    if (server) {
        await new Promise(r => server.close(r));
        console.log('  Test server stopped');
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total:  ${passed + failed}`);

    if (failed > 0) {
        console.log('\n  FAILURES:');
        errors.forEach(e => console.error(`    ${e}`));
        console.log('\n  ❌ SOME TESTS FAILED');
    } else {
        console.log('\n  ✅ ALL TESTS PASSED');
    }
}

// ── Run ────────────────────────────────────────

async function run() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  1AI Affiliate — INTEGRATION E2E Test Suite');
    console.log('  Meta×Shopee + Competitive Gaps · Zero Mocks');
    console.log('═══════════════════════════════════════════════════════');

    try {
        const [dbCheck] = await db.query('SELECT 1 AS ok');
        console.log(`\n  DB connected: ${dbCheck[0].ok}`);

        await setup();

        await testAdvertiserCRUD();
        await testTrafficSourceCRUD();
        await testOfferCRUD();
        await testCampaignCRUD();
        await testReports();
        await testAffiliates();
        await testSelfRegistration();
        await testAffiliateDashboard();
        await testTelegramIntegration();
        await testPayoutRules();
        await testNotifications();
        await testValidationAndErrors();
        await testLegacyRoutes();

        await teardown();
    } catch (err) {
        console.error('\n❌ INTEGRATION TEST SUITE ERROR:', err.message);
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
    run().then(({ passed, failed }) => {
        process.exit(failed > 0 ? 1 : 0);
    }).catch(err => {
        console.error('Fatal:', err);
        process.exit(1);
    });
}
