-- Rollback for 006_schema_alignment.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE `1ai_clicks` DROP COLUMN IF EXISTS `click_ip`;
DROP TABLE IF EXISTS `1ai_affiliate_vip_profiles`;
DROP TABLE IF EXISTS `1ai_clickserver_domains`;
DROP TABLE IF EXISTS `1ai_settings`;
DROP TABLE IF EXISTS `1ai_click_log`;
DROP TABLE IF EXISTS `1ai_smartlinks`;
DROP TABLE IF EXISTS `1ai_commission_entries`;
DROP TABLE IF EXISTS `1ai_offer_affiliate_access`;
DROP TABLE IF EXISTS `1ai_offer_campaigns`;
DROP TABLE IF EXISTS `1ai_offers`;
DROP TABLE IF EXISTS `1ai_networks`;
DROP TABLE IF EXISTS `1ai_affiliate_payments`;
DROP TABLE IF EXISTS `1ai_affiliate_earnings`;
DROP TABLE IF EXISTS `1ai_affiliate_sessions`;
DROP TABLE IF EXISTS `1ai_affiliate_links`;
DROP TABLE IF EXISTS `1ai_affiliates`;
