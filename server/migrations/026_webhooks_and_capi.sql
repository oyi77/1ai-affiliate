-- 026_webhooks_and_capi.sql
-- Webhook management table + CAPI audit log

CREATE TABLE IF NOT EXISTS `1ai_webhooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `events` JSON NOT NULL COMMENT '["conversion","click","fraud"]',
  `secret` VARCHAR(128) DEFAULT NULL,
  `enabled` TINYINT(1) DEFAULT 1,
  `last_triggered_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_capi_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `traffic_source_id` INT UNSIGNED NOT NULL,
  `platform` VARCHAR(32) NOT NULL COMMENT 'meta, google',
  `event_name` VARCHAR(64) NOT NULL,
  `success` TINYINT(1) NOT NULL DEFAULT 0,
  `response_time_ms` INT UNSIGNED DEFAULT NULL,
  `error_message` TEXT DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_traffic_source` (`traffic_source_id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_success` (`success`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
