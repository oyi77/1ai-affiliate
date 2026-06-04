-- 1ai-Affiliate: Commission ledger and payout tracking

CREATE TABLE IF NOT EXISTS `commission_entries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `entry_type` ENUM('earning','adjustment','clawback','bonus','payout') NOT NULL,
    `amount` DECIMAL(10,4) NOT NULL,
    `balance_before` DECIMAL(12,4) NOT NULL,
    `balance_after` DECIMAL(12,4) NOT NULL,
    `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'conversion, manual, system',
    `reference_id` INT UNSIGNED DEFAULT NULL COMMENT 'ID in source table',
    `note` TEXT DEFAULT NULL,
    `created_by` INT UNSIGNED DEFAULT NULL COMMENT 'Admin user_id, NULL for system',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_entry_type` (`entry_type`),
    CONSTRAINT `fk_ce_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Immutable ledger of all commission movements';

CREATE TABLE IF NOT EXISTS `payout_batches` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `batch_ref` VARCHAR(36) NOT NULL COMMENT 'UUID for idempotency',
    `status` ENUM('draft','processing','completed','failed') NOT NULL DEFAULT 'draft',
    `total_amount` DECIMAL(12,4) NOT NULL DEFAULT 0,
    `affiliate_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `processed_by` INT UNSIGNED DEFAULT NULL,
    `started_at` INT UNSIGNED DEFAULT NULL,
    `completed_at` INT UNSIGNED DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_batch_ref` (`batch_ref`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payout batches for affiliate payments';

CREATE TABLE IF NOT EXISTS `payout_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `batch_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `amount` DECIMAL(10,4) NOT NULL,
    `earnings_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of earning entries covered',
    `status` ENUM('pending','processed','failed') NOT NULL DEFAULT 'pending',
    `transaction_ref` VARCHAR(255) DEFAULT NULL COMMENT 'External payment reference',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_batch_id` (`batch_id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    CONSTRAINT `fk_pi_batch` FOREIGN KEY (`batch_id`) REFERENCES `payout_batches`(`id`),
    CONSTRAINT `fk_pi_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual affiliate payouts within a batch';
