-- Rollback for 025_schema_alignment_fixes.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_shopee_payouts` DROP COLUMN IF EXISTS `shopee_account_id`;
ALTER TABLE `1ai_shopee_reports` DROP COLUMN IF EXISTS `shopee_account_id`;
ALTER TABLE `1ai_meta_daily_stats` DROP COLUMN IF EXISTS `adset_name`;
DROP TABLE IF EXISTS `1ai_advertisers`;
