-- Migration 030b: Seed postback URL templates for major networks

INSERT IGNORE INTO `1ai_postback_templates` (network_name, network_icon, url_template, method, description, macros, is_default, created_at) VALUES
('Shopee', '🛒', 'https://your-domain.com/postback?click_id={subid}&payout={commission}', 'GET', 'Shopee affiliate postback', '["click_id","payout","subid"]', 1, UNIX_TIMESTAMP()),
('Tokopedia', '🟢', 'https://your-domain.com/postback?click_id={subid}&payout={amount}', 'GET', 'Tokopedia affiliate postback', '["click_id","payout","subid"]', 1, UNIX_TIMESTAMP()),
('Meta Ads', '📘', 'https://your-domain.com/postback?click_id={click_id}&payout={value}&fbc={fbc}&fbp={fbp}', 'GET', 'Meta CAPI postback with click/browser IDs', '["click_id","payout","fbc","fbp"]', 0, UNIX_TIMESTAMP()),
('Google Ads', '🔍', 'https://your-domain.com/postback?click_id={click_id}&payout={value}&gclid={gclid}', 'GET', 'Google Ads conversion postback', '["click_id","payout","gclid"]', 0, UNIX_TIMESTAMP()),
('TikTok Ads', '🎵', 'https://your-domain.com/postback?click_id={click_id}&payout={value}&ttclid={ttclid}', 'GET', 'TikTok Ads conversion postback', '["click_id","payout","ttclid"]', 0, UNIX_TIMESTAMP()),
('Generic S2S', '🔗', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}&event={event}&txid={transaction_id}', 'GET', 'Generic server-to-server postback', '["click_id","payout","event","transaction_id"]', 1, UNIX_TIMESTAMP()),
('PropellerAds', '🌐', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'PropellerAds postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('RichPush', '📢', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'RichPush postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('Taboola', '📰', 'https://your-domain.com/postback?click_id={click_id}&payout={revenue}', 'GET', 'Taboola conversion postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('MGID', '🟢', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'MGID postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('Adsterra', '🔺', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'Adsterra postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('Zeropark', '⚡', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'Zeropark postback', '["click_id","payout"]', 0, UNIX_TIMESTAMP()),
('Custom', '⚙️', 'https://your-domain.com/postback?click_id={click_id}&payout={payout}', 'GET', 'Custom network postback — edit the URL', '["click_id","payout"]', 0, UNIX_TIMESTAMP());
