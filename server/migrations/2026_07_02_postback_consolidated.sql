-- Consolidated postback + offers + affiliate_links schema
-- Sources: scripts/006_schema_alignment.sql, scripts/008_postback_system.sql,
--          server/migrations/000-postback-schema-columns.sql, scripts/015_adtech_worldclass.sql
-- Applied: 2026-07-02

-- ===========================================================================
-- 1. UPSTREAM TABLE ALTERS
-- ===========================================================================
ALTER TABLE `1ai_users`
    MODIFY COLUMN `user_role`
    ENUM('admin','affiliate','advertiser','manager')
    NOT NULL DEFAULT 'affiliate';

ALTER TABLE `1ai_clicks`
    ADD COLUMN IF NOT EXISTS `click_ip` VARCHAR(45) DEFAULT NULL COMMENT 'IPv4/IPv6 of click source';

ALTER TABLE `1ai_clicks`
    ADD INDEX IF NOT EXISTS `idx_time_campaign` (`click_time`, `aff_campaign_id`);

ALTER TABLE `1ai_conversion_logs`
    ADD INDEX IF NOT EXISTS `idx_conv_time` (`conversion_time`);

-- ===========================================================================
-- 2. AFFILIATE CORE TABLES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_affiliates` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `affiliate_code` VARCHAR(32) NOT NULL,
    `status` ENUM('active','paused','banned') NOT NULL DEFAULT 'active',
    `tier` ENUM('standard','premium','vip') NOT NULL DEFAULT 'standard',
    `company_name` VARCHAR(255) DEFAULT NULL,
    `contact_email` VARCHAR(255) DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `payment_details` TEXT DEFAULT NULL,
    `minimum_payout` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_affiliate_code` (`affiliate_code`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_affiliate_links` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL,
    `link_token` VARCHAR(64) NOT NULL,
    `slug` VARCHAR(80) DEFAULT NULL,
    `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
    `conversions` INT UNSIGNED NOT NULL DEFAULT 0,
    `source` VARCHAR(50) DEFAULT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('active','paused','revoked') NOT NULL DEFAULT 'active',
    `click_limit` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_link_token` (`link_token`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_campaign_id` (`campaign_id`),
    KEY `idx_status` (`status`),
    KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_affiliate_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `link_token` VARCHAR(64) NOT NULL,
    `click_id` VARCHAR(64) NOT NULL,
    `affiliate_payout` DECIMAL(10,4) DEFAULT NULL,
    `tracked_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_link_token` (`link_token`),
    KEY `idx_click_id` (`click_id`),
    KEY `idx_tracked_at` (`tracked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_affiliate_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `conversion_id` BIGINT UNSIGNED DEFAULT NULL,
    `payout_amount` DECIMAL(10,4) NOT NULL,
    `admin_amount` DECIMAL(10,4) NOT NULL DEFAULT 0,
    `status` ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
    `approved_by` INT UNSIGNED DEFAULT NULL,
    `approved_at` INT UNSIGNED DEFAULT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_affiliate_payments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `reference` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
    `tripay_ref` VARCHAR(255) DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reference` (`reference`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- 3. OFFER / NETWORK TABLES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_networks` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_offers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `advertiser_id` INT UNSIGNED DEFAULT NULL,
    `network_id` INT UNSIGNED DEFAULT NULL,
    `network_offer_id` VARCHAR(100) DEFAULT NULL,
    `vertical` VARCHAR(100) DEFAULT NULL,
    `geo` VARCHAR(255) DEFAULT NULL,
    `type` ENUM('CPA','CPL','CPS','CPI','revshare') NOT NULL DEFAULT 'CPA',
    `payout` DECIMAL(10,4) NOT NULL DEFAULT 0,
    `network_payout` DECIMAL(10,4) DEFAULT NULL,
    `payout_currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `cap_daily` INT UNSIGNED DEFAULT NULL,
    `cap_monthly` INT UNSIGNED DEFAULT NULL,
    `traffic_allowed` TEXT DEFAULT NULL,
    `postback_url` VARCHAR(1024) DEFAULT NULL,
    `postback_enabled` TINYINT(1) DEFAULT 1,
    `postback_method` VARCHAR(10) DEFAULT 'GET',
    `postback_headers` JSON DEFAULT NULL,
    `postback_retries` INT DEFAULT 3,
    `postback_timeout` INT DEFAULT 10,
    `postback_auth_type` VARCHAR(50) DEFAULT NULL,
    `postback_auth_value` VARCHAR(1024) DEFAULT NULL,
    `status` ENUM('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
    `approval_status` ENUM('pending','approved','rejected','changes_requested') NOT NULL DEFAULT 'pending',
    `notes` TEXT DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_advertiser` (`advertiser_id`),
    KEY `idx_network` (`network_id`),
    KEY `idx_status_geo` (`status`, `geo`(20)),
    KEY `idx_approval_status` (`approval_status`),
    KEY `idx_offer_name` (`name`(128))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_offer_campaigns` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL,
    `aff_campaign_id` INT UNSIGNED NOT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_campaign` (`offer_id`, `campaign_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_campaign_id` (`campaign_id`),
    KEY `idx_aff_campaign_id` (`aff_campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_offer_affiliate_access` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `custom_payout` DECIMAL(10,4) DEFAULT NULL,
    `status` ENUM('pending','approved','revoked') NOT NULL DEFAULT 'pending',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_affiliate` (`offer_id`, `affiliate_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- 4. COMMISSION LEDGER
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_commission_entries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `commission` DECIMAL(10,4) NOT NULL DEFAULT 0,
    `tier` ENUM('standard','premium','vip') NOT NULL DEFAULT 'standard',
    `status` ENUM('pending','approved','paid','reversed') NOT NULL DEFAULT 'pending',
    `reference_type` VARCHAR(50) DEFAULT NULL,
    `reference_id` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- 5. POSTBACK SYSTEM
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_postback_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `offer_id` INT UNSIGNED NOT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `click_id` VARCHAR(255) NOT NULL,
  `transaction_id` VARCHAR(255) DEFAULT NULL,
  `postback_url` TEXT NOT NULL,
  `postback_method` VARCHAR(10) DEFAULT 'POST',
  `postback_headers` JSON DEFAULT NULL,
  `postback_body` TEXT DEFAULT NULL,
  `http_status` INT DEFAULT NULL,
  `http_response` TEXT DEFAULT NULL,
  `raw_response` TEXT DEFAULT NULL,
  `payout` DECIMAL(10,2) DEFAULT 0,
  `conversion_event` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `retry_count` INT DEFAULT 0,
  `next_retry_at` TIMESTAMP NULL,
  `error_message` TEXT DEFAULT NULL,
  `dedupe_hash` CHAR(64) DEFAULT NULL,
  `dedupe_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sent_at` TIMESTAMP NULL,
  KEY `idx_offer_id` (`offer_id`),
  KEY `idx_affiliate_id` (`affiliate_id`),
  KEY `idx_click_id` (`click_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  UNIQUE KEY `uk_dedupe_hash` (`dedupe_hash`),
  KEY `idx_next_retry` (`next_retry_at`),
  KEY `idx_status_retry` (`status`, `retry_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `1ai_postback_queue` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `postback_log_id` INT UNSIGNED NOT NULL,
  `status` ENUM('queued','retry','sent','failed') NOT NULL DEFAULT 'queued',
  `scheduled_at` DATETIME DEFAULT NULL,
  `attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_attempt_at` DATETIME DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_postback_log` (`postback_log_id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_at` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- 6. SMARTLINKS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_smartlinks` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED DEFAULT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `hash` VARCHAR(64) NOT NULL,
    `geo_rules` JSON DEFAULT NULL,
    `device_rules` JSON DEFAULT NULL,
    `weight_algorithm` ENUM('random','round_robin','weighted','priority') NOT NULL DEFAULT 'weighted',
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `default_url` VARCHAR(2048) DEFAULT NULL,
    `click_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_slug` (`slug`),
    UNIQUE KEY `uk_hash` (`hash`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
