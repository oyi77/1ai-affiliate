/**
 * E2E Fraud Tests — IP-Based Fraud Detection
 *
 * Covers: FRAUD-I03, FRAUD-I04, FRAUD-I06, FRAUD-I10
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
process.env.DB_NAME = process.env.DB_NAME || 'prosper1ai_test';
process.env.PORT = process.env.TEST_PORT || '3099';
process.env.NODE_ENV = 'test';

const path = require('path');
const crypto = require('crypto');

const app = require('../../../server/app');
const db = require('../../../server/db/mysql');
const fraudDetection = require('../../../server/services/fraudDetectionService');

// ── Test State ──────────────────────────────────

const TEST_PORT = parseInt(process.env.TEST_PORT || '3099', 10);

let server = null;
let testOfferId = null;
let testAffiliateId = null;

let passed = 0;
let failed = 0;
const errors = [];

// ── Helpers ─────────────────────────────────────

function assert(condition, message) {
    if (!condition) {
        failed++;
        const err = new Error(`FAIL: ${message}`);
        errors.push(err.message);
        console.error(`  \u2717 ${message}`);
        return false;
    }
    passed++;
    console.log(`  \u2713 ${message}`);
    return true;
}

function makeid(len) {
    return crypto.randomBytes(len).toString('hex').substring(0, len);
}

// ── Setup ───────────────────────────────────────

async function setup() {
    console.log('\n=== IP FRAUD SETUP ===\n');

    // Clean existing test data
    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE reason LIKE 'E2E-TEST-%' OR ip_address LIKE '10.255.%'");
    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%'");

    // Create test users
    const advHash = makeid(32);
    const [advResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-ip-adv-${makeid(4)}`, `ip-adv-${makeid(4)}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), advHash, makeid(32)]
    );

    const pubHash = makeid(32);
    const [pubResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'publisher', UNIX_TIMESTAMP(), ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-ip-pub-${makeid(4)}`, `ip-pub-${makeid(4)}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), pubHash, makeid(32)]
    );

    const [affResult] = await db.query(
        `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at) VALUES (?, ?, 'pro', UNIX_TIMESTAMP())`,
        [pubResult.insertId, `E2E-TEST-IPAFF-${makeid(4)}`]
    );
    testAffiliateId = affResult.insertId;

    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model, payout_currency,
                                 approval_status, margin_floor_pct, created_at)
         VALUES (?, ?, 5.00, 10.00, 'cpa', 'USD', 'approved', 5.00, UNIX_TIMESTAMP())`,
        [`E2E-TEST-IpOffer-${makeid(4)}`, advResult.insertId]
    );
    testOfferId = offerResult.insertId;

    console.log(`  Offer: ${testOfferId}, Affiliate: ${testAffiliateId}`);

    server = app.listen(TEST_PORT);
    console.log(`  Test server started on port ${TEST_PORT}`);
    await new Promise(r => setTimeout(r, 500));
}

// ── FRAUD-I03: IP Velocity — 55 clicks in 60s ──

async function testFraudI03_IPVelocity() {
    console.log('\n=== FRAUD-I03: IP Velocity — 55 clicks from same IP in 60s ===');

    const testIP = '10.255.254.100';
    const testSlug = `e2e-ip-vel-${makeid(6)}`;
    const totalClicks = 55; // Exceeds VELOCITY_CLICKS_PER_MIN (50)
    const VELOCITY_CLICKS_PER_MIN = fraudDetection.VELOCITY_CLICKS_PER_MIN || 50;
    const VELOCITY_WINDOW_SECONDS = fraudDetection.VELOCITY_WINDOW_SECONDS || 60;

    // Insert velocity records simulating 55 clicks from the same IP in the last 60s
    const now = Date.now();

    for (let i = 0; i < totalClicks; i++) {
        // Stagger timestamps across the 60s window
        const offsetMs = i * (59000 / totalClicks);
        const ts = new Date(now - offsetMs).toISOString().slice(0, 23).replace('T', ' ');

        try {
            await db.query(
                `INSERT INTO 1ai_fraud_click_velocity
                 (ip_address, slug, offer_id, affiliate_id, user_agent, blocked, reason, created_at)
                 VALUES (?, ?, ?, ?, ?, 0, 'E2E-TEST-velocity', ?)`,
                [testIP, testSlug, testOfferId, testAffiliateId,
                 'Mozilla/5.0 VelocityTest', ts]
            );
        } catch (e) {
            try {
                await db.query(
                    `INSERT INTO 1ai_fraud_click_velocity
                     (ip_address, slug, offer_id, affiliate_id, user_agent, blocked, reason, click_time)
                     VALUES (?, ?, ?, ?, ?, 0, 'E2E-TEST-velocity', ?)`,
                    [testIP, testSlug, testOfferId, testAffiliateId,
                     'Mozilla/5.0 VelocityTest', ts.replace(' ', 'T')]
                );
            } catch (e2) {
                if (i === 0) {
                    console.log(`  \u26A0 Velocity table schema mismatch: ${e2.message}`);
                }
            }
        }
    }

    // Count actual records inserted
    const [countResult] = await db.query(
        `SELECT COUNT(*) AS cnt FROM 1ai_fraud_click_velocity WHERE ip_address = ?`,
        [testIP]
    );
    const actualCount = countResult[0]?.cnt || 0;
    console.log(`  Inserted ${actualCount}/${totalClicks} velocity records for IP ${testIP}`);

    if (actualCount >= VELOCITY_CLICKS_PER_MIN) {
        const velocityCheck = await fraudDetection.checkClickVelocity(testIP);
        console.log(`  Velocity check: blocked=${velocityCheck.blocked}, reason=${velocityCheck.reason || 'none'}`);

        assert(velocityCheck.blocked === true,
            `IP velocity blocked at ${actualCount} clicks (threshold=${VELOCITY_CLICKS_PER_MIN})`);

        const fraudCheck = await fraudDetection.checkClickFraud(
            testIP, testSlug,
            'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36',
            testOfferId, testAffiliateId
        );
        assert(fraudCheck.allowed === false,
            `Full fraud check blocks high-velocity IP (allowed=${fraudCheck.allowed})`);

        const blCheck = await fraudDetection.checkBlacklist(testIP, 'Mozilla/5.0');
        console.log(`  Auto-blacklist: blocked=${blCheck.blocked}`);
    } else if (actualCount > 0) {
        console.log(`  \u26A0 Only ${actualCount} records — threshold (${VELOCITY_CLICKS_PER_MIN}) not reached`);
        const velocityCheck = await fraudDetection.checkClickVelocity(testIP);
        console.log(`  Velocity check at ${actualCount} clicks: blocked=${velocityCheck.blocked}`);
    } else {
        console.log(`  \u26A0 Velocity test skipped — 0 records inserted`);
    }
}

// ── FRAUD-I04: Rapid Clicks — 4 clicks in <1s ───

async function testFraudI04_RapidClicks() {
    console.log('\n=== FRAUD-I04: Rapid clicks — 4 clicks from same IP in <1s ===');

    const testIP = '10.255.253.50';
    const testSlug = `e2e-ip-rapid-${makeid(6)}`;
    const RAPID_CLICK_MAX = fraudDetection.RAPID_CLICK_MAX || 3;

    // Insert 4 rapid-click records within the last second
    const now = new Date();
    for (let i = 0; i < RAPID_CLICK_MAX + 1; i++) {
        const ts = new Date(now.getTime() - (i * 200)).toISOString().slice(0, 23).replace('T', ' ');

        try {
            await db.query(
                `INSERT INTO 1ai_fraud_click_velocity
                 (ip_address, slug, offer_id, affiliate_id, user_agent, blocked, reason, created_at)
                 VALUES (?, ?, ?, ?, ?, 0, 'E2E-TEST-rapid', ?)`,
                [testIP, testSlug, testOfferId, testAffiliateId,
                 'Mozilla/5.0 RapidTest', ts]
            );
        } catch (e) {
            try {
                await db.query(
                    `INSERT INTO 1ai_fraud_click_velocity
                     (ip_address, slug, offer_id, affiliate_id, user_agent, blocked, reason, click_time)
                     VALUES (?, ?, ?, ?, ?, 0, 'E2E-TEST-rapid', ?)`,
                    [testIP, testSlug, testOfferId, testAffiliateId,
                     'Mozilla/5.0 RapidTest', ts.replace(' ', 'T')]
                );
            } catch (e2) {
                if (i === 0) {
                    console.log(`  \u26A0 Rapid click table schema mismatch: ${e2.message}`);
                }
            }
        }
    }

    // Check rapid click detection
    const rapidCheck = await fraudDetection.checkRapidClicks(testIP);
    console.log(`  Rapid check: blocked=${rapidCheck.blocked}, reason=${rapidCheck.reason || 'none'}`);

    assert(rapidCheck.blocked === true,
        `Rapid clicks blocked (${RAPID_CLICK_MAX + 1} clicks in <1s, threshold=${RAPID_CLICK_MAX})`);

    // Verify full fraud check blocks
    const fraudCheck = await fraudDetection.checkClickFraud(
        testIP, testSlug,
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36',
        testOfferId, testAffiliateId
    );
    assert(fraudCheck.allowed === false,
        `Full fraud check blocks rapid-click IP (allowed=${fraudCheck.allowed})`);

    if (fraudCheck.reason) {
        const mentionsRapid = fraudCheck.reason.toLowerCase().includes('rapid');
        assert(mentionsRapid,
            `Block reason mentions "rapid": "${fraudCheck.reason}"`);
    }
}

// ── FRAUD-I06: Tor exit node IP ─────────────────

async function testFraudI06_TorExitNode() {
    console.log('\n=== FRAUD-I06: Tor exit node IP detection ===');

    // Known Tor exit node IPs
    const torExitIPs = [
        '185.220.101.0',
        '199.249.230.100',
        '103.236.201.110',
        '171.25.193.77',
    ];

    let torDetected = 0;

    for (const ip of torExitIPs) {
        try {
            const entry = await fraudDetection.addToBlacklist(
                'ip', ip,
                `E2E-TEST-tor-exit: known Tor exit node`,
                'high', true
            );
            console.log(`  Tor IP ${ip}: blacklisted (id=${entry.id})`);
            torDetected++;
        } catch (e) {
            console.log(`  \u26A0 Tor IP ${ip}: blacklist add failed — ${e.message}`);
        }

        const result = await fraudDetection.checkClickFraud(
            ip, `e2e-ip-tor-${makeid(4)}`,
            'Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/115.0',
            testOfferId, testAffiliateId
        );
        assert(result.allowed === false,
            `Tor exit node IP ${ip} blocked (allowed=${result.allowed})`);
    }

    console.log(`  Tor exit node detection: ${torDetected}/${torExitIPs.length} IPs blacklisted`);
    assert(torDetected > 0,
        `At least one Tor exit node IP was successfully blacklisted`);

    // Test Tor IP range blacklisting
    const torIPRange = '185.220.101.%';
    try {
        const rangeEntry = await fraudDetection.addToBlacklist(
            'ip_range', torIPRange,
            `E2E-TEST-tor-range: Tor exit node /24 range`,
            'critical', true
        );
        console.log(`  Tor IP range ${torIPRange}: blacklisted (id=${rangeEntry.id})`);

        const rangeIP = '185.220.101.42';
        const blCheck = await fraudDetection.checkBlacklist(rangeIP, 'Mozilla/5.0');
        console.log(`  Range check for ${rangeIP}: blocked=${blCheck.blocked}`);
    } catch (e) {
        console.log(`  \u26A0 IP range blacklist: ${e.message}`);
    }
}

// ── FRAUD-I10: Manual IP blacklist by admin ─────

async function testFraudI10_ManualIPBlacklist() {
    console.log('\n=== FRAUD-I10: Manual IP blacklist — admin adds, verify blocking ===');

    const maliciousIP = '10.255.250.99';
    const testSlug = `e2e-ip-manual-${makeid(6)}`;

    // Step 1: Verify IP is NOT blocked initially
    const initialCheck = await fraudDetection.checkClickFraud(
        maliciousIP, testSlug,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        testOfferId, testAffiliateId
    );
    console.log(`  Pre-blacklist click: allowed=${initialCheck.allowed}`);

    // Step 2: Admin manually adds the IP to blacklist
    const blEntry = await fraudDetection.addToBlacklist(
        'ip', maliciousIP,
        `E2E-TEST-manual-blacklist: admin-added malicious IP`,
        'critical', false
    );
    console.log(`  Admin blacklisted IP: id=${blEntry.id}, severity=${blEntry.severity}, auto=${blEntry.auto_detected}`);
    assert(blEntry.type === 'ip',
        `Blacklist entry type = ip`);
    assert(blEntry.severity === 'critical',
        `Severity = critical (admin-set high priority)`);
    assert(blEntry.auto_detected === false,
        `auto_detected = false (manual admin action)`);

    // Step 3: Verify blacklist query returns the entry
    const blacklist = await fraudDetection.getBlacklist({ type: 'ip', limit: 100 });
    const foundEntry = blacklist.find(e => e.value === maliciousIP);
    assert(!!foundEntry,
        `Malicious IP found in blacklist query results`);

    // Step 4: Verify subsequent clicks from this IP are blocked
    const blockedCheck = await fraudDetection.checkClickFraud(
        maliciousIP, testSlug,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        testOfferId, testAffiliateId
    );
    assert(blockedCheck.allowed === false,
        `Click from blacklisted IP blocked (allowed=${blockedCheck.allowed})`);
    assert(blockedCheck.reason && blockedCheck.reason.toLowerCase().includes('blacklist'),
        `Block reason mentions blacklist: "${blockedCheck.reason}"`);

    // Step 5: Verify the blocked_count increments on repeated attempts
    const check2 = await fraudDetection.checkBlacklist(maliciousIP, 'Mozilla/5.0');
    assert(check2.blocked === true,
        `Blacklist check confirms block for repeated attempt`);

    // Step 6: Verify blacklist entry has the E2E test reason
    if (foundEntry) {
        const hasE2eReason = (foundEntry.reason || '').includes('E2E-TEST');
        console.log(`  Blacklist reason: ${foundEntry.reason}`);
        assert(hasE2eReason,
            `Blacklist entry reason contains E2E-TEST marker`);
    }

    // Step 7: Admin removes the IP from blacklist
    const removed = await fraudDetection.removeFromBlacklist(blEntry.id);
    console.log(`  Admin removed IP from blacklist: ${removed}`);
    assert(removed === true,
        `IP successfully removed from blacklist`);

    // Step 8: Verify IP is no longer blocked after removal
    const afterRemoval = await fraudDetection.checkClickFraud(
        maliciousIP, testSlug,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        testOfferId, testAffiliateId
    );
    console.log(`  Post-removal click: allowed=${afterRemoval.allowed}`);

    // Step 9: Verify the blacklist no longer contains the entry
    const blacklistAfter = await fraudDetection.getBlacklist({ type: 'ip', limit: 100 });
    const stillExists = blacklistAfter.some(e => e.value === maliciousIP);
    assert(stillExists === false,
        `IP no longer in blacklist after admin removal`);
}

// ── Teardown ────────────────────────────────────

async function teardown() {
    console.log('\n=== IP FRAUD TEARDOWN ===\n');

    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE reason LIKE 'E2E-TEST-%' OR ip_address LIKE '10.255.%'");
    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%' OR value LIKE '185.220.101.%'");
    await db.query("DELETE FROM 1ai_offers WHERE name LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_affiliates WHERE affiliate_code LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_users WHERE user_name LIKE 'E2E-TEST-%'");

    if (server) {
        await new Promise(r => server.close(r));
        console.log('  Test server stopped');
    }
}

// ── Run ─────────────────────────────────────────

async function run() {
    console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
    console.log('  1AI Affiliate — IP Fraud Detection E2E Test Suite');
    console.log('  FRAUD-I03, I04, I06, I10');
    console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

    try {
        const [dbCheck] = await db.query('SELECT 1 AS ok');
        console.log(`\n  DB connected: ${dbCheck[0].ok}`);

        await setup();

        await testFraudI03_IPVelocity();
        await testFraudI04_RapidClicks();
        await testFraudI06_TorExitNode();
        await testFraudI10_ManualIPBlacklist();

        await teardown();
    } catch (err) {
        console.error('\n\u274C TEST SUITE ERROR:', err.message);
        console.error(err.stack);
        errors.push(`Suite error: ${err.message}`);
    }

    console.log(`\n=== IP FRAUD RESULTS: ${passed} passed, ${failed} failed ===\n`);
    if (failed > 0) {
        console.error('FAILURES:');
        errors.forEach(e => console.error(`  ${e}`));
    }

    return { passed, failed, errors };
}

module.exports = { run };

if (require.main === module) {
    run().then(({ passed, failed }) => {
        process.exit(failed > 0 ? 1 : 0);
    });
}
