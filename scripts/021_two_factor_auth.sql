-- Two-Factor Authentication (TOTP) support
-- Adds 2FA columns to users table

ALTER TABLE 1ai_users
ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(64) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS totp_enabled TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT DEFAULT NULL;
