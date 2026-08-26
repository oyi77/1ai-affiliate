'use strict';

/**
 * Platform Review Mode — Detect and handle platform ad reviewers.
 *
 * Platforms like Facebook, Google, TikTok have review systems that visit
 * offer URLs to check compliance. These reviewers use:
 * - Real residential IPs (not datacenter)
 * - Standard Chrome/Safari UAs
 * - Platform-specific referer domains
 * - Sometimes execute JavaScript
 *
 * This service maintains known reviewer IP ranges and behavioral signatures
 * to identify review traffic and serve safe pages.
 *
 * IP ranges are stored in DB table `1ai_platform_ip_ranges` and loaded via
 * loadPlatformRanges(pool). The constants below serve as fallback defaults.
 */

// ── DB Loader ───────────────────────────────────────────────────────────

/**
 * Load platform IP ranges from DB. Returns null on error so callers
 * can fall back to the hardcoded constants.
 *
 * @param {Object} pool - mysql2/promise pool
 * @returns {Array<{platform, range_type, ip_range}>|null}
 */
async function loadPlatformRanges(pool) {
  try {
    const [rows] = await pool.query(
      'SELECT platform, range_type, ip_range FROM 1ai_platform_ip_ranges WHERE is_active = 1'
    );
    return rows;
  } catch {
    return null;
  }
}

// ── Hardcoded Fallback Constants ─────────────────────────────────────────

// FALLBACK_DEFAULT: known platform reviewer IP ranges
// Loaded from DB in production; these are the offline fallback
const PLATFORM_REVIEWER_RANGES = {
  facebook: {
    // Meta's known IP ranges for crawlers/reviewers
    // Source: https://developers.facebook.com/docs/sharing/webmasters/crawler
    ip_ranges: [
      '66.220.144.0/20',
      '69.63.176.0/20',
      '69.171.224.0/20',
      '74.119.76.0/22',
      '103.4.96.0/22',
      '173.252.64.0/18',
      '204.15.20.0/22',
    ],
    ua_patterns: ['facebookexternalhit', 'facebot', 'meta-externalagent'],
    referer_patterns: ['facebook.com', 'fb.com', 'l.facebook.com', 'lm.facebook.com'],
    safe_urls: [
      'https://www.facebook.com',
      'https://www.facebook.com/business',
      'https://www.facebook.com/help',
    ],
  },
  google: {
    // Google's known IP ranges for crawlers/reviewers
    // Source: https://developers.google.com/search/docs/crawling-indexing/verifying-googlebot
    ip_ranges: [
      '66.249.64.0/19',
      '72.14.192.0/18',
      '74.125.0.0/16',
      '108.177.8.0/21',
      '173.194.0.0/16',
      '209.85.128.0/17',
    ],
    ua_patterns: ['googlebot', 'google-read-aloud', 'googleother', 'adsbot-google', 'apis-google'],
    referer_patterns: ['google.com', 'googleapis.com', 'googlebot.com'],
    safe_urls: [
      'https://www.google.com',
      'https://www.google.com/search',
      'https://news.google.com',
    ],
  },
  tiktok: {
    // TikTok's known ranges for content review
    ip_ranges: [
      '161.117.0.0/16',
      '47.74.0.0/16',
      '47.88.0.0/16',
    ],
    ua_patterns: ['tiktok', 'bytedance', 'byteoversea'],
    referer_patterns: ['tiktok.com', 'bytedance.com', 'tiktokcdn.com'],
    safe_urls: [
      'https://www.tiktok.com',
      'https://www.tiktok.com/explore',
    ],
  },
  bing: {
    ip_ranges: [
      '13.64.0.0/11',
      '40.64.0.0/10',
      '104.208.0.0/13',
    ],
    ua_patterns: ['bingbot', 'msnbot', 'adidxbot'],
    referer_patterns: ['bing.com', 'msn.com', 'live.com'],
    safe_urls: [
      'https://www.bing.com',
      'https://www.bing.com/search',
    ],
  },
  twitter: {
    ip_ranges: [
      '199.16.156.0/22',    // Twitter primary
      '199.96.57.0/24',     // Twitter
      '199.96.58.0/24',     // Twitter
      '199.96.59.0/24',     // Twitter
      '199.59.148.0/22',    // Twitter
      '202.160.128.0/22',   // Twitter Asia
      '209.237.192.0/19',   // Twitter legacy
      '104.244.42.0/21',    // Twitter
      '185.45.5.0/24',      // X Corp
    ],
    ua_patterns: ['twitterbot', 'twitterbot-crawler', 'xbot'],
    referer_patterns: ['twitter.com', 'x.com', 't.co', 'twimg.com'],
    safe_urls: [
      'https://twitter.com',
      'https://x.com',
    ],
  },
};

