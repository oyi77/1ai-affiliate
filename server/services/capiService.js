/**
 * Conversion API (CAPI) Service
 * Sends conversion events to Meta Conversions API and Google Ads API.
 * Integrates with traffic source api_config to fire async on postback receipt.
 */

const GRAPH_API = 'https://graph.facebook.com/v19.0';

/**
 * Send a conversion event to Meta Conversions API.
 *
 * @param {string} accessToken — Meta access token with ads_management scope
 * @param {string} pixelId — Meta Pixel ID
 * @param {object} event — Conversion event payload
 * @param {string} event.event_name — e.g. 'Purchase', 'Lead', 'CompleteRegistration'
 * @param {number} event.event_time — Unix timestamp
 * @param {object} event.user_data — Hashed or raw user identifiers
 * @param {string} [event.user_data.client_ip_address]
 * @param {string} [event.user_data.client_user_agent]
 * @param {string} [event.user_data.fbc] — Click ID (fbclid)
 * @param {string} [event.user_data.fbp] — Browser ID (_fbp cookie)
 * @param {object} [event.custom_data] — Business-specific data
 * @param {number} [event.custom_data.value] — Conversion value
 * @param {string} [event.custom_data.currency] — ISO 4217 currency code
 * @param {string[]} [event.custom_data.content_ids] — Product/content IDs
 * @param {string} [event.action_source] — 'website', 'app', 'phone_call', 'chat', 'physical_store', 'system_generated', 'other'
 * @returns {Promise<{success: boolean, events_received?: number, fbtrace_id?: string, error?: string}>}
 */
