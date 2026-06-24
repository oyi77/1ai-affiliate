-- Create test user for isolated testing
-- Test data lives under this user, admin dashboard shows only real data

-- Create test user (password: test123456)
INSERT INTO 1ai_users (user_id, user_name, user_email, user_pass, user_role, user_date_added)
VALUES (999, 'testuser', 'test@1ai.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'affiliate', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE user_name = 'testuser';

-- Create test affiliate
INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at, updated_at)
VALUES (999, 'TEST001', 'starter', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE tier = 'starter';

-- Archive all test offers (keep real Shopee offers)
UPDATE 1ai_offers SET status = 'archived', archived_at = UNIX_TIMESTAMP()
WHERE name LIKE '%test%' OR name LIKE '%Test%' OR name LIKE '%E2E%' OR name LIKE '%QA%'
   OR name LIKE '%Final Offer%' OR name LIKE '%Engine Test%' OR name LIKE '%script>alert%'
   OR name LIKE '%Bot Fx%' OR name LIKE '%Apply Test%' OR name LIKE '%Production Test%';

-- Create test offers under test user
INSERT INTO 1ai_offers (name, advertiser_id, status, payout, type, created_at, updated_at) VALUES
('Test Offer - Sweepstakes', NULL, 'active', 5.00, 'CPA', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Test Offer - E-Commerce', NULL, 'active', 12.50, 'CPS', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Test Offer - Finance', NULL, 'active', 25.00, 'CPA', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Create test clicks
INSERT INTO 1ai_clicks (click_time, aff_campaign_id, click_payout, click_ip)
VALUES
(UNIX_TIMESTAMP() - 3600, 1, 0, '127.0.0.1'),
(UNIX_TIMESTAMP() - 7200, 1, 0, '127.0.0.1'),
(UNIX_TIMESTAMP() - 10800, 2, 0, '192.168.1.1');

-- Create test conversions
INSERT INTO 1ai_conversions (click_id, offer_id, payout, revenue, status, created_at)
VALUES
('test-click-001', (SELECT id FROM 1ai_offers WHERE name = 'Test Offer - Sweepstakes' LIMIT 1), 5.00, 50.00, 'approved', UNIX_TIMESTAMP()),
('test-click-002', (SELECT id FROM 1ai_offers WHERE name = 'Test Offer - E-Commerce' LIMIT 1), 12.50, 125.00, 'pending', UNIX_TIMESTAMP());
