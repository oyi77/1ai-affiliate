-- 1ai-Affiliate: Payment tracking table for Tripay/Express integration
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
    UNIQUE KEY `uk_reference` (`reference`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_tripay_ref` (`tripay_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payment transactions from Tripay integration';
