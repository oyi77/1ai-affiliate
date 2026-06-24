/**
 * Centralized settings service.
 * Read order: 1ai_settings DB table → .env → hardcoded defaults.
 * Caches for 60s to avoid DB hits on every request.
 */
const pool = require('../db/mysql');

let cache = {};
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

// All known settings with their .env fallback keys and defaults
const SCHEMA = {
  // Domains — MUST be configured via env or admin settings
  smartlink_domain:       { env: 'SMARTLINK_FALLBACK_DOMAIN',  default: '' },
  smartlink_domain_alt:   { env: 'SMARTLINK_DOMAIN_ALT',       default: '' },
  deeplink_domain:        { env: 'DEEPLINK_DOMAIN',            default: '' },
  click_domain:           { env: 'CLICK_DOMAIN',               default: '' },
  landing_domain:         { env: 'LANDING_DOMAIN',             default: '' },
  app_domain:             { env: 'APP_DOMAIN',                 default: '' },

  // Branding
  brand_name:             { env: 'BRAND_NAME',                 default: '1AI Affiliate' },
  support_email:          { env: 'SUPPORT_EMAIL',              default: '' },
  noreply_email:          { env: 'SMTP_FROM',                  default: '' },
  status_page_url:        { env: 'STATUS_PAGE_URL',            default: '' },
  changelog_url:          { env: 'CHANGELOG_URL',              default: '' },
  community_url:          { env: 'COMMUNITY_URL',              default: '' },

  // Postback
  postback_url_template:  { env: 'POSTBACK_URL_TEMPLATE',      default: '' },
  webhook_url_template:   { env: 'WEBHOOK_URL_TEMPLATE',       default: '' },

  // Shortener
  default_shortener:      { env: 'DEFAULT_SHORTENER',          default: '' },

  // Misc
  default_fallback_url:   { env: 'DEFAULT_FALLBACK_URL',       default: '' },
  default_currency:       { env: 'DEFAULT_CURRENCY',           default: 'IDR' },
};

async function loadSettings() {
  const now = Date.now();
  if (now < cacheExpiry && Object.keys(cache).length > 0) return cache;

  try {
    const [rows] = await pool.query('SELECT name, value FROM 1ai_settings');
    const dbValues = {};
    for (const row of rows) {
      dbValues[row.name] = row.value;
    }

    const resolved = {};
    for (const [key, spec] of Object.entries(SCHEMA)) {
      resolved[key] = dbValues[key] || process.env[spec.env] || spec.default;
    }

    cache = resolved;
    cacheExpiry = now + CACHE_TTL_MS;
    return resolved;
  } catch (err) {
    // DB down — fall back to env + defaults
    const resolved = {};
    for (const [key, spec] of Object.entries(SCHEMA)) {
      resolved[key] = process.env[spec.env] || spec.default;
    }
    return resolved;
  }
}

async function get(key) {
  const settings = await loadSettings();
  return settings[key] ?? SCHEMA[key]?.default ?? '';
}

async function set(key, value) {
  const ts = Math.floor(Date.now() / 1000);
  await pool.query(
    'INSERT INTO 1ai_settings (name, value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)',
    [key, value, ts]
  );
  // Invalidate cache
  cacheExpiry = 0;
}

async function getAll() {
  return loadSettings();
}

async function setMany(entries) {
  const ts = Math.floor(Date.now() / 1000);
  const conn = await pool.getConnection();
  try {
    for (const [key, value] of Object.entries(entries)) {
      await conn.query(
        'INSERT INTO 1ai_settings (name, value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)',
        [key, value, ts]
      );
    }
  } finally {
    conn.release();
  }
  cacheExpiry = 0;
}

function getSchema() {
  return SCHEMA;
}

module.exports = { get, set, getAll, setMany, getSchema, loadSettings };
