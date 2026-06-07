-- 1ai-Affiliate: Offer management tables
-- Offers are upstream deals from networks like Advidi/ClickDealer

CREATE TABLE IF NOT EXISTS `offers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `network` VARCHAR(100) NOT NULL COMMENT 'advidi, clickdealer, etc.',
    `network_offer_id` VARCHAR(100) DEFAULT NULL COMMENT 'Offer ID in network system',
    `vertical` VARCHAR(100) DEFAULT NULL COMMENT 'sweepstakes, dating, nutra, etc.',
    `geo` VARCHAR(255) DEFAULT NULL COMMENT 'Target countries, comma-separated',
    `type` ENUM('CPA','CPL','CPS','CPI','revshare') NOT NULL DEFAULT 'CPA',
    `payout` DECIMAL(10,4) NOT NULL COMMENT 'Network payout to admin',
    `payout_currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `cap_daily` INT UNSIGNED DEFAULT NULL,
    `cap_monthly` INT UNSIGNED DEFAULT NULL,
    `traffic_allowed` TEXT DEFAULT NULL COMMENT 'JSON: allowed traffic types',
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `notes` TEXT DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_network` (`network`),
    KEY `idx_vertical` (`vertical`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Upstream offers from CPA networks';

CREATE TABLE IF NOT EXISTS `offer_campaigns` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL COMMENT '1ai_aff_campaigns.aff_campaign_id',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_campaign` (`offer_id`, `campaign_id`),
    CONSTRAINT `fk_oc_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oc_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `1ai_aff_campaigns`(`aff_campaign_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Links offers to tracking campaigns';

CREATE TABLE IF NOT EXISTS `offer_affiliate_access` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `custom_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'Override default payout for this affiliate',
    `status` ENUM('pending','approved','revoked') NOT NULL DEFAULT 'pending',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_affiliate` (`offer_id`, `affiliate_id`),
    CONSTRAINT `fk_oa_offer` FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_oa_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Which affiliates have access to which offers';
