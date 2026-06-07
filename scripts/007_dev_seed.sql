-- 1ai-Affiliate: Development Data Seeder
-- PURPOSE: Populate realistic sample data for development/testing.
-- RUN WITH: mysql -u root -p prosper1ai_test < scripts/007_dev_seed.sql
-- IDempotent: uses INSERT IGNORE / ON DUPLICATE KEY UPDATE
-- DEV-ONLY: Do NOT register in run_migrations.php (test data)

USE prosper1ai_test;

-- ===========================================================================
-- 1. USERS (1ai_users — upstream table, anchors all roles)
-- ===========================================================================
INSERT INTO `1ai_users` (`user_id`, `user_name`, `user_email`, `user_password`, `user_role`, `user_api_key`, `user_date_added`)
VALUES
    (1, 'Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'admin-api-key-123', UNIX_TIMESTAMP() - 86400 * 30),
    (2, 'Affiliate User', 'affiliate@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'affiliate', 'affiliate-api-key-456', UNIX_TIMESTAMP() - 86400 * 15),
    (3, 'Advertiser User', 'advertiser@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'advertiser', 'advertiser-api-key-789', UNIX_TIMESTAMP() - 86400 * 10),
    (4, 'Manager User', 'manager@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 'manager-api-key-012', UNIX_TIMESTAMP() - 86400 * 5)
ON DUPLICATE KEY UPDATE
    `user_name` = VALUES(`user_name`),
    `user_password` = VALUES(`user_password`),
    `user_role` = VALUES(`user_role`),
    `user_api_key` = VALUES(`user_api_key`);

-- ===========================================================================
-- 2. AFFILIATES (1ai_affiliates — linked to 1ai_users)
-- ===========================================================================
INSERT INTO `1ai_affiliates` (`id`, `user_id`, `affiliate_code`, `status`, `tier`, `company_name`, `contact_email`, `payment_method`, `payment_details`, `minimum_payout`, `created_at`, `updated_at`)
VALUES
    (1, 2, 'AFF-TEST-001', 'active', 'standard', 'Test Affiliate Co', 'affiliate@example.com', 'paypal', 'paypal@example.com', 50.00, UNIX_TIMESTAMP() - 86400 * 14, UNIX_TIMESTAMP() - 86400 * 1),
    (2, 2, 'AFF-TEST-002', 'active', 'premium', 'Premium Affiliates', 'premium@example.com', 'wire', 'Bank: BCA, Acc: 1234567890', 100.00, UNIX_TIMESTAMP() - 86400 * 10, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `affiliate_code` = VALUES(`affiliate_code`),
    `status` = VALUES(`status`),
    `tier` = VALUES(`tier`),
    `company_name` = VALUES(`company_name`),
    `contact_email` = VALUES(`contact_email`),
    `payment_method` = VALUES(`payment_method`),
    `payment_details` = VALUES(`payment_details`),
    `minimum_payout` = VALUES(`minimum_payout`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 3. NETWORKS (1ai_networks — offer sources)
-- ===========================================================================
INSERT INTO `1ai_networks` (`id`, `name`, `status`, `created_at`)
VALUES
    (1, 'Test Network 1', 'active', UNIX_TIMESTAMP() - 86400 * 20),
    (2, 'Test Network 2', 'active', UNIX_TIMESTAMP() - 86400 * 15),
    (3, 'Global Offers', 'active', UNIX_TIMESTAMP() - 86400 * 10)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `status` = VALUES(`status`);

-- ===========================================================================
-- 4. OFFERS (1ai_offers — CPA offers from networks)
-- ===========================================================================
INSERT INTO `1ai_offers` (`id`, `name`, `advertiser_id`, `network_id`, `network_offer_id`, `vertical`, `geo`, `type`, `payout`, `network_payout`, `payout_currency`, `cap_daily`, `cap_monthly`, `traffic_allowed`, `status`, `notes`, `created_at`, `updated_at`)
VALUES
    (1, 'Test Offer 1 - CPA', 3, 1, 'NETWORK1-001', 'Finance', 'ID,MY,TH', 'CPA', 5.0000, 3.5000, 'USD', 100, 1000, '{"device": ["mobile", "desktop"]}', 'active', 'Test offer for Indonesia/Malaysia/Thailand', UNIX_TIMESTAMP() - 86400 * 5, UNIX_TIMESTAMP() - 86400 * 1),
    (2, 'Test Offer 2 - CPL', 3, 2, 'NETWORK2-001', 'E-commerce', 'Global', 'CPL', 2.5000, 1.7500, 'USD', 200, 2000, '{"device": ["mobile"]}', 'active', 'Global CPL offer', UNIX_TIMESTAMP() - 86400 * 4, UNIX_TIMESTAMP() - 86400 * 1),
    (3, 'Test Offer 3 - RevShare', 3, 3, 'GLOBAL-001', 'Gaming', 'US,CA', 'revshare', 10.0000, 7.0000, 'USD', 50, 500, '{"device": ["desktop"]}', 'active', 'US/Canada gaming offer', UNIX_TIMESTAMP() - 86400 * 3, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `advertiser_id` = VALUES(`advertiser_id`),
    `network_id` = VALUES(`network_id`),
    `network_offer_id` = VALUES(`network_offer_id`),
    `vertical` = VALUES(`vertical`),
    `geo` = VALUES(`geo`),
    `type` = VALUES(`type`),
    `payout` = VALUES(`payout`),
    `network_payout` = VALUES(`network_payout`),
    `payout_currency` = VALUES(`payout_currency`),
    `cap_daily` = VALUES(`cap_daily`),
    `cap_monthly` = VALUES(`cap_monthly`),
    `traffic_allowed` = VALUES(`traffic_allowed`),
    `status` = VALUES(`status`),
    `notes` = VALUES(`notes`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 5. CAMPAIGNS (1ai_aff_campaigns — upstream table, anchors clicks/conversions)
-- ===========================================================================
INSERT INTO `1ai_aff_campaigns` (`aff_campaign_id`, `aff_campaign_name`, `aff_campaign_payout`, `aff_campaign_payout_type`, `aff_campaign_status`)
VALUES
    (1, 'Test Campaign 1 - Finance', 5.00, 'CPA', 'active'),
    (2, 'Test Campaign 2 - E-commerce', 2.50, 'CPL', 'active'),
    (3, 'Test Campaign 3 - Gaming', 10.00, 'CPA', 'active')
ON DUPLICATE KEY UPDATE
    `aff_campaign_name` = VALUES(`aff_campaign_name`),
    `aff_campaign_payout` = VALUES(`aff_campaign_payout`),
    `aff_campaign_payout_type` = VALUES(`aff_campaign_payout_type`),
    `aff_campaign_status` = VALUES(`aff_campaign_status`);

-- ===========================================================================
-- 6. OFFER-CAMPAIGN MAPPING (1ai_offer_campaigns — reconciles 3 join keys)
-- ===========================================================================
INSERT INTO `1ai_offer_campaigns` (`id`, `offer_id`, `campaign_id`, `aff_campaign_id`, `created_at`)
VALUES
    (1, 1, 1, 1, UNIX_TIMESTAMP() - 86400 * 5),
    (2, 2, 2, 2, UNIX_TIMESTAMP() - 86400 * 4),
    (3, 3, 3, 3, UNIX_TIMESTAMP() - 86400 * 3)
ON DUPLICATE KEY UPDATE
    `offer_id` = VALUES(`offer_id`),
    `campaign_id` = VALUES(`campaign_id`),
    `aff_campaign_id` = VALUES(`aff_campaign_id`);

-- ===========================================================================
-- 7. AFFILIATE LINKS (1ai_affiliate_links — smartlink tracking)
-- ===========================================================================
INSERT INTO `1ai_affiliate_links` (`id`, `affiliate_id`, `campaign_id`, `link_token`, `status`, `click_limit`, `created_at`, `updated_at`)
VALUES
    (1, 1, 1, 'abc123def456', 'active', NULL, UNIX_TIMESTAMP() - 86400 * 2, UNIX_TIMESTAMP() - 86400 * 1),
    (2, 1, 2, 'ghi789jkl012', 'active', 100, UNIX_TIMESTAMP() - 86400 * 1, UNIX_TIMESTAMP() - 86400 * 1),
    (3, 2, 3, 'mno345pqr678', 'paused', NULL, UNIX_TIMESTAMP() - 86400 * 1, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `affiliate_id` = VALUES(`affiliate_id`),
    `campaign_id` = VALUES(`campaign_id`),
    `status` = VALUES(`status`),
    `click_limit` = VALUES(`click_limit`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 8. AFFILIATE OFFER ACCESS (1ai_offer_affiliate_access — per-affiliate offer access)
-- ===========================================================================
INSERT INTO `1ai_offer_affiliate_access` (`id`, `offer_id`, `affiliate_id`, `custom_payout`, `status`, `created_at`, `updated_at`)
VALUES
    (1, 1, 1, 5.5000, 'approved', UNIX_TIMESTAMP() - 86400 * 2, UNIX_TIMESTAMP() - 86400 * 1),
    (2, 2, 1, NULL, 'approved', UNIX_TIMESTAMP() - 86400 * 2, UNIX_TIMESTAMP() - 86400 * 1),
    (3, 3, 2, 11.0000, 'approved', UNIX_TIMESTAMP() - 86400 * 1, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `offer_id` = VALUES(`offer_id`),
    `affiliate_id` = VALUES(`affiliate_id`),
    `custom_payout` = VALUES(`custom_payout`),
    `status` = VALUES(`status`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 9. CLICKS (1ai_clicks — upstream table, extended by 006 migration)
-- ===========================================================================
INSERT INTO `1ai_clicks` (`click_id`, `click_time`, `aff_campaign_id`, `click_payout`, `click_ip`)
VALUES
    (1, UNIX_TIMESTAMP() - 86400 * 7, 1, 5.00, '192.168.1.1'),
    (2, UNIX_TIMESTAMP() - 86400 * 6, 1, 5.00, '192.168.1.2'),
    (3, UNIX_TIMESTAMP() - 86400 * 5, 2, 2.50, '192.168.1.3'),
    (4, UNIX_TIMESTAMP() - 86400 * 4, 2, 2.50, '192.168.1.4'),
    (5, UNIX_TIMESTAMP() - 86400 * 3, 3, 10.00, '192.168.1.5'),
    (6, UNIX_TIMESTAMP() - 86400 * 2, 3, 10.00, '192.168.1.6')
ON DUPLICATE KEY UPDATE
    `click_time` = VALUES(`click_time`),
    `aff_campaign_id` = VALUES(`aff_campaign_id`),
    `click_payout` = VALUES(`click_payout`),
    `click_ip` = VALUES(`click_ip`);

-- ===========================================================================
-- 10. CONVERSIONS (1ai_conversion_logs — upstream table)
-- ===========================================================================
INSERT INTO `1ai_conversion_logs` (`conversion_id`, `aff_campaign_id`, `click_id`, `conversion_time`)
VALUES
    (1, 1, 1, UNIX_TIMESTAMP() - 86400 * 7 + 3600),
    (2, 1, 2, UNIX_TIMESTAMP() - 86400 * 6 + 3600),
    (3, 2, 3, UNIX_TIMESTAMP() - 86400 * 5 + 3600),
    (4, 3, 5, UNIX_TIMESTAMP() - 86400 * 3 + 3600)
ON DUPLICATE KEY UPDATE
    `aff_campaign_id` = VALUES(`aff_campaign_id`),
    `click_id` = VALUES(`click_id`),
    `conversion_time` = VALUES(`conversion_time`);

-- ===========================================================================
-- 11. AFFILIATE SESSIONS (1ai_affiliate_sessions — click-level tracking)
-- ===========================================================================
INSERT INTO `1ai_affiliate_sessions` (`id`, `link_token`, `click_id`, `affiliate_payout`, `tracked_at`)
VALUES
    (1, 'abc123def456', 'click123', 5.0000, UNIX_TIMESTAMP() - 86400 * 7),
    (2, 'abc123def456', 'click456', 5.0000, UNIX_TIMESTAMP() - 86400 * 6),
    (3, 'ghi789jkl012', 'click789', 2.5000, UNIX_TIMESTAMP() - 86400 * 5),
    (4, 'mno345pqr678', 'click012', 10.0000, UNIX_TIMESTAMP() - 86400 * 3)
ON DUPLICATE KEY UPDATE
    `link_token` = VALUES(`link_token`),
    `click_id` = VALUES(`click_id`),
    `affiliate_payout` = VALUES(`affiliate_payout`),
    `tracked_at` = VALUES(`tracked_at`);

-- ===========================================================================
-- 12. COMMISSION ENTRIES (1ai_commission_entries — Node shape, distinct from migration 004)
-- ===========================================================================
INSERT INTO `1ai_commission_entries` (`id`, `affiliate_id`, `offer_id`, `commission`, `tier`, `status`, `reference_type`, `reference_id`, `created_at`)
VALUES
    (1, 1, 1, 5.0000, 'standard', 'approved', 'conversion', 1, UNIX_TIMESTAMP() - 86400 * 7 + 3600),
    (2, 1, 1, 5.0000, 'standard', 'approved', 'conversion', 2, UNIX_TIMESTAMP() - 86400 * 6 + 3600),
    (3, 1, 2, 2.5000, 'standard', 'approved', 'conversion', 3, UNIX_TIMESTAMP() - 86400 * 5 + 3600),
    (4, 2, 3, 10.0000, 'premium', 'approved', 'conversion', 4, UNIX_TIMESTAMP() - 86400 * 3 + 3600)
ON DUPLICATE KEY UPDATE
    `affiliate_id` = VALUES(`affiliate_id`),
    `offer_id` = VALUES(`offer_id`),
    `commission` = VALUES(`commission`),
    `tier` = VALUES(`tier`),
    `status` = VALUES(`status`),
    `reference_type` = VALUES(`reference_type`),
    `reference_id` = VALUES(`reference_id`),
    `created_at` = VALUES(`created_at`);

-- ===========================================================================
-- 13. EARNINGS (1ai_affiliate_earnings — conversion-level earnings)
-- ===========================================================================
INSERT INTO `1ai_affiliate_earnings` (`id`, `affiliate_id`, `conversion_id`, `payout_amount`, `admin_amount`, `status`, `approved_by`, `approved_at`, `paid_at`, `created_at`)
VALUES
    (1, 1, 1, 5.0000, 1.5000, 'paid', 1, UNIX_TIMESTAMP() - 86400 * 7 + 7200, UNIX_TIMESTAMP() - 86400 * 7 + 10800, UNIX_TIMESTAMP() - 86400 * 7 + 3600),
    (2, 1, 2, 5.0000, 1.5000, 'approved', 1, UNIX_TIMESTAMP() - 86400 * 6 + 7200, NULL, UNIX_TIMESTAMP() - 86400 * 6 + 3600),
    (3, 1, 3, 2.5000, 0.7500, 'approved', 1, UNIX_TIMESTAMP() - 86400 * 5 + 7200, NULL, UNIX_TIMESTAMP() - 86400 * 5 + 3600),
    (4, 2, 4, 10.0000, 3.0000, 'paid', 1, UNIX_TIMESTAMP() - 86400 * 3 + 7200, UNIX_TIMESTAMP() - 86400 * 3 + 10800, UNIX_TIMESTAMP() - 86400 * 3 + 3600)
ON DUPLICATE KEY UPDATE
    `affiliate_id` = VALUES(`affiliate_id`),
    `conversion_id` = VALUES(`conversion_id`),
    `payout_amount` = VALUES(`payout_amount`),
    `admin_amount` = VALUES(`admin_amount`),
    `status` = VALUES(`status`),
    `approved_by` = VALUES(`approved_by`),
    `approved_at` = VALUES(`approved_at`),
    `paid_at` = VALUES(`paid_at`),
    `created_at` = VALUES(`created_at`);

-- ===========================================================================
-- 14. PAYMENTS (1ai_affiliate_payments — payout transactions)
-- ===========================================================================
INSERT INTO `1ai_affiliate_payments` (`id`, `user_id`, `reference`, `amount`, `status`, `tripay_ref`, `created_at`, `paid_at`)
VALUES
    (1, 2, 'PAY-20260601-001', 10.00, 'paid', 'TRIPAY-12345', UNIX_TIMESTAMP() - 86400 * 7 + 10800, UNIX_TIMESTAMP() - 86400 * 7 + 10800),
    (2, 2, 'PAY-20260605-002', 2.50, 'pending', NULL, UNIX_TIMESTAMP() - 86400 * 1, NULL)
ON DUPLICATE KEY UPDATE
    `user_id` = VALUES(`user_id`),
    `reference` = VALUES(`reference`),
    `amount` = VALUES(`amount`),
    `status` = VALUES(`status`),
    `tripay_ref` = VALUES(`tripay_ref`),
    `created_at` = VALUES(`created_at`),
    `paid_at` = VALUES(`paid_at`);

-- ===========================================================================
-- 15. SMARTLINKS (1ai_smartlinks — geo/device routing)
-- ===========================================================================
INSERT INTO `1ai_smartlinks` (`id`, `user_id`, `campaign_id`, `slug`, `hash`, `geo_rules`, `device_rules`, `weight_algorithm`, `status`, `default_url`, `click_count`, `created_at`, `updated_at`)
VALUES
    (1, 2, 1, 'finance-offer', 'finance123', '[{"country": "ID", "offer_id": 1, "weight": 100}]', '[{"device": "mobile", "offer_id": 1, "weight": 80}, {"device": "desktop", "offer_id": 1, "weight": 20}]', 'weighted', 'active', 'https://example.com/fallback', 10, UNIX_TIMESTAMP() - 86400 * 2, UNIX_TIMESTAMP() - 86400 * 1),
    (2, 2, 2, 'ecommerce-cpl', 'ecom456', '[{"country": "Global", "offer_id": 2, "weight": 100}]', '[{"device": "mobile", "offer_id": 2, "weight": 100}]', 'weighted', 'active', 'https://example.com/fallback', 5, UNIX_TIMESTAMP() - 86400 * 1, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `user_id` = VALUES(`user_id`),
    `campaign_id` = VALUES(`campaign_id`),
    `geo_rules` = VALUES(`geo_rules`),
    `device_rules` = VALUES(`device_rules`),
    `weight_algorithm` = VALUES(`weight_algorithm`),
    `status` = VALUES(`status`),
    `default_url` = VALUES(`default_url`),
    `click_count` = VALUES(`click_count`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 16. CLICK LOG (1ai_click_log — smartlink click tracking)
-- ===========================================================================
INSERT INTO `1ai_click_log` (`id`, `click_id`, `smartlink_id`, `link_token`, `offer_id`, `affiliate_id`, `subid`, `ip`, `country_code`, `device_type`, `user_agent`, `payout`, `converted`, `converted_at`, `clicked_at`)
VALUES
    (1, 'smartclick1', 1, 'abc123def456', 1, 1, 'sub123', '192.168.1.100', 'ID', 'mobile', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36', 5.0000, 1, UNIX_TIMESTAMP() - 86400 * 2 + 3600, UNIX_TIMESTAMP() - 86400 * 2),
    (2, 'smartclick2', 1, 'abc123def456', 1, 1, 'sub456', '192.168.1.101', 'MY', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36', 5.0000, 0, NULL, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `smartlink_id` = VALUES(`smartlink_id`),
    `link_token` = VALUES(`link_token`),
    `offer_id` = VALUES(`offer_id`),
    `affiliate_id` = VALUES(`affiliate_id`),
    `subid` = VALUES(`subid`),
    `ip` = VALUES(`ip`),
    `country_code` = VALUES(`country_code`),
    `device_type` = VALUES(`device_type`),
    `user_agent` = VALUES(`user_agent`),
    `payout` = VALUES(`payout`),
    `converted` = VALUES(`converted`),
    `converted_at` = VALUES(`converted_at`),
    `clicked_at` = VALUES(`clicked_at`);

-- ===========================================================================
-- 17. SETTINGS (1ai_settings — version marker)
-- ===========================================================================
INSERT INTO `1ai_settings` (`name`, `value`, `updated_at`)
VALUES
    ('db_version', '007', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 18. VIP PROFILES (1ai_affiliate_vip_profiles — admin intake)
-- ===========================================================================
INSERT INTO `1ai_affiliate_vip_profiles` (`user_id`, `monthly_traffic`, `primary_vertical`, `preferred_payout`, `notes`, `status`, `updated_at`)
VALUES
    (2, 100000, 'Finance', 'paypal', 'High-volume affiliate', 'active', UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `monthly_traffic` = VALUES(`monthly_traffic`),
    `primary_vertical` = VALUES(`primary_vertical`),
    `preferred_payout` = VALUES(`preferred_payout`),
    `notes` = VALUES(`notes`),
    `status` = VALUES(`status`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- 19. CLICKSERVER DOMAINS (1ai_clickserver_domains — custom tracking domains)
-- ===========================================================================
INSERT INTO `1ai_clickserver_domains` (`id`, `domain`, `user_id`, `status`, `created_at`, `updated_at`)
VALUES
    (1, 'track.example.com', 2, 'active', UNIX_TIMESTAMP() - 86400 * 5, UNIX_TIMESTAMP() - 86400 * 1)
ON DUPLICATE KEY UPDATE
    `user_id` = VALUES(`user_id`),
    `status` = VALUES(`status`),
    `updated_at` = VALUES(`updated_at`);

-- ===========================================================================
-- SEEDER COMPLETE
-- ===========================================================================
SELECT 'Seeder completed successfully.' AS message;