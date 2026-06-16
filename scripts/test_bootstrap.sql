-- 1ai-Affiliate test bootstrap
-- Creates minimum upstream tracking1ai tables + our renamed tables

USE 1ai_affiliate_test;

-- ===== UPSTREAM (tracking1ai) — minimal for tests =====
CREATE TABLE IF NOT EXISTS `1ai_users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(100) NOT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `user_password` VARCHAR(255) NOT NULL,
  `user_role` ENUM('admin','affiliate') NOT NULL DEFAULT 'affiliate',
  `user_api_key` VARCHAR(64) DEFAULT NULL,
  `user_date_added` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_email` (`user_email`),
  KEY `idx_api_key` (`user_api_key`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `1ai_aff_campaigns` (
  `aff_campaign_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `aff_campaign_name` VARCHAR(200) NOT NULL,
  `aff_campaign_payout` DECIMAL(10,2) DEFAULT 0,
  `aff_campaign_payout_type` VARCHAR(20) DEFAULT 'CPA',
  `aff_campaign_status` ENUM('active','paused','deleted') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`aff_campaign_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `1ai_clicks` (
  `click_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `click_time` INT UNSIGNED NOT NULL,
  `aff_campaign_id` INT UNSIGNED NOT NULL,
  `click_payout` DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (`click_id`),
  KEY `idx_campaign` (`aff_campaign_id`),
  KEY `idx_time` (`click_time`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `1ai_conversion_logs` (
  `conversion_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `aff_campaign_id` INT UNSIGNED NOT NULL,
  `click_id` BIGINT UNSIGNED DEFAULT NULL,
  `conversion_time` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`conversion_id`),
  KEY `idx_campaign` (`aff_campaign_id`)
) ENGINE=InnoDB;

-- ===== NEW (renamed from 1ai_*) =====
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `affiliate_code` VARCHAR(50) NOT NULL,
  `tier` ENUM('starter','pro','premium') NOT NULL DEFAULT 'starter',
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`),
  UNIQUE KEY `uk_code` (`affiliate_code`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `affiliate_links` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `offer_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
  `conversions` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `affiliate_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `expires_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `affiliate_earnings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `source` VARCHAR(50) DEFAULT 'conversion',
  `payout_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` INT UNSIGNED DEFAULT NULL,
  `approved_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate` (`affiliate_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `affiliate_payments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `reference` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('UNPAID','PAID','FAILED','EXPIRED') NOT NULL DEFAULT 'UNPAID',
  `tripay_ref` VARCHAR(100) DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `paid_at` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reference` (`reference`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `margin_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `margin_pct` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `tier` ENUM('starter','pro','premium') NOT NULL DEFAULT 'starter',
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `offers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `payout` DECIMAL(10,2) NOT NULL,
  `tier` ENUM('starter','pro','premium') NOT NULL DEFAULT 'starter',
  `status` ENUM('active','paused') NOT NULL DEFAULT 'active',
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `offer_campaigns` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` INT UNSIGNED NOT NULL,
  `aff_campaign_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `offer_affiliate_access` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `offer_id` INT UNSIGNED NOT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `commission_entries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `offer_id` INT UNSIGNED NOT NULL,
  `commission` DECIMAL(10,2) NOT NULL,
  `tier` VARCHAR(20) DEFAULT 'base',
  `status` ENUM('pending','approved','paid') NOT NULL DEFAULT 'pending',
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `payout_batches` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `total` DECIMAL(12,2) NOT NULL,
  `status` ENUM('draft','processing','paid') NOT NULL DEFAULT 'draft',
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `payout_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `batch_id` INT UNSIGNED NOT NULL,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ===== SEED TEST DATA =====
-- Admin user (bcrypt hash of "admin123" generated separately)
INSERT INTO `1ai_users` (user_id, user_name, user_email, user_password, user_role, user_api_key, user_date_added)
VALUES
  (1, 'admin', 'admin@1ai.io', '$2b$10$placeholder', 'admin', 'test-api-key-admin-1234', UNIX_TIMESTAMP()),
  (2, 'alice', 'alice@1ai.io', '$2b$10$placeholder', 'affiliate', NULL, UNIX_TIMESTAMP()),
  (3, 'bob', 'bob@1ai.io', '$2b$10$placeholder', 'affiliate', NULL, UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO `affiliates` (id, user_id, affiliate_code, tier, created_at)
VALUES
  (1, 2, 'ALICE001', 'pro', UNIX_TIMESTAMP()),
  (2, 3, 'BOB0001', 'starter', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO `1ai_aff_campaigns` (aff_campaign_id, aff_campaign_name, aff_campaign_payout, aff_campaign_payout_type, aff_campaign_status)
VALUES
  (1, 'Shopee-Indonesia-CPA', 25000.00, 'CPA', 'active'),
  (2, 'TikTok-Affiliate-Pro', 50000.00, 'CPA', 'active')
ON DUPLICATE KEY UPDATE aff_campaign_id=aff_campaign_id;

-- Recent clicks for stats
INSERT INTO `1ai_clicks` (click_time, aff_campaign_id, click_payout) VALUES
  (UNIX_TIMESTAMP(NOW()), 1, 25000),
  (UNIX_TIMESTAMP(NOW()) - 3600, 1, 25000),
  (UNIX_TIMESTAMP(NOW()) - 86400 - 3600, 1, 25000),  -- yesterday
  (UNIX_TIMESTAMP(NOW()) - 86400 - 7200, 1, 25000),
  (UNIX_TIMESTAMP(NOW()) - 86400 - 10800, 1, 25000);

INSERT INTO `affiliate_earnings` (affiliate_id, source, payout_amount, status, created_at) VALUES
  (1, 'conversion', 50000.00, 'pending', UNIX_TIMESTAMP()),
  (1, 'conversion', 75000.00, 'approved', UNIX_TIMESTAMP() - 86400),
  (2, 'conversion', 25000.00, 'pending', UNIX_TIMESTAMP()),
  (2, 'conversion', 100000.00, 'paid', UNIX_TIMESTAMP() - 172800);

INSERT INTO `commission_entries` (affiliate_id, offer_id, commission, tier, status, created_at) VALUES
  (1, 1, 50000.00, 'pro', 'pending', UNIX_TIMESTAMP()),
  (2, 2, 25000.00, 'base', 'paid', UNIX_TIMESTAMP() - 86400);

INSERT INTO `affiliate_payments` (user_id, reference, amount, status, created_at, paid_at) VALUES
  (2, 'TEST-PAY-001', 100000.00, 'PAID', UNIX_TIMESTAMP() - 86400, UNIX_TIMESTAMP() - 86000),
  (3, 'TEST-PAY-002', 50000.00, 'UNPAID', UNIX_TIMESTAMP(), NULL);

SELECT 'Bootstrap complete.' AS status;
