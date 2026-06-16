-- Phase B: Core AdTech Data Model
-- World-class affiliate network schema extensions.
-- Idempotent: uses IF NOT EXISTS / IF EXISTS / ADD COLUMN IF NOT EXISTS / DROP FOREIGN KEY IF EXISTS.
-- Safe for existing data: new columns have sensible defaults; existing offer status values are preserved.

-- ===========================================================================
-- 1. OFFER STATUS WORKFLOW
-- ===========================================================================
-- Extend status enum to include `draft`. Existing rows keep their current value.
-- MySQL stores ENUM values as positional integers, so extending the enum at the end is safe.
ALTER TABLE `1ai_offers`
  MODIFY COLUMN `status` ENUM('draft','active','paused','archived') NOT NULL DEFAULT 'draft'
    COMMENT 'draft=pending approval, active=live, paused=temporarily stopped, archived=retired';

-- Approval workflow timestamps and actor tracking.
ALTER TABLE `1ai_offers`
  ADD COLUMN IF NOT EXISTS `approval_status` ENUM('pending','approved','rejected','changes_requested') NOT NULL DEFAULT 'pending'
    COMMENT 'OM review state' AFTER `status`,
  ADD COLUMN IF NOT EXISTS `submitted_for_approval_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `submitted_for_approval_by` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approved_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approved_by` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rejected_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rejected_by` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `archived_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `archived_by` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `paused_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `paused_by` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_by` INT UNSIGNED DEFAULT NULL,
  ADD INDEX IF NOT EXISTS `idx_approval_status` (`approval_status`),
  ADD INDEX IF NOT EXISTS `idx_status_approval` (`status`, `approval_status`),
  ADD INDEX IF NOT EXISTS `idx_submitted_for_approval` (`submitted_for_approval_at`),
  ADD INDEX IF NOT EXISTS `idx_offer_name` (`name`(128));

-- ===========================================================================
-- 2. OFFER LANDING PAGES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_offer_landing_pages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `offer_id` INT UNSIGNED NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `weight` INT UNSIGNED NOT NULL DEFAULT 100,
  `geo_targeting` JSON DEFAULT NULL COMMENT 'Allowed country codes, e.g. ["US","GB"]',
  `device_targeting` JSON DEFAULT NULL COMMENT 'Allowed devices, e.g. ["mobile","desktop"]',
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_offer_id` (`offer_id`),
  KEY `idx_default` (`offer_id`, `is_default`),
  CONSTRAINT `fk_landing_offer` FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Landing URLs per offer with geo/device weights';

-- ===========================================================================
-- 3. OFFER CREATIVES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_offer_creatives` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `offer_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `type` ENUM('image','video','html','text','email') NOT NULL DEFAULT 'image',
  `asset_url` VARCHAR(2048) DEFAULT NULL,
  `html_body` TEXT DEFAULT NULL,
  `dimensions` VARCHAR(50) DEFAULT NULL COMMENT 'e.g. 300x250',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_offer_id` (`offer_id`),
  KEY `idx_active` (`offer_id`, `is_active`),
  CONSTRAINT `fk_creative_offer` FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Creative asset catalog per offer';

