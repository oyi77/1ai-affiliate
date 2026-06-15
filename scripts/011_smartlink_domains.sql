-- Smartlink Custom Domains & URL Shortener Integration
-- Allows admins to add custom domains for smartlink redirects and integrate with URL shortener services

-- Table for custom domains used in smartlinks
CREATE TABLE IF NOT EXISTS 1ai_smartlink_domains (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL COMMENT 'Full domain (e.g., go.example.com, r.example.com)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Enable/disable this domain',
  is_default BOOLEAN DEFAULT FALSE COMMENT 'Default domain for new smartlinks',
  ssl_enabled BOOLEAN DEFAULT TRUE COMMENT 'Force HTTPS for this domain',
  cloudflare_zone_id VARCHAR(100) DEFAULT NULL COMMENT 'Cloudflare zone ID for DNS management',
  notes TEXT DEFAULT NULL COMMENT 'Internal notes about this domain',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_domain (domain),
  KEY idx_is_active (is_active),
  KEY idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom domains for smartlink redirects';

-- Table for URL shortener service configurations
CREATE TABLE IF NOT EXISTS 1ai_url_shortener_services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT 'Service name (e.g., Bitly, TinyURL, Rebrandly, Custom)',
  service_type ENUM('bitly', 'tinyurl', 'rebrandly', 'cuttly', 'shortio', 'custom') NOT NULL COMMENT 'Type of shortener service',
  api_endpoint VARCHAR(255) DEFAULT NULL COMMENT 'Custom API endpoint for custom services',
  api_key VARCHAR(500) DEFAULT NULL COMMENT 'API key/token for the service',
  api_secret VARCHAR(500) DEFAULT NULL COMMENT 'API secret for services that require it (e.g., Rebrandly)',
  domain_id INT UNSIGNED DEFAULT NULL COMMENT 'Link to smartlink domain for branded short domains',
  default_domain VARCHAR(255) DEFAULT NULL COMMENT 'Default short domain (e.g., bit.ly, tinyurl.com)',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Enable/disable this shortener service',
  is_default BOOLEAN DEFAULT FALSE COMMENT 'Default shortener for auto-shortening',
  rate_limit_per_minute INT DEFAULT 60 COMMENT 'API rate limit',
  config_json JSON DEFAULT NULL COMMENT 'Additional service-specific configuration',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_service_type (service_type),
  KEY idx_is_active (is_active),
  KEY idx_is_default (is_default),
  KEY idx_domain_id (domain_id),
  FOREIGN KEY (domain_id) REFERENCES 1ai_smartlink_domains(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='URL shortener service configurations';

-- Add domain_id and short_url columns to affiliate links table
ALTER TABLE 1ai_affiliate_links 
  ADD COLUMN IF NOT EXISTS domain_id INT UNSIGNED DEFAULT NULL COMMENT 'Custom domain used for this smartlink',
  ADD COLUMN IF NOT EXISTS short_url VARCHAR(500) DEFAULT NULL COMMENT 'Shortened URL from shortener service',
  ADD COLUMN IF NOT EXISTS shortener_service_id INT UNSIGNED DEFAULT NULL COMMENT 'Shortener service used for this link',
  ADD KEY IF NOT EXISTS idx_domain_id (domain_id),
  ADD KEY IF NOT EXISTS idx_shortener_service_id (shortener_service_id),
  ADD FOREIGN KEY IF NOT EXISTS fk_domain_id (domain_id) REFERENCES 1ai_smartlink_domains(id) ON DELETE SET NULL,
  ADD FOREIGN KEY IF NOT EXISTS fk_shortener_service_id (shortener_service_id) REFERENCES 1ai_url_shortener_services(id) ON DELETE SET NULL;

-- Create table for tracking shortened URL analytics
CREATE TABLE IF NOT EXISTS 1ai_short_url_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shortener_service_id INT UNSIGNED NOT NULL,
  original_url TEXT NOT NULL,
  short_url VARCHAR(500) NOT NULL,
  short_code VARCHAR(100) DEFAULT NULL COMMENT 'The short code/hash (e.g., abc123)',
  affiliate_link_id INT UNSIGNED DEFAULT NULL COMMENT 'Reference to affiliate link if applicable',
  clicks INT UNSIGNED DEFAULT 0 COMMENT 'Click count from shortener analytics',
  last_sync_at TIMESTAMP NULL COMMENT 'Last time analytics were synced',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_short_url (short_url),
  KEY idx_shortener_service_id (shortener_service_id),
  KEY idx_affiliate_link_id (affiliate_link_id),
  KEY idx_short_code (short_code),
  FOREIGN KEY (shortener_service_id) REFERENCES 1ai_url_shortener_services(id) ON DELETE CASCADE,
  FOREIGN KEY (affiliate_link_id) REFERENCES 1ai_affiliate_links(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Analytics and tracking for shortened URLs';

-- Insert default domains (will be configured via admin)
INSERT IGNORE INTO 1ai_smartlink_domains (domain, is_active, is_default, ssl_enabled, notes) VALUES 
('go.berkahkarya.org', TRUE, TRUE, TRUE, 'Primary smartlink redirect domain'),
('r.berkahkarya.org', TRUE, FALSE, TRUE, 'Secondary smartlink redirect domain');

-- Insert default URL shortener services (disabled by default, need API keys)
INSERT IGNORE INTO 1ai_url_shortener_services (name, service_type, is_active, is_default, rate_limit_per_minute, config_json) VALUES 
('Bitly', 'bitly', FALSE, FALSE, 60, '{"domain": "bit.ly", "group_guid": ""}'),
('TinyURL', 'tinyurl', FALSE, FALSE, 30, '{"domain": "tinyurl.com"}'),
('Rebrandly', 'rebrandly', FALSE, FALSE, 60, '{"domain": "rebrand.ly"}'),
('Cutt.ly', 'cuttly', FALSE, FALSE, 30, '{"domain": "cutt.ly"}'),
('Short.io', 'shortio', FALSE, FALSE, 60, '{"domain": "short.io"}');

