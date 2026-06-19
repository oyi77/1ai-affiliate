-- 023_bemob_entity_model.sql
-- BeMob Entity Model: Advertisers, Traffic Sources, Meta×Shopee Integration
-- + Competitive gap tables: Telegram, Payouts, Notifications, White-label

-- Enrich advertisers with platform fields
ALTER TABLE `1ai_advertisers`
  ADD COLUMN IF NOT EXISTS `platform_type` VARCHAR(64) DEFAULT NULL COMMENT 'shopee, tokopedia, lazada, custom',
  ADD COLUMN IF NOT EXISTS `affiliate_program_url` VARCHAR(512) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `commission_type` ENUM('percentage','fixed') DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS `default_commission_rate` DECIMAL(6,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `logo_url` VARCHAR(512) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `settings` JSON DEFAULT NULL;

-- Enrich traffic sources with platform fields
ALTER TABLE `1ai_traffic_sources`
  ADD COLUMN IF NOT EXISTS `platform_type` VARCHAR(64) DEFAULT NULL COMMENT 'meta, google, tiktok, propellerads, custom',
  ADD COLUMN IF NOT EXISTS `tracking_domain` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `cost_model` ENUM('CPC','CPM','CPA','revshare') DEFAULT 'CPC',
  ADD COLUMN IF NOT EXISTS `currency` VARCHAR(3) DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS `api_config` JSON DEFAULT NULL COMMENT 'API credentials for auto-sync',
  ADD COLUMN IF NOT EXISTS `postback_url_template` VARCHAR(1024) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `pixel_code` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `auto_sync_enabled` TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `last_synced_at` INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `user_id` INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `updated_at` INT UNSIGNED DEFAULT NULL;

-- Enrich offers
ALTER TABLE `1ai_offers`
  ADD COLUMN IF NOT EXISTS `affiliate_url` VARCHAR(1024) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `product_image_url` VARCHAR(512) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `commission_gross_pct` DECIMAL(6,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `platform_product_id` VARCHAR(128) DEFAULT NULL;

-- Meta Ads daily stats
CREATE TABLE IF NOT EXISTS `1ai_meta_daily_stats` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `traffic_source_id` INT UNSIGNED NOT NULL,
  `campaign_id` VARCHAR(64) NOT NULL,
  `campaign_name` VARCHAR(255) DEFAULT NULL,
  `report_date` DATE NOT NULL,
  `spend` DECIMAL(12,2) DEFAULT 0.00,
  `impressions` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `cpc` DECIMAL(8,4) DEFAULT 0.00,
  `ctr` DECIMAL(6,4) DEFAULT 0.00,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_campaign_date` (`traffic_source_id`, `campaign_id`, `report_date`),
  KEY `idx_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shopee commission reports
CREATE TABLE IF NOT EXISTS `1ai_shopee_reports` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `advertiser_id` INT UNSIGNED NOT NULL,
  `taglink` VARCHAR(255) DEFAULT NULL,
  `order_id` VARCHAR(128) DEFAULT NULL,
  `product_name` VARCHAR(512) DEFAULT NULL,
  `product_category` VARCHAR(128) DEFAULT NULL,
  `commission_gross` DECIMAL(12,2) DEFAULT 0.00,
  `commission_net` DECIMAL(12,2) DEFAULT 0.00,
  `order_amount` DECIMAL(12,2) DEFAULT 0.00,
  `order_status` VARCHAR(64) DEFAULT NULL,
  `order_type` VARCHAR(64) DEFAULT NULL,
  `click_time` INT UNSIGNED DEFAULT NULL,
  `order_time` INT UNSIGNED DEFAULT NULL,
  `validation_time` INT UNSIGNED DEFAULT NULL,
  `report_date` DATE NOT NULL,
  `raw_data` JSON DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_order` (`advertiser_id`, `order_id`, `report_date`),
  KEY `idx_user_date` (`user_id`, `report_date`),
  KEY `idx_taglink` (`taglink`, `report_date`),
  KEY `idx_advertiser_date` (`advertiser_id`, `report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shopee payouts
CREATE TABLE IF NOT EXISTS `1ai_shopee_payouts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `advertiser_id` INT UNSIGNED NOT NULL,
  `report_id` VARCHAR(64) NOT NULL,
  `issued_date` DATE NOT NULL,
  `paid_at` DATE DEFAULT NULL,
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','paid','cancelled') DEFAULT 'pending',
  `bank_account` VARCHAR(128) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_report` (`report_id`),
  KEY `idx_advertiser` (`advertiser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Taglink ↔ campaign mapping
CREATE TABLE IF NOT EXISTS `1ai_taglink_mappings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `taglink` VARCHAR(255) NOT NULL,
  `offer_id` INT UNSIGNED DEFAULT NULL,
  `traffic_source_id` INT UNSIGNED DEFAULT NULL,
  `meta_campaign_id` VARCHAR(64) DEFAULT NULL,
  `meta_campaign_name` VARCHAR(255) DEFAULT NULL,
  `advertiser_id` INT UNSIGNED DEFAULT NULL,
  `budget_daily` DECIMAL(10,2) DEFAULT NULL,
  `status` ENUM('active','paused','archived') DEFAULT 'active',
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_tag` (`user_id`, `taglink`),
  KEY `idx_offer` (`offer_id`),
  KEY `idx_traffic_source` (`traffic_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Balance ledger
CREATE TABLE IF NOT EXISTS `1ai_balance_ledger` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `traffic_source_id` INT UNSIGNED DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `type` ENUM('deposit','withdrawal','spend','adjustment') DEFAULT 'deposit',
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_date` (`user_id`, `created_at`),
  KEY `idx_traffic_source` (`traffic_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Telegram integration config
CREATE TABLE IF NOT EXISTS `1ai_telegram_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `bot_token` VARCHAR(255) DEFAULT NULL,
  `chat_id` VARCHAR(64) DEFAULT NULL,
  `daily_summary_enabled` TINYINT(1) DEFAULT 0,
  `balance_alert_enabled` TINYINT(1) DEFAULT 0,
  `balance_alert_threshold` DECIMAL(12,2) DEFAULT 200000.00,
  `performance_alert_enabled` TINYINT(1) DEFAULT 0,
  `last_sent_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Automated payout rules
CREATE TABLE IF NOT EXISTS `1ai_payout_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `min_amount` DECIMAL(10,2) NOT NULL DEFAULT 50000.00,
  `auto_approve` TINYINT(1) DEFAULT 0,
  `payment_method` ENUM('bank_transfer','ewallet','manual') DEFAULT 'bank_transfer',
  `payment_schedule` ENUM('weekly','biweekly','monthly') DEFAULT 'monthly',
  `enabled` TINYINT(1) DEFAULT 1,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- White-label config
CREATE TABLE IF NOT EXISTS `1ai_white_label` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `brand_name` VARCHAR(128) DEFAULT NULL,
  `logo_url` VARCHAR(512) DEFAULT NULL,
  `primary_color` VARCHAR(7) DEFAULT '#6366f1',
  `custom_domain` VARCHAR(255) DEFAULT NULL,
  `hide_branding` TINYINT(1) DEFAULT 0,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- In-app notifications
CREATE TABLE IF NOT EXISTS `1ai_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(64) NOT NULL COMMENT 'conversion, fraud, cap_reached, payout, system',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `read_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_read` (`user_id`, `read_at`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Offer rotation config
ALTER TABLE `1ai_offer_campaigns`
  ADD COLUMN IF NOT EXISTS `weight` INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS `rotation_type` ENUM('weighted','sequential','random') DEFAULT 'weighted',
  ADD COLUMN IF NOT EXISTS `status` ENUM('active','paused') DEFAULT 'active';
