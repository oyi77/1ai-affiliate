-- Migration: Add promo_queue table for Telegram Shopee poster
-- Replaces the old PostgreSQL-only promo_queue from poster/poster.py
-- This table is managed by server/services/posterService.js

CREATE TABLE IF NOT EXISTS 1ai_promo_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_url VARCHAR(500) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  normal_price INT NOT NULL,
  promo_price INT NOT NULL,
  discount_pct INT GENERATED ALWAYS AS (
    ROUND((1 - promo_price / NULLIF(normal_price, 0)) * 100)
  ) STORED,
  status ENUM('pending','posted','failed') DEFAULT 'pending',
  posted_at INT NULL,
  error_message TEXT NULL,
  affiliate_link VARCHAR(500) NULL,
  niche VARCHAR(50) NULL,
  created_at INT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
