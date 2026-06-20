const pool = require('../db/mysql');
const { mintSmartlink, shortenUrl } = require('../services/smartlinkService');
const fraudRuleEngine = require('../services/fraudRuleEngine');
const settings = require('../services/settingsService');

async function routeTrafficByHash(req, res) {
  const slug = req.params.hash;
  if (!slug) return res.status(400).send('Invalid link');

  try {
    const [links] = await pool.query(
      'SELECT l.id, l.affiliate_id, l.offer_id, l.campaign_id FROM 1ai_affiliate_links l WHERE l.slug = ? AND l.status = "active" LIMIT 1',
      [slug]
    );
    if (!links.length) return res.status(404).send('Link not found');
    const link = links[0];

    // Fraud check — unified scoring engine
    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    const fraud = await fraudRuleEngine.evaluateClick(pool, {
      ip, userAgent, referer, slug,
      offer_id: link.offer_id, affiliate_id: link.affiliate_id,
    });
    if (fraud.action === 'block') return res.status(403).send('Blocked');
    // Record click for velocity tracking
    fraudRuleEngine.recordClick(pool, ip, null, link.affiliate_id, userAgent, fraud.action === 'block', fraud.rules.map(r => r.reason).join('; '));
    if (fraud.score >= 80) {
      fraudRuleEngine.autoBlacklist(pool, ip, fraud.score, fraud.rules.map(r => r.reason).join('; '));
    }

    // Determine target URL with geo/device targeting
    let targetUrl = await settings.get('default_fallback_url');
    let countryCode = null;
    let deviceType = null;

    // GeoIP lookup
    try {
      const { lookupIp } = require('../routes/geoip');
      const geo = await lookupIp(ip);
      countryCode = geo.country_code || null;
    } catch {}

    // Device detection from UA
    const ua = (userAgent || '').toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) deviceType = 'mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';
    else deviceType = 'desktop';

    if (link.offer_id) {
      // Check for geo/device-targeted landing pages
      const [landings] = await pool.query(
        'SELECT url, geo_targeting, device_targeting, is_default FROM 1ai_offer_landing_pages WHERE offer_id = ? ORDER BY weight DESC, is_default DESC',
        [link.offer_id]
      );

      let matchedLanding = null;
      for (const lp of landings) {
        let geoMatch = !lp.geo_targeting; // no targeting = matches all
        if (lp.geo_targeting && countryCode) {
          try {
            const allowed = JSON.parse(lp.geo_targeting);
            geoMatch = Array.isArray(allowed) && allowed.map(c => c.toUpperCase()).includes(countryCode.toUpperCase());
          } catch { geoMatch = lp.geo_targeting.toUpperCase().includes(countryCode.toUpperCase()); }
        }
        let devMatch = !lp.device_targeting;
        if (lp.device_targeting && deviceType) {
          try {
            const allowed = JSON.parse(lp.device_targeting);
            devMatch = Array.isArray(allowed) && allowed.includes(deviceType);
          } catch { devMatch = lp.device_targeting.toLowerCase().includes(deviceType); }
        }
        if (geoMatch && devMatch) { matchedLanding = lp; break; }
      }

      if (matchedLanding) {
        targetUrl = matchedLanding.url;
      } else {
        // Fall back to offer's default affiliate_url
        const [offers] = await pool.query('SELECT affiliate_url FROM 1ai_offers WHERE id = ?', [link.offer_id]);
        if (offers.length && offers[0].affiliate_url) targetUrl = offers[0].affiliate_url;
      }
    }

    // Campaign override
    if (link.campaign_id) {
      const [campaigns] = await pool.query('SELECT default_url FROM 1ai_aff_campaigns WHERE aff_campaign_id = ?', [link.campaign_id]);
      if (campaigns.length && campaigns[0].default_url) targetUrl = campaigns[0].default_url;
    }

    // Record click (async, fire-and-forget — don't block redirect)
    const clickId = `cl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    pool.query(
      'INSERT INTO 1ai_click_log (click_id, offer_id, affiliate_id, ip, country_code, device_type, user_agent, clicked_at) VALUES (?,?,?,?,?,?,?,UNIX_TIMESTAMP())',
      [clickId, link.offer_id, link.affiliate_id, ip, countryCode || null, deviceType || 'unknown', userAgent]
    ).catch(err => console.error('Click insert error:', err));

    // Increment link click counter
    pool.query('UPDATE 1ai_affiliate_links SET clicks = clicks + 1 WHERE id = ?', [link.id]).catch(() => {});

    return res.redirect(302, targetUrl);
  } catch (err) {
    console.error('routeTrafficByHash error:', err);
    return res.redirect(302, '/');
  }
}

async function generateSmartlink(req, res) {
  const { offer_id, domain_id, shortener_service_id, affiliate_id } = req.body;
  if (!offer_id) return res.status(400).json({ error: 'offer_id required' });

  try {
    let affiliateId = affiliate_id;

    // If admin doesn't provide affiliate_id, try to find their own affiliate profile
    if (!affiliateId) {
      const [aff] = await pool.query(
        'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
        [req.user.id]
      );
      affiliateId = aff.length ? aff[0].id : null;
    }

    if (!affiliateId) return res.status(403).json({ error: 'Affiliate profile not found. Provide affiliate_id as admin or ensure user has affiliate profile.' });

    const result = await mintSmartlink({
      offerId: offer_id,
      affiliateId,
      domainId: domain_id || null,
      shortenerServiceId: shortener_service_id || null
    });

    res.json({
      success: true,
      slug: result.slug,
      url: result.url,
      short_url: result.shortUrl,
      domain: result.domain
    });
  } catch (err) {
    console.error('generateSmartlink error:', err);
    res.status(500).json({ error: err.message });
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

    const baseUrl = req.protocol + '://' + req.get('host');
    const linksWithUrls = links.map(link => {
      let url = link.url;
      if (link.domain_name) {
        url = `https://${link.domain_name}/go/${link.slug}`;
      } else {
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

    const postbackQueue = require('../services/postbackQueue');
    const [offers] = await pool.query('SELECT postback_enabled FROM 1ai_offers WHERE id = ?', [link.offer_id]);
    if (offers.length && offers[0].postback_enabled) {
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
