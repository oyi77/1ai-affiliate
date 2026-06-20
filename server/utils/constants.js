'use strict';

/**
 * Shared constants for the entire server.
 * ponytail: one file, all magic values. Change here, changes everywhere.
 */

module.exports = {
  // ── Status Values ────────────────────────────────────────────────────
  STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    ARCHIVED: 'archived',
    PENDING: 'pending',
    APPROVED: 'approved',
    PAID: 'paid',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    FAILED: 'failed',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    DELETED: 'deleted',
  },

  // ── Roles ────────────────────────────────────────────────────────────
  ROLES: {
    ADMIN: 'admin',
    AFFILIATE: 'affiliate',
    ADVERTISER: 'advertiser',
    MANAGER: 'manager',
    AM: 'am',
    OM: 'om',
  },

  // ── Time Constants (seconds) ─────────────────────────────────────────
  TIME: {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
    MONTH: 2592000, // 30 days
  },

  // ── Time Constants (milliseconds) ────────────────────────────────────
  TIME_MS: {
    SECOND: 1000,
    MINUTE: 60_000,
    HOUR: 3_600_000,
    DAY: 86_400_000,
  },

  // ── Limits ───────────────────────────────────────────────────────────
  LIMITS: {
    PAGE_SIZE_DEFAULT: 50,
    PAGE_SIZE_MAX: 200,
    EXPORT_ROW_LIMIT: 10000,
    WEBHOOK_TIMEOUT_MS: 10_000,
    WEBHOOK_MAX_RETRIES: 4,
    CAPI_DEDUP_WINDOW_SEC: 172800, // 48 hours
    RATE_LIMIT_AUTH: 5,
    RATE_LIMIT_REGISTER: 3,
    RATE_LIMIT_ADMIN: 100,
    RATE_LIMIT_API: 60,
    CLICK_VELOCITY_THRESHOLD: 10,
    CLICK_VELOCITY_EXTREME: 50,
    FRAUD_SCORE_BLOCK: 80,
    FRAUD_SCORE_REVIEW: 40,
    POSTBACK_QUEUE_INTERVAL_MS: 10_000,
    SSE_PUSH_INTERVAL_MS: 5000,
    PIPELINE_RETRY_DELAY_MS: 5000,
    AUTO_RULES_INTERVAL_MIN: 15,
  },

  // ── Default Values ───────────────────────────────────────────────────
  DEFAULTS: {
    CURRENCY: 'IDR',
    COST_MODEL: 'CPC',
    FALLBACK_URL: process.env.DEFAULT_FALLBACK_URL || 'https://berkahkarya.org',
    RESET_KEY_EXPIRY_SEC: 3 * 86400, // 3 days
    COOKIE_MAX_AGE_SEC: 30 * 86400,  // 30 days
  },

  // ── API Endpoints ────────────────────────────────────────────────────
  URLS: {
    META_GRAPH_API: 'https://graph.facebook.com/v19.0',
    GOOGLE_ADS_API: 'https://googleads.googleapis.com/v17',
    TIKTOK_ADS_API: 'https://business-api.tiktok.com/open_api/v1.3',
    GOOGLE_TOKEN_URL: 'https://oauth2.googleapis.com/token',
    EXCHANGE_RATE_API: 'https://open.er-api.com/v6/latest/USD',
  },

  // ── Cookie Names ─────────────────────────────────────────────────────
  COOKIES: {
    CLICK_ID: '_1ai_click',
    LP_ID: '_1ai_lp',
  },
};
