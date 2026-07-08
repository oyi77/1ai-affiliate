-- Rollback 029: remove cert provisioning columns from 1ai_smartlink_domains
-- Idempotent: DROP COLUMN IF EXISTS guards prevent errors on re-run.
ALTER TABLE 1ai_smartlink_domains
  DROP INDEX  IF EXISTS idx_cert_status,
  DROP INDEX  IF EXISTS idx_cert_expires,
  DROP COLUMN IF EXISTS cert_status,
  DROP COLUMN IF EXISTS cert_pem,
  DROP COLUMN IF EXISTS cert_key_pem,
  DROP COLUMN IF EXISTS cert_expires_at,
  DROP COLUMN IF EXISTS cert_error,
  DROP COLUMN IF EXISTS cert_requested_at;