async function sendMetaConversion(accessToken, pixelId, event) {
  const url = `${GRAPH_API}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  const payload = {
    data: [{
      event_name: event.event_name || 'Purchase',
      event_time: event.event_time || Math.floor(Date.now() / 1000),
      event_id: event.event_id || undefined,
      action_source: event.action_source || 'website',
      user_data: {
        client_ip_address: event.user_data?.client_ip_address || '',
        client_user_agent: event.user_data?.client_user_agent || '',
        fbc: event.user_data?.fbc || '',
        fbp: event.user_data?.fbp || '',
      },
      custom_data: {
        value: event.custom_data?.value || 0,
        currency: event.custom_data?.currency || 'IDR',
        content_ids: event.custom_data?.content_ids || [],
      },
    }],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (json.error) {
    return { success: false, error: json.error.message || 'Meta CAPI error' };
  }

  return {
    success: true,
    events_received: json.events_received,
    fbtrace_id: json.fbtrace_id,
  };
}

/**
 * Send a conversion to Google Ads API (offline conversion import).
 *
 * @param {string} accessToken — OAuth2 access token
 * @param {string} customerId — Google Ads customer ID (no dashes)
 * @param {string} conversionAction — Resource name of the conversion action
 * @param {object} conversion — Conversion data
 * @param {string} conversion.gclid — Google Click ID
 * @param {number} conversion.conversion_value — Monetary value
 * @param {string} [conversion.currency_code] — ISO 4217
 * @param {string} [conversion.conversion_date_time] — YYYY-MM-DD HH:MM:SS+TZ
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendGoogleConversion(accessToken, customerId, conversionAction, conversion) {
  const url = `https://googleads.googleapis.com/v17/customers/${customerId}/conversionUploads:uploadClickConversions`;

  const payload = {
    conversions: [{
      conversion_action: conversionAction,
      gclid: conversion.gclid,
      conversion_value: conversion.conversion_value || 0,
      currency_code: conversion.currency_code || 'IDR',
      conversion_date_time: conversion.conversion_date_time || null,
    }],
    partial_failure: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (json.error) {
    return { success: false, error: json.error.message || 'Google Ads CAPI error' };
  }

  return { success: true };
}

/**
 * Handle a conversion event — check if CAPI is configured for the traffic source
 * and fire the appropriate platform conversion asynchronously.
 *
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} conversionData
 * @param {number} conversionData.offer_id
 * @param {number} conversionData.affiliate_id
 * @param {number} conversionData.click_id
 * @param {number} [conversionData.payout]
 * @param {string} [conversionData.transaction_id]
 * @param {string} [conversionData.event_name] — e.g. 'Purchase', 'Lead'
 * @param {string} [conversionData.ip_address]
 * @param {string} [conversionData.user_agent]
 * @param {string} [conversionData.fbc] — Facebook click ID
 * @param {string} [conversionData.fbp] — Facebook browser ID
 * @param {string} [conversionData.gclid] — Google Click ID
 * @param {string} [conversionData.currency] — ISO 4217 currency code
async function handleConversion(pool, conversionData) {
  try {
    const clickId = conversionData.click_id || '';
    const eventName = conversionData.event_name || 'Purchase';
    const eventId = `click_${clickId}_${eventName}`;

    // Dedup: skip if we already sent this event within the last 48 hours
    const [existing] = await pool.query(
      `SELECT id FROM 1ai_capi_log
       WHERE event_id = ? AND success = 1 AND created_at > UNIX_TIMESTAMP() - 172800
       LIMIT 1`,
      [eventId]
    ).catch(() => [[]]);

    if (existing && existing.length > 0) {
      return; // Already sent — skip duplicate
    }

    // Look up traffic sources linked to this offer's campaigns
    const [rows] = await pool.query(
      `SELECT ts.id, ts.platform_type, ts.api_config
       FROM 1ai_campaigns c
       JOIN 1ai_traffic_sources ts ON c.traffic_source_id = ts.id
       WHERE c.offer_id = ? AND ts.api_config IS NOT NULL`,
      [conversionData.offer_id]
    );

    for (const ts of rows) {
      let config;
      try {
        config = typeof ts.api_config === 'string' ? JSON.parse(ts.api_config) : ts.api_config;
      } catch {
        continue;
      }

      if (!config || !config.capi_enabled) continue;

      // Fire asynchronously — don't block the postback response
      fireCapiAsync(pool, ts.id, config, conversionData).catch(err => {
        console.error(`CAPI async fire error for traffic_source ${ts.id}:`, err.message);
      });
    }
  } catch (err) {
    console.error('handleConversion error:', err.message);
  }
}

/**
 * Fire CAPI conversion for a specific platform (meta or google).
 * Records the result in 1ai_capi_log for auditing.
async function fireCapiAsync(pool, trafficSourceId, config, conversionData) {
  const startTime = Date.now();
  let result;
  const clickId = conversionData.click_id || '';

  if (config.capi_platform === 'meta' && config.pixel_id && config.access_token) {
    // event_id enables dedup between Pixel (client) and CAPI (server)
    const eventId = `click_${clickId}_${conversionData.event_name || 'Purchase'}`;
    result = await sendMetaConversion(config.access_token, config.pixel_id, {
      event_name: conversionData.event_name || 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: {
        client_ip_address: conversionData.ip_address || '',
        client_user_agent: conversionData.user_agent || '',
        fbc: conversionData.fbc || '',
        fbp: conversionData.fbp || '',
      },
      custom_data: {
        value: conversionData.payout || 0,
        currency: conversionData.currency || 'IDR',
      },
    });
  } else if (config.capi_platform === 'google' && config.customer_id && config.access_token && config.conversion_action) {
    result = await sendGoogleConversion(
      config.access_token,
      config.customer_id,
      config.conversion_action,
      {
        gclid: conversionData.gclid || '',  // Fixed: was incorrectly mapped from fbc
        conversion_value: conversionData.payout || 0,
        currency_code: conversionData.currency || 'IDR',
      }
    );
  } else {
    return;
  }

  const elapsed = Date.now() - startTime;

  // Audit log — best effort, don't throw if table doesn't exist
  try {
    await pool.query(
      `INSERT INTO 1ai_capi_log
       (traffic_source_id, platform, event_name, event_id, success, response_time_ms, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [
        trafficSourceId,
        config.capi_platform,
        conversionData.event_name || 'Purchase',
        `click_${clickId}_${conversionData.event_name || 'Purchase'}`,
        result.success ? 1 : 0,
        elapsed,
        result.error || null,
      ]
    );
  } catch {
    // Table may not exist yet — non-fatal
  }
}

module.exports = { sendMetaConversion, sendGoogleConversion, handleConversion };
