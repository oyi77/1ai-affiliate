'use strict';

/**
 * Enhanced Fraud Detection Service
 * Zero mocks — all checks hit real DB queries
 */

const db = require('../db/mysql');

const RAPID_CLICK_THRESHOLD_MS = 1000;
const RAPID_CLICK_MAX = 3;
const VELOCITY_CLICKS_PER_MIN = 50;
const VELOCITY_WINDOW_SECONDS = 60;
const CONVERSION_EXPIRY_HOURS = 72;

const KNOWN_BOT_SIGNATURES = [
    // Search engine bots
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot',
    'linkedinbot', 'pinterestbot', 'applebot', 'ia_archiver',
    // SEO / analysis tools
    'ahrefsbot', 'semrushbot', 'mozbot', 'majestic-12', 'rogerbot',
    'exabot', 'screaming frog', 'seznambot', 'dotbot', 'spider',
    // Performance / monitoring
    'pingdom', 'newrelicpinger', 'datadog', 'uptimerobot',
    'site24x7', 'statuscake', 'monitis', 'keycdn',
    // Headless browsers / scrapers
    'headlesschrome', 'headless', 'phantomjs', 'slimerjs',
    'selenium', 'puppeteer', 'playwright', 'cypress',
    // Generic crawlers
    'crawler', 'crawling', 'scraper', 'scrapy', 'wget',
    'curl', 'python-requests', 'python-urllib', 'go-http-client',
    'java/', 'libwww-perl', 'httpclient', 'okhttp',
    // Bot frameworks
    'bot', 'nutch', 'heritrix', 'gigabot', 'mj12bot',
    'btwebclient', 'a6-indexer', 'netcraft', 'masscan',
    'zgrab', 'nmap', 'nikto', 'nessus',
    // Legacy / misc
    'msnbot', 'mediapartners-google', 'adsbot-google',
    'feedfetcher-google', 'google-adwords', 'adwords',
    'proximic', 'zoominfobot', 'meanpathbot', 'spinn3r',
    'genieo', 'bloglovin', 'flipboardproxy', 'tumblr'
];

/**
 * Check click for fraud signals
 * @param {string} ip
 * @param {string} slug
 * @param {string} userAgent
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function checkClickFraud(ip, slug, userAgent, offer_id, affiliate_id) {
    try {
        // 1. Bot UA check (fastest, no DB)
        const botCheck = checkBotUserAgent(userAgent);
        if (botCheck) {
            return { allowed: false, reason: botCheck };
        }

        // 2. Blacklist check (DB)
        const blacklistCheck = await checkBlacklist(ip, userAgent);
        if (blacklistCheck.blocked) {
            return { allowed: false, reason: blacklistCheck.reason };
        }

        // 3. Rapid click check (DB — count clicks from same IP in last 1 second)
        const rapidCheck = await checkRapidClicks(ip);
        if (rapidCheck.blocked) {
            return { allowed: false, reason: rapidCheck.reason };
        }

        // 4. Velocity check (> 50 clicks/min from same IP across offers)
        const velocityCheck = await checkClickVelocity(ip);
        if (velocityCheck.blocked) {
            // Auto-blacklist on velocity violation
            await addToBlacklist('ip', ip, velocityCheck.reason, 'high', true);
            return { allowed: false, reason: velocityCheck.reason };
        }

        return { allowed: true };
    } catch (err) {
        console.error('[FraudDetection] checkClickFraud error:', err);
        // On error, allow the click through (fail open for availability)
        return { allowed: true };
    }
}

/**
 * Check user-agent against known bot signatures
 * @param {string} userAgent
 * @returns {string|null} reason string if blocked, null if allowed
 */
function checkBotUserAgent(userAgent) {
    if (!userAgent || userAgent.trim() === '') {
        return 'Empty user agent — blocked';
    }

    const ua = userAgent.toLowerCase();

    for (const signature of KNOWN_BOT_SIGNATURES) {
        if (ua.includes(signature)) {
            return `Known bot signature detected: "${signature}"`;
        }
    }

    return null;
}

/**
 * Check IP and UA against fraud blacklist
 * @param {string} ip
 * @param {string} userAgent
 * @returns {Promise<{blocked: boolean, reason?: string}>}
 */
async function checkBlacklist(ip, userAgent) {
    const [blacklisted] = await db.query(
        `SELECT type, value, severity, reason
         FROM 1ai_fraud_blacklist
         WHERE (type = 'ip' AND value = ?)
            OR (type = 'ua' AND value = ?)
            OR (type = 'ip_range' AND ? LIKE value)
         LIMIT 5`,
        [ip, userAgent, ip]
    );

    if (blacklisted.length > 0) {
        const entry = blacklisted[0];
        return {
            blocked: true,
            reason: `Blacklisted ${entry.type}: "${entry.value}" — ${entry.reason || 'No reason provided'} (severity: ${entry.severity || 'medium'})`
        };
    }

    return { blocked: false };
}

