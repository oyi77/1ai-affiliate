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
 */

// FALLBACK_DEFAULT: known platform reviewer IP ranges
// In production, these should be loaded from DB and updated via community feed
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

module.exports = {
  detectPlatformReviewer,
  isPlatformReviewerIP,
  getSafeUrl,
  PLATFORM_REVIEWER_RANGES,
};
