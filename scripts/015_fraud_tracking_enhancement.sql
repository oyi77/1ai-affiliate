-- 015_fraud_tracking_enhancement.sql
-- Enhanced fraud detection, device tracking, and redirect tracking tables

-- Redirect tracking table
CREATE TABLE IF NOT EXISTS `1ai_redirect_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `click_id` varchar(64) NOT NULL,
  `from_url` varchar(2048) NOT NULL,
  `to_url` varchar(2048) NOT NULL,
  `hop_number` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `status_code` smallint(5) unsigned NOT NULL DEFAULT 302,
  `redirect_time_ms` int(10) unsigned NOT NULL DEFAULT 0,
  `method` varchar(10) NOT NULL DEFAULT 'GET',
  `content_type` varchar(128) DEFAULT NULL,
  `server_header` varchar(128) DEFAULT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_click_id` (`click_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_code` (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced click enrichment table (stores parsed device + geo data per click)
CREATE TABLE IF NOT EXISTS `1ai_click_enrichment` (
  `click_id` varchar(64) NOT NULL,
  -- Device fingerprint
  `os_name` varchar(50) DEFAULT NULL,
  `os_version` varchar(20) DEFAULT NULL,
  `browser_name` varchar(50) DEFAULT NULL,
  `browser_version` varchar(20) DEFAULT NULL,
  `browser_engine` varchar(20) DEFAULT NULL,
  `device_type` enum('mobile','desktop','tablet','bot','tv','console','unknown') NOT NULL DEFAULT 'unknown',
  `is_mobile` tinyint(1) NOT NULL DEFAULT 0,
  `is_bot` tinyint(1) NOT NULL DEFAULT 0,
  -- Geo enrichment
  `country` varchar(100) DEFAULT NULL,
  `country_code` varchar(2) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  -- Network enrichment
  `isp` varchar(200) DEFAULT NULL,
  `asn_number` int(10) unsigned DEFAULT NULL,
  `connection_type` enum('residential','datacenter','vpn','mobile','unknown') NOT NULL DEFAULT 'unknown',
  `is_datacenter` tinyint(1) NOT NULL DEFAULT 0,
  `is_vpn` tinyint(1) NOT NULL DEFAULT 0,
  `is_proxy` tinyint(1) NOT NULL DEFAULT 0,
  -- Fraud signals
  `fraud_score` decimal(3,2) DEFAULT NULL COMMENT '0.00-1.00 risk score',
  `fraud_verdict` enum('allow','review','block') DEFAULT NULL,
  `fraud_flags` text DEFAULT NULL COMMENT 'JSON array of detected issues',
  `quality_score` tinyint(3) unsigned DEFAULT NULL COMMENT '0-100 click quality',
  -- Timing
  `enriched_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`click_id`),
  KEY `idx_country_code` (`country_code`),
  KEY `idx_device_type` (`device_type`),
  KEY `idx_fraud_verdict` (`fraud_verdict`),
  KEY `idx_connection_type` (`connection_type`),
  KEY `idx_quality_score` (`quality_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fraud detection log (detailed fraud analysis history)
CREATE TABLE IF NOT EXISTS `1ai_fraud_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `click_id` varchar(64) DEFAULT NULL,
  `ip` varchar(45) NOT NULL,
  `affiliate_id` int(10) unsigned DEFAULT NULL,
  `offer_id` int(10) unsigned DEFAULT NULL,
  `risk_score` decimal(3,2) NOT NULL DEFAULT 0.00,
  `verdict` enum('allow','review','block') NOT NULL DEFAULT 'allow',
  `flags` text DEFAULT NULL COMMENT 'JSON array of detected issues',
  `details` text DEFAULT NULL COMMENT 'JSON full analysis details',
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ip` (`ip`),
  KEY `idx_click_id` (`click_id`),
  KEY `idx_affiliate_id` (`affiliate_id`),
  KEY `idx_verdict` (`verdict`),
  KEY `idx_risk_score` (`risk_score`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IP reputation cache (stores reputation data to avoid repeated lookups)
CREATE TABLE IF NOT EXISTS `1ai_ip_reputation` (
  `ip` varchar(45) NOT NULL,
  `reputation_score` decimal(3,2) NOT NULL DEFAULT 0.50 COMMENT '0.00=clean, 1.00=malicious',
  `total_clicks` int(10) unsigned NOT NULL DEFAULT 0,
  `total_conversions` int(10) unsigned NOT NULL DEFAULT 0,
  `total_fraud_flags` int(10) unsigned NOT NULL DEFAULT 0,
  `first_seen` int(10) unsigned NOT NULL,
  `last_seen` int(10) unsigned NOT NULL,
  `is_blacklisted` tinyint(1) NOT NULL DEFAULT 0,
  `blacklist_reason` varchar(255) DEFAULT NULL,
  `last_country_code` varchar(2) DEFAULT NULL,
  `last_asn` int(10) unsigned DEFAULT NULL,
  `last_isp` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`ip`),
  KEY `idx_reputation` (`reputation_score`),
  KEY `idx_blacklisted` (`is_blacklisted`),
  KEY `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
