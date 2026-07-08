-- Migration 028: Create 1ai_postback_queue table
--
-- The postback queue worker (server/services/postbackQueue.js) queries this
-- table but no prior migration created it. This is the canonical schema.
--
-- Idempotent: uses CREATE TABLE IF NOT EXISTS.
-- Rollback: DROP TABLE IF EXISTS 1ai_postback_queue;

CREATE TABLE IF NOT EXISTS 1ai_postback_queue (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  postback_log_id BIGINT UNSIGNED NOT NULL COMMENT 'FK to 1ai_postback_logs.id',
  status         ENUM('queued','processing','retry','completed','failed')
                 NOT NULL DEFAULT 'queued'
                 COMMENT 'State machine: queued→processing→completed|retry|failed',
  scheduled_at   TIMESTAMP NULL DEFAULT NULL
                 COMMENT 'NULL = process immediately; set for exponential-backoff retries',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_postback_log (postback_log_id),
  KEY idx_status_scheduled (status, scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Retry queue for outbound postback delivery';
