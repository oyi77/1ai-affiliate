-- Postback state machine migration.
--
-- PR #1 (postback-hardening) changed the queue worker to query
--   WHERE status IN ('queued', 'retry')
-- previously it was
--   WHERE status IN ('queued', 'failed')
--
-- In production, items left in 'failed' before this deploy will never
-- be picked up again, but they were never delivered. Move them to 'retry'
-- so the new worker can finish what the old one started.
--
-- Safe to run on a fresh database (no rows match the WHERE clause).
--
-- Run with: mysql -u root -p <DBNAME> < scripts/009_postback_failed_to_retry.sql

UPDATE 1ai_postback_queue
SET status = 'retry'
WHERE status = 'failed'
  AND scheduled_at IS NOT NULL
  AND scheduled_at <= NOW();
