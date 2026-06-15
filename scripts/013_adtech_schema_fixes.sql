-- Fix missing columns for fraud and tracking tables

ALTER TABLE 1ai_fraud_click_velocity
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) NOT NULL AFTER click_id,
  ADD COLUMN IF NOT EXISTS click_id VARCHAR(255) NOT NULL FIRST;

-- Recreate fraud_click_velocity with correct columns if needed
DROP TABLE IF EXISTS 1ai_fraud_click_velocity_new;
CREATE TABLE 1ai_fraud_click_velocity_new (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  click_id VARCHAR(255) NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  fraud_score DECIMAL(4,3) NOT NULL,
  reasons JSON,
  action VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ip_address (ip_address),
  KEY idx_click_id (click_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_created_at (created_at),
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Click fraud velocity logs';

INSERT INTO 1ai_fraud_click_velocity_new (id, ip_address, click_id, affiliate_id, fraud_score, reasons, action, created_at)
SELECT id, COALESCE(ip_address, ''), COALESCE(click_id, ''), affiliate_id, fraud_score, reasons, action, created_at
FROM 1ai_fraud_click_velocity;

DROP TABLE 1ai_fraud_click_velocity;
RENAME TABLE 1ai_fraud_click_velocity_new TO 1ai_fraud_click_velocity;

-- Fix conversion_logs columns
ALTER TABLE 1ai_conversion_logs
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS offer_id INT UNSIGNED DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS affiliate_id INT UNSIGNED DEFAULT NULL;

-- Fix cpv_view_events columns  
ALTER TABLE 1ai_cpv_view_events
  ADD COLUMN IF NOT EXISTS duration_seconds INT UNSIGNED NOT NULL DEFAULT 0;
