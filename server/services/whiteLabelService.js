'use strict';

/**
 * White-Label Service
 * Manages custom branding per affiliate (logo, colors, domain).
 */

const pool = require('../db/mysql');

async function getBranding(affiliateId) {
  const [rows] = await pool.query('SELECT * FROM 1ai_white_label WHERE affiliate_id = ?', [affiliateId]);
  return rows[0] || null;
}

async function setBranding(affiliateId, config) {
  const now = Math.floor(Date.now() / 1000);
  await pool.query(
    `INSERT INTO 1ai_white_label (affiliate_id, brand_name, brand_logo_url, brand_color, custom_domain, custom_favicon_url, custom_footer_html, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE brand_name=VALUES(brand_name), brand_logo_url=VALUES(brand_logo_url), brand_color=VALUES(brand_color), custom_domain=VALUES(custom_domain), custom_favicon_url=VALUES(custom_favicon_url), custom_footer_html=VALUES(custom_footer_html), updated_at=VALUES(updated_at)`,
    [affiliateId, config.brand_name, config.brand_logo_url, config.brand_color || '#6366f1', config.custom_domain, config.custom_favicon_url, config.custom_footer_html, now, now]
  );
}

async function resolveDomain(hostname) {
  const [rows] = await pool.query('SELECT affiliate_id FROM 1ai_white_label WHERE custom_domain = ?', [hostname]);
  return rows[0]?.affiliate_id || null;
}

module.exports = { getBranding, setBranding, resolveDomain };
