-- Add smartlink tracking columns to 1ai_promo_queue (idempotent)
-- This enables tracking of Telegram poster clicks through the affiliate platform

ALTER TABLE 1ai_promo_queue
  MODIFY COLUMN smartlink_slug VARCHAR(128) NULL COMMENT 'Minted smartlink slug from 1ai_affiliate_links',
  MODIFY COLUMN tracked_url VARCHAR(500) NULL COMMENT 'Full tracked URL (e.g., https://go.berkahkarya.org/go/abc123)',
  MODIFY COLUMN offer_id INT UNSIGNED NULL COMMENT 'Offer ID from 1ai_offers for smartlink minting';

-- Add index if not exists (idempotent)
SET @db = (SELECT DATABASE());
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = '1ai_promo_queue' AND INDEX_NAME = 'idx_smartlink_slug') = 0,
  'ALTER TABLE 1ai_promo_queue ADD INDEX idx_smartlink_slug (smartlink_slug)',
  'SELECT 1'
));
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;
