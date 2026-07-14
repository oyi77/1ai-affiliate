const pool = require('../db/mysql');
const crypto = require('crypto');


/**
 * Internal helper to mint a tracked smartlink without an HTTP request context.
 *
 * @param {object} params
 * @param {number} params.offerId       - 1ai_offers.id
 * @param {number} params.affiliateId   - 1ai_affiliates.id
 * @param {number|null} [params.domainId] - 1ai_smartlink_domains.id
 * @param {number|null} [params.shortenerServiceId] - 1ai_url_shortener_services.id
 * @returns {Promise<{slug:string, url:string, shortUrl:string|null, domain:string|null}>}
 */
async function mintSmartlink({ offerId, affiliateId, domainId = null, shortenerServiceId = null }) {
  if (!offerId || !affiliateId) {
    throw new Error('offerId and affiliateId are required');
  }

  // Resolve domain
  let domain = null;
  if (domainId) {
    const [domains] = await pool.query(
      'SELECT id, domain, ssl_enabled FROM 1ai_smartlink_domains WHERE id = ? AND is_active = TRUE',
      [domainId]
    );
    if (domains.length) domain = domains[0];
  } else {
    const [defaultDomains] = await pool.query(
      'SELECT id, domain, ssl_enabled FROM 1ai_smartlink_domains WHERE is_default = TRUE AND is_active = TRUE LIMIT 1'
    );
    if (defaultDomains.length) domain = defaultDomains[0];
  }

  const slug = crypto.randomBytes(6).toString('hex');

  const linkToken = crypto.randomBytes(16).toString('hex');
  await pool.query(
    'INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, link_token, slug, domain_id, shortener_service_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
    [affiliateId, offerId, linkToken, slug, domain?.id || null, shortenerServiceId || null]
  );

  let smartlinkUrl;
  if (domain) {
    const protocol = domain.ssl_enabled ? 'https' : 'http';
    smartlinkUrl = `${protocol}://${domain.domain}/go/${slug}`;
  } else {
    if (!process.env.SMARTLINK_FALLBACK_DOMAIN) throw new Error('SMARTLINK_FALLBACK_DOMAIN not configured');
    smartlinkUrl = `https://${process.env.SMARTLINK_FALLBACK_DOMAIN}/go/${slug}`;
  }

  let shortUrl = null;
  if (shortenerServiceId) {
    const [services] = await pool.query(
      'SELECT * FROM 1ai_url_shortener_services WHERE id = ? AND is_active = TRUE',
      [shortenerServiceId]
    );
    if (services.length) {
      try {
        shortUrl = await shortenUrl(smartlinkUrl, services[0]);
        await pool.query(
          'UPDATE 1ai_affiliate_links SET short_url = ? WHERE slug = ?',
          [shortUrl, slug]
        );
        const [[{ id: affiliateLinkId }]] = await pool.query(
          'SELECT id FROM 1ai_affiliate_links WHERE slug = ?',
          [slug]
        );
        await pool.query(
          'INSERT INTO 1ai_short_url_logs (shortener_service_id, original_url, short_url, affiliate_link_id, created_at) VALUES (?, ?, ?, ?, NOW())',
          [shortenerServiceId, smartlinkUrl, shortUrl, affiliateLinkId]
        );
      } catch (shortenErr) {
        console.error('Shortener error in mintSmartlink:', shortenErr);
      }
    }
  }

  return {
    slug,
    url: smartlinkUrl,
    shortUrl,
    domain: domain?.domain || process.env.SMARTLINK_FALLBACK_DOMAIN || ''
  };
}


/**
 * Helper function to shorten URL using different services.
 * Moved here from smartlinkController to avoid circular imports.
 */