-- ===========================================================================
-- 4. TRAFFIC SOURCES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_traffic_sources` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_affiliate_source` (`affiliate_id`, `name`),
  KEY `idx_affiliate_id` (`affiliate_id`),
  CONSTRAINT `fk_source_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate-defined traffic sources';

-- ===========================================================================
-- 5. EXTEND AFFILIATE LINKS
-- ===========================================================================
ALTER TABLE `1ai_affiliate_links`
  ADD COLUMN IF NOT EXISTS `offer_id` INT UNSIGNED DEFAULT NULL AFTER `campaign_id`,
  ADD COLUMN IF NOT EXISTS `offer_landing_page_id` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `traffic_source_id` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `subid1` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `subid2` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `subid3` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `subid4` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `subid5` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `deleted_at` INT UNSIGNED DEFAULT NULL,
  ADD INDEX IF NOT EXISTS `idx_offer_id` (`offer_id`),
  ADD INDEX IF NOT EXISTS `idx_landing_page` (`offer_landing_page_id`),
  ADD INDEX IF NOT EXISTS `idx_traffic_source` (`traffic_source_id`),
  ADD INDEX IF NOT EXISTS `idx_subids` (`subid1`(64), `subid2`(64), `subid3`(64), `subid4`(64), `subid5`(64));

-- ===========================================================================
-- 6. CLICK SESSIONS (ATTRIBUTION)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_click_sessions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `click_id` VARCHAR(64) NOT NULL,
  `link_token` VARCHAR(64) NOT NULL COMMENT 'Affiliate link slug/token',
  `offer_id` INT UNSIGNED DEFAULT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `campaign_id` INT UNSIGNED DEFAULT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `country_code` VARCHAR(3) DEFAULT NULL,
  `region` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `device_type` VARCHAR(50) DEFAULT NULL,
  `os` VARCHAR(50) DEFAULT NULL,
  `browser` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `referrer` TEXT DEFAULT NULL,
  `language` VARCHAR(10) DEFAULT NULL,
  `fingerprint` VARCHAR(64) DEFAULT NULL,
  `session_started_at` INT UNSIGNED NOT NULL,
  `session_expires_at` INT UNSIGNED NOT NULL,
  `conversion_id` BIGINT UNSIGNED DEFAULT NULL,
  `converted_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_click_id` (`click_id`),
  KEY `idx_link_token` (`link_token`),
  KEY `idx_offer_id` (`offer_id`),
  KEY `idx_affiliate_id` (`affiliate_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_country_code` (`country_code`),
  KEY `idx_session_expires` (`session_expires_at`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_session_offer` FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Click attribution sessions with geo/device/fingerprint';

