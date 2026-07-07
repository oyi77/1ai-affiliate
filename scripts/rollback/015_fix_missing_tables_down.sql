-- Rollback for 015_fix_missing_tables.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_users` DROP COLUMN IF EXISTS `install_hash`;
ALTER TABLE `1ai_users` DROP COLUMN IF EXISTS `vip_perks_status`;
DROP TABLE IF EXISTS `1ai_dataengine_job`;
DROP TABLE IF EXISTS `1ai_cronjob_logs`;
DROP TABLE IF EXISTS `ips_v6`;
DROP TABLE IF EXISTS `ips`;
