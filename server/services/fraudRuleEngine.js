'use strict';

/**
 * Unified Fraud Rule Engine
 * Reads rules from 1ai_fraud_rules table, evaluates click/conversion metadata,
 * returns a composite suspicion score (0–100) with matched rules and action.
 *
 * Replaces the binary allow/block logic in fraudDetectionService.js with
 * weighted scoring that matches Voluum's Anti-Fraud Kit.
 */


// ── Consolidated Bot UA Signatures ──────────────────────────────────────────
// Merged from Node (64), PHP (20), Go (33) — deduplicated to ~85 unique patterns.
const BOT_SIGNATURES = [
  // Search engine bots
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot',
  'linkedinbot', 'pinterestbot', 'applebot', 'ia_archiver',
  // SEO / analysis tools
  'ahrefsbot', 'semrushbot', 'mozbot', 'majestic-12', 'rogerbot',
  'exabot', 'screaming frog', 'seznambot', 'dotbot', 'spider',
  'megaindex', 'sogou', 'exalead', 'gigablast', 'scrapy',
  // Performance / monitoring
  'pingdom', 'newrelicpinger', 'datadog', 'uptimerobot',
  'site24x7', 'statuscake', 'monitis', 'keycdn', 'gtmetrix',
  'webpagetest', 'lighthouse', 'pagespeed',
  // Headless browsers / scrapers
  'headlesschrome', 'headless', 'phantomjs', 'slimerjs',
  'selenium', 'puppeteer', 'playwright', 'cypress',
  'nightmare', 'zombie', 'casperjs',
  // Generic crawlers
  'crawler', 'crawling', 'scraper', 'scrapy', 'wget',
  'curl', 'python-requests', 'python-urllib', 'go-http-client',
  'java/', 'libwww-perl', 'httpclient', 'okhttp',
  'apache-httpclient', 'node-fetch', 'axios/', 'got/',
  // Bot frameworks
  'bot', 'nutch', 'heritrix', 'mj12bot',
  'btwebclient', 'a6-indexer', 'netcraft', 'masscan',
  'zgrab', 'nmap', 'nikto', 'nessus', 'openvas',
  'sqlmap', 'dirbuster', 'gobuster', 'wfuzz', 'hydra',
  // Legacy / misc
  'msnbot', 'mediapartners-google', 'adsbot-google',
  'feedfetcher-google', 'google-adwords', 'adwords',
  'proximic', 'zoominfobot', 'meanpathbot', 'spinn3r',
  'genieo', 'bloglovin', 'flipboardproxy', 'tumblr',
  'archive.org', 'wayback', 'ccbot', 'commoncrawl',
  'bytespider', 'petalbot', 'yisouspider',
];

// ── Rule Cache ──────────────────────────────────────────────────────────────
let ruleCache = null;
let ruleCacheExpiry = 0;
const RULE_CACHE_TTL_MS = 60_000; // 1 minute

