-- Rollback for 011_smartlink_domains.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE 1ai_affiliate_links DROP COLUMN IF EXISTS domain_id;
DROP TABLE IF EXISTS 1ai_short_url_logs;
DROP TABLE IF EXISTS 1ai_url_shortener_services;
DROP TABLE IF EXISTS 1ai_smartlink_domains;
