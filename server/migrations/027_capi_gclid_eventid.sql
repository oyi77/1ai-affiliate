-- Migration 027: Fix CAPI gclid mapping + add event_id dedup
-- Adds gclid column to click_log and event_id to capi_log

-- Add gclid column to 1ai_click_log for Google Ads CAPI
ALTER TABLE `1ai_click_log`
  ADD COLUMN IF NOT EXISTS `gclid` VARCHAR(255) DEFAULT NULL
    COMMENT 'Google Click ID for Google Ads CAPI'
    AFTER `user_agent`,
  ADD INDEX IF NOT EXISTS `idx_gclid` (`gclid`);

-- Add event_id column to 1ai_capi_log for Meta CAPI deduplication
ALTER TABLE `1ai_capi_log`
  ADD COLUMN IF NOT EXISTS `event_id` VARCHAR(128) DEFAULT NULL
    COMMENT 'Event ID for Meta CAPI dedup (matches Pixel event_id)'
    AFTER `event_name`,
  ADD INDEX IF NOT EXISTS `idx_event_id` (`event_id`, `platform`);
