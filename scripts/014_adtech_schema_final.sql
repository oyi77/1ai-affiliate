-- Final schema alignment for AdTech workflow tables
-- Aligns column names with code expectations

ALTER TABLE 1ai_offers
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fraud click velocity: code expects ip_address, click_id
DROP TABLE IF EXISTS 1ai_fraud_click_velocity;
CREATE TABLE 1ai_fraud_click_velocity (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  click_id VARCHAR(255) NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  fraud_score DECIMAL(4,3) NOT NULL,
  reason TEXT,
  blocked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ip_address (ip_address),
  KEY idx_click_id (click_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_created_at (created_at),
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Click fraud velocity logs';

-- Fraud blacklist: code expects ip_address column
DROP TABLE IF EXISTS 1ai_fraud_blacklist;
CREATE TABLE 1ai_fraud_blacklist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  created_by INT UNSIGNED NOT NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ip_address (ip_address),
  KEY idx_expires_at (expires_at),
  FOREIGN KEY (created_by) REFERENCES 1ai_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP blacklist for fraud prevention';

-- Fraud conversion velocity: ensure correct columns
DROP TABLE IF EXISTS 1ai_fraud_conversion_velocity;
CREATE TABLE 1ai_fraud_conversion_velocity (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) DEFAULT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  fraud_score DECIMAL(4,3) NOT NULL,
  reasons JSON,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_click_id (click_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_created_at (created_at),
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conversion fraud velocity logs';

-- CPV view events: align to code expectation (duration_seconds)
DROP TABLE IF EXISTS 1ai_cpv_view_events;
CREATE TABLE 1ai_cpv_view_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(64) NOT NULL,
  offer_id INT UNSIGNED NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_click_id (click_id),
  KEY idx_offer_id (offer_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CPV view duration events';

-- AM assignments align to code expectation (expires_at column)
ALTER TABLE 1ai_am_assignments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL;

-- Final schema adjustments for E2E workflow
-- 1. Remove foreign key constraint on 1ai_offer_assignments.affiliate_id so global
--    assignments can use affiliate_id = 0 (semantic "all affiliates") without requiring
--    a synthetic row in 1ai_affiliates.
ALTER TABLE 1ai_offer_assignments
    DROP FOREIGN KEY IF EXISTS 1ai_offer_assignments_ibfk_2;
