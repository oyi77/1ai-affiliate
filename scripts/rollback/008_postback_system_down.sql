-- Rollback for 008_postback_system.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_auth_value;
ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_auth_type;
ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_timeout;
ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_retries;
ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_enabled;
ALTER TABLE 1ai_offers DROP COLUMN IF EXISTS postback_url;
DROP TABLE IF EXISTS 1ai_postback_queue;
DROP TABLE IF EXISTS 1ai_postback_logs;
