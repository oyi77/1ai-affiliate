-- Postback system schema
-- Adds postback configuration to offers and audit trail logging

-- Add postback configuration columns to 1ai_offers
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_url VARCHAR(1024) DEFAULT NULL COMMENT 'Advertiser postback URL with macro tokens (e.g., {click_id}, {payout}, {txid})';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_enabled BOOLEAN DEFAULT 1 COMMENT 'Enable/disable postback for this offer';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_retries INT DEFAULT 3 COMMENT 'Number of postback retry attempts on failure';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_timeout INT DEFAULT 10 COMMENT 'Postback request timeout in seconds';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_auth_type VARCHAR(50) DEFAULT NULL COMMENT 'Auth type: none, api_key, bearer, signature';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_auth_value VARCHAR(1024) DEFAULT NULL COMMENT 'Auth credentials (API key, token, signature secret)';

-- Create postback logs table for audit trail
CREATE TABLE IF NOT EXISTS 1ai_postback_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id INT UNSIGNED NOT NULL,
  affiliate_id INT UNSIGNED NOT NULL,
  click_id VARCHAR(255) NOT NULL COMMENT 'BeMob/Voluum style unique click identifier',
  transaction_id VARCHAR(255) DEFAULT NULL COMMENT 'Advertiser transaction/order ID',
  postback_url TEXT NOT NULL COMMENT 'Full postback URL that was called',
  postback_method VARCHAR(10) DEFAULT 'POST' COMMENT 'HTTP method (GET, POST)',
  postback_headers JSON COMMENT 'HTTP headers sent',
  postback_body TEXT COMMENT 'HTTP body/parameters sent',
  http_status INT DEFAULT NULL COMMENT 'HTTP response status code',
  http_response TEXT COMMENT 'HTTP response body',
  payout DECIMAL(10, 2) DEFAULT 0 COMMENT 'Payout amount sent in postback',
  conversion_event VARCHAR(255) DEFAULT NULL COMMENT 'Conversion event type (install, purchase, etc)',
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, sent, failed, retry, success',
  retry_count INT DEFAULT 0 COMMENT 'Number of retries performed',
  next_retry_at TIMESTAMP NULL COMMENT 'When next retry is scheduled',
  error_message TEXT COMMENT 'Error details if failed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL COMMENT 'When postback was successfully sent',
  
  FOREIGN KEY (offer_id) REFERENCES 1ai_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliate_id) REFERENCES 1ai_affiliates(id) ON DELETE CASCADE,
  KEY idx_offer_id (offer_id),
  KEY idx_affiliate_id (affiliate_id),
  KEY idx_click_id (click_id),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for all postback attempts to advertisers';

-- Add index to smartlink for faster click_id lookups
ALTER TABLE 1ai_affiliate_links ADD KEY IF NOT EXISTS idx_slug (slug);

-- Create postback queue table (in-memory worker queue)
CREATE TABLE IF NOT EXISTS 1ai_postback_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  postback_log_id BIGINT UNSIGNED NOT NULL,
  scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_started_at TIMESTAMP NULL,
  status VARCHAR(50) DEFAULT 'queued' COMMENT 'queued, processing, completed, failed',
  
  FOREIGN KEY (postback_log_id) REFERENCES 1ai_postback_logs(id) ON DELETE CASCADE,
  KEY idx_status (status),
  KEY idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Queue for async postback processing';