/**
 * Check for rapid clicks from same IP in the last second
 * @param {string} ip
 * @returns {Promise<{blocked: boolean, reason?: string}>}
 */
async function checkRapidClicks(ip) {
    const [clicks] = await db.query(
        `SELECT COUNT(*) AS cnt
         FROM 1ai_fraud_click_velocity
         WHERE ip_address = ?
           AND created_at > DATE_SUB(NOW(), INTERVAL ? MICROSECOND)
           AND blocked = 0`,
        [ip, RAPID_CLICK_THRESHOLD_MS * 1000]
    );

    const count = clicks[0]?.cnt || 0;
    if (count >= RAPID_CLICK_MAX) {
        return {
            blocked: true,
            reason: `Rapid clicks detected: ${count + 1} clicks from IP ${ip} in last ${RAPID_CLICK_THRESHOLD_MS}ms (max ${RAPID_CLICK_MAX})`
        };
    }

    return { blocked: false };
}

/**
 * Check click velocity from same IP across all offers
 * Auto-blacklists if exceeded
 * @param {string} ip
 * @returns {Promise<{blocked: boolean, reason?: string}>}
 */
async function checkClickVelocity(ip) {
    const [clicks] = await db.query(
        `SELECT COUNT(*) AS cnt
         FROM 1ai_fraud_click_velocity
         WHERE ip_address = ?
           AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)`,
        [ip, VELOCITY_WINDOW_SECONDS]
    );

    const count = clicks[0]?.cnt || 0;
    if (count >= VELOCITY_CLICKS_PER_MIN) {
        return {
            blocked: true,
            reason: `Velocity threshold exceeded: ${count} clicks from IP ${ip} in last ${VELOCITY_WINDOW_SECONDS}s (max ${VELOCITY_CLICKS_PER_MIN})`
        };
    }

    return { blocked: false };
}

/**
 * Record a click in the velocity tracking table
 * @param {string} ip
 * @param {string} slug
 * @param {number} offer_id
 * @param {number} affiliate_id
 * @param {string} user_agent
 * @param {number} blocked - 0 or 1
 * @param {string|null} reason
 */
