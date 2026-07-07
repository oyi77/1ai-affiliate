-- Rollback for 010_postback_ip_allowlist.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_offers` DROP COLUMN IF EXISTS `postback_ip_allowlist`;
