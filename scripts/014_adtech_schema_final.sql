-- Consolidated adtech schema: fraud, CPV, offer approval
-- Merged from 014 + 015 + migration_011 (removed conflicting duplicates)

-- Fraud tables (final schema)
CREATE TABLE IF NOT EXISTS 1ai_fraud_blacklist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45),
  user_id INT UNSIGNED,
  reason VARCHAR(255),
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  INDEX idx_ip (ip_address),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS 1ai_fraud_click_velocity (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  click_count INT UNSIGNED DEFAULT 0,
  window_start INT UNSIGNED NOT NULL,
  window_end INT UNSIGNED NOT NULL,
  INDEX idx_ip_window (ip_address, window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS 1ai_fraud_conversion_velocity (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_id INT UNSIGNED NOT NULL,
  conversion_count INT UNSIGNED DEFAULT 0,
  window_start INT UNSIGNED NOT NULL,
  window_end INT UNSIGNED NOT NULL,
  INDEX idx_aff_window (affiliate_id, window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CPV view events
CREATE TABLE IF NOT EXISTS 1ai_cpv_view_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(64) NOT NULL,
  offer_id INT UNSIGNED,
  view_duration_ms INT UNSIGNED DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  INDEX idx_click (click_id),
  INDEX idx_offer (offer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Offer approval
CREATE TABLE IF NOT EXISTS 1ai_offer_approval_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id INT UNSIGNED NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by INT UNSIGNED,
  reviewed_at INT UNSIGNED,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  INDEX idx_offer (offer_id),
  INDEX idx_affiliate (affiliate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add subid columns to affiliate_links if missing
ALTER TABLE 1ai_affiliate_links
  ADD COLUMN IF NOT EXISTS subid1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subid2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subid3 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subid4 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS subid5 VARCHAR(255);
