-- Migration 017: Meta × Shopee integration + feature toggles

-- Feature toggles
INSERT IGNORE INTO 1ai_settings (name, value, updated_at) VALUES
('feature_meta_shopee', '{"enabled":false}', UNIX_TIMESTAMP()),
('feature_telegram_alerts', '{"enabled":false}', UNIX_TIMESTAMP());

-- Meta ad accounts
CREATE TABLE IF NOT EXISTS `1ai_meta_accounts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `act_id` varchar(64) NOT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `tax_rate` decimal(5,2) DEFAULT 0,
  `daily_budget` decimal(12,2) DEFAULT 0,
  `balance` decimal(12,2) DEFAULT 0,
  `last_synced_at` int(10) unsigned DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_act_id` (`act_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shopee affiliate accounts
CREATE TABLE IF NOT EXISTS `1ai_shopee_accounts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `report_count` int DEFAULT 0,
  `last_upload_at` int(10) unsigned DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Campaign → Taglink mapping
CREATE TABLE IF NOT EXISTS `1ai_campaign_taglinks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(255) NOT NULL,
  `taglink` varchar(255) NOT NULL,
  `source` varchar(50) DEFAULT 'manual',
  `notes` text DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_campaign_tag` (`campaign_name`, `taglink`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shopee payout tracking
CREATE TABLE IF NOT EXISTS `1ai_shopee_payouts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` varchar(100) DEFAULT NULL,
  `shopee_account` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `issued_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Daily ad spend tracking
CREATE TABLE IF NOT EXISTS `1ai_daily_spend` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `meta_account_id` int(10) unsigned DEFAULT NULL,
  `campaign_name` varchar(255) DEFAULT NULL,
  `spend` decimal(12,2) DEFAULT 0,
  `clicks` int DEFAULT 0,
  `impressions` int DEFAULT 0,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`),
  KEY `idx_campaign` (`campaign_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
