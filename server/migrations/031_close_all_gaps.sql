-- Migration 031: Close All Gaps — smartlink rotation, sub-affiliate, cross-device tracking,
-- real-time WS, ad-block, CAPI, recurring commissions, messaging, scorecard, multi-currency,
-- marketplace, compliance, retargeting pixels, mobile SDK, offer recommendations, PMP,
-- landing page builder, LTV, AI traffic optimization, advanced analytics
-- Applied: 2026-07-14

-- ===========================================================================
-- GAP #1: Smartlink Rotation — wire existing 1ai_smartlinks table into routing
-- (Table already exists; no new table needed)
-- ===========================================================================
ALTER TABLE `1ai_smartlinks`
    ADD COLUMN IF NOT EXISTS `fallback_offer_id` INT UNSIGNED DEFAULT NULL COMMENT 'Fallback when no rotation match',
    ADD COLUMN IF NOT EXISTS `rotation_strategy` ENUM('weighted','round_robin','random','priority') NOT NULL DEFAULT 'weighted',
    ADD COLUMN IF NOT EXISTS `visitor_rules` JSON DEFAULT NULL COMMENT 'Visitor classification rules for routing';

-- Link table: many-to-many between smartlinks and offers with weight
CREATE TABLE IF NOT EXISTS `1ai_smartlink_offers` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `smartlink_id` INT UNSIGNED NOT NULL,
    `offer_id` INT UNSIGNED NOT NULL,
    `weight` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Weight for weighted rotation',
    `priority` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Lower = higher priority',
    `created_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_smartlink_offer` (`smartlink_id`, `offer_id`),
    KEY `idx_smartlink` (`smartlink_id`),
    KEY `idx_offer` (`offer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- GAP #2: Sub-affiliate / 2-tier Program
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_sub_affiliates` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `parent_affiliate_id` INT UNSIGNED NOT NULL,
    `sub_affiliate_id` INT UNSIGNED NOT NULL,
    `commission_rate` DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT '% of parent commission shared with sub-affiliate',
    `status` ENUM('active','paused','suspended') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_parent_sub` (`parent_affiliate_id`, `sub_affiliate_id`),
    KEY `idx_sub_affiliate` (`sub_affiliate_id`),
    FOREIGN KEY (`parent_affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sub_affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='2-tier sub-affiliate relationships';

CREATE TABLE IF NOT EXISTS `1ai_sub_affiliate_earnings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `earning_id` INT UNSIGNED NOT NULL COMMENT 'Parent 1ai_affiliate_earnings.id',
    `parent_affiliate_id` INT UNSIGNED NOT NULL,
    `sub_affiliate_id` INT UNSIGNED NOT NULL,
    `gross_amount` DECIMAL(12,4) NOT NULL COMMENT 'Original commission earned',
    `commission_amount` DECIMAL(12,4) NOT NULL COMMENT 'Amount shared to sub-affiliate',
    `parent_net_amount` DECIMAL(12,4) NOT NULL COMMENT 'Parent keeps this much',
    `conversion_id` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('pending','approved','paid') NOT NULL DEFAULT 'pending',
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_parent` (`parent_affiliate_id`),
    KEY `idx_sub` (`sub_affiliate_id`),
    KEY `idx_earning` (`earning_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='2-tier earnings distribution';

-- ===========================================================================
-- GAP #3: Cross-device Tracking
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_cross_device_visitors` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `merged_user_id` VARCHAR(128) DEFAULT NULL COMMENT 'Merged identity if resolved',
    `fingerprints` JSON NOT NULL COMMENT 'Array of device fingerprints linked to this visitor',
    `devices` JSON NOT NULL COMMENT 'Array of device info objects',
    `first_seen_at` INT UNSIGNED NOT NULL,
    `last_seen_at` INT UNSIGNED NOT NULL,
    `click_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `conversion_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `confidence` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Merge confidence score 0-100',
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_merged_user` (`merged_user_id`),
    KEY `idx_last_seen` (`last_seen_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cross-device visitor identity graph';

CREATE TABLE IF NOT EXISTS `1ai_cross_device_merge_log` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `source_visitor_id` INT UNSIGNED NOT NULL,
    `target_visitor_id` INT UNSIGNED NOT NULL,
    `merge_reason` VARCHAR(64) NOT NULL COMMENT 'email_match / fingerprint_similar / login_match',
    `confidence` DECIMAL(5,2) NOT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_source` (`source_visitor_id`),
    KEY `idx_target` (`target_visitor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cross-device merge audit trail';

-- ===========================================================================
-- GAP #4: Real-time Push Notifications
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_notification_channels` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `channel` VARCHAR(32) NOT NULL COMMENT 'socket session id or device push token',
    `channel_type` ENUM('socket','push','webhook') NOT NULL DEFAULT 'socket',
    `subscribed_topics` JSON NOT NULL COMMENT '["conversion","payout","fraud_alert","offer_update"]',
    `created_at` INT UNSIGNED NOT NULL,
    `last_heartbeat_at` INT UNSIGNED NOT NULL,
    KEY `idx_user` (`user_id`),
    KEY `idx_channel` (`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='WebSocket and push notification channels';

CREATE TABLE IF NOT EXISTS `1ai_notification_queue` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `topic` VARCHAR(48) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT DEFAULT NULL,
    `payload` JSON DEFAULT NULL,
    `priority` ENUM('low','normal','high','critical') NOT NULL DEFAULT 'normal',
    `status` ENUM('queued','sent','delivered','failed') NOT NULL DEFAULT 'queued',
    `read_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_user_status` (`user_id`, `status`),
    KEY `idx_topic` (`topic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Push notification queue for real-time delivery';

-- ===========================================================================
-- GAP #6: Retargeting Pixels
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_retargeting_pixels` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `pixel_type` ENUM('facebook','google','tiktok','pinterest','twitter','custom') NOT NULL DEFAULT 'custom',
    `pixel_code` TEXT NOT NULL COMMENT 'Pixel JavaScript snippet',
    `pixel_id` VARCHAR(128) DEFAULT NULL COMMENT 'Platform pixel ID',
    `status` ENUM('active','paused','disabled') NOT NULL DEFAULT 'active',
    `fired_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `conversion_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_offer` (`offer_id`),
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_type` (`pixel_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Retargeting pixels for affiliate offers';

CREATE TABLE IF NOT EXISTS `1ai_retargeting_audiences` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `pixel_id` INT UNSIGNED NOT NULL,
    `visitor_id` VARCHAR(128) NOT NULL COMMENT 'Browser/device visitor ID',
    `event_type` ENUM('visit','click','add_to_cart','purchase','lead','custom') NOT NULL DEFAULT 'visit',
    `event_data` JSON DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_pixel` (`pixel_id`),
    KEY `idx_visitor` (`visitor_id`),
    KEY `idx_event` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Retargeting audience membership';

-- ===========================================================================
-- GAP #7: Advanced Analytics
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_analytics_reports` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `report_type` ENUM('conversion','revenue','click','affiliate_performance','offer_performance','custom') NOT NULL,
    `config` JSON NOT NULL COMMENT 'Report configuration (filters, metrics, grouping)',
    `schedule` VARCHAR(64) DEFAULT NULL COMMENT 'Cron expression for scheduled delivery',
    `recipients` JSON DEFAULT NULL COMMENT 'Email/webhook recipients',
    `last_run_at` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_user` (`user_id`),
    KEY `idx_type` (`report_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Advanced analytics report configurations';

CREATE TABLE IF NOT EXISTS `1ai_analytics_report_results` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT UNSIGNED NOT NULL,
    `result_data` MEDIUMBLOB NOT NULL COMMENT 'Serialized report data',
    `generated_at` INT UNSIGNED NOT NULL,
    `expires_at` INT UNSIGNED DEFAULT NULL,
    KEY `idx_report` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cached analytics report results';

-- ===========================================================================
-- GAP #8: Automated Offer Recommendations
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_offer_recommendations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `offer_id` INT UNSIGNED NOT NULL,
    `score` DECIMAL(10,4) NOT NULL COMMENT 'Recommendation score',
    `reason` VARCHAR(255) DEFAULT NULL COMMENT 'Why this offer was recommended',
    `bucket` ENUM('top_match','trending','high_payout','geo_match','category_match','similar_affiliate','new') NOT NULL,
    `impressed` TINYINT(1) NOT NULL DEFAULT 0,
    `clicked` TINYINT(1) NOT NULL DEFAULT 0,
    `converted` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_bucket` (`bucket`),
    KEY `idx_score` (`score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Automated offer recommendations for affiliates';

-- ===========================================================================
-- GAP #9: Private Marketplace (PMP)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_private_marketplace` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL UNIQUE,
    `visibility` ENUM('invite_only','selected_affiliates','all') NOT NULL DEFAULT 'invite_only',
    `min_rating` DECIMAL(3,2) DEFAULT NULL COMMENT 'Min affiliate rating required',
    `min_monthly_clicks` INT UNSIGNED DEFAULT NULL,
    `max_affiliates` INT UNSIGNED DEFAULT NULL,
    `private_notes` TEXT DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_visibility` (`visibility`),
    FOREIGN KEY (`offer_id`) REFERENCES `1ai_offers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Private marketplace visibility and rules';

CREATE TABLE IF NOT EXISTS `1ai_pmp_invitations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `pmp_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `invited_by` INT UNSIGNED NOT NULL COMMENT 'User ID who sent invite',
    `status` ENUM('pending','accepted','declined','revoked') NOT NULL DEFAULT 'pending',
    `special_rate` DECIMAL(12,4) DEFAULT NULL COMMENT 'Negotiated commission rate',
    `special_caps` JSON DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_pmp_affiliate` (`pmp_id`, `affiliate_id`),
    FOREIGN KEY (`pmp_id`) REFERENCES `1ai_private_marketplace`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PMP affiliate invitations';

-- ===========================================================================
-- GAP #10: Affiliate Compliance
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_compliance_docs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `doc_type` ENUM('w9','w8ben','id_verification','tax_id','business_license','nda','other') NOT NULL,
    `file_url` VARCHAR(512) NOT NULL,
    `file_name` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
    `reviewed_by` INT UNSIGNED DEFAULT NULL,
    `review_notes` TEXT DEFAULT NULL,
    `expires_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_status` (`status`),
    KEY `idx_doc_type` (`doc_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Affiliate compliance documents';

CREATE TABLE IF NOT EXISTS `1ai_compliance_policies` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(128) NOT NULL,
    `policy_type` ENUM('terms','privacy','restricted','promotional','payout') NOT NULL,
    `content` TEXT NOT NULL,
    `version` INT UNSIGNED NOT NULL DEFAULT 1,
    `required` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_type` (`policy_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Compliance policy versions';

CREATE TABLE IF NOT EXISTS `1ai_compliance_acceptances` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `policy_id` INT UNSIGNED NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(512) DEFAULT NULL,
    `accepted_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_affiliate_policy` (`affiliate_id`, `policy_id`),
    FOREIGN KEY (`policy_id`) REFERENCES `1ai_compliance_policies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Policy acceptance records';

-- ===========================================================================
-- GAP #11: Recurring Commissions
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_recurring_commission_plans` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `interval_type` ENUM('daily','weekly','monthly','quarterly','yearly') NOT NULL,
    `interval_count` INT UNSIGNED NOT NULL DEFAULT 1,
    `max_occurrences` INT UNSIGNED DEFAULT NULL COMMENT 'Null = unlimited',
    `amount` DECIMAL(12,4) NOT NULL,
    `amount_type` ENUM('fixed','percentage_last') NOT NULL DEFAULT 'fixed',
    `status` ENUM('active','paused','disabled') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_offer` (`offer_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Recurring commission plan templates';

CREATE TABLE IF NOT EXISTS `1ai_recurring_commissions` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plan_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `original_conversion_id` INT UNSIGNED NOT NULL COMMENT 'First conversion that started this recurring',
    `next_occurrence_at` INT UNSIGNED NOT NULL,
    `occurrences_remaining` INT UNSIGNED DEFAULT NULL,
    `occurrences_paid` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_paid` DECIMAL(14,4) NOT NULL DEFAULT 0,
    `status` ENUM('active','completed','cancelled','paused') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_plan` (`plan_id`),
    KEY `idx_next` (`next_occurrence_at`),
    KEY `idx_conv` (`original_conversion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Active recurring commission subscriptions';

CREATE TABLE IF NOT EXISTS `1ai_recurring_commission_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `recurring_id` INT UNSIGNED NOT NULL,
    `occurrence` INT UNSIGNED NOT NULL,
    `amount` DECIMAL(12,4) NOT NULL,
    `earning_id` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('due','paid','skipped','failed') NOT NULL DEFAULT 'due',
    `scheduled_at` INT UNSIGNED NOT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    KEY `idx_recurring` (`recurring_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Recurring commission payment logs';

-- ===========================================================================
-- GAP #12: In-platform Messaging
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_conversations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `subject` VARCHAR(255) DEFAULT NULL,
    `participants` JSON NOT NULL COMMENT 'Array of user_ids',
    `last_message_at` INT UNSIGNED DEFAULT NULL,
    `last_message_preview` VARCHAR(255) DEFAULT NULL,
    `message_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active','archived','closed') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_last_msg` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='In-platform message conversations';

CREATE TABLE IF NOT EXISTS `1ai_messages` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` INT UNSIGNED NOT NULL,
    `sender_id` INT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `message_type` ENUM('text','system','offer_shared','payout_note') NOT NULL DEFAULT 'text',
    `metadata` JSON DEFAULT NULL,
    `read_by` JSON DEFAULT NULL COMMENT 'Array of user_ids who read this',
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_conversation` (`conversation_id`),
    FOREIGN KEY (`conversation_id`) REFERENCES `1ai_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Conversation messages';

-- ===========================================================================
-- GAP #14: Affiliate Scorecard / Performance
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_affiliate_scorecards` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `period_type` ENUM('daily','weekly','monthly','quarterly','custom') NOT NULL DEFAULT 'monthly',
    `total_clicks` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_conversions` INT UNSIGNED NOT NULL DEFAULT 0,
    `total_revenue` DECIMAL(14,4) NOT NULL DEFAULT 0,
    `total_payout` DECIMAL(14,4) NOT NULL DEFAULT 0,
    `cr` DECIMAL(8,4) NOT NULL DEFAULT 0 COMMENT 'Conversion rate',
    `epc` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Earnings per click',
    `epv` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Earnings per visit',
    `fraud_score` DECIMAL(5,2) DEFAULT NULL COMMENT '0-100, lower is better',
    `overall_score` DECIMAL(8,2) DEFAULT NULL COMMENT 'Weighted composite score',
    `score_components` JSON DEFAULT NULL COMMENT 'Breakdown of score factors',
    `created_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_affiliate_period` (`affiliate_id`, `period_type`, `period_start`),
    KEY `idx_period` (`period_start`, `period_end`),
    KEY `idx_score` (`overall_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Periodic affiliate performance scorecards';

-- ===========================================================================
-- GAP #16: Tiered LTV (Lifetime Value)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_ltv_settings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `offer_id` INT UNSIGNED NOT NULL,
    `lookback_days` INT UNSIGNED NOT NULL DEFAULT 90,
    `min_conversions` INT UNSIGNED NOT NULL DEFAULT 3 COMMENT 'Min conversions before LTV computed',
    `status` ENUM('active','disabled') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_offer` (`offer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='LTV calculation settings per offer';

CREATE TABLE IF NOT EXISTS `1ai_ltv_calculations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `campaign_id` INT UNSIGNED DEFAULT NULL,
    `ltv_30d` DECIMAL(14,4) DEFAULT NULL,
    `ltv_60d` DECIMAL(14,4) DEFAULT NULL,
    `ltv_90d` DECIMAL(14,4) DEFAULT NULL,
    `ltv_180d` DECIMAL(14,4) DEFAULT NULL,
    `ltv_365d` DECIMAL(14,4) DEFAULT NULL,
    `avg_order_value` DECIMAL(14,4) DEFAULT NULL,
    `repeat_rate` DECIMAL(5,2) DEFAULT NULL,
    `churn_rate` DECIMAL(5,2) DEFAULT NULL,
    `confidence` ENUM('low','medium','high') NOT NULL DEFAULT 'low',
    `calculated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_offer` (`offer_id`),
    KEY `idx_campaign` (`campaign_id`),
    KEY `idx_calculated` (`calculated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lifetime value calculations';

-- ===========================================================================
-- GAP #18: Affiliate Marketplace Profiles
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_affiliate_marketplace_profiles` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL UNIQUE,
    `headline` VARCHAR(255) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `avatar_url` VARCHAR(512) DEFAULT NULL,
    `website_url` VARCHAR(255) DEFAULT NULL,
    `social_links` JSON DEFAULT NULL COMMENT '{"twitter":"...","linkedin":"...","youtube":"..."}',
    `traffic_sources` JSON DEFAULT NULL COMMENT '["seo","paid","social","email","push"]',
    `geo_reach` JSON DEFAULT NULL COMMENT '["US","UK","DE","JP"]',
    `vertical_specialties` JSON DEFAULT NULL COMMENT '["finance","health","ecommerce","gaming"]',
    `monthly_visitors` INT UNSIGNED DEFAULT NULL,
    `avg_cr` DECIMAL(5,2) DEFAULT NULL,
    `top_offers` JSON DEFAULT NULL,
    `rating` DECIMAL(3,2) DEFAULT NULL COMMENT '1.00 - 5.00',
    `rating_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `featured` TINYINT(1) NOT NULL DEFAULT 0,
    `status` ENUM('active','hidden','suspended') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_featured` (`featured`),
    KEY `idx_rating` (`rating`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Affiliate marketplace public profiles';

-- ===========================================================================
-- GAP #5: Mobile SDK API
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_sdk_apps` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `app_name` VARCHAR(128) NOT NULL,
    `app_package` VARCHAR(255) DEFAULT NULL COMMENT 'Bundle ID / package name',
    `platform` ENUM('ios','android','flutter','react_native','other') NOT NULL,
    `api_key` VARCHAR(64) NOT NULL UNIQUE,
    `status` ENUM('active','revoked') NOT NULL DEFAULT 'active',
    `last_active_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_affiliate` (`affiliate_id`),
    KEY `idx_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mobile SDK registered apps';

CREATE TABLE IF NOT EXISTS `1ai_sdk_events` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `sdk_app_id` INT UNSIGNED NOT NULL,
    `event_type` ENUM('install','session','purchase','registration','trial','custom') NOT NULL,
    `event_name` VARCHAR(128) DEFAULT NULL COMMENT 'Custom event name',
    `event_data` JSON DEFAULT NULL,
    `device_id` VARCHAR(128) DEFAULT NULL,
    `advertising_id` VARCHAR(64) DEFAULT NULL COMMENT 'IDFA / GAID',
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(512) DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_app` (`sdk_app_id`),
    KEY `idx_event` (`event_type`),
    KEY `idx_device` (`device_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SDK event log';

-- ===========================================================================
-- GAP #15: No-code Landing Page Builder (extend existing)
-- ===========================================================================
ALTER TABLE `1ai_landing_pages`
    ADD COLUMN IF NOT EXISTS `builder_data` JSON DEFAULT NULL COMMENT 'No-code builder config',
    ADD COLUMN IF NOT EXISTS `published_version` INT UNSIGNED NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS `draft_data` JSON DEFAULT NULL COMMENT 'Unpublished edits',
    ADD COLUMN IF NOT EXISTS `custom_css` TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `custom_js` TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `meta_title` VARCHAR(128) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS `meta_description` VARCHAR(255) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `1ai_landing_page_blocks` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `page_id` INT UNSIGNED NOT NULL,
    `block_type` ENUM('hero','features','cta','testimonial','pricing','faq','form','image','video','text','custom') NOT NULL,
    `block_order` INT UNSIGNED NOT NULL DEFAULT 0,
    `block_config` JSON NOT NULL COMMENT 'Block-specific data',
    `visibility` JSON DEFAULT NULL COMMENT '{"mobile":true,"desktop":true,"tablet":true}',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    KEY `idx_page` (`page_id`),
    KEY `idx_order` (`block_order`),
    FOREIGN KEY (`page_id`) REFERENCES `1ai_landing_pages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Landing page drag-and-drop blocks';

-- ===========================================================================
-- GAP #19: Multi-currency Payouts
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_payout_currency_prefs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `preferred_currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `auto_convert` TINYINT(1) NOT NULL DEFAULT 1,
    `rounding_mode` ENUM('round','ceil','floor') NOT NULL DEFAULT 'round',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    UNIQUE KEY `uk_affiliate` (`affiliate_id`),
    FOREIGN KEY (`affiliate_id`) REFERENCES `1ai_affiliates`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Per-affiliate payout currency preferences';

-- ===========================================================================
-- GAP #20: Ad-block Detection
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `1ai_ad_block_log` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `visitor_id` VARCHAR(128) NOT NULL COMMENT 'Browser/device fingerprint',
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(512) DEFAULT NULL,
    `ad_block_detected` TINYINT(1) NOT NULL DEFAULT 1,
    `detection_method` ENUM('bait_script','iframe_test','api_test','header_analysis','extension_check') DEFAULT NULL,
    `blocker_type` VARCHAR(64) DEFAULT NULL COMMENT 'uBlock / AdBlock / Brave / etc',
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `page_url` VARCHAR(512) DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    KEY `idx_visitor` (`visitor_id`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ad-block detection event log';
