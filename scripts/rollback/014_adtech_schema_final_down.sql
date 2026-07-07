-- Rollback for 014_adtech_schema_final.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE 1ai_affiliate_links DROP COLUMN IF EXISTS subid1;
DROP TABLE IF EXISTS 1ai_offer_approval_log;
DROP TABLE IF EXISTS 1ai_cpv_view_events;
DROP TABLE IF EXISTS 1ai_fraud_conversion_velocity;
DROP TABLE IF EXISTS 1ai_fraud_click_velocity;
DROP TABLE IF EXISTS 1ai_fraud_blacklist;
