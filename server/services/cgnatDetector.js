'use strict';

/**
 * CGNAT Detector — Detect Carrier-Grade NAT ranges and provide composite fingerprinting.
 * 
 * CGNAT collapses thousands of mobile users behind a single public IP.
 * Traditional IP-based bot detection fails on CGNAT — false positives everywhere.
 * 
 * Solution: For CGNAT IPs, switch from IP-only to composite key:
 *   hash(ip + ua + accept-language + screen-res)
 */

const crypto = require('crypto');

// Known CGNAT IP ranges (major mobile carriers worldwide)
// FALLBACK_DEFAULT: used when DB is unavailable
const CGNAT_RANGES = [
  // Telkomsel (Indonesia)
  { start: '114.124.0.0', end: '114.127.255.255', carrier: 'Telkomsel', country: 'ID' },
  { start: '182.1.0.0', end: '182.3.255.255', carrier: 'Telkomsel', country: 'ID' },
  // XL Axiata (Indonesia)
  { start: '112.215.0.0', end: '112.215.255.255', carrier: 'XL Axiata', country: 'ID' },
  // Indosat (Indonesia)
  { start: '114.79.0.0', end: '114.79.255.255', carrier: 'Indosat', country: 'ID' },
  // Smartfren (Indonesia)
  { start: '158.140.0.0', end: '158.140.255.255', carrier: 'Smartfren', country: 'ID' },
  // Jio (India)
  { start: '49.36.0.0', end: '49.47.255.255', carrier: 'Jio', country: 'IN' },
  { start: '157.46.0.0', end: '157.51.255.255', carrier: 'Jio', country: 'IN' },
  // Airtel (India)
  { start: '106.216.0.0', end: '106.219.255.255', carrier: 'Airtel', country: 'IN' },
  // Vodafone (India)
  { start: '27.97.0.0', end: '27.97.255.255', carrier: 'Vodafone', country: 'IN' },
  // T-Mobile (US)
  { start: '35.152.0.0', end: '35.159.255.255', carrier: 'T-Mobile', country: 'US' },
  // AT&T (US)
  { start: '107.76.0.0', end: '107.79.255.255', carrier: 'AT&T', country: 'US' },
  // Verizon (US)
  { start: '174.192.0.0', end: '174.255.255.255', carrier: 'Verizon', country: 'US' },
  // Vodafone (UK/EU)
  { start: '2.124.0.0', end: '2.127.255.255', carrier: 'Vodafone', country: 'UK' },
  // Orange (EU)
  { start: '90.0.0.0', end: '90.63.255.255', carrier: 'Orange', country: 'FR' },
  // Telefonica (LATAM)
  { start: '186.156.0.0', end: '186.159.255.255', carrier: 'Telefonica', country: 'MX' },
  // Claro (LATAM)
  { start: '187.192.0.0', end: '187.207.255.255', carrier: 'Claro', country: 'MX' },
  // Globe (Philippines)
  { start: '120.28.0.0', end: '120.29.255.255', carrier: 'Globe', country: 'PH' },
  // AIS (Thailand)
  { start: '49.228.0.0', end: '49.231.255.255', carrier: 'AIS', country: 'TH' },
  // Digi (Malaysia)
  { start: '115.164.0.0', end: '115.164.255.255', carrier: 'Digi', country: 'MY' },
];

/**
 * Convert IPv4 to integer for range comparison.
 */
function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Check if an IP is in a known CGNAT range.
 * 
 * @param {string} ip - IPv4 address
 * @returns {{ is_cgnat: boolean, carrier: string|null, country: string|null }}
 */
function detectCGNAT(ip) {
  if (!ip || ip.includes(':')) return { is_cgnat: false, carrier: null, country: null }; // Skip IPv6

  const ipNum = ipToInt(ip);

  for (const range of CGNAT_RANGES) {
    const startNum = ipToInt(range.start);
    const endNum = ipToInt(range.end);
    if (ipNum >= startNum && ipNum <= endNum) {
      return { is_cgnat: true, carrier: range.carrier, country: range.country };
    }
  }

  // Also check via mobile carrier ASN patterns
  // This is handled by the geoip connection_type detection

  return { is_cgnat: false, carrier: null, country: null };
}

/**
 * Generate a composite fingerprint key for CGNAT IPs.
 * Instead of just IP, use: hash(ip + ua + accept-language + screen-res)
 * 
 * @param {Object} params
 * @param {string} params.ip - IP address
 * @param {string} params.ua - User agent
 * @param {string} params.acceptLanguage - Accept-Language header
 * @param {string} params.screenRes - Screen resolution (from JS fingerprint)
 * @returns {string} Composite fingerprint hash
 */
function generateCompositeKey({ ip, ua, acceptLanguage, screenRes }) {
  const components = [
    ip || '',
    ua || '',
    acceptLanguage || '',
    screenRes || '',
  ].join('|');

  return crypto.createHash('sha256').update(components).digest('hex').substring(0, 32);
}

/**
 * Check if a CGNAT composite key has been seen before.
 * 
 * @param {Object} pool - MySQL pool
 * @param {string} compositeKey - Composite fingerprint hash
 * @returns {Promise<Object>} { seen: boolean, clicks: number, first_seen: number }
 */
async function checkCompositeKey(pool, compositeKey) {
  try {
    const [[row]] = await pool.query(
      'SELECT clicks, first_seen, last_seen FROM 1ai_ip_reputation WHERE ip = ?',
      [`cgnat:${compositeKey}`]
    );
    return row ? { seen: true, ...row } : { seen: false, clicks: 0 };
  } catch {
    return { seen: false, clicks: 0 };
  }
}

/**
 * Record a CGNAT composite key visit.
 */
async function recordCompositeKey(pool, compositeKey, { country_code, asn, isp }) {
  try {
    await pool.query(
      `INSERT INTO 1ai_ip_reputation (ip, reputation_score, total_clicks, first_seen, last_seen, last_country_code, last_asn, last_isp)
       VALUES (?, 0.1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE total_clicks = total_clicks + 1, last_seen = UNIX_TIMESTAMP()`,
      [`cgnat:${compositeKey}`, country_code || null, asn || null, isp || null]
    );
  } catch (err) {
    console.error('recordCompositeKey error:', err.message);
  }
}

module.exports = {
  detectCGNAT,
  generateCompositeKey,
  checkCompositeKey,
  recordCompositeKey,
  CGNAT_RANGES,
};
