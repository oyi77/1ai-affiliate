const pool = require('../db/mysql');
const crypto = require('crypto');
const { lookupIp } = require('../routes/geoip');

/**
 * Core routing engine implementation.
 * Compares Geo and Device rules.
 */
async function processRouting(sl, subid, ip, userAgent) {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  // 1. Get the link
  const [links] = await pool.query('SELECT * FROM 1ai_affiliate_links WHERE link_token = ? AND status = "active"', [sl]);
  if (!links.length) throw new Error('Smartlink inactive or not found');
  const link = links[0];

  // 2. Lookup Geo
  const geoData = await lookupIp(ip);
  const countryCode = geoData.country_code || 'US';

  // 3. Get active offers for the campaign
  const [offers] = await pool.query(`
    SELECT o.id, o.network_offer_id, o.payout, o.geo, o.traffic_allowed 
    FROM 1ai_offers o
    JOIN 1ai_offer_campaigns oc ON o.id = oc.offer_id
    WHERE oc.campaign_id = ? AND o.status = 'active'
  `, [link.campaign_id]);

  if (!offers.length) throw new Error('No active offers found for this routing pool');

  // 4. Filter offers based on Geo and Device
  let validOffers = offers.filter(o => {
    // Check Geo
    const geoMatch = !o.geo || o.geo.includes(countryCode) || o.geo.includes('Global');
    
    // Check Traffic/Device
    let deviceMatch = true;
    if (o.traffic_allowed) {
      try {
        const rules = JSON.parse(o.traffic_allowed);
        if (rules.device && !rules.device.includes(deviceType)) {
          deviceMatch = false;
        }
      } catch (e) { /* ignore parse error */ }
    }
    
    return geoMatch && deviceMatch;
  });

  // Fallback if strict filtering eliminated all offers
  if (!validOffers.length) validOffers = offers;

  // 5. Select offer
  let selectedOffer = validOffers[Math.floor(Math.random() * validOffers.length)];
  const clickId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // 6. Log Session
  await pool.query(
    'INSERT INTO 1ai_affiliate_sessions (link_token, click_id, affiliate_payout, tracked_at) VALUES (?, ?, ?, UNIX_TIMESTAMP())',
    [sl, clickId, selectedOffer.payout]
  ).catch(e => console.error("Session log error:", e));

  // 7. Route URL (redirects to the PHP core tracker click receiver)
  return `/tracking1ai/redirect/dl.php?t1aiid=${selectedOffer.id}&t1aisubid=${subid || ''}&c1=${clickId}`;
}

/**
 * Smartlink API route.
 */
async function routeTraffic(req, res) {
  const { sl, subid } = req.query;
  if (!sl) return res.status(400).send('Invalid Smartlink');

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  
  try {
    const trackingUrl = await processRouting(sl, subid, ip, userAgent);
    res.redirect(trackingUrl);
  } catch (err) {
    console.error('Smartlink API Error:', err);
    res.status(500).send(err.message || 'Routing error');
  }
}

/**
 * Shortlink/ClickServer modern b202 equivalent handler
 */
async function routeTrafficByHash(req, res) {
  const hash = req.params.hash;
  const { subid } = req.query;
  if (!hash) return res.status(400).send('Invalid Link');

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const trackingUrl = await processRouting(hash, subid, ip, userAgent);
    res.redirect(trackingUrl);
  } catch (err) {
    console.error('Shortlink Route Error:', err);
    res.status(500).send(err.message || 'Routing error');
  }
}

/**
 * Generate a new Smartlink/Shortlink for an affiliate.
 */
async function generateSmartlink(req, res) {
  const { campaign_id } = req.body;
  
  try {
    const [aff] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    const affiliate_id = aff.length ? aff[0].id : 1; // fallback to 1 for testing

    const token = crypto.randomBytes(6).toString('hex'); // 12 chars is good for shortlink
    await pool.query(
      'INSERT INTO 1ai_affiliate_links (affiliate_id, campaign_id, link_token, status, created_at, updated_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())',
      [affiliate_id, campaign_id || 1, token, 'active']
    );
    
    // Return both the modern shortlink and the API route
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({ 
      success: true, 
      token, 
      url: `${baseUrl}/go/${token}`,
      api_url: `${baseUrl}/api/smartlink/route?sl=${token}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function listSmartlinks(req, res) {
  try {
    const [aff] = await pool.query('SELECT id FROM 1ai_affiliates WHERE user_id = ?', [req.user.id]);
    if (!aff.length) return res.json([]);
    const [links] = await pool.query(
      `SELECT l.*, c.name AS campaignName
       FROM 1ai_affiliate_links l
       LEFT JOIN 1ai_campaigns c ON l.campaign_id = c.id
       WHERE l.affiliate_id = ?
       ORDER BY l.created_at DESC`,
      [aff[0].id]
    );
    res.json(links);
  } catch (err) {
    console.error('listSmartlinks error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { routeTraffic, routeTrafficByHash, generateSmartlink, listSmartlinks };
