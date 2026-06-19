const pool = require('../db/mysql');
const https = require('https');
const http = require('http');

/**
 * Public postback endpoint — receives conversion data from advertisers
 * Security: click_id is unique and hard to guess; optionally supports API key/signature verification
 */
async function receivePostback(req, res) {
  const params = { ...(req.query || {}), ...(req.body || {}) };
  // Accept click_id, clickid, or cid — all common S2S postback macro names
  const rawClickId = params.click_id || params.clickid || params.cid;
  const { payout, transaction_id, event, status: convStatus, sig, ...rest } = params;
  // Remove the click_id aliases from customParams
  delete rest.click_id;
  delete rest.clickid;
  delete rest.cid;
  const customParams = rest;

  if (!rawClickId) {
    return res.status(400).json({ error: 'click_id required' });
  }

  const click_id = String(rawClickId).trim();

  try {
    // Look up the real click record in 1ai_click_log by click_id
    const [clickRows] = await pool.query(
      `SELECT cl.click_id, cl.affiliate_id, cl.offer_id,
              o.postback_url, o.postback_auth_type, o.postback_auth_value
       FROM 1ai_click_log cl
       JOIN 1ai_offers o ON cl.offer_id = o.id
       WHERE cl.click_id = ? LIMIT 1`,
      [click_id]
    );

    if (!clickRows.length) {
      return res.status(404).json({ error: 'click_id not found' });
    }

    const click = clickRows[0];

    // Idempotency: dedupe_hash = SHA-256(click_id + '|' + (txid || ''))
    const crypto = require('crypto');
    const txid = transaction_id || '';
    const dedupeHash = crypto.createHash('sha256').update(click_id + '|' + txid).digest('hex');

    // Check for duplicate postbacks via dedupe_hash
    const [existing] = await pool.query(
      'SELECT id FROM 1ai_postback_logs WHERE dedupe_hash = ? LIMIT 1',
      [dedupeHash]
    );

    if (existing.length) {
      return res.status(409).json({ error: 'Postback already received for this click' });
    }

    // Verify signature if required
    if (click.postback_auth_type === 'signature') {
      const expectedSig = generateSignature(click_id + payout + txid, click.postback_auth_value);
      if (sig !== expectedSig) {
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    // Create postback log entry (dedupe_hash enforces idempotency at DB level too)
    const postbackLogId = await logPostback({
      offer_id: click.offer_id,
      affiliate_id: click.affiliate_id,
      click_id,
      transaction_id: txid || null,
      payout: parseFloat(payout) || 0,
      conversion_event: event || 'conversion',
      status: 'received',
      custom_params: customParams,
      postback_url: click.postback_url,
      dedupe_hash: dedupeHash,
    });

    // Mark the click as converted
    await pool.query(
      'UPDATE 1ai_click_log SET converted = 1, converted_at = UNIX_TIMESTAMP() WHERE click_id = ?',
      [click_id]
    );

    // Create earnings entry
    await pool.query(
      `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, status, created_at)
       VALUES (?, ?, ?, UNIX_TIMESTAMP())`,
      [click.affiliate_id, parseFloat(payout) || 0, 'pending']
    );

    // Enqueue postback for async sending
    const postbackQueue = require('../services/postbackQueue');
    await postbackQueue.enqueue(postbackLogId);

    // Fire Conversion API (CAPI) if configured for traffic sources linked to this offer
    const capiService = require('../services/capiService');
    capiService.handleConversion(pool, {
      offer_id: click.offer_id,
      affiliate_id: click.affiliate_id,
      click_id,
      payout: parseFloat(payout) || 0,
      transaction_id: txid || null,
      ip_address: req.ip || req.connection?.remoteAddress || '',
      user_agent: req.headers?.['user-agent'] || '',
      fbc: params.fbc || '',
      fbp: params.fbp || '',
    }).catch(err => console.error('CAPI handleConversion error:', err.message));

    // Fire registered webhooks for the 'conversion' event
    const zapierService = require('../services/zapierService');
    zapierService.fireWebhooksForEvent(pool, click.affiliate_id, 'conversion', {
      click_id,
      offer_id: click.offer_id,
      payout: parseFloat(payout) || 0,
      transaction_id: txid || null,
      status: 'received',
    }).catch(err => console.error('Webhook fire error:', err.message));

    res.json({ success: true, postback_id: postbackLogId, payout, click_id });
  } catch (err) {
    if (isDuplicatePostbackError(err)) {
      return res.status(409).json({ error: 'Postback already received for this click' });
    }
    console.error('Postback receive error:', err);
    res.status(500).json({ error: err.message });
  }
}

function isDuplicatePostbackError(err) {
  return err && (err.code === 'ER_DUP_ENTRY' || String(err.message || '').includes('uk_offer_click'));
}

/**
 * Parse postback_headers defensively: handle JSON string, object, or null
 */
function parsePostbackHeaders(headersValue) {
  if (!headersValue) return {};

  let parsed = headersValue;
  if (typeof headersValue === 'string') {
    try {
      parsed = JSON.parse(headersValue);
    } catch (err) {
      console.warn('Invalid postback_headers JSON:', err.message);
      return {};
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed)
      .filter(([key, value]) => typeof key === 'string' && key.trim() && value !== null && value !== undefined)
      .map(([key, value]) => [key, String(value)])
  );
}

/**
 * Fire postback to advertiser (called after conversion is recorded)
 * Substitutes macro tokens, supports GET and POST, and handles retries
 */
async function firePostback(postbackLogId) {
  let maxRetries = 3;
  try {
    const [logs] = await pool.query('SELECT * FROM 1ai_postback_logs WHERE id = ?', [postbackLogId]);
    if (!logs.length) throw new Error('Postback log not found');

    const log = logs[0];
    const [offers] = await pool.query('SELECT postback_url, postback_enabled, postback_timeout, postback_auth_type, postback_auth_value, postback_method, postback_headers, postback_retries FROM 1ai_offers WHERE id = ?', [log.offer_id]);
    
    if (!offers.length || !offers[0].postback_enabled) {
      throw new Error('Postback not enabled for offer');
    }

    const offer = offers[0];
    const timeout = normalizeInteger(offer.postback_timeout, 10, 1, 60);
    maxRetries = normalizeInteger(offer.postback_retries, 3, 0, 10);
    const method = (offer.postback_method || 'GET').toUpperCase();

    // Substitute macro tokens in postback URL (sanitized with URL encoding)
    let postbackUrl = offer.postback_url
      .replace(/{click_id}/g, encodeURIComponent(log.click_id || ''))
      .replace(/{cid}/g, encodeURIComponent(log.click_id || ''))
      .replace(/{tid}/g, encodeURIComponent(log.click_id || ''))
      .replace(/{aff_click_id}/g, encodeURIComponent(log.click_id || ''))
      .replace(/{payout}/g, encodeURIComponent(String(log.payout || '0')))
      .replace(/{transaction_id}/g, encodeURIComponent(log.transaction_id || ''))
      .replace(/{txid}/g, encodeURIComponent(log.transaction_id || ''))
      .replace(/{event}/g, encodeURIComponent(log.conversion_event || 'conversion'))
      .replace(/{status}/g, 'approved');

    // Build headers: defaults + auth + custom
    const headers = { 'User-Agent': '1ai-Affiliate/1.0' };
    if (offer.postback_auth_type === 'api_key') {
      headers['X-API-Key'] = offer.postback_auth_value;
    } else if (offer.postback_auth_type === 'bearer') {
      headers['Authorization'] = `Bearer ${offer.postback_auth_value}`;
    }

    // Merge custom headers (parsed defensively)
    const customHeaders = parsePostbackHeaders(offer.postback_headers);
    Object.assign(headers, customHeaders);

    // Build request body for POST
    let body = null;
    if (method === 'POST') {
      const bodyData = {
        click_id: log.click_id,
        payout: log.payout,
        transaction_id: log.transaction_id || '',
        event: log.conversion_event || 'conversion',
        status: 'approved'
      };
      body = JSON.stringify(bodyData);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const response = await fireHttpRequest(postbackUrl, method, headers, timeout, body);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Postback HTTP ${response.status}: ${response.body || 'non-2xx response'}`);
    }

    await pool.query(
      `UPDATE 1ai_postback_logs SET status = 'sent', http_status = ?, http_response = ?, sent_at = NOW() 
       WHERE id = ?`,
      [response.status, response.body, postbackLogId]
    );

    return { success: true, status: response.status };
  } catch (err) {
    console.error('Fire postback error:', err);

    // Update log with retry info
    const [logs] = await pool.query('SELECT retry_count FROM 1ai_postback_logs WHERE id = ?', [postbackLogId]);
    if (logs.length) {
      const newRetryCount = (logs[0].retry_count || 0) + 1;
      const shouldRetry = newRetryCount < maxRetries;
      const nextRetryAt = shouldRetry ? new Date(Date.now() + Math.pow(2, newRetryCount) * 60000) : null;
      
      await pool.query(
        `UPDATE 1ai_postback_logs SET status = ?, retry_count = ?, next_retry_at = ?, error_message = ? 
         WHERE id = ?`,
        [shouldRetry ? 'retry' : 'failed', newRetryCount, nextRetryAt, err.message, postbackLogId]
      );
    }

    throw err;
  }
}

/**
 * Fire HTTP request with timeout and optional body
 */
function fireHttpRequest(url, method = 'GET', headers = {}, timeout = 10, body = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(body);
    }

    const req = client.request(url, { method, headers: reqHeaders, timeout: timeout * 1000 }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: responseBody });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Postback timeout'));
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

/**
 * Log postback attempt
 */
async function logPostback(data) {
  const { offer_id, affiliate_id, click_id, transaction_id, payout, conversion_event, status, custom_params, postback_url, dedupe_hash } = data;

  const [result] = await pool.query(
    `INSERT INTO 1ai_postback_logs (offer_id, affiliate_id, click_id, transaction_id, payout, conversion_event, status, postback_url, postback_body, dedupe_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [offer_id, affiliate_id, click_id, transaction_id, payout, conversion_event, status, postback_url || null, JSON.stringify(custom_params || {}), dedupe_hash || null]
  );

  return result.insertId;
}

/**
 * Generate signature for postback verification
 */
function generateSignature(data, secret) {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Validate postback URL format — must be valid HTTP or HTTPS URL, or empty (disabled)
 */
function validatePostbackUrl(url) {
  if (!url) return true; // null/empty is OK (postback disabled)
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function normalizeInteger(value, defaultValue, min, max) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= min && numeric <= max ? numeric : defaultValue;
}

function isIntegerInRange(value, min, max) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= min && numeric <= max;
}

/**
 * Get postback logs (admin only)
 */
async function getPostbackLogs(req, res) {
  try {
    const { offer_id, status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM 1ai_postback_logs WHERE 1=1';
    const params = [];

    if (offer_id) {
      query += ' AND offer_id = ?';
      params.push(offer_id);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (err) {
    console.error('Get postback logs error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Set postback config for offer (admin only)
 */
async function setOfferPostback(req, res) {
  const { offerId } = req.params;
  const { postback_url, postback_enabled, postback_auth_type, postback_auth_value, postback_method, postback_headers, postback_timeout, postback_retries } = req.body;

  if (postback_url && !validatePostbackUrl(postback_url)) {
    return res.status(400).json({ 
      error: 'Invalid postback URL format. Must be a valid HTTP or HTTPS URL.' 
    });
  }

  if (postback_method && !['GET', 'POST'].includes(postback_method.toUpperCase())) {
    return res.status(400).json({ 
      error: 'postback_method must be GET or POST' 
    });
  }

  if (postback_timeout !== undefined && !isIntegerInRange(postback_timeout, 1, 60)) {
    return res.status(400).json({ error: 'postback_timeout must be an integer between 1 and 60' });
  }

  if (postback_retries !== undefined && !isIntegerInRange(postback_retries, 0, 10)) {
    return res.status(400).json({ error: 'postback_retries must be an integer between 0 and 10' });
  }

  try {
    const headersToStore = postback_headers ? JSON.stringify(parsePostbackHeaders(postback_headers)) : null;

    await pool.query(
      `UPDATE 1ai_offers SET postback_url = ?, postback_enabled = ?, postback_auth_type = ?, postback_auth_value = ?, postback_method = ?, postback_headers = ?, postback_timeout = ?, postback_retries = ? WHERE id = ?`,
      [postback_url || null, postback_enabled !== false, postback_auth_type || null, postback_auth_value || null, postback_method?.toUpperCase() || 'GET', headersToStore || '{}', normalizeInteger(postback_timeout, 10, 1, 60), normalizeInteger(postback_retries, 3, 0, 10), offerId]
    );

    res.json({ success: true, offer_id: offerId });
  } catch (err) {
    console.error('Set postback config error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get postback config for offer
 */
async function getOfferPostback(req, res) {
  const { offerId } = req.params;

  try {
    const [offers] = await pool.query(
      'SELECT postback_url, postback_enabled, postback_auth_type, postback_auth_value, postback_timeout, postback_method, postback_headers, postback_retries FROM 1ai_offers WHERE id = ?',
      [offerId]
    );

    if (!offers.length) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(offers[0]);
  } catch (err) {
    console.error('Get postback config error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  receivePostback,
  firePostback,
  getPostbackLogs,
  setOfferPostback,
  getOfferPostback,
  validatePostbackUrl,
  parsePostbackHeaders,
  normalizeInteger,
  isIntegerInRange,
};
