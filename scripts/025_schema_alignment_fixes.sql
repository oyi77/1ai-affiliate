-- 025_schema_alignment_fixes.sql
-- Fixes column drift between PRODUCT_ROADMAP.md and actual schema

-- Add adset_name + conversions to meta_daily_stats (roadmap had these, migration 023 missed them)
ALTER TABLE `1ai_meta_daily_stats`
  ADD COLUMN IF NOT EXISTS `adset_name` VARCHAR(255) DEFAULT NULL AFTER `campaign_name`,
  ADD COLUMN IF NOT EXISTS `conversions` INT DEFAULT 0 AFTER `clicks`;

-- Add shopee_account_id/name to shopee_reports (roadmap had these, migration 023 used advertiser_id instead)
ALTER TABLE `1ai_shopee_reports`
  ADD COLUMN IF NOT EXISTS `shopee_account_id` VARCHAR(64) DEFAULT 'default' AFTER `advertiser_id`,
  ADD COLUMN IF NOT EXISTS `shopee_account_name` VARCHAR(128) DEFAULT NULL AFTER `shopee_account_id`;

-- Add shopee_account_id/name to shopee_payouts (same fix)
ALTER TABLE `1ai_shopee_payouts`
  ADD COLUMN IF NOT EXISTS `shopee_account_id` VARCHAR(64) DEFAULT 'default' AFTER `advertiser_id`,
  ADD COLUMN IF NOT EXISTS `shopee_account_name` VARCHAR(128) DEFAULT NULL AFTER `shopee_account_id`;

-- Ensure 1ai_advertisers has CREATE TABLE (migration 023 only ALTERed, assumed table existed)
CREATE TABLE IF NOT EXISTS `1ai_advertisers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(512) DEFAULT NULL,
  `status` ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `platform_type` VARCHAR(64) DEFAULT NULL COMMENT 'shopee, tokopedia, lazada, custom',
  `affiliate_program_url` VARCHAR(512) DEFAULT NULL,
  `commission_type` ENUM('percentage','fixed') DEFAULT 'percentage',
  `default_commission_rate` DECIMAL(6,2) DEFAULT NULL,
  `logo_url` VARCHAR(512) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `settings` JSON DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` INT UNSIGNED NOT NULL DEFAULT 0,
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
