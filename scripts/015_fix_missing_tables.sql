-- Migration 015: Create missing tables and columns needed by PHP tracking + Node.js API
-- Fixes: memory exhaustion in connect2.php (missing ips table),
--        missing cronjob/dataengine tables, missing vip_perks_status column

-- IP tracking table (Prosper202 core)
CREATE TABLE IF NOT EXISTS `ips` (
  `ip_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ip_id`),
  UNIQUE KEY `ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- IPv6 tracking table (Prosper202 core)
CREATE TABLE IF NOT EXISTS `ips_v6` (
  `ip_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varbinary(16) DEFAULT NULL,
  PRIMARY KEY (`ip_id`),
  KEY `ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cronjob execution logs
CREATE TABLE IF NOT EXISTS `1ai_cronjob_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job_name` varchar(128) NOT NULL,
  `last_execution_time` datetime DEFAULT NULL,
  `status` enum('success','failed','running') DEFAULT 'success',
  `details` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_name` (`job_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data engine job queue
CREATE TABLE IF NOT EXISTS `1ai_dataengine_job` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job_type` varchar(64) NOT NULL,
  `status` enum('pending','running','completed','failed') DEFAULT 'pending',
  `payload` longtext DEFAULT NULL,
  `result` longtext DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  `updated_at` int(10) unsigned NOT NULL DEFAULT (unix_timestamp()),
  PRIMARY KEY (`id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add missing columns to 1ai_users (safe — ADD COLUMN IF NOT EXISTS)
ALTER TABLE `1ai_users` ADD COLUMN IF NOT EXISTS `vip_perks_status` tinyint(1) DEFAULT 0;
ALTER TABLE `1ai_users` ADD COLUMN IF NOT EXISTS `install_hash` varchar(64) DEFAULT NULL;
