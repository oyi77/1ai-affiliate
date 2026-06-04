const express = require('express');
const maxmind = require('maxmind');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-loaded readers (initialized once on first request)
let countryReader = null;
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

async function lookupIp(ip) {
  const result = { ip, country: null, country_code: null, continent: null, isp: null, asn_number: null };

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
    } catch {
      // IP not found in database
    }
  }

  const ar = await getAsnReader();
  if (ar) {
    try {
      const asn = ar.get(ip);
      if (asn) {
        result.isp = asn.autonomous_system_organization || null;
        result.asn_number = asn.autonomous_system_number || null;
      }
    } catch {
      // IP not found in database
    }
  }

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

module.exports = router;