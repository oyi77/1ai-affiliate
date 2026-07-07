-- Rollback for 002_margin_engine.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_conversion_logs` DROP COLUMN IF EXISTS `network_payout_snapshot`;
ALTER TABLE `1ai_aff_campaigns` DROP COLUMN IF EXISTS `network_payout`;
DROP TABLE IF EXISTS `margin_config`;