async function recordClickVelocity(ip, slug, offer_id, affiliate_id, user_agent, blocked, reason) {
    try {
        await db.query(
            `INSERT INTO 1ai_fraud_click_velocity
             (ip_address, slug, offer_id, affiliate_id, user_agent, blocked, reason, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [ip, slug || null, offer_id || null, affiliate_id || null, user_agent || null, blocked ? 1 : 0, reason || null]
        );
    } catch (err) {
        console.error('[FraudDetection] recordClickVelocity error:', err);
        // Non-critical logging — never throw
    }
}

/**
 * Add an entry to the fraud blacklist
 * @param {string} type - 'ip' | 'ua' | 'ip_range'
 * @param {string} value
 * @param {string} reason
 * @param {string} severity - 'low' | 'medium' | 'high' | 'critical'
 * @param {boolean} auto_detected
 * @returns {Promise<Object>} created blacklist entry
 */
async function addToBlacklist(type, value, reason, severity, auto_detected) {
    const validTypes = ['ip', 'ua', 'ip_range'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
        throw new Error(`Invalid blacklist type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!value || value.trim() === '') {
        throw new Error('Blacklist value is required');
    }

    if (!validSeverities.includes(severity)) {
        severity = 'medium';
    }

    // Check if already blacklisted
    const [existing] = await db.query(
        `SELECT id FROM 1ai_fraud_blacklist WHERE type = ? AND value = ?`,
        [type, value]
    );

    if (existing.length > 0) {
        // Update severity and reason
        await db.query(
            `UPDATE 1ai_fraud_blacklist
             SET severity = ?, reason = ?, auto_detected = ?, updated_at = NOW(), blocked_count = blocked_count + 1
             WHERE id = ?`,
            [severity, reason || 'Auto-detected', auto_detected ? 1 : 0, existing[0].id]
        );
        return {
            id: existing[0].id,
            type,
            value,
            severity,
            reason: reason || 'Auto-detected',
            auto_detected,
            updated: true
        };
    }

    const [result] = await db.query(
        `INSERT INTO 1ai_fraud_blacklist
         (type, value, reason, severity, auto_detected, blocked_count, created_at)
         VALUES (?, ?, ?, ?, ?, 1, NOW())`,
        [type, value, reason || null, severity, auto_detected ? 1 : 0]
    );

    return {
        id: result.insertId,
        type,
        value,
        severity,
        reason: reason || null,
        auto_detected,
        updated: false
    };
}

/**
 * Check conversion for fraud signals
 * @param {number} click_id
 * @param {number} offer_id
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
async function checkConversionFraud(click_id, offer_id) {
    try {
        // 1. Verify click exists in 1ai_clicks
        const [clicks] = await db.query(
            `SELECT click_id, click_time, click_payout, click_bot
             FROM 1ai_clicks WHERE click_id = ?`,
            [click_id]
        );

        if (clicks.length === 0) {
            return { allowed: false, reason: `Click ID ${click_id} not found` };
        }

        const click = clicks[0];

        // 2. Check if click was already converted (via conversion_logs)
        const [conversions] = await db.query(
            `SELECT COUNT(*) AS cnt FROM 1ai_conversion_logs
             WHERE click_id = ?`,
            [click_id]
        );

        if (conversions[0]?.cnt > 0) {
            return {
                allowed: false,
                reason: 'duplicate_conversion',
                detail: `Click ID ${click_id} already converted (${conversions[0].cnt} existing)`
            };
        }

        // 3. Check if click was marked as bot
        if (click.click_bot) {
            return { allowed: false, reason: 'bot_click', detail: 'Click was marked as bot traffic' };
        }

        // 4. Check expiry (72 hour window from click_time unix timestamp)
        const now = Math.floor(Date.now() / 1000);
        const maxAge = 72 * 3600;
        if (click.click_time && (now - click.click_time) > maxAge) {
            return {
                allowed: false,
                reason: 'expired_click',
                detail: `Click is ${Math.floor((now - click.click_time) / 3600)} hours old (max 72h)`
            };
        }

        return { allowed: true };
    } catch (err) {
        console.error('[FraudDetection] checkConversionFraud error:', err);
        return { allowed: true };
    }
}

/**
 * Check if payout would result in negative margin
 * @param {number} network_payout - what the network pays
 * @param {number} payout - what the affiliate gets paid
 * @returns {{safe: boolean, margin_pct: number, error?: string}}
 */
function checkNegativeMargin(network_payout, payout) {
    const netPayout = parseFloat(network_payout);
    const affPayout = parseFloat(payout);

    if (isNaN(netPayout) || isNaN(affPayout)) {
        return { safe: false, margin_pct: 0, error: 'Invalid payout values' };
    }

    if (netPayout <= 0) {
        return { safe: false, margin_pct: 0, error: 'Network payout must be greater than zero' };
    }

    const marginPct = ((netPayout - affPayout) / netPayout) * 100;

    if (affPayout > netPayout) {
        return {
            safe: false,
            margin_pct: Number(marginPct.toFixed(2)),
            error: `Negative margin: payout $${affPayout} exceeds network payout $${netPayout}`
        };
    }

    return {
        safe: true,
        margin_pct: Number(marginPct.toFixed(2))
    };
}

/**
 * Get blacklist entries with optional filters
 * @param {Object} filters
 * @param {string} [filters.type]
 * @param {string} [filters.severity]
 * @param {number} [filters.limit]
 * @returns {Promise<Array>}
 */
async function getBlacklist(filters = {}) {
    let sql = 'SELECT * FROM 1ai_fraud_blacklist WHERE 1=1';
    const params = [];

    if (filters.type) {
        sql += ' AND type = ?';
        params.push(filters.type);
    }
    if (filters.severity) {
        sql += ' AND severity = ?';
        params.push(filters.severity);
    }

    sql += ' ORDER BY updated_at DESC';
    const limit = filters.limit || 100;
    sql += ' LIMIT ?';
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows;
}

/**
 * Remove an entry from the blacklist
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function removeFromBlacklist(id) {
    const [result] = await db.query(
        `DELETE FROM 1ai_fraud_blacklist WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    checkClickFraud,
    checkBotUserAgent,
    checkBlacklist,
    checkRapidClicks,
    checkClickVelocity,
    checkConversionFraud,
    checkNegativeMargin,
    recordClickVelocity,
    addToBlacklist,
    getBlacklist,
    removeFromBlacklist,
    KNOWN_BOT_SIGNATURES,
    RAPID_CLICK_THRESHOLD_MS,
    RAPID_CLICK_MAX,
    VELOCITY_CLICKS_PER_MIN,
    VELOCITY_WINDOW_SECONDS,
    CONVERSION_EXPIRY_HOURS
};
