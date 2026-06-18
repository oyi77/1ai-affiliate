-- Deep link landing pages for affiliate campaigns
-- Enables branded landing pages that trigger Universal Links / App Links
-- URL format: l.berkahkarya.org/{slug}

CREATE TABLE IF NOT EXISTS deep_link_pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(32) NOT NULL UNIQUE COMMENT 'URL slug (e.g., shopee-deal)',
    user_id INT UNSIGNED NOT NULL COMMENT 'Owner user ID',
    aff_campaign_id INT UNSIGNED NULL COMMENT 'Linked campaign ID',
    
    -- Deep link config
    offer_url VARCHAR(2048) NOT NULL COMMENT 'Destination URL (e.g., https://s.shopee.co.id/xxx)',
    app_store_url VARCHAR(2048) NULL COMMENT 'Fallback URL if app not installed',
    
    -- Page content
    title VARCHAR(255) NOT NULL DEFAULT 'Special Offer',
    description TEXT NULL,
    button_text VARCHAR(100) NOT NULL DEFAULT 'Open Now',
    accent_color VARCHAR(7) NOT NULL DEFAULT '#ee4d2d',
    background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    image_url VARCHAR(2048) NULL COMMENT 'Product/promo image URL',
    logo_url VARCHAR(2048) NULL COMMENT 'Brand logo URL',
    
    -- Tracking
    impressions BIGINT UNSIGNED NOT NULL DEFAULT 0,
    clicks BIGINT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Status
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at INT UNSIGNED NOT NULL,
    updated_at INT UNSIGNED NOT NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_user_id (user_id),
    INDEX idx_campaign_id (aff_campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed a test landing page for Shopee deep link
INSERT INTO deep_link_pages (slug, user_id, offer_url, title, description, button_text, accent_color, created_at, updated_at)
VALUES (
    'shopee-test',
    1,
    'https://s.shopee.co.id/4frU188GNJ',
    'Shopee Deal',
    'Click the button below to open this deal in the Shopee app',
    'Buka di Shopee',
    '#ee4d2d',
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
)
ON DUPLICATE KEY UPDATE updated_at = UNIX_TIMESTAMP();