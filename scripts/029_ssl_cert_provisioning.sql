-- Migration 029: SSL cert provisioning columns for custom domains
--
-- Adds cert lifecycle tracking to 1ai_smartlink_domains so the
-- certProvisioner service can store/renew Let's Encrypt certs.
--
-- Idempotent: all statements use IF NOT EXISTS / IF EXISTS guards.

ALTER TABLE 1ai_smartlink_domains
  ADD COLUMN IF NOT EXISTS cert_status    ENUM('none','pending','active','error') NOT NULL DEFAULT 'none'
    COMMENT 'ACME cert state machine',
  ADD COLUMN IF NOT EXISTS cert_pem       MEDIUMTEXT DEFAULT NULL
    COMMENT 'PEM-encoded full-chain certificate (encrypted at rest in prod)',
  ADD COLUMN IF NOT EXISTS cert_key_pem   MEDIUMTEXT DEFAULT NULL
    COMMENT 'PEM-encoded private key (encrypted at rest in prod)',
  ADD COLUMN IF NOT EXISTS cert_expires_at TIMESTAMP NULL
    COMMENT 'Certificate expiry; triggers renewal when < 30 days away',
  ADD COLUMN IF NOT EXISTS cert_error     TEXT DEFAULT NULL
    COMMENT 'Last ACME error message for UI display',
  ADD COLUMN IF NOT EXISTS cert_requested_at TIMESTAMP NULL
    COMMENT 'When provisioning was last requested',
  ADD KEY IF NOT EXISTS idx_cert_status (cert_status),
  ADD KEY IF NOT EXISTS idx_cert_expires (cert_expires_at);

-- DOWN
-- ALTER TABLE 1ai_smartlink_domains
--   DROP COLUMN cert_status,
--   DROP COLUMN cert_pem,
--   DROP COLUMN cert_key_pem,
--   DROP COLUMN cert_expires_at,
--   DROP COLUMN cert_error,
--   DROP COLUMN cert_requested_at;
