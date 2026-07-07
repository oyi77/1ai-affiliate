-- Rollback for 023_bemob_entity_model.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_offer_campaigns` DROP COLUMN IF EXISTS `weight`;
ALTER TABLE `1ai_offers` DROP COLUMN IF EXISTS `affiliate_url`;
ALTER TABLE `1ai_traffic_sources` DROP COLUMN IF EXISTS `platform_type`;
ALTER TABLE `1ai_advertisers` DROP COLUMN IF EXISTS `platform_type`;
DROP TABLE IF EXISTS `1ai_notifications`;
DROP TABLE IF EXISTS `1ai_white_label`;
DROP TABLE IF EXISTS `1ai_payout_rules`;
DROP TABLE IF EXISTS `1ai_telegram_config`;
DROP TABLE IF EXISTS `1ai_balance_ledger`;
DROP TABLE IF EXISTS `1ai_taglink_mappings`;
DROP TABLE IF EXISTS `1ai_shopee_payouts`;
DROP TABLE IF EXISTS `1ai_shopee_reports`;
DROP TABLE IF EXISTS `1ai_meta_daily_stats`;
