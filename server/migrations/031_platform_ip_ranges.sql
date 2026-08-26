-- Migration 031: Platform IP ranges for reviewer/employee detection

CREATE TABLE IF NOT EXISTS `1ai_platform_ip_ranges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `platform` VARCHAR(50) NOT NULL,
  `range_type` VARCHAR(20) NOT NULL DEFAULT 'reviewer' COMMENT 'reviewer or employee',
  `ip_range` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200) DEFAULT '',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_platform_range` (`platform`, `range_type`, `ip_range`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Platform reviewer and employee IP ranges for detection';
