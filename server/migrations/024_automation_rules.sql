CREATE TABLE IF NOT EXISTS `1ai_automation_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `rule_type` ENUM('auto_pause','auto_scale','sleep_schedule','balance_alert','performance_alert') NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `config` JSON NOT NULL,
  `enabled` TINYINT(1) DEFAULT 1,
  `last_triggered_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_type` (`user_id`, `rule_type`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
