-- Migration 028: GDPR consent tracking

CREATE TABLE IF NOT EXISTS `1ai_user_consents` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT 'NULL for anonymous visitors',
  `consent_type` ENUM('essential','analytics','marketing') NOT NULL,
  `granted` TINYINT(1) NOT NULL DEFAULT 0,
  `ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(512) DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_consent_type` (`consent_type`),
  UNIQUE KEY `uk_user_type` (`user_id`, `consent_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='GDPR/CCPA user consent records';
