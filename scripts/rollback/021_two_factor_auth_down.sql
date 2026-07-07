-- Rollback for 021_two_factor_auth.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

ALTER TABLE 1ai_users DROP COLUMN IF EXISTS totp_secret;
