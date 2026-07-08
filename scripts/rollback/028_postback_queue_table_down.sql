-- Rollback 028: drop 1ai_postback_queue table
-- Idempotent: DROP IF EXISTS is safe to run multiple times.
DROP TABLE IF EXISTS 1ai_postback_queue;
