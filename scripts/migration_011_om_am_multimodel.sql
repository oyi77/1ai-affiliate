-- Migration 011: OM Vetting, AM Assignment, Multi-Model CPM/CPC/CPV, Margin Negotiation
-- Applied after migration 010
-- Safe to run multiple times (IF NOT EXISTS / idempotent)

-- ============================================================
-- 1. OM VETTING: Extend 1ai_offers with approval workflow
-- ============================================================
ALTER TABLE `1ai_offers`
    ADD COLUMN IF NOT EXISTS `approval_status` ENUM('pending','approved','rejected','changes_requested') NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS `approved_by` INT UNSIGNED DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `approved_at` DATETIME DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `rejection_reason` VARCHAR(500) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `om_notes` TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `payout_model` ENUM('cpm','cpc','cpa','cps','cpv','revshare') NOT NULL DEFAULT 'cpa',
    ADD COLUMN IF NOT EXISTS `payout_currency` CHAR(3) NOT NULL DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS `margin_floor_pct` DECIMAL(5,2) NOT NULL DEFAULT 5.00;

-- Approval audit log
CREATE TABLE IF NOT EXISTS `1ai_offer_approval_log` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `action` ENUM('submitted','approved','rejected','changes_requested','modified') NOT NULL,
    `actor_id` INT UNSIGNED NOT NULL,
    `actor_role` VARCHAR(20) NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `metadata` JSON DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_approval_offer` (`offer_id`),
    INDEX `idx_approval_actor` (`actor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. AM ASSIGNMENT
-- ============================================================
-- Skip ALTER for 1ai_offer_affiliate_access if table may not exist yet
ALTER TABLE `1ai_offer_affiliate_access`
    ADD COLUMN IF NOT EXISTS `assigned_by` INT UNSIGNED DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS `assignment_type` ENUM('specific','global') NOT NULL DEFAULT 'specific',
    ADD COLUMN IF NOT EXISTS `is_global` TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `auto_approve` TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `expires_at` DATETIME DEFAULT NULL;

-- AM-to-affiliate mapping
CREATE TABLE IF NOT EXISTS `1ai_am_assignments` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `am_user_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `assignment_type` ENUM('primary','secondary','temp') NOT NULL DEFAULT 'primary',
    `assigned_by` INT UNSIGNED NOT NULL,
    `notes` VARCHAR(500) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_am_affiliate` (`am_user_id`, `affiliate_id`),
    INDEX `idx_am_assign_am` (`am_user_id`),
    INDEX `idx_am_assign_aff` (`affiliate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. MARGIN NEGOTIATION
-- ============================================================
CREATE TABLE IF NOT EXISTS `1ai_margin_negotiations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `proposed_by` INT UNSIGNED NOT NULL,
    `proposed_by_role` ENUM('am','admin','advertiser') NOT NULL,
    `current_payout` DECIMAL(12,4) NOT NULL,
    `proposed_payout` DECIMAL(12,4) NOT NULL,
    `network_payout` DECIMAL(12,4) NOT NULL,
    `margin_pct` DECIMAL(5,2) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `volume_commitment` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('pending','approved','rejected','countered','expired') NOT NULL DEFAULT 'pending',
    `approved_by` INT UNSIGNED DEFAULT NULL,
    `approved_at` DATETIME DEFAULT NULL,
    `rejection_reason` VARCHAR(500) DEFAULT NULL,
    `counter_payout` DECIMAL(12,4) DEFAULT NULL,
    `expires_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_nego_offer` (`offer_id`),
    INDEX `idx_nego_aff` (`affiliate_id`),
    INDEX `idx_nego_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. FRAUD DETECTION
-- ============================================================
CREATE TABLE IF NOT EXISTS `1ai_fraud_blacklist` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('ip','ua','country','device_id','fingerprint','click_id') NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `reason` VARCHAR(200) NOT NULL,
    `severity` ENUM('low','medium','high','critical') NOT NULL DEFAULT 'high',
    `auto_detected` TINYINT(1) NOT NULL DEFAULT 0,
    `expires_at` DATETIME DEFAULT NULL,
    `created_by` INT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_blacklist_type_value` (`type`, `value`),
    INDEX `idx_blacklist_type` (`type`),
    INDEX `idx_blacklist_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Click velocity log
CREATE TABLE IF NOT EXISTS `1ai_fraud_click_velocity` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `ip_address` VARCHAR(45) NOT NULL,
    `click_time` DATETIME(3) NOT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `affiliate_id` INT UNSIGNED DEFAULT NULL,
    `slug` VARCHAR(100) DEFAULT NULL,
    `user_agent` VARCHAR(500) DEFAULT NULL,
    `blocked` TINYINT(1) NOT NULL DEFAULT 0,
    `reason` VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_velocity_ip` (`ip_address`, `click_time`),
    INDEX `idx_velocity_blocked` (`blocked`, `click_time`),
    INDEX `idx_velocity_cleanup` (`click_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. MULTI-MODEL
-- ============================================================
CREATE TABLE IF NOT EXISTS `1ai_cpm_fulfillments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `click_batch_id` VARCHAR(64) NOT NULL,
    `target_clicks` INT UNSIGNED NOT NULL COMMENT '1000 for CPM',
    `actual_clicks` INT UNSIGNED NOT NULL DEFAULT 0,
    `payout_per_block` DECIMAL(12,4) NOT NULL,
    `total_payout` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    `fulfilled` TINYINT(1) NOT NULL DEFAULT 0,
    `fulfilled_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_cpm_offer` (`offer_id`, `affiliate_id`, `fulfilled`),
    UNIQUE KEY `uq_cpm_batch` (`click_batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_cpv_view_events` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `click_id` VARCHAR(64) NOT NULL,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `view_duration_ms` INT UNSIGNED NOT NULL DEFAULT 0,
    `qualified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=duration >= 3000ms',
    `payout` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `idx_cpv_click` (`click_id`),
    INDEX `idx_cpv_qualified` (`qualified`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. Update user_role to include om, am, publisher
-- ============================================================
SET @schema_name = (SELECT DATABASE());
SET @current_enum = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = '1ai_users'
      AND COLUMN_NAME = 'user_role'
);
SELECT IF(
    LOCATE('om', @current_enum) = 0,
    'ALTER TABLE 1ai_users MODIFY COLUMN user_role ENUM("admin","affiliate","advertiser","manager","om","am","publisher") NOT NULL DEFAULT "publisher"',
    'SELECT "Roles already updated"'
) INTO @alter_sql;
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 7. Commission entries enhancements
-- ============================================================
ALTER TABLE `1ai_commission_entries`
    ADD COLUMN IF NOT EXISTS `payout_model` ENUM('cpm','cpc','cpa','cps','cpv','revshare') DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `metadata` JSON DEFAULT NULL;

SELECT 'Migration 011 complete' AS status;
