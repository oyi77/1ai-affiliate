-- Add missing columns to 1ai_offers
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_method VARCHAR(10) DEFAULT 'GET';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_headers JSON DEFAULT '{}';
ALTER TABLE 1ai_offers ADD COLUMN IF NOT EXISTS postback_retries INT DEFAULT 3;

-- Ensure 1ai_postback_logs has all columns
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS postback_url VARCHAR(2048);
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS postback_body TEXT;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS http_status INT;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS http_response LONGTEXT;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP;
ALTER TABLE 1ai_postback_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
