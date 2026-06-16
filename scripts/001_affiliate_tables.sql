-- 1ai-Affiliate: Affiliate Portal tables
-- Run with: mysql -u root -p <dbname> < scripts/001_affiliate_tables.sql
-- Idempotent: uses IF NOT EXISTS

CREATE TABLE IF NOT EXISTS `affiliates` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Linked 1ai_users user_id',
    `affiliate_code` VARCHAR(32) NOT NULL COMMENT 'Unique referral code',
    `status` ENUM('active','paused','banned') NOT NULL DEFAULT 'active',
    `tier` ENUM('standard','premium','vip') NOT NULL DEFAULT 'standard',
    `company_name` VARCHAR(255) DEFAULT NULL,
    `contact_email` VARCHAR(255) DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL COMMENT 'paypal, wire, crypto',
    `payment_details` TEXT DEFAULT NULL COMMENT 'Encrypted or JSON payment info',
    `minimum_payout` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_affiliate_code` (`affiliate_code`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate profiles linked to 1ai-affiliate users';

CREATE TABLE IF NOT EXISTS `affiliate_links` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL COMMENT '1ai_aff_campaigns.aff_campaign_id',
    `link_token` VARCHAR(64) NOT NULL COMMENT 'Unique token for tracking',
    `status` ENUM('active','paused','revoked') NOT NULL DEFAULT 'active',
    `click_limit` INT UNSIGNED DEFAULT NULL COMMENT 'NULL = unlimited',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_link_token` (`link_token`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_campaign_id` (`campaign_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_al_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_al_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `1ai_aff_campaigns`(`aff_campaign_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate tracking links per campaign';

CREATE TABLE IF NOT EXISTS `affiliate_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `link_token` VARCHAR(64) NOT NULL,
    `click_id` BIGINT UNSIGNED NOT NULL COMMENT '1ai_clicks.click_id',
    `affiliate_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'Snapshot of payout at click time',
    `tracked_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_click_id` (`click_id`),
    KEY `idx_link_token` (`link_token`),
    KEY `idx_tracked_at` (`tracked_at`),
    CONSTRAINT `fk_as_link` FOREIGN KEY (`link_token`) REFERENCES `affiliate_links`(`link_token`),
    CONSTRAINT `fk_as_click` FOREIGN KEY (`click_id`) REFERENCES `1ai_clicks`(`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks which affiliate sent which click';

CREATE TABLE IF NOT EXISTS `affiliate_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `conversion_id` INT UNSIGNED NOT NULL COMMENT '1ai_conversion_logs.conv_id',
    `payout_amount` DECIMAL(10,4) NOT NULL,
    `admin_amount` DECIMAL(10,4) NOT NULL COMMENT 'Admin margin',
    `status` ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
    `approved_by` INT UNSIGNED DEFAULT NULL COMMENT 'Admin user_id',
    `approved_at` INT UNSIGNED DEFAULT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_conversion_id` (`conversion_id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_ae_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates`(`id`),
    CONSTRAINT `fk_ae_conv` FOREIGN KEY (`conversion_id`) REFERENCES `1ai_conversion_logs`(`conv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate earnings per conversion';
