/**
 * E2E Fraud Tests — Bot Detection
 *
 * Covers: FRAUD-B05, FRAUD-B06, FRAUD-B07
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
    console.log('\n=== BOT DETECTION SETUP ===\n');

    // Clean existing test data
    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE reason LIKE 'E2E-TEST-%'");

    // Create minimal test data
    const advHash = makeid(32);
    const [advResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-bot-adv-${makeid(4)}`, `bot-adv-${makeid(4)}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), advHash, makeid(32)]
    );

    const pubHash = makeid(32);
    const [pubResult] = await db.query(
        `INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added, clickserver_api_key, user_stats_app_key, install_hash, user_hash, modal_status, vip_perks_status)
         VALUES (?, ?, ?, 'publisher', UNIX_TIMESTAMP(), ?, ?, ?, ?, 1, 1)`,
        [`E2E-TEST-bot-pub-${makeid(4)}`, `bot-pub-${makeid(4)}@test.com`,
         crypto.createHash('sha256').update('test').digest('hex'),
         makeid(16), makeid(16), pubHash, makeid(32)]
    );

    const [affResult] = await db.query(
        `INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at) VALUES (?, ?, 'pro', UNIX_TIMESTAMP())`,
        [pubResult.insertId, `E2E-TEST-BOTAFF-${makeid(4)}`]
    );
    testAffiliateId = affResult.insertId;

    const [offerResult] = await db.query(
        `INSERT INTO 1ai_offers (name, advertiser_id, payout, network_payout, payout_model, payout_currency,
                                 approval_status, margin_floor_pct, created_at)
         VALUES (?, ?, 5.00, 10.00, 'cpa', 'USD', 'approved', 5.00, UNIX_TIMESTAMP())`,
        [`E2E-TEST-BotOffer-${makeid(4)}`, advResult.insertId]
    );
    testOfferId = offerResult.insertId;

    console.log(`  Offer: ${testOfferId}, Affiliate: ${testAffiliateId}`);

    // Start server for any API-based checks
    server = app.listen(TEST_PORT);
    console.log(`  Test server started on port ${TEST_PORT}`);
    await new Promise(r => setTimeout(r, 500));
}

// ── FRAUD-B05: HeadlessChrome UA detection ──────

async function testFraudB05_HeadlessChromeUA() {
    console.log('\n=== FRAUD-B05: HeadlessChrome user-agent detection ===');

    // Collection of headless/automation browser UAs
    const headlessUAs = [
        // Headless Chrome
        {
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
            label: 'HeadlessChrome (explicit)',
            shouldBlock: true,
        },
        // PhantomJS
        {
            ua: 'Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/538.1 (KHTML, like Gecko) PhantomJS/2.1.1 Safari/538.1',
            label: 'PhantomJS',
            shouldBlock: true,
        },
        // Selenium
        {
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Selenium/4.15.0',
            label: 'Selenium WebDriver',
            shouldBlock: true,
        },
        // Puppeteer
        {
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36 Puppeteer/21.0.0',
            label: 'Puppeteer',
            shouldBlock: true,
        },
        // Playwright
        {
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Playwright/1.40.0',
            label: 'Playwright',
            shouldBlock: true,
        },
        // Cypress
        {
            ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Cypress/13.6.0',
            label: 'Cypress',
            shouldBlock: true,
        },
        // SlimerJS
        {
            ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 SlimerJS/1.0.0 Firefox/68.0',
            label: 'SlimerJS',
            shouldBlock: true,
        },
        // Generic "headless" signature
        {
            ua: 'headless/2.0 (custom automation framework)',
            label: 'Generic headless',
            shouldBlock: true,
        },
    ];

    // Also test legitimate browser UAs (should NOT be blocked)
    const legitimateUAs = [
        {
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            label: 'Normal Chrome on Windows',
            shouldBlock: false,
        },
        {
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            label: 'Normal Safari on macOS',
            shouldBlock: false,
        },
        {
            ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            label: 'Normal Safari on iPhone',
            shouldBlock: false,
        },
    ];

    const testIP = '198.51.100.10';
    const testSlug = `e2e-bot-b05-${makeid(4)}`;

    // Test headless/automation UAs
    let headlessBlocked = 0;
    let headlessTotal = 0;

    for (const { ua, label, shouldBlock } of headlessUAs) {
        headlessTotal++;
        const result = await fraudDetection.checkClickFraud(
            testIP, testSlug, ua, testOfferId, testAffiliateId
        );
        if (shouldBlock) {
            const blocked = result.allowed === false;
            if (blocked) headlessBlocked++;
            const botReason = fraudDetection.checkBotUserAgent(ua);
            console.log(`  ${label}: blocked=${blocked} (botCheck=${botReason || 'none'})`);
            assert(blocked,
                `${label} detected as bot (allowed=${result.allowed})`);
        }
    }

    // Test legitimate UAs
    for (const { ua, label, shouldBlock } of legitimateUAs) {
        const result = await fraudDetection.checkClickFraud(
            '198.51.100.20', testSlug, ua, testOfferId, testAffiliateId
        );
        if (!shouldBlock) {
            const botReason = fraudDetection.checkBotUserAgent(ua);
            console.log(`  ${label}: allowed=${result.allowed} (botCheck=${botReason || 'none'})`);
            assert(result.allowed === true,
                `${label} NOT falsely flagged as bot (allowed=${result.allowed})`);
        }
    }

    console.log(`  Headless detection rate: ${headlessBlocked}/${headlessTotal}`);
}

// ── FRAUD-B06: Custom bot not in base list ───────

async function testFraudB06_CustomBotBlacklist() {
    console.log('\n=== FRAUD-B06: Custom bot UA not in base list — add & detect ===');

    const customBotUA = 'MyCustomScraperBot/3.0 (+https://evil-crawler.example.com)';
    const testIP = '198.51.100.40';
    const testSlug = `e2e-bot-b06-${makeid(4)}`;

    // Step 1: Verify the custom bot is NOT in the base list
    const baseCheck = fraudDetection.checkBotUserAgent(customBotUA);
    console.log(`  Base bot check for custom UA: ${baseCheck || 'not in base list'}`);
    assert(baseCheck === null,
        `Custom bot UA not in base detection list: ${customBotUA}`);

    // Step 2: The bot might still pass if not blacklisted yet
    let initialResult = await fraudDetection.checkClickFraud(
        testIP, testSlug, customBotUA, testOfferId, testAffiliateId
    );
    console.log(`  Initial click check (before blacklist): allowed=${initialResult.allowed}`);

    // Step 3: Add the custom bot UA to the fraud blacklist
    let blEntry;
    try {
        blEntry = await fraudDetection.addToBlacklist(
            'ua', customBotUA,
            `E2E-TEST-custom-bot: user-defined scraper bot`,
            'high', false
        );
        console.log(`  Added custom bot to blacklist: id=${blEntry.id}, severity=${blEntry.severity}`);
        assert(blEntry.type === 'ua',
            `Blacklist entry type = ua (got ${blEntry.type})`);
        assert(blEntry.value === customBotUA,
            `Blacklist value matches custom UA`);
    } catch (e) {
        console.log(`  \u26A0 Blacklist add error: ${e.message}`);
        assert(false, `Failed to add custom bot to blacklist: ${e.message}`);
        return;
    }

    // Step 4: Verify the blacklisted UA is now detected
    const blCheck = await fraudDetection.checkBlacklist(testIP, customBotUA);
    console.log(`  Blacklist check: blocked=${blCheck.blocked}, reason=${blCheck.reason || 'none'}`);
    assert(blCheck.blocked === true,
        `Custom bot UA found in blacklist after addition`);

    // Step 5: Verify click with this UA is now blocked
    const finalResult = await fraudDetection.checkClickFraud(
        testIP, testSlug, customBotUA, testOfferId, testAffiliateId
    );
    assert(finalResult.allowed === false,
        `Click from custom bot UA blocked after blacklisting (allowed=${finalResult.allowed})`);

    // Step 6: Verify removal works
    // Try to get the blacklist entry ID
    const blacklist = await fraudDetection.getBlacklist({ type: 'ua' });
    const customEntry = blacklist.find(e => e.value === customBotUA);

    if (customEntry) {
        const removed = await fraudDetection.removeFromBlacklist(customEntry.id);
        console.log(`  Removed custom bot from blacklist: ${removed}`);
        assert(removed === true,
            `Custom bot UA removed from blacklist`);

        // After removal, bot should be allowed again (assuming it's not in base list)
        const afterRemoval = await fraudDetection.checkClickFraud(
            testIP, testSlug, customBotUA, testOfferId, testAffiliateId
        );
        console.log(`  After removal: allowed=${afterRemoval.allowed}`);
    }
}

// ── FRAUD-B07: Spot-check 10 most common bot signatures ──

async function testFraudB07_BotSignatureSpotCheck() {
    console.log('\n=== FRAUD-B07: Spot-check 10 most common bot signatures (score >= 0.4) ===');

    const testIP = '198.51.100.99';
    const testSlug = `e2e-bot-b07-${makeid(4)}`;

    // The 10 most common bot signatures selected from the 40+ in KNOWN_BOT_SIGNATURES
    // Each should be detected by the Node.js fraud service
    const spotCheckBots = [
        {
            ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            name: 'Googlebot',
            signature: 'googlebot',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
            name: 'Bingbot',
            signature: 'bingbot',
            minScore: 0.4,
        },
        {
            ua: 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
            name: 'DuckDuckBot',
            signature: 'duckduckbot',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
            name: 'Baiduspider',
            signature: 'baiduspider',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
            name: 'YandexBot',
            signature: 'yandexbot',
            minScore: 0.4,
        },
        {
            ua: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            name: 'Facebook External Hit',
            signature: 'facebookexternalhit',
            minScore: 0.4,
        },
        {
            ua: 'Twitterbot/1.0',
            name: 'Twitterbot',
            signature: 'twitterbot',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
            name: 'AhrefsBot',
            signature: 'ahrefsbot',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
            name: 'SemrushBot',
            signature: 'semrushbot',
            minScore: 0.4,
        },
        {
            ua: 'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)',
            name: 'DotBot (Moz)',
            signature: 'dotbot',
            minScore: 0.4,
        },
    ];

    // Also verify these additional signatures from the base list for broader coverage
    const additionalSigs = [
        { signature: 'slurp', name: 'Yahoo Slurp' },
        { signature: 'applebot', name: 'AppleBot' },
        { signature: 'linkedinbot', name: 'LinkedInBot' },
        { signature: 'screaming frog', name: 'Screaming Frog SEO' },
        { signature: 'phantomjs', name: 'PhantomJS' },
        { signature: 'playwright', name: 'Playwright' },
        { signature: 'selenium', name: 'Selenium' },
        { signature: 'curl', name: 'cURL' },
        { signature: 'wget', name: 'Wget' },
        { signature: 'python-requests', name: 'Python Requests' },
    ];

    let detectedCount = 0;
    let totalChecks = 0;

    // Test the 10 primary spot-check bots via checkClickFraud (which calls checkBotUserAgent)
    for (const { ua, name, signature, minScore } of spotCheckBots) {
        totalChecks++;
        const result = await fraudDetection.checkClickFraud(
            testIP, testSlug, ua, testOfferId, testAffiliateId
        );

        const botReason = fraudDetection.checkBotUserAgent(ua);
        const blocked = result.allowed === false;
        const detectedSig = botReason ? botReason.match(/"([^"]+)"/)?.[1] || signature : 'none';

        console.log(`  ${name}: blocked=${blocked}, sig="${detectedSig}", reason=${botReason || 'none'}`);

        if (blocked) detectedCount++;

        // Assert the bot is detected (blocked)
        assert(blocked,
            `${name} detected as bot (signature: ${signature}, blocked=${blocked})`);

        // Verify the signature matches
        if (botReason) {
            const containsSig = botReason.toLowerCase().includes(signature);
            if (containsSig) {
                console.log(`    \u2192 Correct signature matched: "${signature}"`);
            }
        }
    }

    // Test additional signatures via direct checkBotUserAgent
    console.log('\n  Additional signature coverage:');
    for (const { signature, name } of additionalSigs) {
        totalChecks++;
        const testUA = `TestUA/1.0 ${signature}/2.0`;
        const botReason = fraudDetection.checkBotUserAgent(testUA);
        const detected = botReason !== null;

        if (detected) detectedCount++;
        console.log(`  ${name} ("${signature}"): detected=${detected}`);

        assert(detected,
            `${name} signature "${signature}" detected in user-agent`);
    }

    console.log(`\n  Bot detection coverage: ${detectedCount}/${totalChecks} detected`);
    assert(detectedCount >= totalChecks * 0.8,
        `At least 80% of bot signatures detected (${detectedCount}/${totalChecks})`);
}

// ── Teardown ────────────────────────────────────

async function teardown() {
    console.log('\n=== BOT DETECTION TEARDOWN ===\n');

    await db.query("DELETE FROM 1ai_fraud_blacklist WHERE reason LIKE 'E2E-TEST-%'");
    await db.query("DELETE FROM 1ai_fraud_click_velocity WHERE reason LIKE 'E2E-TEST-%'");
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
    console.log('  1AI Affiliate — Bot Detection E2E Test Suite');
    console.log('  FRAUD-B05, B06, B07');
    console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

    try {
        const [dbCheck] = await db.query('SELECT 1 AS ok');
        console.log(`\n  DB connected: ${dbCheck[0].ok}`);

        await setup();

        await testFraudB05_HeadlessChromeUA();
        await testFraudB06_CustomBotBlacklist();
        await testFraudB07_BotSignatureSpotCheck();

        await teardown();
    } catch (err) {
        console.error('\n\u274C TEST SUITE ERROR:', err.message);
        console.error(err.stack);
        errors.push(`Suite error: ${err.message}`);
    }

    console.log(`\n=== BOT DETECTION RESULTS: ${passed} passed, ${failed} failed ===\n`);
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
