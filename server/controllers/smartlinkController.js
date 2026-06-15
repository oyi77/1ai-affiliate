const pool = require('../db/mysql');
const crypto = require('crypto');

async function routeTrafficByHash(req, res) {
  const slug = req.params.hash;
  const subid = req.query.subid || '';
  if (!slug) return res.status(400).send('Invalid link');

  try {
    const [links] = await pool.query(
      'SELECT id, affiliate_id, offer_id, slug, clicks FROM 1ai_affiliate_links WHERE slug = ?',
      [slug]
    );
    if (!links.length) return res.status(404).send('Link not found');
    const link = links[0];

    const [offers] = await pool.query(
      'SELECT id, name, payout, network_id, advertiser_id FROM 1ai_offers WHERE id = ? AND status = ?',
      [link.offer_id, 'active']
    );
    if (!offers.length) return res.status(404).send('Offer not available');
    const offer = offers[0];

    const [campaigns] = await pool.query(
      'SELECT oc.aff_campaign_id FROM 1ai_offer_campaigns oc WHERE oc.offer_id = ? LIMIT 1',
      [offer.id]
    );
    const campaignId = campaigns.length ? campaigns[0].aff_campaign_id : offer.id;
    const clickId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Record click in affiliate_links table
    await pool.query('UPDATE 1ai_affiliate_links SET clicks = clicks + 1 WHERE id = ?', [link.id]);

    // Build redirect URL — use OFFER_BASE_URL env or a sensible default
    const offerBase = process.env.OFFER_BASE_URL || 'https://example.com/affiliate';
    const redirectUrl = `${offerBase}/offer/${offer.id}?aid=${link.affiliate_id}&cid=${campaignId}&click=${clickId}&subid=${subid}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Smartlink route error:', err);
    res.status(500).send('Routing error');
  }
}

async function generateSmartlink(req, res) {
  const { offer_id, domain_id, shortener_service_id } = req.body;
  if (!offer_id) return res.status(400).json({ error: 'offer_id required' });

  try {
    const [aff] = await pool.query(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [req.user.id]
    );
    const affiliateId = aff.length ? aff[0].id : null;
    if (!affiliateId) return res.status(403).json({ error: 'Affiliate profile not found' });

    // Get the domain to use
    let domain = null;
    if (domain_id) {
      const [domains] = await pool.query(
        'SELECT id, domain, ssl_enabled FROM 1ai_smartlink_domains WHERE id = ? AND is_active = TRUE',
        [domain_id]
      );
      if (!domains.length) return res.status(400).json({ error: 'Domain not found or inactive' });
      domain = domains[0];
    } else {
      // Use default domain
      const [defaultDomains] = await pool.query(
        'SELECT id, domain, ssl_enabled FROM 1ai_smartlink_domains WHERE is_default = TRUE AND is_active = TRUE LIMIT 1'
      );
      if (defaultDomains.length) {
        domain = defaultDomains[0];
      }
    }

    const slug = crypto.randomBytes(6).toString('hex');

    // Insert with domain_id if specified
    await pool.query(
      'INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, domain_id, shortener_service_id, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())',
      [affiliateId, offer_id, slug, domain?.id || null, shortener_service_id || null]
    );

    // Build URL with custom domain or fallback to default
    let smartlinkUrl;
    if (domain) {
      const protocol = domain.ssl_enabled ? 'https' : 'http';
      smartlinkUrl = `${protocol}://${domain.domain}/go/${slug}`;
    } else {
      // Fallback to request host
      const baseUrl = req.protocol + '://' + req.get('host');
      smartlinkUrl = `${baseUrl}/go/${slug}`;
    }

    // If shortener service is specified, shorten the URL
    let shortUrl = null;
    if (shortener_service_id) {
      const [services] = await pool.query(
        'SELECT * FROM 1ai_url_shortener_services WHERE id = ? AND is_active = TRUE',
        [shortener_service_id]
      );
      if (services.length) {
        try {
          shortUrl = await shortenUrl(smartlinkUrl, services[0]);
          // Update the affiliate link with short URL
          await pool.query(
            'UPDATE 1ai_affiliate_links SET short_url = ? WHERE slug = ?',
            [shortUrl, slug]
          );
          // Log the short URL
          await pool.query(
            'INSERT INTO 1ai_short_url_logs (shortener_service_id, original_url, short_url, affiliate_link_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [shortener_service_id, smartlinkUrl, shortUrl, (await pool.query('SELECT id FROM 1ai_affiliate_links WHERE slug = ?', [slug]))[0][0].id]
          );
        } catch (shortenErr) {
          console.error('Shortener error:', shortenErr);
          // Continue without short URL - don't fail the request
        }
      }
    }

    res.json({ 
      success: true, 
      slug, 
      url: smartlinkUrl,
      short_url: shortUrl,
      domain: domain?.domain || null
    });
  } catch (err) {
    console.error('generateSmartlink error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Helper function to shorten URL using different services
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

async function listSmartlinks(req, res) {
  try {
    const [aff] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!aff.length) return res.json([]);

    const [links] = await pool.query(
      `SELECT l.id, l.slug, l.clicks, l.conversions, l.created_at, l.short_url,
              o.name AS offer_name, o.payout AS offer_payout,
              d.domain AS domain_name,
              s.name AS shortener_name
       FROM 1ai_affiliate_links l
       LEFT JOIN 1ai_offers o ON l.offer_id = o.id
       LEFT JOIN 1ai_smartlink_domains d ON l.domain_id = d.id
       LEFT JOIN 1ai_url_shortener_services s ON l.shortener_service_id = s.id
       WHERE l.affiliate_id = ?
       ORDER BY l.created_at DESC`,
      [aff[0].id]
    );
    
    // Build full URLs for each link
    const baseUrl = req.protocol + '://' + req.get('host');
    const linksWithUrls = links.map(link => {
      let url = link.url;
      if (link.domain_name) {
        // Use custom domain if available
        url = `https://${link.domain_name}/go/${link.slug}`;
      } else {
        // Use default host
        url = `${baseUrl}/go/${link.slug}`;
      }
      return { ...link, url };
    });
    
    res.json(linksWithUrls);
  } catch (err) {
    console.error('listSmartlinks error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function recordConversion(req, res) {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  try {
    const [links] = await pool.query(
      'SELECT l.id, l.affiliate_id, l.offer_id, o.payout, o.network_payout FROM 1ai_affiliate_links l JOIN 1ai_offers o ON l.offer_id = o.id WHERE l.slug = ?',
      [slug]
    );
    if (!links.length) return res.status(404).json({ error: 'Link not found' });
    const link = links[0];

    const [campaigns] = await pool.query(
      'SELECT oc.aff_campaign_id FROM 1ai_offer_campaigns oc WHERE oc.offer_id = ? LIMIT 1',
      [link.offer_id]
    );
    const campaignId = campaigns.length ? campaigns[0].aff_campaign_id : link.offer_id;

    const networkPayout = parseFloat(link.network_payout) || 0;
    const affiliatePayout = parseFloat(link.payout) || 0;
    const marginAmount = networkPayout - affiliatePayout;

    await pool.query(
      `INSERT INTO 1ai_conversion_logs (aff_campaign_id, click_id, conversion_time, network_payout_snapshot, affiliate_payout_snapshot, margin_amount, affiliate_id, affiliate_status)
       VALUES (?, ?, UNIX_TIMESTAMP(), ?, ?, ?, ?, 'approved')`,
      [campaignId, Date.now(), networkPayout, affiliatePayout, marginAmount, link.affiliate_id]
    );

    await pool.query(
      'INSERT INTO 1ai_affiliate_earnings (affiliate_id, source, payout_amount, status, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())',
      [link.affiliate_id, 'conversion', affiliatePayout, 'pending']
    );

    await pool.query(
      'UPDATE 1ai_affiliate_links SET conversions = conversions + 1 WHERE id = ?',
      [link.id]
    );

    // Enqueue postback to advertiser if configured
    const postbackQueue = require('../services/postbackQueue');
    const [offers] = await pool.query('SELECT postback_enabled FROM 1ai_offers WHERE id = ?', [link.offer_id]);
    if (offers.length && offers[0].postback_enabled) {
      // Create postback log and enqueue
      const [pbResult] = await pool.query(
        `INSERT INTO 1ai_postback_logs (offer_id, affiliate_id, click_id, payout, conversion_event, status, postback_url)
         VALUES (?, ?, ?, ?, ?, ?, NULL)`,
        [link.offer_id, link.affiliate_id, slug, affiliatePayout, 'conversion', 'pending']
      );
      await postbackQueue.enqueue(pbResult.insertId);
    }

    res.json({ success: true, payout: affiliatePayout, margin: marginAmount });
  } catch (err) {
    console.error('recordConversion error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getSmartlinkStats(req, res) {
  try {
    const [aff] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!aff.length) return res.json({ total_clicks: 0, total_conversions: 0, total_earnings: 0, pending_earnings: 0 });

    const [linkStats] = await pool.query(
      'SELECT COALESCE(SUM(clicks),0) AS total_clicks, COALESCE(SUM(conversions),0) AS total_conversions FROM 1ai_affiliate_links WHERE affiliate_id = ?',
      [aff[0].id]
    );
    const [earnStats] = await pool.query(
      `SELECT COALESCE(SUM(CASE WHEN status IN ('paid','approved') THEN payout_amount ELSE 0 END),0) AS total_earnings,
              COALESCE(SUM(CASE WHEN status = 'pending' THEN payout_amount ELSE 0 END),0) AS pending_earnings
       FROM 1ai_affiliate_earnings WHERE affiliate_id = ?`,
      [aff[0].id]
    );

    res.json({
      total_clicks: toNumber(linkStats[0]?.total_clicks || 0),
      total_conversions: toNumber(linkStats[0]?.total_conversions || 0),
      total_earnings: toNumber(earnStats[0]?.total_earnings || 0),
      pending_earnings: toNumber(earnStats[0]?.pending_earnings || 0),
    });
  } catch (err) {
    console.error('getSmartlinkStats error:', err);
    res.status(500).json({ error: err.message });
  }
}

function toNumber(v) { return Number(v || 0); }

module.exports = { routeTrafficByHash, generateSmartlink, listSmartlinks, recordConversion, getSmartlinkStats };
