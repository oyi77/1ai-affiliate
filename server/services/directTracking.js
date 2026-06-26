'use strict';

/**
 * Direct Tracking Mode — Cookieless, server-side tracking without redirects.
 * 
 * Competitors: Voluum has direct tracking, RedTrack has server-side CAPI.
 * We provide pixel-based + API-based direct tracking that bypasses redirect detection.
 * 
 * How it works:
 * 1. Advertiser places our tracking pixel (1x1 image) on their thank-you page
 * 2. Pixel fires with click_id parameter
 * 3. Server records conversion directly without redirect
 * 4. Alternative: Advertiser calls our API endpoint directly (S2S)
 */

const crypto = require('crypto');
const pool = require('../db/mysql');

// ── Generate Tracking Pixel ─────────────────────────────────────

/**
 * Generate a 1x1 tracking pixel URL for direct tracking.
 * @param {Object} params
 * @param {string} params.click_id - Click identifier
 * @param {number} params.offer_id - Offer ID
 * @returns {string} Pixel URL
 */
function generatePixelUrl({ click_id, offer_id }) {
  const domain = process.env.TRACKING_DOMAIN || 'track.berkahkarya.org';
  const token = crypto.createHmac('sha256', process.env.HMAC_CLICK_SECRET || 'default-secret')
    .update(`${click_id}:${offer_id}`)
    .digest('hex')
    .substring(0, 16);
  
  return `https://${domain}/pixel.gif?cid=${encodeURIComponent(click_id)}&oid=${offer_id}&t=${token}`;
}

/**
 * Generate HTML tracking pixel tag.
 * @param {Object} params
 * @returns {string} HTML img tag
 */
function generatePixelTag(params) {
  const url = generatePixelUrl(params);
  return `<img src="${url}" width="1" height="1" style="display:none" alt="" />`;
}

/**
 * Generate JavaScript tracking snippet.
 * @param {Object} params
 * @returns {string} JavaScript code
 */
function generateJSSnippet(params) {
  const domain = process.env.TRACKING_DOMAIN || 'track.berkahkarya.org';
  return `
<!-- 1AI Affiliate Direct Tracking -->
<script>
(function() {
  var clickId = '${params.click_id || '{click_id}'}';
  var offerId = '${params.offer_id || '{offer_id}'}';
  var img = new Image();
  img.src = 'https://${domain}/pixel.gif?cid=' + encodeURIComponent(clickId) + '&oid=' + offerId + '&t=' + Date.now();
  img.style.display = 'none';
  document.body.appendChild(img);
})();
</script>
<!-- End 1AI Tracking -->`;
}

// ── Handle Pixel Request ────────────────────────────────────────

/**
 * Process a tracking pixel request.
 * Records the conversion directly without redirect.
 */
async function handlePixelRequest(query) {
  const { cid: click_id, oid: offer_id, t: token } = query;
  
  if (!click_id || !offer_id) {
    return { success: false, error: 'Missing click_id or offer_id' };
  }

  // Verify token
  const expectedToken = crypto.createHmac('sha256', process.env.HMAC_CLICK_SECRET || 'default-secret')
    .update(`${click_id}:${offer_id}`)
    .digest('hex')
    .substring(0, 16);

  if (token !== expectedToken) {
    return { success: false, error: 'Invalid token' };
  }

  // Record conversion
  try {
    const [[existing]] = await pool.query(
      'SELECT conversion_id FROM 1ai_conversion_logs WHERE click_id = ? AND aff_campaign_id = ?',
      [click_id, offer_id]
    );

    if (existing) {
      return { success: true, duplicate: true, conversion_id: existing.conversion_id };
    }

    const [result] = await pool.query(
      `INSERT INTO 1ai_conversion_logs (click_id, aff_campaign_id, conversion_time, status, affiliate_payout_snapshot)
       VALUES (?, ?, UNIX_TIMESTAMP(), 'pending', 0)`,
      [click_id, offer_id]
    );

    return { success: true, conversion_id: result.insertId };
  } catch (err) {
    console.error('handlePixelRequest error:', err.message);
    return { success: false, error: err.message };
  }
}

// ── S2S Postback Handler ────────────────────────────────────────

/**
 * Handle S2S postback from advertiser.
 * More reliable than pixel — server-to-server.
 */
async function handleS2SPostback(body) {
  const { click_id, payout, transaction_id, status } = body;
  
  if (!click_id) {
    return { success: false, error: 'click_id required' };
  }

  try {
    // Find the original click
    const [[click]] = await pool.query(
      'SELECT click_id, aff_campaign_id FROM 1ai_click_log WHERE click_id = ?',
      [click_id]
    );

    if (!click) {
      return { success: false, error: 'Click not found' };
    }

    // Check for duplicate
    const [[existing]] = await pool.query(
      'SELECT conversion_id FROM 1ai_conversion_logs WHERE click_id = ?',
      [click_id]
    );

    if (existing) {
      return { success: true, duplicate: true, conversion_id: existing.conversion_id };
    }

    // Record conversion
    const [result] = await pool.query(
      `INSERT INTO 1ai_conversion_logs (click_id, aff_campaign_id, conversion_time, status, affiliate_payout_snapshot, network_payout_snapshot)
       VALUES (?, ?, UNIX_TIMESTAMP(), ?, ?, ?)`,
      [click_id, click.aff_campaign_id, status || 'pending', payout || 0, payout || 0]
    );

    return { success: true, conversion_id: result.insertId };
  } catch (err) {
    console.error('handleS2SPostback error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  generatePixelUrl,
  generatePixelTag,
  generateJSSnippet,
  handlePixelRequest,
  handleS2SPostback,
};
