'use strict';
/**
 * Postback, domain, and URL-shortener admin handlers.
 * Split from server/controllers/adminController.js (800-line gate).
 */

const pool = require('../db/mysql');
const { parsePostbackHeaders, validatePostbackUrl, normalizeInteger, isIntegerInRange } = require('./postbackController');
const infrastructureManager = require('../services/infrastructureManager');
const { queryRows, queryOne } = require('./adminShared');

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
    console.error('setOfferPostback error:', err);
    res.status(500).json({ error: err.message });
  }
}

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
    console.error('getOfferPostback error:', err);
    res.status(500).json({ error: err.message });
  }
}

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
    console.error('getPostbackLogs error:', err);
    res.status(500).json({ error: err.message });
  }
}

// ============ Domain Management ============

/**
 * Get all smartlink domains
 */

// ============ Domain Management ============

/**
 * Get all smartlink domains
 */
async function getDomains(_req, res) {
  try {
    const [domains] = await pool.query(`
      SELECT id, domain, is_active, is_default, ssl_enabled, cloudflare_zone_id, notes, created_at, updated_at
      FROM 1ai_smartlink_domains
      ORDER BY is_default DESC, domain ASC
    `);
    res.json(domains);
  } catch (err) {
    console.error('getDomains error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Create a new domain
 */

/**
 * Create a new domain
 */
async function createDomain(req, res) {
  const { domain, is_active = true, is_default = false, ssl_enabled = true, cloudflare_zone_id = null, notes = null } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }
  
  try {
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query('UPDATE 1ai_smartlink_domains SET is_default = FALSE');
    }
    
    const [result] = await pool.query(`
      INSERT INTO 1ai_smartlink_domains (domain, is_active, is_default, ssl_enabled, cloudflare_zone_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [domain, is_active, is_default, ssl_enabled, cloudflare_zone_id, notes]);
    
    const [newDomain] = await pool.query('SELECT * FROM 1ai_smartlink_domains WHERE id = ?', [result.insertId]);
    
    // Provision infrastructure if SSL is enabled
    if (ssl_enabled) {
      try {
        await infrastructureManager.provisionDomain(domain, {
          sslEnabled: ssl_enabled,
          cloudflareZoneId: cloudflare_zone_id,
          serverIp: process.env.SERVER_IP
        });
      } catch (infraErr) {
        console.error('Infrastructure provisioning failed:', infraErr);
        // Rollback: delete the database record
        await pool.query('DELETE FROM 1ai_smartlink_domains WHERE id = ?', [result.insertId]);
        return res.status(500).json({ 
          error: 'Failed to provision infrastructure',
          details: infraErr.message 
        });
      }
    }
    
    res.status(201).json(newDomain[0]);
  } catch (err) {
    console.error('createDomain error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Domain already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update a domain
 */

/**
 * Update a domain
 */
async function updateDomain(req, res) {
  const { id } = req.params;
  const { domain, is_active, is_default, ssl_enabled, cloudflare_zone_id, notes } = req.body;
  
  try {
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query('UPDATE 1ai_smartlink_domains SET is_default = FALSE');
    }
    
    await pool.query(`
      UPDATE 1ai_smartlink_domains
      SET domain = COALESCE(?, domain),
          is_active = COALESCE(?, is_active),
          is_default = COALESCE(?, is_default),
          ssl_enabled = COALESCE(?, ssl_enabled),
          cloudflare_zone_id = COALESCE(?, cloudflare_zone_id),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `, [domain, is_active, is_default, ssl_enabled, cloudflare_zone_id, notes, id]);
    
    const [updated] = await pool.query('SELECT * FROM 1ai_smartlink_domains WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updateDomain error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Domain already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete a domain
 */

/**
 * Delete a domain
 */
async function deleteDomain(req, res) {
  const { id } = req.params;
  
  try {
    const [links] = await pool.query('SELECT COUNT(*) as count FROM 1ai_affiliate_links WHERE domain_id = ?', [id]);
    if (links[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete domain with associated smartlinks' });
    }
    
    await pool.query('DELETE FROM 1ai_smartlink_domains WHERE id = ?', [id]);
    res.json({ success: true, message: 'Domain deleted' });
  } catch (err) {
    console.error('deleteDomain error:', err);
    res.status(500).json({ error: err.message });
  }
}

// ============ URL Shortener Services ============

/**
 * Get all URL shortener services
 */

// ============ URL Shortener Services ============

/**
 * Get all URL shortener services
 */
async function getShortenerServices(_req, res) {
  try {
    const [services] = await pool.query(`
      SELECT s.id, s.name, s.service_type, s.api_endpoint, s.is_active, s.is_default, 
             s.default_domain, s.rate_limit_per_minute, s.config_json, s.created_at, s.updated_at,
             d.domain as linked_domain
      FROM 1ai_url_shortener_services s
      LEFT JOIN 1ai_smartlink_domains d ON s.domain_id = d.id
      ORDER BY s.is_default DESC, s.name ASC
    `);
    res.json(services);
  } catch (err) {
    console.error('getShortenerServices error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Create or update a shortener service
 */

/**
 * Create or update a shortener service
 */
async function saveShortenerService(req, res) {
  const { id } = req.params;
  const { name, service_type, api_endpoint, api_key, api_secret, domain_id, default_domain, is_active, is_default, rate_limit_per_minute, config_json } = req.body;
  
  try {
    // If setting as default, unset other defaults first
    if (is_default) {
      await pool.query('UPDATE 1ai_url_shortener_services SET is_default = FALSE');
    }
    
    if (id) {
      // Update existing
      await pool.query(`
        UPDATE 1ai_url_shortener_services
        SET name = COALESCE(?, name),
            service_type = COALESCE(?, service_type),
            api_endpoint = COALESCE(?, api_endpoint),
            api_key = COALESCE(?, api_key),
            api_secret = COALESCE(?, api_secret),
            domain_id = COALESCE(?, domain_id),
            default_domain = COALESCE(?, default_domain),
            is_active = COALESCE(?, is_active),
            is_default = COALESCE(?, is_default),
            rate_limit_per_minute = COALESCE(?, rate_limit_per_minute),
            config_json = COALESCE(?, config_json)
        WHERE id = ?
      `, [name, service_type, api_endpoint, api_key, api_secret, domain_id, default_domain, is_active, is_default, rate_limit_per_minute, config_json, id]);
      
      const [updated] = await pool.query('SELECT * FROM 1ai_url_shortener_services WHERE id = ?', [id]);
      res.json(updated[0]);
    } else {
      // Create new
      const [result] = await pool.query(`
        INSERT INTO 1ai_url_shortener_services 
          (name, service_type, api_endpoint, api_key, api_secret, domain_id, default_domain, is_active, is_default, rate_limit_per_minute, config_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, service_type, api_endpoint, api_key, api_secret, domain_id, default_domain, is_active || true, is_default || false, rate_limit_per_minute || 60, config_json]);
      
      const [newService] = await pool.query('SELECT * FROM 1ai_url_shortener_services WHERE id = ?', [result.insertId]);
      res.status(201).json(newService[0]);
    }
  } catch (err) {
    console.error('saveShortenerService error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete a shortener service
 */

/**
 * Delete a shortener service
 */
async function deleteShortenerService(req, res) {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM 1ai_url_shortener_services WHERE id = ?', [id]);
    res.json({ success: true, message: 'Shortener service deleted' });
  } catch (err) {
    console.error('deleteShortenerService error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Test a shortener service by shortening a URL
 */

/**
 * Test a shortener service by shortening a URL
 */
async function testShortenerService(req, res) {
  const { id } = req.params;
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const [services] = await pool.query('SELECT * FROM 1ai_url_shortener_services WHERE id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Shortener service not found' });
    }
    
    const service = services[0];
    const shortUrl = await shortenUrl(url, service);
    res.json({ short_url: shortUrl });
  } catch (err) {
    console.error('testShortenerService error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Helper function to shorten URL using different services
 */

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

module.exports = {
  setOfferPostback,
  getOfferPostback,
  getPostbackLogs,
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  getShortenerServices,
  saveShortenerService,
  deleteShortenerService,
  testShortenerService,
  shortenUrl,

};