-- ===========================================================================
-- 7. CONVERSION REVENUE LEDGER
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_conversion_revenue` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversion_id` BIGINT UNSIGNED NOT NULL,
  `click_id` VARCHAR(64) DEFAULT NULL,
  `offer_id` INT UNSIGNED NOT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `revenue_amount` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT 'Total revenue from advertiser/network',
  `payout_amount` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT 'Affiliate payout',
  `margin_amount` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT 'revenue - payout',
  `margin_pct` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending','approved','reversed','fraud') NOT NULL DEFAULT 'pending',
  `reversal_reason` VARCHAR(500) DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_conversion_id` (`conversion_id`),
  KEY `idx_click_id` (`click_id`),
  KEY `idx_offer_id` (`offer_id`),
  KEY `idx_affiliate_id` (`affiliate_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_revenue_offer` FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_revenue_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per-conversion revenue/payout/margin ledger';

-- ===========================================================================
-- 8. FRAUD RULES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_fraud_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `rule_type` ENUM('ip_velocity','click_velocity','conversion_velocity','geo_vpn','device_fingerprint','ua_blacklist','referrer_blacklist','time_window','custom') NOT NULL,
  `target` ENUM('click','conversion','both') NOT NULL DEFAULT 'click',
  `condition` JSON NOT NULL COMMENT 'Rule payload, e.g. {threshold: 5, window_seconds: 60}',
  `action` ENUM('allow','review','block') NOT NULL DEFAULT 'review',
  `score_weight` DECIMAL(4,3) NOT NULL DEFAULT 0.500,
  `priority` INT NOT NULL DEFAULT 100,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_rule_type` (`rule_type`),
  KEY `idx_target` (`target`),
  KEY `idx_active_priority` (`is_active`, `priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configurable bot/velocity/geo/vpn fraud rules';

-- ===========================================================================
-- 9. IDEMPOTENCY KEYS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_idempotency_keys` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key_hash` CHAR(64) NOT NULL COMMENT 'Raw Idempotency-Key header value or SHA256',
  `fingerprint` CHAR(64) NOT NULL COMMENT 'Composite hash of user + method + path + payload',
  `response_status` INT UNSIGNED NOT NULL,
  `response_body` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_key_fingerprint` (`key_hash`, `fingerprint`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_fingerprint` (`fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mutation response cache for idempotency';

-- ===========================================================================
-- 10. AUDIT LOG
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_audit_log` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `user_role` VARCHAR(50) DEFAULT NULL,
  `action` VARCHAR(255) NOT NULL,
  `resource_type` VARCHAR(100) DEFAULT NULL,
  `resource_id` VARCHAR(255) DEFAULT NULL,
  `payload` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `status_code` INT UNSIGNED DEFAULT NULL,
  `idempotency_key` CHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_resource` (`resource_type`, `resource_id`(64)),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for mutating actions';

-- ===========================================================================
-- 11. AFFILIATE INVOICES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_affiliate_invoices` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `conversions_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `revenue_amount` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `payout_amount` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `margin_amount` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `status` ENUM('draft','sent','paid','void') NOT NULL DEFAULT 'draft',
  `paid_at` INT UNSIGNED DEFAULT NULL,
  `paid_by` INT UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_affiliate_id` (`affiliate_id`),
  KEY `idx_period` (`period_start`, `period_end`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_invoice_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Billing/invoice ledger for affiliates';

-- ===========================================================================
-- 12. POSTBACK LOG ENRICHMENTS
-- ===========================================================================
ALTER TABLE `1ai_postback_logs`
  ADD COLUMN IF NOT EXISTS `raw_response` TEXT DEFAULT NULL AFTER `http_response`,
  ADD COLUMN IF NOT EXISTS `dedupe_hash` CHAR(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `dedupe_count` INT UNSIGNED NOT NULL DEFAULT 0,
  ADD UNIQUE KEY IF NOT EXISTS `uk_dedupe_hash` (`dedupe_hash`),
  ADD INDEX IF NOT EXISTS `idx_next_retry` (`next_retry_at`),
  ADD INDEX IF NOT EXISTS `idx_status_retry` (`status`, `retry_count`);

-- ===========================================================================
-- 13. CAP ENFORCEMENT TABLE
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_offer_cap_usage` (
  `offer_id` INT UNSIGNED NOT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL DEFAULT 0,
  `cap_date` DATE NOT NULL,
  `cap_month` CHAR(7) NOT NULL COMMENT 'YYYY-MM',
  `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
  `conversions` INT UNSIGNED NOT NULL DEFAULT 0,
  `revenue` DECIMAL(12,4) NOT NULL DEFAULT 0,
  `updated_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`offer_id`, `affiliate_id`, `cap_date`),
  KEY `idx_cap_month` (`offer_id`, `affiliate_id`, `cap_month`),
  CONSTRAINT `fk_cap_offer` FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Daily/monthly offer cap usage counters';

-- ===========================================================================
-- 14. IDEMPOTENCY / AUDIT LOG COLUMNS ON RELATED TABLES
-- ===========================================================================
ALTER TABLE `1ai_offer_approval_history`
  ADD COLUMN IF NOT EXISTS `idempotency_key` CHAR(64) DEFAULT NULL,
  ADD INDEX IF NOT EXISTS `idx_idempotency_key` (`idempotency_key`);

ALTER TABLE `1ai_assignment_history`
  ADD COLUMN IF NOT EXISTS `idempotency_key` CHAR(64) DEFAULT NULL,
  ADD INDEX IF NOT EXISTS `idx_idempotency_key` (`idempotency_key`);

-- ===========================================================================
-- 15. ASSIGNMENT FK CLEANUP FOR GLOBAL ASSIGNMENTS
-- ===========================================================================
-- Phase A already references this. Ensure no FK prevents affiliate_id=0.
ALTER TABLE `1ai_offer_assignments`
  DROP FOREIGN KEY IF EXISTS `1ai_offer_assignments_ibfk_2`;
