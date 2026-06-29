const pool = require('../db/mysql');
const { mintSmartlink, shortenUrl } = require('../services/smartlinkService');
const { toNumber } = require('./adminController');
const { classifyVisitor, generateCanaryPage, generateCanaryScript, PROTECTION_PRESETS, SAFE_URLS } = require('../services/smartRedirectEngine');
const { getDeviceFingerprint } = require('../services/deviceTracker');
const { lookupIp } = require('../routes/geoip');

async function routeTrafficByHash(req, res) {
  const slug = req.params.hash;
  const subid = req.query.subid || '';
  if (!slug) return res.status(400).send('Invalid link');

  try {
    const [links] = await pool.query(
      'SELECT id, affiliate_id, offer_id, slug, clicks, cloaking_config FROM 1ai_affiliate_links WHERE slug = ?',
      [slug]
    );
    if (!links.length) return res.status(404).send('Link not found');
    const link = links[0];

    const [offers] = await pool.query(
      'SELECT id, name, payout, network_id, advertiser_id, tracking_url, geo FROM 1ai_offers WHERE id = ? AND status = ?',
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
    const clientIp = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';

    // ── Parse cloaking config ───────────────────────────────────────────
    let cloakingConfig = {};
    try { cloakingConfig = link.cloaking_config ? JSON.parse(link.cloaking_config) : {}; } catch {}

    // Merge with preset if specified
    const preset = cloakingConfig.protection_preset || 'standard';
    const config = { ...PROTECTION_PRESETS[preset], ...cloakingConfig };

    // ── Smart Visitor Classification ─────────────────────────────────────
    const classification = await classifyVisitor(req, config);

    // ── Handle crawlers/bots — serve safe page ──────────────────────────
    if (classification.visitor_type === 'crawler') {
      // Record as bot click (don't count as real click)
      await pool.query('UPDATE 1ai_affiliate_links SET clicks = clicks + 1 WHERE id = ?', [link.id]);

      // Log the bot visit for analytics
      try {
        await pool.query(
          `INSERT INTO 1ai_fraud_log (ip, risk_score, verdict, flags, details, created_at)
           VALUES (?, ?, 'block', ?, ?, UNIX_TIMESTAMP())`,
          [clientIp, classification.risk_score, JSON.stringify(classification.signals), JSON.stringify(classification.layers)]
        );
      } catch {}

      // Serve safe page or redirect to safe URL
      if (config.safe_page_html) {
        return res.send(config.safe_page_html);
      }
      return res.redirect(classification.safe_url || config.safe_url || SAFE_URLS.google);
    }

    // ── Handle suspicious visitors — serve canary page ──────────────────
    if (classification.visitor_type === 'suspicious') {
      // If JS fingerprinting is required, serve canary page
      if (config.require_js_fingerprint && !classification.layers.js_fingerprint.present) {
        const canaryHtml = generateCanaryPage(
          config.canary_title || 'Welcome',
          config.canary_content || '<p>Loading...</p>',
          offer.tracking_url || '/'
        );
        // Inject the canary JS that checks for real browser behavior
        const canaryScript = generateCanaryScript(offer.tracking_url || '/', clickId);
        const htmlWithScript = canaryHtml.replace('</body>', `<script>${canaryScript}</script></body>`);
        return res.send(htmlWithScript);
      }

      // Serve clean landing page if configured
      if (config.suspicious_strategy === 'clean_lp' && config.clean_lp_url) {
        return res.redirect(config.clean_lp_url);
      }

      // Default: serve canary page with JS fingerprint check
      const canaryHtml = generateCanaryPage(
        config.canary_title || 'Welcome',
        config.canary_content || '<p>Loading...</p>',
        offer.tracking_url || '/'
      );
      const canaryScript = generateCanaryScript(offer.tracking_url || '/', clickId);
      const htmlWithScript = canaryHtml.replace('</body>', `<script>${canaryScript}</script></body>`);
      return res.send(htmlWithScript);
    }

    // ── Real User — process click and redirect to offer ─────────────────
    const ua = req.headers['user-agent'] || '';
    const device = getDeviceFingerprint(ua);
    const referer = req.headers['referer'] || req.headers['referrer'] || '';

    // Click dedup — same IP + same link within 24h
    const [dupCheck] = await pool.query(
      'SELECT click_id FROM 1ai_clicks WHERE click_ip = ? AND aff_campaign_id = ? AND click_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR)) LIMIT 1',
      [clientIp, campaignId]
    );
    if (dupCheck.length) {
      return res.redirect(offer.tracking_url || '/');
    }

    // Record click enrichment data
    const geo = classification.layers.ip;

    // Update link click count + log to analytics table + enrichment
    await Promise.all([
      pool.query('UPDATE 1ai_affiliate_links SET clicks = clicks + 1 WHERE id = ?', [link.id]),
      pool.query(
        `INSERT INTO 1ai_clicks (click_time, aff_campaign_id, click_payout, click_ip)
         VALUES (UNIX_TIMESTAMP(), ?, ?, ?)`,
        [campaignId, offer.payout || 0, clientIp]
      ),
      pool.query(
        `INSERT INTO 1ai_click_log (click_id, offer_id, affiliate_id, subid, ip, country_code, device_type, user_agent, clicked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [clickId, offer.id, link.affiliate_id, subid, clientIp, geo.country, device.device_type, ua.substring(0, 512)]
      ),
      pool.query(
        `INSERT INTO 1ai_click_enrichment (click_id, os_name, os_version, browser_name, browser_version, browser_engine, device_type, is_mobile, is_bot, country, country_code, city, region, timezone, latitude, longitude, isp, asn_number, connection_type, is_datacenter, is_vpn, is_proxy, fraud_score, fraud_verdict, fraud_flags, quality_score, enriched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [
          clickId, device.os.name, device.os.version, device.browser.name, device.browser.version, device.browser.engine,
          device.device_type, device.is_mobile ? 1 : 0, device.is_bot ? 1 : 0,
          geo.country, geo.country_code, geo.city, geo.region, geo.timezone, geo.latitude, geo.longitude,
          geo.isp, geo.asn_number, geo.connection_type, geo.is_datacenter ? 1 : 0, geo.is_vpn ? 1 : 0, geo.is_proxy ? 1 : 0,
          classification.risk_score, classification.visitor_type === 'real_user' ? 'allow' : 'review',
          JSON.stringify(classification.signals), classification.layers.behavior?.time_on_page_ms ? 80 : 60,
        ]
      ),
    ]);

    // Build redirect URL — use tracking_url, replace {clickId} placeholder (both literal and URL-encoded)
    let redirectUrl = offer.tracking_url || offer.affiliate_url || '';
    if (redirectUrl) {
      redirectUrl = redirectUrl
        .replace(/%7[Bb]clickId%7[Dd]/gi, clickId)
        .replace(/%7[Bb]clickid%7[Dd]/gi, clickId)
        .replace(/\{clickId\}/gi, clickId)
        .replace(/\{clickid\}/gi, clickId);
    }
    res.redirect(redirectUrl || '/');

  } catch (err) {
    console.error('Smartlink route error:', err);
    res.status(500).send('Routing error');
  }
}

async function generateSmartlink(req, res) {
  const { offer_id, domain_id, shortener_service_id } = req.body;
  if (!offer_id) return res.status(400).json({ error: 'offer_id required' });

  try {
    // Validate offer exists and is active
    const [offerCheck] = await pool.query(
      'SELECT id FROM 1ai_offers WHERE id = ? AND status = ?',
      [offer_id, 'active']
    );
    if (!offerCheck.length) return res.status(404).json({ error: 'Offer not found or inactive' });

    const [aff] = await pool.query(
      'SELECT id FROM 1ai_affiliates WHERE user_id = ?',
      [req.user.id]
    );
    const affiliateId = aff.length ? aff[0].id : null;
    if (!affiliateId) return res.status(403).json({ error: 'Affiliate profile not found' });

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

    // Conversion dedup — same click_id within 24h
    const clickId = Date.now();
    const [convDup] = await pool.query(
      'SELECT conversion_id FROM 1ai_conversion_logs WHERE click_id = ? AND conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR)) LIMIT 1',
      [clickId]
    );
    if (convDup.length) {
      return res.status(409).json({ error: 'Duplicate conversion' });
    }

    const networkPayout = parseFloat(link.network_payout) || 0;
    const affiliatePayout = parseFloat(link.payout) || 0;
    const marginAmount = networkPayout - affiliatePayout;

    await pool.query(
      `INSERT INTO 1ai_conversion_logs (aff_campaign_id, click_id, conversion_time, network_payout_snapshot, affiliate_payout_snapshot, margin_amount, affiliate_id, affiliate_status)
       VALUES (?, ?, UNIX_TIMESTAMP(), ?, ?, ?, ?, 'approved')`,
      [campaignId, clickId, networkPayout, affiliatePayout, marginAmount, link.affiliate_id]
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


module.exports = { routeTrafficByHash, generateSmartlink, listSmartlinks, recordConversion, getSmartlinkStats };
