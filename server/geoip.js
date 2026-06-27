const express = require('express');
const maxmind = require('maxmind');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-loaded readers (initialized once on first request)
let countryReader = null;
let cityReader = null;
let asnReader = null;

const GEO_DIR = path.resolve(__dirname, '../../config/geo');

async function getCountryReader() {
  if (!countryReader) {
    const dbPath = path.join(GEO_DIR, 'Country.mmdb');
    try {
      countryReader = await maxmind.open(dbPath);
    } catch (err) {
      console.error('Failed to load Country.mmdb:', err.message);
      return null;
    }
  }
  return countryReader;
}

async function getCityReader() {
  if (!cityReader) {
    const dbPath = path.join(GEO_DIR, 'City.mmdb');
    try {
      cityReader = await maxmind.open(dbPath);
    } catch (err) {
      console.error('Failed to load City.mmdb:', err.message);
      return null;
    }
  }
  return cityReader;
}

async function getAsnReader() {
  if (!asnReader) {
    const dbPath = path.join(GEO_DIR, 'GeoLite2-ASN.mmdb');
    try {
      asnReader = await maxmind.open(dbPath);
    } catch (err) {
      console.error('Failed to load GeoLite2-ASN.mmdb:', err.message);
      return null;
    }
  }
  return asnReader;
}

// Datacenter/hosting ASN patterns for proxy/VPN detection
const DATACENTER_PATTERNS = [
  'amazon', 'aws', 'google', 'microsoft', 'azure', 'digitalocean', 'ovh',
  'rackspace', 'softlayer', 'equinix', 'colo', 'hosting', 'datacenter',
  'cloud', 'leaseweb', 'choopa', 'psychz', 'colocrossing', 'contabo',
  'bunny', 'cloudflare', 'akamai', 'fastly', 'stackpath', 'maxcdn',
];

// Known VPN/proxy provider ASNs (partial list)
const VPN_PATTERNS = [
  'nordvpn', 'expressvpn', 'surfshark', 'protonvpn', 'cyberghost',
  'private internet', 'pia', 'mullvad', 'windscribe', 'tunnelbear',
  'hidemyass', 'hidemy', 'hotspot shield', 'anchorfree', 'zenmate',
  'vpn', 'proxy', 'tor', 'openvpn', 'wireguard',
];

const MOBILE_PATTERNS = [
  'mobile', 'cellular', 'wireless', 't-mobile', 'verizon', 'at&t',
  'sprint', 'vodafone', 'orange', 'telefonica', 'bharti', 'jio',
  'telkomsel', 'xl axiata', 'indosat', 'smartfren',
];

function detectConnectionType(asnOrg) {
  if (!asnOrg) return { connection_type: 'unknown', is_datacenter: false, is_vpn: false, is_mobile: false };
  const org = asnOrg.toLowerCase();

  const is_datacenter = DATACENTER_PATTERNS.some(p => org.includes(p));
  const is_vpn = VPN_PATTERNS.some(p => org.includes(p));
  const is_mobile = MOBILE_PATTERNS.some(p => org.includes(p));

  let connection_type = 'residential';
  if (is_datacenter) connection_type = 'datacenter';
  else if (is_vpn) connection_type = 'vpn';
  else if (is_mobile) connection_type = 'mobile';

  return { connection_type, is_datacenter, is_vpn, is_mobile };
}
// ── GeoIP LRU Cache ─────────────────────────────────────────────
// Caches lookups for 1 hour. Prevents repeated MaxMind reads for same IP.
const geoCache = new Map();
const GEO_CACHE_TTL = 3600_000; // 1 hour
const GEO_CACHE_MAX = 10_000;   // max entries

function getCachedGeo(ip) {
  const entry = geoCache.get(ip);
  if (entry && Date.now() < entry.expiry) return entry.data;
  if (entry) geoCache.delete(ip);
  return null;
}

function setCachedGeo(ip, data) {
  if (geoCache.size >= GEO_CACHE_MAX) {
    // Evict oldest entry
    const firstKey = geoCache.keys().next().value;
    geoCache.delete(firstKey);
  }
  geoCache.set(ip, { data, expiry: Date.now() + GEO_CACHE_TTL });
}

async function lookupIp(ip) {
  // Check cache first
  const cached = getCachedGeo(ip);
  if (cached) return cached;

  const result = {
    ip,
    country: null, country_code: null, continent: null,
    city: null, region: null, timezone: null,
    latitude: null, longitude: null,
    isp: null, asn_number: null,
    connection_type: 'unknown',
    is_datacenter: false, is_vpn: false, is_mobile: false,
    is_proxy: false,
  };

  const cr = await getCountryReader();
  if (cr) {
    try {
      const country = cr.get(ip);
      if (country && country.country) {
        result.country = country.country.names?.en || country.country.iso_code || '';
        result.country_code = country.country.iso_code || '';
      }
      if (country && country.continent) {
        result.continent = country.continent.names?.en || '';
      }
    } catch {}
  }

  const cit = await getCityReader();
  if (cit) {
    try {
      const city = cit.get(ip);
      if (city) {
        result.city = city.city?.names?.en || null;
        result.region = city.subdivisions?.[0]?.names?.en || null;
        result.timezone = city.location?.time_zone || null;
        result.latitude = city.location?.latitude || null;
        result.longitude = city.location?.longitude || null;
      }
    } catch {}
  }

  const ar = await getAsnReader();
  if (ar) {
    try {
      const asn = ar.get(ip);
      if (asn) {
        result.isp = asn.autonomous_system_organization || null;
        result.asn_number = asn.autonomous_system_number || null;
        const conn = detectConnectionType(asn.autonomous_system_organization);
        Object.assign(result, conn);
        result.is_proxy = conn.is_vpn || conn.is_datacenter;
      }
    } catch {}
  }

  // Cache result
  setCachedGeo(ip, result);
  return result;
}

/**
 * GET /api/geo/:ip — Look up country + ISP for an IP address
 * Uses Loyalsoldier/geoip (free, weekly-updated)
 */
router.get('/:ip', authenticate, async (req, res) => {
  const { ip } = req.params;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Invalid IPv4 address' });
  }

  const result = await lookupIp(ip);
  res.json(result);
});

/**
 * GET /api/geo/me/ip — Look up country + ISP for the requester's IP
 */
router.get('/me/ip', authenticate, async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.ip
    || '127.0.0.1';

  const result = await lookupIp(ip);
  res.json(result);
});

router.lookupIp = lookupIp;
module.exports = router;