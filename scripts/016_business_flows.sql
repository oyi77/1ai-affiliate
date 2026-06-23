-- Migration 016: Business flow tables and columns for production launch

-- Conversion approval workflow
ALTER TABLE `1ai_conversion_logs`
  ADD COLUMN IF NOT EXISTS `network_payout_snapshot` DECIMAL(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `affiliate_payout_snapshot` DECIMAL(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `margin_amount` DECIMAL(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `affiliate_id` INT(10) unsigned DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `affiliate_status` VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `status` ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `approved_by` INT(10) unsigned DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approved_at` INT(10) unsigned DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `reject_reason` VARCHAR(500) DEFAULT NULL;

-- Indexes for conversion approval queries
CREATE INDEX IF NOT EXISTS `idx_conversion_status` ON `1ai_conversion_logs`(`status`);
CREATE INDEX IF NOT EXISTS `idx_conversion_affiliate` ON `1ai_conversion_logs`(`affiliate_id`);

-- Offer creatives
CREATE TABLE IF NOT EXISTS `1ai_offer_creatives` (
  `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
  `offer_id` INT(10) unsigned NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `type` ENUM('image','video','html','text','email') NOT NULL DEFAULT 'image',
  `asset_url` VARCHAR(2048) DEFAULT NULL,
  `html_body` TEXT DEFAULT NULL,
  `dimensions` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` INT(10) unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `updated_at` INT(10) unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`id`),
  KEY `idx_creatives_offer` (`offer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payout batches
CREATE TABLE IF NOT EXISTS `payout_batches` (
  `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `status` ENUM('draft','processing','paid') NOT NULL DEFAULT 'draft',
  `created_at` INT(10) unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payout items (per-affiliate line items within a batch)
CREATE TABLE IF NOT EXISTS `payout_items` (
  `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` INT(10) unsigned NOT NULL,
  `affiliate_id` INT(10) unsigned NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_payout_batch` (`batch_id`),
  KEY `idx_payout_affiliate` (`affiliate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
