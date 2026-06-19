CREATE TABLE IF NOT EXISTS `1ai_traffic_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `offer_id` INT UNSIGNED DEFAULT NULL,
  `conditions` JSON NOT NULL,
  `action` ENUM('redirect','show_landing','block') DEFAULT 'redirect',
  `target_url` VARCHAR(1024) DEFAULT NULL,
  `landing_page_id` INT UNSIGNED DEFAULT NULL,
  `weight` INT DEFAULT 100,
  `enabled` TINYINT(1) DEFAULT 1,
  `priority` INT DEFAULT 0,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_offer` (`user_id`, `offer_id`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