/**
 * Convert CIDR to start/end IP integers.
 */
function cidrToRange(cidr) {
  const [ip, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  const start = (ipNum & mask) >>> 0;
  const end = (ipNum | ~mask) >>> 0;
  return { start, end };
}

/**
 * Convert IP to integer.
 */
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Check if an IP matches a platform's reviewer IP range.
 * 
 * @param {string} ip - IPv4 address
 * @param {string} platform - Platform name (facebook, google, tiktok, bing)
 * @returns {boolean}
 */
function isPlatformReviewerIP(ip, platform) {
  const config = PLATFORM_REVIEWER_RANGES[platform];
  if (!config || !ip || ip.includes(':')) return false;

  const ipNum = ipToInt(ip);

  for (const cidr of config.ip_ranges) {
    const { start, end } = cidrToRange(cidr);
    if (ipNum >= start && ipNum <= end) return true;
  }

  return false;
}

/**
 * Detect if a request is from a platform reviewer.
 * 
 * @param {Object} req - Express request
 * @returns {{ is_reviewer: boolean, platform: string|null, confidence: number, safe_url: string|null }}
 */
function detectPlatformReviewer(req) {
  const ip = req.ip || req.connection?.remoteAddress || '';
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const referer = (req.headers['referer'] || '').toLowerCase();

  for (const [platform, config] of Object.entries(PLATFORM_REVIEWER_RANGES)) {
    let confidence = 0;

    // Check UA patterns
    const uaMatch = config.ua_patterns.some(pattern => ua.includes(pattern));
    if (uaMatch) confidence += 0.5;

    // Check referer patterns
    const refererMatch = config.referer_patterns.some(pattern => referer.includes(pattern));
    if (refererMatch) confidence += 0.3;

    // Check IP ranges
    const ipMatch = isPlatformReviewerIP(ip, platform);
    if (ipMatch) confidence += 0.4;

    // If high confidence, return as reviewer
    if (confidence >= 0.5) {
      return {
        is_reviewer: true,
        platform,
        confidence,
        safe_url: config.safe_urls[0],
        safe_urls: config.safe_urls,
      };
    }
  }

  return { is_reviewer: false, platform: null, confidence: 0, safe_url: null };
}

/**
 * Get safe URL for a specific platform.
 * Rotates through available safe URLs for variety.
 * 
 * @param {string} platform - Platform name
 * @returns {string} Safe URL
 */
function getSafeUrl(platform) {
  const config = PLATFORM_REVIEWER_RANGES[platform];
  if (!config) return 'https://www.google.com';
  const idx = Math.floor(Math.random() * config.safe_urls.length);
  return config.safe_urls[idx];
}

// ── Platform Employee Detection ──────────────────────────────────────────

/**
 * Check if an IP is within a specific CIDR range.
 *
 * @param {string} ip - IPv4 address
 * @param {string} cidr - CIDR notation (e.g. '157.240.0.0/16')
 * @returns {boolean}
 */
function isIPInCIDR(ip, cidr) {
  if (!ip || ip.includes(':')) return false;
  const ipNum = ipToInt(ip);
  const { start, end } = cidrToRange(cidr);
  return ipNum >= start && ipNum <= end;
}

/**
 * Known platform employee / corporate IP ranges.
 * These are ranges owned by the companies themselves — if a request
 * originates here it's almost certainly an employee or internal tool.
 */
const PLATFORM_EMPLOYEE_RANGES = {
  meta: {
    ip_ranges: [
      '157.240.0.0/16',     // Meta primary
      '129.134.0.0/16',     // Meta internal
      '157.240.192.0/18',   // Meta internal
      '31.13.24.0/21',      // Meta/WhatsApp
      '31.13.64.0/18',      // Meta/Instagram
      '66.220.144.0/20',    // Meta infrastructure
      '69.171.224.0/18',    // Meta
      '69.171.248.0/21',    // Meta employees
    ],
    ua_patterns: [],
    referer_patterns: ['internal.facebook.com', 'workplace.facebook.com', 'fb.workplace.com'],
  },
  google: {
    ip_ranges: [
      '8.8.8.0/24',         // Google DNS
      '8.8.4.0/24',         // Google DNS
      '23.236.48.0/20',     // Google Cloud
      '34.64.0.0/10',       // Google Cloud
      '35.186.0.0/16',      // Google Cloud
      '35.190.0.0/16',      // Google Cloud
      '35.191.0.0/16',      // Google Cloud
      '104.154.0.0/15',     // Google Cloud
      '142.250.0.0/15',     // Google
      '172.217.0.0/16',     // Google
      '216.58.192.0/19',    // Google
    ],
    ua_patterns: [],
    referer_patterns: ['googleplex.com', 'corp.google.com', 'intranet.google.com'],
  },
  tiktok: {
    ip_ranges: [
      '161.117.0.0/16',     // ByteDance
      '47.74.0.0/16',       // ByteDance
      '47.88.0.0/16',       // ByteDance
      '103.126.92.0/23',    // ByteDance
      '103.155.56.0/23',    // ByteDance
    ],
    ua_patterns: [],
    referer_patterns: ['bytedance.com', 'byteoversea.com', 'bytedance.net'],
  },
};

// Safe URLs keyed by platform for employee detection responses
const EMPLOYEE_SAFE_URLS = {
  meta: 'https://www.facebook.com',
  google: 'https://www.google.com',
  tiktok: 'https://www.tiktok.com',
};

/**
 * Detect if a request originates from a known platform employee IP range
 * or internal referer domain.
 *
 * @param {Object} req - Express request
 * @returns {{ is_employee: boolean, platform: string|null, source: string|null, safe_url: string|null }}
 */
function detectPlatformEmployee(req) {
  const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
  const referer = (req.headers['referer'] || '').toLowerCase();
  const refererLower = referer.toLowerCase();

  for (const [platform, cfg] of Object.entries(PLATFORM_EMPLOYEE_RANGES)) {
    // Check IP range
    if (cfg.ip_ranges?.some(range => isIPInCIDR(ip, range))) {
      return { is_employee: true, platform, source: 'ip_range', safe_url: EMPLOYEE_SAFE_URLS[platform] || 'https://www.google.com' };
    }
    // Check referer (internal domains)
    if (cfg.referer_patterns?.some(pattern => refererLower.includes(pattern))) {
      return { is_employee: true, platform, source: 'referer', safe_url: EMPLOYEE_SAFE_URLS[platform] || 'https://www.google.com' };
    }
  }
  return { is_employee: false, platform: null, source: null, safe_url: null };
}

module.exports = {
  loadPlatformRanges,
  detectPlatformReviewer,
  isPlatformReviewerIP,
  getSafeUrl,
  PLATFORM_REVIEWER_RANGES,
  detectPlatformEmployee,
  PLATFORM_EMPLOYEE_RANGES,
  isIPInCIDR,
};
