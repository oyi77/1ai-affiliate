-- Migration 029: Exchange rates + multi-platform daily stats

-- Exchange rates table
CREATE TABLE IF NOT EXISTS `1ai_exchange_rates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `base_currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `target_currency` VARCHAR(3) NOT NULL,
  `rate` DECIMAL(12,6) NOT NULL,
  `fetched_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_pair` (`base_currency`, `target_currency`),
  KEY `idx_base` (`base_currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Exchange rates for multi-currency support';

-- Add platform column to daily stats for multi-platform support
ALTER TABLE `1ai_meta_daily_stats`
  ADD COLUMN IF NOT EXISTS `platform` VARCHAR(16) DEFAULT 'meta'
    COMMENT 'Ad platform: meta, google, tiktok'
    AFTER `traffic_source_id`;
