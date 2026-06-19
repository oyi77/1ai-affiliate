-- Migration 030: White-label, API keys, A/B testing, scheduled exports

-- White-label branding per affiliate
CREATE TABLE IF NOT EXISTS `1ai_white_label` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `affiliate_id` INT UNSIGNED NOT NULL,
  `brand_name` VARCHAR(128) DEFAULT NULL,
  `brand_logo_url` VARCHAR(512) DEFAULT NULL,
  `brand_color` VARCHAR(7) DEFAULT '#6366f1',
  `custom_domain` VARCHAR(255) DEFAULT NULL,
  `custom_favicon_url` VARCHAR(512) DEFAULT NULL,
  `custom_footer_html` TEXT DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_affiliate` (`affiliate_id`),
  KEY `idx_custom_domain` (`custom_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='White-label branding per affiliate';

-- API keys for programmatic access
CREATE TABLE IF NOT EXISTS `1ai_api_keys` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `key_hash` CHAR(64) NOT NULL COMMENT 'SHA-256 of the API key',
  `key_prefix` VARCHAR(8) NOT NULL COMMENT 'First 8 chars for display',
  `name` VARCHAR(128) NOT NULL,
  `scopes` JSON DEFAULT NULL COMMENT '["read","write","admin"] or null for full',
  `last_used_at` INT UNSIGNED DEFAULT NULL,
  `expires_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_key_hash` (`key_hash`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Per-user API keys with scoped permissions';

-- A/B testing split configs
CREATE TABLE IF NOT EXISTS `1ai_ab_tests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `campaign_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `variants` JSON NOT NULL COMMENT '[{"name":"A","weight":50,"landing_page_id":1,"offer_id":2},...]',
  `status` ENUM('active','paused','completed') DEFAULT 'active',
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_campaign` (`campaign_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='A/B test split configurations';

-- A/B test results tracking
CREATE TABLE IF NOT EXISTS `1ai_ab_test_results` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `test_id` INT UNSIGNED NOT NULL,
  `variant_name` VARCHAR(64) NOT NULL,
  `click_id` VARCHAR(64) DEFAULT NULL,
  `converted` TINYINT(1) DEFAULT 0,
  `revenue` DECIMAL(10,4) DEFAULT 0,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_test_variant` (`test_id`, `variant_name`),
  KEY `idx_test_id` (`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='A/B test click/conversion tracking';

-- Scheduled report exports
CREATE TABLE IF NOT EXISTS `1ai_scheduled_exports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `report_type` VARCHAR(64) NOT NULL COMMENT 'clicks, conversions, ads, daily, breakdown',
  `filters` JSON DEFAULT NULL COMMENT '{"date_from":"...","dimension":"country"}',
  `schedule` VARCHAR(32) NOT NULL DEFAULT 'daily' COMMENT 'daily, weekly, monthly',
  `format` ENUM('csv','json') DEFAULT 'csv',
  `email_to` VARCHAR(255) DEFAULT NULL,
  `last_run_at` INT UNSIGNED DEFAULT NULL,
  `status` ENUM('active','paused') DEFAULT 'active',
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Scheduled report export configs';

-- Postback URL templates
CREATE TABLE IF NOT EXISTS `1ai_postback_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `network_name` VARCHAR(128) NOT NULL,
  `network_icon` VARCHAR(16) DEFAULT '🔗',
  `url_template` VARCHAR(1024) NOT NULL,
  `method` ENUM('GET','POST') DEFAULT 'GET',
  `headers` JSON DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `macros` JSON DEFAULT NULL COMMENT '["click_id","payout","subid"]',
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_network` (`network_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pre-built postback URL templates per network';