async function shortenUrl(longUrl, service) {
  const fetch = (await import('node-fetch')).default;

  switch (service.service_type) {
    case 'bitly': {
      const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ long_url: longUrl, domain: JSON.parse(service.config_json || '{}').domain || 'bit.ly' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Bitly API error');
      return data.link;
    }

    case 'tinyurl': {
      const response = await fetch(`https://api.tinyurl.com/create?url=${encodeURIComponent(longUrl)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.api_key}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'TinyURL API error');
      return data.data.tiny_url;
    }

    case 'rebrandly': {
      const response = await fetch('https://api.rebrandly.com/v1/links', {
        method: 'POST',
        headers: {
          'apikey': service.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: longUrl, domain: { fullName: JSON.parse(service.config_json || '{}').domain || 'rebrand.ly' } })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Rebrandly API error');
      return data.shortUrl;
    }

    case 'cuttly': {
      const response = await fetch(`https://cutt.ly/api/api.php?key=${service.api_key}&short=${encodeURIComponent(longUrl)}`);
      const data = await response.json();
      if (data.url?.status !== 7) throw new Error('Cutt.ly API error');
      return data.url.shortLink;
    }

    case 'shortio': {
      const response = await fetch('https://api.short.io/links', {
        method: 'POST',
        headers: {
          'Authorization': service.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originalURL: longUrl, domain: JSON.parse(service.config_json || '{}').domain || 'short.io' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Short.io API error');
      return data.shortURL;
    }

    case 'custom': {
      if (!service.api_endpoint) throw new Error('Custom API endpoint not configured');
      const response = await fetch(service.api_endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${service.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: longUrl, ...(service.config_json ? JSON.parse(service.config_json) : {}) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Custom API error');
      return data.short_url || data.shortUrl || data.link;
    }

    default:
      throw new Error('Unknown shortener service type');
  }
}


/**
 * Get assigned offers for a smartlink from the join table.
 * Filters to active offers only.
 */
async function getSmartlinkOffers(smartlinkId) {
  const [rows] = await pool.query(
    `SELECT slo.id, slo.smartlink_id, slo.offer_id, slo.weight, slo.priority,
            o.name AS offer_name, o.type, o.payout, o.payout_currency,
            o.geo, o.status AS offer_status
     FROM 1ai_smartlink_offers slo
     JOIN 1ai_offers o ON o.id = slo.offer_id
     WHERE slo.smartlink_id = ?
     ORDER BY slo.priority ASC, slo.weight DESC`,
    [smartlinkId]
  );
  return rows.filter(r => r.offer_status === 'active');
}

/**
 * Pick one offer for a visitor based on the smartlink's rotation strategy.
 *
 * @param {number} smartlinkId
 * @param {object} [visitorData] - { geo, device, user_agent } for future rule matching
 * @returns {Promise<object|null>} { offer_id, offer_name, type, payout, payout_currency }
 */
async function getOfferForVisitor(smartlinkId, visitorData = {}) {
  // Fetch smartlink + offers in parallel
  const [smartlinks] = await pool.query(
    `SELECT id, fallback_offer_id, rotation_strategy, visitor_rules,
            geo_rules, device_rules, default_url
     FROM 1ai_smartlinks WHERE id = ? AND status = 'active'`,
    [smartlinkId]
  );
  if (!smartlinks.length) return null;

  const sl = smartlinks[0];
  const strategy = sl.rotation_strategy || 'weighted';
  const offers = await getSmartlinkOffers(smartlinkId);
  if (!offers.length) {
    // No assigned offers — use fallback if configured
    return sl.fallback_offer_id ? resolveFallback(sl.fallback_offer_id) : null;
  }

  let picked;
  switch (strategy) {
    case 'random':
      picked = pickRandom(offers);
      break;
    case 'round_robin':
      picked = await pickRoundRobin(smartlinkId, offers);
      break;
    case 'priority':
      picked = pickByPriority(offers);
      break;
    case 'weighted':
    default:
      picked = pickWeighted(offers);
      break;
  }

  if (!picked && sl.fallback_offer_id) {
    picked = await resolveFallback(sl.fallback_offer_id);
  }

  return picked || null;
}

/**
 * Weighted random: each offer's weight = chance proportion.
 */
function pickWeighted(offers) {
  const totalWeight = offers.reduce((s, o) => s + (o.weight || 1), 0);
  if (totalWeight <= 0) return offers[0] || null;

  let r = Math.random() * totalWeight;
  for (const offer of offers) {
    r -= (offer.weight || 1);
    if (r <= 0) return offer;
  }
  return offers[offers.length - 1];
}

/**
 * Round-robin using click_count modulo on the smartlink.
 * Atomically increments the counter.
 */
async function pickRoundRobin(smartlinkId, offers) {
  if (!offers.length) return null;
  // Atomically increment and get the resulting count
  const [result] = await pool.query(
    'UPDATE 1ai_smartlinks SET click_count = LAST_INSERT_ID(click_count + 1) WHERE id = ?',
    [smartlinkId]
  );
  // Read the updated value via LAST_INSERT_ID()
  const [[{ idx }]] = await pool.query('SELECT LAST_INSERT_ID() AS idx');
  return offers[Number(idx) % offers.length];
}

/**
 * Priority: lowest priority value (highest priority) first.
 * Offers already sorted by priority ASC from getSmartlinkOffers.
 */
function pickByPriority(offers) {
  return offers[0] || null;
}

/**
 * Uniform random pick.
 */
function pickRandom(offers) {
  if (!offers.length) return null;
  return offers[Math.floor(Math.random() * offers.length)];
}

/**
 * Resolve a fallback offer by ID.
 */
async function resolveFallback(offerId) {
  const [rows] = await pool.query(
    'SELECT id AS offer_id, name AS offer_name, type, payout, payout_currency FROM 1ai_offers WHERE id = ? AND status = ?',
    [offerId, 'active']
  );
  return rows.length ? rows[0] : null;
}

module.exports = { mintSmartlink, shortenUrl, getOfferForVisitor, getSmartlinkOffers };
