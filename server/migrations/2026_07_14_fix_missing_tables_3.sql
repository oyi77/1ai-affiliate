-- Migration: Fix missing tables (3 services)
-- 1. 1ai_analytics_dashboards (referenced by analyticsService)
-- 2. 1ai_ai_traffic_rules (referenced by aiTrafficService)
-- 3. 1ai_ai_traffic_logs (referenced by aiTrafficService)
-- Applied: 2026-07-14

CREATE TABLE IF NOT EXISTS `1ai_analytics_dashboards` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `config` JSON DEFAULT NULL,
    `is_public` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Analytics dashboard configurations';

CREATE TABLE IF NOT EXISTS `1ai_ai_traffic_rules` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `rule_type` VARCHAR(50) NOT NULL COMMENT 'geo_redirect|device_redirect|time_based|custom',
    `conditions` JSON DEFAULT NULL,
    `actions` JSON DEFAULT NULL,
    `priority` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active','archived') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI traffic routing rules';

CREATE TABLE IF NOT EXISTS `1ai_ai_traffic_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `rule_id` INT UNSIGNED NOT NULL,
    `visitor_id` VARCHAR(128) DEFAULT NULL,
    `matched` TINYINT(1) NOT NULL DEFAULT 0,
    `action_taken` VARCHAR(255) DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_rule` (`rule_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI traffic rule decision logs';
