-- Integration credentials storage (encrypted at rest via application layer)
-- All credentials stored in 1ai_settings with 'integration_' prefix

INSERT INTO 1ai_settings (name, value, updated_at) VALUES
-- BeMob API
('integration_bemob_access_key', '', UNIX_TIMESTAMP()),
('integration_bemob_secret_key', '', UNIX_TIMESTAMP()),
('integration_bemob_endpoint', 'https://api.bemob.com', UNIX_TIMESTAMP()),
('integration_bemob_enabled', '0', UNIX_TIMESTAMP()),

-- TrackPro
('integration_trackpro_url', 'https://tracker.getflashsale.xyz', UNIX_TIMESTAMP()),
('integration_trackpro_username', '', UNIX_TIMESTAMP()),
('integration_trackpro_password', '', UNIX_TIMESTAMP()),
('integration_trackpro_enabled', '0', UNIX_TIMESTAMP()),

-- Shopee Affiliate
('integration_shopee_affiliate_id', '1301713950', UNIX_TIMESTAMP()),
('integration_shopee_cookies', '', UNIX_TIMESTAMP()),
('integration_shopee_enabled', '0', UNIX_TIMESTAMP()),

-- Facebook/Meta Ads
('integration_facebook_token', '', UNIX_TIMESTAMP()),
('integration_facebook_enabled', '0', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE value = VALUES(value);
