-- AdTech workflow support: offer approval history, AM offer assignments, fraud tracking, multi-model tracking fields.

CREATE TABLE IF NOT EXISTS 1ai_offer_approval_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id INT UNSIGNED NOT NULL,
  reviewed_by INT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'approved, rejected, changes_requested, paused, active',
  reason VARCHAR(500) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_offer_id (offer_id),
  KEY idx_reviewed_by (reviewed_by),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail of offer approval actions';

CREATE TABLE IF NOT EXISTS 1ai_offer_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id INT UNSIGNED NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL COMMENT '0 = global assignment',
  am_user_id INT UNSIGNED NOT NULL,
  assignment_type ENUM('specific','global') NOT NULL DEFAULT 'specific',
  is_active BOOLEAN DEFAULT TRUE,
  affiliate_margin_pct DECIMAL(5,2) DEFAULT NULL COMMENT 'AM override margin % for this affiliate',
  affiliate_payout DECIMAL(10,2) DEFAULT NULL COMMENT 'Protected payout for this assignment',
  cap_daily_override INT UNSIGNED DEFAULT NULL,
  cap_monthly_override INT UNSIGNED DEFAULT NULL,
  expires_at TIMESTAMP NULL COMMENT 'Temporary assignment expiration',
  assigned_by INT UNSIGNED NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_offer_affiliate (offer_id, affiliate_id),
  KEY idx_offer_id (offer_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_am_user_id (am_user_id),
  KEY idx_is_active (is_active),
  KEY idx_expires_at (expires_at),
  FOREIGN KEY (offer_id) REFERENCES 1ai_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE,
  FOREIGN KEY (am_user_id) REFERENCES 1ai_users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES 1ai_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AM offer assignments to affiliates';

CREATE TABLE IF NOT EXISTS 1ai_assignment_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'assigned, global_assigned, removed, updated',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_assignment_id (assignment_id),
  KEY idx_user_id (user_id),
  FOREIGN KEY (assignment_id) REFERENCES 1ai_offer_assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES 1ai_users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='History of assignment changes';

CREATE TABLE IF NOT EXISTS 1ai_fraud_conversion_velocity (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) DEFAULT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  fraud_score DECIMAL(4,3) NOT NULL,
  reasons JSON,
  action VARCHAR(20) NOT NULL COMMENT 'allow, review, block',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_click_id (click_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_created_at (created_at),
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conversion fraud velocity logs';

CREATE TABLE IF NOT EXISTS 1ai_fraud_blacklist (
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

-- Extend offers for multi-model tracking fields if not already present.
ALTER TABLE 1ai_offers
  ADD COLUMN IF NOT EXISTS revenue_share_pct DECIMAL(5,2) DEFAULT NULL COMMENT 'Revenue share % for CPS/RevShare',
  ADD COLUMN IF NOT EXISTS view_duration INT UNSIGNED DEFAULT NULL COMMENT 'Required view seconds for CPV',
  ADD COLUMN IF NOT EXISTS geo_targeting JSON DEFAULT NULL COMMENT 'Allowed country codes',
  ADD COLUMN IF NOT EXISTS device_targeting JSON DEFAULT NULL COMMENT 'Allowed device types';

-- Extend affiliate_links for campaign and deep_link metadata.
ALTER TABLE 1ai_affiliate_links
  ADD COLUMN IF NOT EXISTS campaign_id INT UNSIGNED DEFAULT NULL COMMENT 'Publisher campaign ID',
  ADD COLUMN IF NOT EXISTS deep_link TEXT DEFAULT NULL COMMENT 'Deep link override',
  ADD COLUMN IF NOT EXISTS subid1 VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subid2 VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subid3 VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subid4 VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subid5 VARCHAR(255) DEFAULT NULL;

-- CPM impressions and CPV view events (if not present).
CREATE TABLE IF NOT EXISTS 1ai_cpm_impressions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(255) NOT NULL,
  offer_id INT UNSIGNED NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  country_code VARCHAR(3) DEFAULT NULL,
  device_type VARCHAR(50) DEFAULT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_click_id (click_id),
  KEY idx_offer_id (offer_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CPM impression events';

CREATE TABLE IF NOT EXISTS 1ai_cpv_view_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  click_id VARCHAR(255) NOT NULL,
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
