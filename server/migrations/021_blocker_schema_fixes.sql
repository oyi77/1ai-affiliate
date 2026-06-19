-- Migration 021: Blocker schema fixes
-- Idempotent: uses IF NOT EXISTS / IF EXISTS throughout
-- MariaDB 11.x compatible: no ON UPDATE for int columns
-- Executed: 2026-06-19

-- ─────────────────────────────────────────────
-- 1. 1ai_users_pref — user preference store
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `1ai_users_pref` (
  `id`         int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`    int unsigned NOT NULL,
  `prefs`      longtext,
  `created_at` int unsigned NOT NULL DEFAULT 0,
  `updated_at` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- 2. 1ai_am_assignments — AM-to-affiliate mappings
-- Columns from amController.js: mapAmToAffiliate INSERT / listAmMappings SELECT
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `1ai_am_assignments` (
  `id`              int unsigned NOT NULL AUTO_INCREMENT,
  `am_user_id`      int unsigned NOT NULL,
  `affiliate_id`    int unsigned NOT NULL,
  `assignment_type` enum('primary','secondary') NOT NULL DEFAULT 'primary',
  `assigned_by`     int unsigned DEFAULT NULL,
  `notes`           text,
  `created_at`      int unsigned NOT NULL DEFAULT 0,
  `updated_at`      int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `am_affiliate_unique` (`am_user_id`, `affiliate_id`),
  KEY `am_user_id` (`am_user_id`),
  KEY `affiliate_id` (`affiliate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- 3. 1ai_pipeline_jobs — async pipeline job tracking
-- Columns from pipelineService.js: saveJob INSERT / updateJob / listJobs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `1ai_pipeline_jobs` (
  `id`         int unsigned  NOT NULL AUTO_INCREMENT,
  `url`        varchar(2048) DEFAULT NULL,
  `niche`      varchar(64)   DEFAULT NULL,
  `status`     varchar(32)   NOT NULL DEFAULT 'pending',
  `steps`      longtext,
  `result`     longtext,
  `error`      text,
  `created_at` int unsigned  NOT NULL DEFAULT 0,
  `updated_at` int unsigned  NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- 4. 1ai_promo_queue — Telegram/social poster queue
-- Columns from posterService.js: fetchNextPending SELECT / addToQueue INSERT
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `1ai_promo_queue` (
  `id`             int unsigned  NOT NULL AUTO_INCREMENT,
  `product_name`   varchar(512)  NOT NULL,
  `product_url`    varchar(2048) NOT NULL,
  `image_url`      varchar(2048) DEFAULT NULL,
  `normal_price`   int unsigned  NOT NULL,
  `promo_price`    int unsigned  NOT NULL,
  `affiliate_link` varchar(2048) DEFAULT NULL,
  `smartlink_slug` varchar(128)  DEFAULT NULL,
  `tracked_url`    varchar(2048) DEFAULT NULL,
  `offer_id`       int unsigned  DEFAULT NULL,
  `niche`          varchar(64)   DEFAULT NULL,
  `status`         enum('pending','posted','failed') NOT NULL DEFAULT 'pending',
  `error_message`  text,
  `created_at`     int unsigned  NOT NULL DEFAULT 0,
  `updated_at`     int unsigned  NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_url_pending` (`product_url`(512)),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- 5. 1ai_users — missing columns for password reset and user status
-- ─────────────────────────────────────────────
ALTER TABLE `1ai_users`
  ADD COLUMN IF NOT EXISTS `user_pass_key`      varchar(64)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `user_pass_time`      int unsigned DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `user_registered`     int unsigned NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `user_activation_key` varchar(60)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `user_active`         tinyint(1)   NOT NULL DEFAULT 1;

-- ─────────────────────────────────────────────
-- 6. 1ai_offers — add margin_floor_pct column
-- ─────────────────────────────────────────────
ALTER TABLE `1ai_offers`
  ADD COLUMN IF NOT EXISTS `margin_floor_pct` decimal(5,2) DEFAULT NULL
    COMMENT 'Minimum margin % floor for offer approval';

-- ─────────────────────────────────────────────
-- 7. 1ai_offers.updated_at — set a safe default (was NULL default, now 0)
-- ─────────────────────────────────────────────
ALTER TABLE `1ai_offers`
  MODIFY `updated_at` int unsigned NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────
-- 8. 1ai_users — additional columns used by settingsController.js
-- ─────────────────────────────────────────────
ALTER TABLE `1ai_users`
  ADD COLUMN IF NOT EXISTS `user_timezone`              varchar(64)   NOT NULL DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS `clickserver_api_key`        varchar(64)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `customer_api_key`           varchar(64)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `user_slack_incoming_webhook` varchar(512) DEFAULT NULL;
