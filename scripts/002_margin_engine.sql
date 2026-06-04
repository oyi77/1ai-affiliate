-- 1ai-Affiliate: Margin/Payout configuration
-- Adds payout fields to campaigns and conversions for CPA sub-network

ALTER TABLE `202_aff_campaigns`
    ADD COLUMN IF NOT EXISTS `network_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'What the upstream network pays the admin',
    ADD COLUMN IF NOT EXISTS `affiliate_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'Default payout to sub-affiliates',
    ADD COLUMN IF NOT EXISTS `margin_percent` DECIMAL(5,2) DEFAULT NULL COMMENT 'Override: margin percentage instead of fixed',
    ADD COLUMN IF NOT EXISTS `offer_id` INT UNSIGNED DEFAULT NULL COMMENT 'Linked offer if managed via offer system',
    ADD COLUMN IF NOT EXISTS `affiliate_payout_updated_at` INT UNSIGNED DEFAULT NULL;

ALTER TABLE `202_conversion_logs`
    ADD COLUMN IF NOT EXISTS `network_payout_snapshot` DECIMAL(10,4) DEFAULT NULL COMMENT 'Payout from network at conversion time',
    ADD COLUMN IF NOT EXISTS `affiliate_payout_snapshot` DECIMAL(10,4) DEFAULT NULL COMMENT 'Affiliate payout at conversion time',
    ADD COLUMN IF NOT EXISTS `margin_amount` DECIMAL(10,4) DEFAULT NULL COMMENT 'network_payout - affiliate_payout',
    ADD COLUMN IF NOT EXISTS `affiliate_id` INT UNSIGNED DEFAULT NULL COMMENT 'Referring affiliate if any',
    ADD COLUMN IF NOT EXISTS `affiliate_status` VARCHAR(20) DEFAULT NULL COMMENT 'Snapshot of earning status';

CREATE TABLE IF NOT EXISTS `margin_config` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `default_margin_percent` DECIMAL(5,2) NOT NULL DEFAULT 20.00 COMMENT 'Default margin when no campaign override',
    `minimum_payout` DECIMAL(10,2) NOT NULL DEFAULT 0.50 COMMENT 'Floor payout per conversion',
    `auto_approve_threshold` DECIMAL(10,2) NOT NULL DEFAULT 100.00 COMMENT 'Auto-approve earnings below this',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    CONSTRAINT `fk_mc_user` FOREIGN KEY (`user_id`) REFERENCES `202_users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Global margin/payout configuration';
