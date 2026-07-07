-- Rollback for 017_meta_shopee_integration.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

DROP TABLE IF EXISTS `1ai_daily_spend`;
DROP TABLE IF EXISTS `1ai_shopee_payouts`;
DROP TABLE IF EXISTS `1ai_campaign_taglinks`;
DROP TABLE IF EXISTS `1ai_shopee_accounts`;
DROP TABLE IF EXISTS `1ai_meta_accounts`;
