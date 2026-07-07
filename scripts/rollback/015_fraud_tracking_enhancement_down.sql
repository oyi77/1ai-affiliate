-- Rollback for 015_fraud_tracking_enhancement.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

DROP TABLE IF EXISTS `1ai_ip_reputation`;
DROP TABLE IF EXISTS `1ai_fraud_log`;
DROP TABLE IF EXISTS `1ai_click_enrichment`;
DROP TABLE IF EXISTS `1ai_redirect_log`;
