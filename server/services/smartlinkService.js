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
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    'INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, campaign_id, link_token, slug, domain_id, shortener_service_id, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?)',
    [affiliateId, offerId, linkToken, slug, domain?.id || null, shortenerServiceId || null, now, now]
  );

  let smartlinkUrl;
  if (domain) {
    const protocol = domain.ssl_enabled ? 'https' : 'http';
    smartlinkUrl = `${protocol}://${domain.domain}/go/${slug}`;
  } else {
    const fallbackDomain = process.env.SMARTLINK_FALLBACK_DOMAIN || 'go.berkahkarya.org';
    smartlinkUrl = `https://${fallbackDomain}/go/${slug}`;
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
    domain: domain?.domain || process.env.SMARTLINK_FALLBACK_DOMAIN || 'go.berkahkarya.org'
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

module.exports = { mintSmartlink, shortenUrl };
