-- Add smartlink tracking columns to 1ai_promo_queue
-- This enables tracking of Telegram poster clicks through the affiliate platform

ALTER TABLE 1ai_promo_queue
  ADD COLUMN smartlink_slug VARCHAR(12) NULL COMMENT 'Minted smartlink slug from 1ai_affiliate_links',
  ADD COLUMN tracked_url VARCHAR(500) NULL COMMENT 'Full tracked URL (e.g., https://go.berkahkarya.org/go/abc123)',
  ADD COLUMN offer_id INT UNSIGNED NULL COMMENT 'Offer ID from 1ai_offers for smartlink minting',
  ADD INDEX idx_smartlink_slug (smartlink_slug);

-- Add foreign key if needed (optional, since smartlink_slug can be used for lookups)
-- ALTER TABLE 1ai_promo_queue ADD FOREIGN KEY (smartlink_slug) REFERENCES 1ai_affiliate_links(slug) ON DELETE SET NULL;
