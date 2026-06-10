-- Migration 010: Add postback IP allowlist column to 1ai_offers
ALTER TABLE `1ai_offers` ADD COLUMN IF NOT EXISTS `postback_ip_allowlist` VARCHAR(1024) DEFAULT NULL COMMENT 'Comma-separated IPs or CIDR blocks allowed to trigger S2S postbacks';