async function loadRules(pool) {
  const now = Date.now();
  if (ruleCache && now < ruleCacheExpiry) return ruleCache;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, rule_type, target, condition, score_weight, priority
       FROM 1ai_fraud_rules
       WHERE is_active = 1
       ORDER BY priority ASC`
    );
    ruleCache = rows;
    ruleCacheExpiry = now + RULE_CACHE_TTL_MS;
    return rows;
  } catch {
    // Table may not exist yet — return empty
    return [];
  }
}

// ── Built-in Evaluators ─────────────────────────────────────────────────────

function evaluateBotUA(userAgent) {
  if (!userAgent) return { matched: true, score: 20, reason: 'Empty user-agent' };
  const ua = userAgent.toLowerCase();
  for (const sig of BOT_SIGNATURES) {
    if (ua.includes(sig)) {
      return { matched: true, score: 50, reason: `Bot UA signature: ${sig}` };
    }
  }
  return { matched: false, score: 0 };
}

function evaluateEmptyReferrer(referer) {
  if (!referer || referer === '') {
    return { matched: true, score: 10, reason: 'Missing referer' };
  }
  return { matched: false, score: 0 };
}

function evaluateClickVelocity(recentClicks) {
  if (recentClicks > 50) return { matched: true, score: 40, reason: `Extreme click velocity: ${recentClicks}/min` };
  if (recentClicks > 10) return { matched: true, score: 20, reason: `High click velocity: ${recentClicks}/min` };
  return { matched: false, score: 0 };
}

function evaluateClickInterval(intervalMs) {
  if (intervalMs < 500) return { matched: true, score: 30, reason: `Rapid click interval: ${intervalMs}ms` };
  return { matched: false, score: 0 };
}

function evaluateTimeToConvert(ttcSeconds) {
  if (ttcSeconds >= 0 && ttcSeconds < 2) return { matched: true, score: 50, reason: `Suspicious TTC: ${ttcSeconds.toFixed(1)}s (< 2s)` };
  if (ttcSeconds >= 2 && ttcSeconds < 10) return { matched: true, score: 20, reason: `Low TTC: ${ttcSeconds.toFixed(1)}s (< 10s)` };
  return { matched: false, score: 0 };
}

function evaluateDatacenterIP(isDatacenter) {
  if (isDatacenter) return { matched: true, score: 30, reason: 'Datacenter IP address' };
  return { matched: false, score: 0 };
}

function evaluateProxyIP(isProxy) {
  if (isProxy) return { matched: true, score: 40, reason: 'Known proxy/VPN IP' };
  return { matched: false, score: 0 };
}

function evaluateBlacklisted(isBlacklisted) {
  if (isBlacklisted) return { matched: true, score: 50, reason: 'IP is blacklisted' };
  return { matched: false, score: 0 };
}

// ── DB-backed Evaluators ────────────────────────────────────────────────────

async function getRecentClickCount(pool, ip, windowSeconds = 60) {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM 1ai_fraud_click_velocity
       WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)`,
      [ip, windowSeconds]
    );
    return rows[0]?.cnt || 0;
  } catch {
    return 0;
  }
}

async function getLastClickInterval(pool, ip) {
  try {
    const [rows] = await pool.query(
      `SELECT created_at FROM 1ai_fraud_click_velocity
       WHERE ip_address = ?
       ORDER BY created_at DESC LIMIT 1`,
      [ip]
    );
    if (!rows.length) return Infinity;
    const lastClick = new Date(rows[0].created_at).getTime();
    return Date.now() - lastClick;
  } catch {
    return Infinity;
  }
}

