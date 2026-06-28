-- Migration 021: Wallet System
-- Creates tables for wallet spending, feature pricing, exchange rates, boost orders

-- Wallet spending log
CREATE TABLE IF NOT EXISTS 1ai_wallet_spending (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  feature ENUM('ai_tool', 'boost', 'ads', 'lead_cost', 'other') NOT NULL,
  feature_id VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  description VARCHAR(255),
  metadata JSON,
  created_at INT UNSIGNED NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_feature (feature),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feature pricing (admin-configurable)
CREATE TABLE IF NOT EXISTS 1ai_feature_pricing (
  feature_key VARCHAR(50) PRIMARY KEY,
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  unit VARCHAR(50),
  description VARCHAR(255),
  updated_at INT UNSIGNED,
  updated_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exchange rates cache
CREATE TABLE IF NOT EXISTS 1ai_exchange_rates (
  currency_pair VARCHAR(10) PRIMARY KEY,
  rate DECIMAL(12,4) NOT NULL,
  source VARCHAR(50),
  fetched_at INT UNSIGNED,
  updated_at INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Boost orders
CREATE TABLE IF NOT EXISTS 1ai_boost_orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  offer_id INT UNSIGNED,
  status ENUM('pending','running','completed','failed','cancelled') DEFAULT 'pending',
  fanpage_count INT DEFAULT 0,
  post_content TEXT,
  post_images JSON,
  target_url VARCHAR(2048),
  cost_per_fanpage DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  started_at INT UNSIGNED,
  completed_at INT UNSIGNED,
  created_at INT UNSIGNED NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default feature pricing
INSERT IGNORE INTO 1ai_feature_pricing (feature_key, price, currency, unit, description) VALUES
('ai_banner',     5000,  'IDR', 'per_call',     'Banner Generator'),
('ai_carousel',   8000,  'IDR', 'per_call',     'IG Carousel Generator'),
('ai_caption',    2000,  'IDR', 'per_call',     'Social Caption Generator'),
('ai_brand_kit',  10000, 'IDR', 'per_call',     'Brand Kit Generator'),
('ai_ab_test',    3000,  'IDR', 'per_call',     'A/B Test Ideas Generator'),
('ai_bg_remove',  1500,  'IDR', 'per_image',    'Background Removal'),
('boost_per_fp',  100,   'IDR', 'per_fanpage',  'Boost per fanpage post'),
('lead_cpl',      5000,  'IDR', 'per_lead',     'Advertiser cost per lead');

-- Seed default exchange rate
INSERT IGNORE INTO 1ai_exchange_rates (currency_pair, rate, source, fetched_at, updated_at)
VALUES ('USD_IDR', 15500, 'manual', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Seed wallet settings
INSERT IGNORE INTO 1ai_settings (name, value, updated_at) VALUES
('wallet_enabled', 'true', UNIX_TIMESTAMP()),
('wallet_min_topup_usd', '10', UNIX_TIMESTAMP()),
('wallet_usd_idr_rate', '15500', UNIX_TIMESTAMP()),
('wallet_rate_source', 'manual', UNIX_TIMESTAMP()),
('wallet_rate_api_url', '', UNIX_TIMESTAMP());
