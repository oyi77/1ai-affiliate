-- Rollback for 016_business_flows.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_conversion_logs` DROP COLUMN IF EXISTS `network_payout_snapshot`;
DROP INDEX IF EXISTS `idx_conversion_affiliate` ON `1ai_conversion_logs`;
DROP INDEX IF EXISTS `idx_conversion_status` ON `1ai_conversion_logs`;
DROP TABLE IF EXISTS `payout_items`;
DROP TABLE IF EXISTS `payout_batches`;
DROP TABLE IF EXISTS `1ai_offer_creatives`;