async function isIPBlacklisted(pool, ip) {
  try {
    const [rows] = await pool.query(
      `SELECT id FROM 1ai_fraud_blacklist
       WHERE ip_address = ? AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`,
      [ip]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

// ── Main Evaluation ─────────────────────────────────────────────────────────

/**
 * Evaluate a click for fraud signals.
 *
 * @param {object} params
 * @param {string} params.ip — Client IP address
 * @param {string} params.userAgent — User-Agent header
 * @param {string} [params.referer] — Referer header
 * @param {string} [params.slug] — Smartlink slug
 * @param {number} [params.offer_id] — Offer ID
 * @param {number} [params.affiliate_id] — Affiliate ID
 * @param {boolean} [params.isDatacenter] — IP is from datacenter
 * @param {boolean} [params.isProxy] — IP is known proxy/VPN
 * @param {number} [params.ttcSeconds] — Time-to-convert (for conversion evaluation)
 * @returns {Promise<{score: number, action: string, rules: Array<{name: string, score: number, reason: string}>}>}
 */
async function evaluateClick(pool, params) {
  const {
    ip, userAgent, referer = '', slug = '', offer_id = null,
    affiliate_id = null, isDatacenter = false, isProxy = false,
    ttcSeconds = null,
  } = params;

  const matched = [];
  let totalScore = 0;

  // 1. Bot UA check (built-in)
  const botResult = evaluateBotUA(userAgent);
  if (botResult.matched) {
    matched.push({ name: 'bot_ua', score: botResult.score, reason: botResult.reason });
    totalScore += botResult.score;
  }

  // 2. Empty referrer
  const refResult = evaluateEmptyReferrer(referer);
  if (refResult.matched) {
    matched.push({ name: 'empty_referrer', score: refResult.score, reason: refResult.reason });
    totalScore += refResult.score;
  }

  // 3. Click velocity (DB-backed)
  const recentClicks = await getRecentClickCount(pool, ip, 60);
  const velocityResult = evaluateClickVelocity(recentClicks);
  if (velocityResult.matched) {
    matched.push({ name: 'click_velocity', score: velocityResult.score, reason: velocityResult.reason });
    totalScore += velocityResult.score;
  }

  // 4. Click interval
  const interval = await getLastClickInterval(pool, ip);
  const intervalResult = evaluateClickInterval(interval);
  if (intervalResult.matched) {
    matched.push({ name: 'click_interval', score: intervalResult.score, reason: intervalResult.reason });
    totalScore += intervalResult.score;
  }

  // 5. Datacenter IP
  const dcResult = evaluateDatacenterIP(isDatacenter);
  if (dcResult.matched) {
    matched.push({ name: 'datacenter_ip', score: dcResult.score, reason: dcResult.reason });
    totalScore += dcResult.score;
  }

  // 6. Proxy/VPN
  const proxyResult = evaluateProxyIP(isProxy);
  if (proxyResult.matched) {
    matched.push({ name: 'proxy_vpn', score: proxyResult.score, reason: proxyResult.reason });
    totalScore += proxyResult.score;
  }

  // 7. Blacklisted IP
  const blResult = evaluateBlacklisted(await isIPBlacklisted(pool, ip));
  if (blResult.matched) {
    matched.push({ name: 'blacklisted_ip', score: blResult.score, reason: blResult.reason });
    totalScore += blResult.score;
  }

  // 8. Time-to-convert (only for conversion evaluation)
  if (ttcSeconds !== null && ttcSeconds >= 0) {
    const ttcResult = evaluateTimeToConvert(ttcSeconds);
    if (ttcResult.matched) {
      matched.push({ name: 'time_to_convert', score: ttcResult.score, reason: ttcResult.reason });
      totalScore += ttcResult.score;
    }
  }

  // 9. DB-configured rules (from 1ai_fraud_rules)
  const rules = await loadRules(pool);
  for (const rule of rules) {
    if (rule.target === 'conversion' && ttcSeconds === null) continue;
    if (rule.target === 'click' && ttcSeconds !== null) continue;

    try {
      const cond = typeof rule.condition === 'string' ? JSON.parse(rule.condition) : rule.condition;
      const weight = parseFloat(rule.score_weight) || 0.5;
      const ruleScore = Math.round(weight * 100);

      // Evaluate based on rule_type
      let ruleMatched = false;
      let reason = '';

      switch (rule.rule_type) {
        case 'ua_blacklist':
          if (cond.patterns) {
            const ua = (userAgent || '').toLowerCase();
            for (const p of cond.patterns) {
              if (ua.includes(p.toLowerCase())) {
                ruleMatched = true;
                reason = `UA matches pattern: ${p}`;
                break;
              }
            }
          }
          break;
        case 'ip_velocity':
          if (cond.threshold && recentClicks > cond.threshold) {
            ruleMatched = true;
            reason = `IP velocity ${recentClicks} exceeds threshold ${cond.threshold}`;
          }
          break;
        case 'click_velocity':
          if (cond.threshold && recentClicks > cond.threshold) {
            ruleMatched = true;
            reason = `Click velocity ${recentClicks} exceeds threshold ${cond.threshold}`;
          }
          break;
        case 'geo_vpn':
          if (isProxy || isDatacenter) {
            ruleMatched = true;
            reason = 'Geo/VPN rule matched';
          }
          break;
        default:
          break;
      }

      if (ruleMatched) {
        matched.push({ name: rule.name, score: ruleScore, reason });
        totalScore += ruleScore;
      }
    } catch {
      // Invalid rule condition — skip
    }
  }

  // Clamp score to 0–100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine action
  let action = 'allow';
  if (finalScore >= 80) action = 'block';
  else if (finalScore >= 40) action = 'review';

  return { score: finalScore, action, rules: matched };
}

/**
 * Record a click in the velocity tracking table.
 */
async function recordClick(pool, ip, clickId, affiliateId, userAgent, blocked, reason) {
  try {
    await pool.query(
      `INSERT INTO 1ai_fraud_click_velocity
       (ip_address, click_id, affiliate_id, fraud_score, reason, blocked, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [ip, clickId || '', affiliateId || 0, blocked ? 1.0 : 0.0, reason || null, blocked ? 1 : 0]
    );
  } catch {
    // Non-fatal
  }
}

/**
 * Auto-blacklist an IP if score exceeds threshold.
 */
async function autoBlacklist(pool, ip, score, reason) {
  if (score < 80) return;
  try {
    await pool.query(
      `INSERT IGNORE INTO 1ai_fraud_blacklist (ip_address, reason, created_by, created_at)
       VALUES (?, ?, 0, NOW())`,
      [ip, reason || `Auto-blacklisted: score ${score}`]
    );
  } catch {
    // Non-fatal
  }
}

// ── Proxy/VPN Detection ────────────────────────────────────────────────────

const DATACENTER_PATTERNS = [
  'amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean', 'ovh',
  'hetzner', 'linode', 'vultr', 'alibaba', 'tencent', 'oracle', 'ibm',
  'rackspace', 'softlayer', 'equinix', 'colo', 'hosting', 'datacenter',
  'cloud', 'leaseweb', 'choopa', 'psychz', 'colocrossing', 'contabo',
];

// ponytail: single ASN reader ref, no init() ceremony
let asnReader = null;
function setASNReader(reader) { asnReader = reader; }

function checkASN(ip) {
  if (!asnReader) return { isDatacenter: false, asn: null, org: null };
  try {
    const r = asnReader.get(ip);
    if (!r) return { isDatacenter: false, asn: null, org: null };
    const org = (r.autonomous_system_organization || '').toLowerCase();
    return { isDatacenter: DATACENTER_PATTERNS.some(p => org.includes(p)), asn: r.autonomous_system_number || null, org: r.autonomous_system_organization || null };
  } catch { return { isDatacenter: false, asn: null, org: null }; }
}

// ── Honeypot ───────────────────────────────────────────────────────────────

function generateHoneypotHTML(campaignId) {
  const id = String(campaignId).replace(/[^a-zA-Z0-9_-]/g, '');
  return `<a href="/go/honeypot/${id}" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-hidden="true" tabindex="-1">.</a>`;
}

async function recordHoneypotClick(pool, ip, userAgent, campaignId) {
  try {
    await pool.query(`INSERT INTO 1ai_fraud_click_velocity (ip_address, click_id, affiliate_id, fraud_score, reason, blocked, created_at) VALUES (?, ?, 0, 1.000, ?, 1, NOW())`, [ip, `honeypot_${campaignId}`, `Honeypot trap: campaign ${campaignId}`]);
    await pool.query(`INSERT IGNORE INTO 1ai_fraud_blacklist (ip_address, reason, created_by, created_at) VALUES (?, ?, 0, NOW())`, [ip, `Auto-blacklisted: honeypot (campaign ${campaignId})`]);
  } catch { /* tables may not exist */ }
}

async function honeypotHandler(req, res) {
  const pool = require('../db/mysql');
  const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || '0.0.0.0';
  await recordHoneypotClick(pool, ip, req.headers['user-agent'] || '', req.params.campaignId);
  res.status(204).end();
}

module.exports = {
  evaluateClick,
  recordClick,
  autoBlacklist,
  BOT_SIGNATURES,
  evaluateBotUA,
  evaluateClickVelocity,
  evaluateClickInterval,
  evaluateTimeToConvert,
  evaluateDatacenterIP,
  evaluateProxyIP,
  setASNReader,
  checkASN,
  DATACENTER_PATTERNS,
  generateHoneypotHTML,
  recordHoneypotClick,
  honeypotHandler,
};
