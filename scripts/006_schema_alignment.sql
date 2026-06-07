-- 1ai-Affiliate: Schema alignment migration (006)
-- ---------------------------------------------------------------------------
-- PURPOSE
--   The Node.js backend (server/controllers/*.js, server/controllers/
--   smartlinkController.js) queries `1ai_`-prefixed tables, while migrations
--   001-005 created UNPREFIXED shadow tables (`affiliates`, `offers`, ...).
--   This migration creates the real `1ai_`-prefixed tables the Node server
--   actually queries, with column shapes anchored to those live queries.
--
-- IDEMPOTENT: every statement uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- NO FOREIGN KEYS: cross-references to upstream tracking tables use plain
--   indexes. Hard FKs against pre-existing upstream tables (whose shape varies
--   per deployment) would abort the runner (run_migrations.php exits on error).
-- ---------------------------------------------------------------------------

-- ===========================================================================
-- 1. UPSTREAM TABLE ALTERS  (extend, never recreate)
-- ===========================================================================

-- Multi-role RBAC: widen user_role from ('admin','affiliate') to four roles.
ALTER TABLE `1ai_users`
    MODIFY COLUMN `user_role`
    ENUM('admin','affiliate','advertiser','manager')
    NOT NULL DEFAULT 'affiliate';

-- getStats() reads click_ip for unique-visitor / fraud aggregation.
ALTER TABLE `1ai_clicks`
    ADD COLUMN IF NOT EXISTS `click_ip` VARCHAR(45) DEFAULT NULL
        COMMENT 'IPv4/IPv6 of click source';

-- Composite index for the date-bucketed stat queries (range + campaign).
ALTER TABLE `1ai_clicks`
    ADD INDEX IF NOT EXISTS `idx_time_campaign` (`click_time`, `aff_campaign_id`);

ALTER TABLE `1ai_conversion_logs`
    ADD INDEX IF NOT EXISTS `idx_conv_time` (`conversion_time`);

-- ===========================================================================
-- 2. AFFILIATE CORE TABLES  (1ai_-prefixed, queried by Node)
-- ===========================================================================

-- authController + adminController: 1ai_affiliates (id, user_id, affiliate_code, status, tier)
CREATE TABLE IF NOT EXISTS `1ai_affiliates` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL COMMENT 'FK-by-convention -> 1ai_users.user_id',
    `affiliate_code` VARCHAR(32) NOT NULL,
    `status` ENUM('active','paused','banned') NOT NULL DEFAULT 'active',
    `tier` ENUM('standard','premium','vip') NOT NULL DEFAULT 'standard',
    `company_name` VARCHAR(255) DEFAULT NULL,
    `contact_email` VARCHAR(255) DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `payment_details` TEXT DEFAULT NULL,
    `minimum_payout` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_affiliate_code` (`affiliate_code`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate profiles linked to 1ai_users';

-- smartlinkController.processRouting: SELECT * FROM 1ai_affiliate_links
--   WHERE link_token = ? AND status = "active"
-- smartlinkController.generateSmartlink: INSERT (affiliate_id, campaign_id,
--   link_token, status, created_at, updated_at)
CREATE TABLE IF NOT EXISTS `1ai_affiliate_links` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL COMMENT '1ai_aff_campaigns.aff_campaign_id',
    `link_token` VARCHAR(64) NOT NULL,
    `status` ENUM('active','paused','revoked') NOT NULL DEFAULT 'active',
    `click_limit` INT UNSIGNED DEFAULT NULL COMMENT 'NULL = unlimited',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_link_token` (`link_token`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_campaign_id` (`campaign_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate tracking links per campaign';

-- smartlinkController.processRouting: INSERT INTO 1ai_affiliate_sessions
--   (link_token, click_id, affiliate_payout, tracked_at)
CREATE TABLE IF NOT EXISTS `1ai_affiliate_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `link_token` VARCHAR(64) NOT NULL,
    `click_id` VARCHAR(64) NOT NULL COMMENT 'Generated short click id',
    `affiliate_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'Snapshot at click time',
    `tracked_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_link_token` (`link_token`),
    KEY `idx_click_id` (`click_id`),
    KEY `idx_tracked_at` (`tracked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks which affiliate link sent which click';

-- adminController.getStats / approveEarning: 1ai_affiliate_earnings
--   columns: id, affiliate_id, conversion_id, payout_amount, admin_amount,
--            status, approved_by, approved_at, paid_at, created_at
CREATE TABLE IF NOT EXISTS `1ai_affiliate_earnings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `conversion_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '1ai_conversion_logs.conversion_id',
    `payout_amount` DECIMAL(10,4) NOT NULL,
    `admin_amount` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Admin margin',
    `status` ENUM('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
    `approved_by` INT UNSIGNED DEFAULT NULL COMMENT 'Admin user_id',
    `approved_at` INT UNSIGNED DEFAULT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate earnings per conversion';

-- adminController.getPayments: 1ai_affiliate_payments
--   columns: id, user_id, reference, amount, status, tripay_ref, created_at, paid_at
CREATE TABLE IF NOT EXISTS `1ai_affiliate_payments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `reference` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pending','processing','paid','failed') NOT NULL DEFAULT 'pending',
    `tripay_ref` VARCHAR(255) DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `paid_at` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reference` (`reference`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Affiliate payout transactions (Tripay)';

-- ===========================================================================
-- 3. OFFER / NETWORK TABLES
-- ===========================================================================

-- adminController.getNetworks: SELECT id, name, status, created_at FROM 1ai_networks
CREATE TABLE IF NOT EXISTS `1ai_networks` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Upstream offer networks';

-- adminController.getOffers (admin branch):
--   o.id, o.name, o.payout, o.network_payout, o.advertiser_id, o.network_id,
--   o.status  +  LEFT JOIN 1ai_networks n ON o.network_id = n.id
-- smartlinkController.processRouting:
--   o.geo, o.traffic_allowed, o.payout, o.status='active'
CREATE TABLE IF NOT EXISTS `1ai_offers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `advertiser_id` INT UNSIGNED DEFAULT NULL COMMENT '1ai_users.user_id of owning advertiser',
    `network_id` INT UNSIGNED DEFAULT NULL COMMENT '1ai_networks.id',
    `network_offer_id` VARCHAR(100) DEFAULT NULL,
    `vertical` VARCHAR(100) DEFAULT NULL,
    `geo` VARCHAR(255) DEFAULT NULL COMMENT 'CSV country codes or "Global"',
    `type` ENUM('CPA','CPL','CPS','CPI','revshare') NOT NULL DEFAULT 'CPA',
    `payout` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Affiliate payout',
    `network_payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'What the network pays admin',
    `payout_currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `cap_daily` INT UNSIGNED DEFAULT NULL,
    `cap_monthly` INT UNSIGNED DEFAULT NULL,
    `traffic_allowed` TEXT DEFAULT NULL COMMENT 'JSON device/source rules',
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `notes` TEXT DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_advertiser` (`advertiser_id`),
    KEY `idx_network` (`network_id`),
    KEY `idx_status_geo` (`status`, `geo`(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='CPA offers';

-- Reconciles BOTH join styles:
--   smartlinkController: JOIN ON o.id=oc.offer_id WHERE oc.campaign_id=?
--   adminController:     JOIN ON cl.aff_campaign_id=oc.aff_campaign_id WHERE oc.offer_id=o.id
-- campaign_id and aff_campaign_id normally hold the same value; both retained.
CREATE TABLE IF NOT EXISTS `1ai_offer_campaigns` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `campaign_id` INT UNSIGNED NOT NULL COMMENT '1ai_aff_campaigns.aff_campaign_id (smartlink join)',
    `aff_campaign_id` INT UNSIGNED NOT NULL COMMENT 'Same value, used by adminController join',
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_campaign` (`offer_id`, `campaign_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_campaign_id` (`campaign_id`),
    KEY `idx_aff_campaign_id` (`aff_campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps offers to affiliate campaigns';

-- adminController.getOffers (affiliate branch):
--   JOIN 1ai_offer_affiliate_access acc ON o.id=acc.offer_id
--   JOIN 1ai_affiliates a ON acc.affiliate_id=a.id WHERE a.user_id=?
CREATE TABLE IF NOT EXISTS `1ai_offer_affiliate_access` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `offer_id` INT UNSIGNED NOT NULL,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `custom_payout` DECIMAL(10,4) DEFAULT NULL,
    `status` ENUM('pending','approved','revoked') NOT NULL DEFAULT 'pending',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_offer_affiliate` (`offer_id`, `affiliate_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per-affiliate offer access + custom payout';

-- ===========================================================================
-- 4. COMMISSION LEDGER  (Node shape — distinct from migration 004 unprefixed)
-- ===========================================================================

-- adminController.getCommissions:
--   FROM 1ai_commission_entries cl
--   LEFT JOIN 1ai_affiliates a ON cl.affiliate_id=a.id
--   LEFT JOIN 1ai_users u ON a.user_id=u.user_id
--   LEFT JOIN 1ai_offers o ON cl.offer_id=o.id
--   needs: cl.id, cl.affiliate_id, cl.offer_id, cl.commission, cl.tier, cl.status, cl.created_at
CREATE TABLE IF NOT EXISTS `1ai_commission_entries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `affiliate_id` INT UNSIGNED NOT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `commission` DECIMAL(10,4) NOT NULL DEFAULT 0,
    `tier` ENUM('standard','premium','vip') NOT NULL DEFAULT 'standard',
    `status` ENUM('pending','approved','paid','reversed') NOT NULL DEFAULT 'pending',
    `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'conversion, manual, system',
    `reference_id` BIGINT UNSIGNED DEFAULT NULL,
    `created_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Commission ledger (Node-facing shape)';

-- ===========================================================================
-- 5. SMARTLINK ENGINE
-- ===========================================================================

CREATE TABLE IF NOT EXISTS `1ai_smartlinks` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL COMMENT 'Owning 1ai_users.user_id',
    `campaign_id` INT UNSIGNED DEFAULT NULL COMMENT '1ai_aff_campaigns.aff_campaign_id',
    `slug` VARCHAR(80) NOT NULL COMMENT 'Human-readable path segment',
    `hash` VARCHAR(64) NOT NULL COMMENT 'Short routing token (/go/:hash)',
    `geo_rules` JSON DEFAULT NULL COMMENT '[{country,offer_id,weight}]',
    `device_rules` JSON DEFAULT NULL COMMENT '[{device,offer_id,weight}]',
    `weight_algorithm` ENUM('random','round_robin','weighted','priority') NOT NULL DEFAULT 'weighted',
    `status` ENUM('active','paused','archived') NOT NULL DEFAULT 'active',
    `default_url` VARCHAR(2048) DEFAULT NULL COMMENT 'Fallback when no rule matches',
    `click_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_slug` (`slug`),
    UNIQUE KEY `uk_hash` (`hash`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Smartlinks with geo/device routing rules';

-- Click-level tracking for smartlink routing (Phase 3 postback mapping).
CREATE TABLE IF NOT EXISTS `1ai_click_log` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `click_id` VARCHAR(64) NOT NULL COMMENT 'Public click identifier',
    `smartlink_id` INT UNSIGNED DEFAULT NULL,
    `link_token` VARCHAR(64) DEFAULT NULL,
    `offer_id` INT UNSIGNED DEFAULT NULL,
    `affiliate_id` INT UNSIGNED DEFAULT NULL,
    `subid` VARCHAR(128) DEFAULT NULL,
    `ip` VARCHAR(45) DEFAULT NULL,
    `country_code` VARCHAR(2) DEFAULT NULL,
    `device_type` ENUM('mobile','desktop','tablet','unknown') NOT NULL DEFAULT 'unknown',
    `user_agent` VARCHAR(512) DEFAULT NULL,
    `payout` DECIMAL(10,4) DEFAULT NULL COMMENT 'Snapshot at click time',
    `converted` TINYINT(1) NOT NULL DEFAULT 0,
    `converted_at` INT UNSIGNED DEFAULT NULL,
    `clicked_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_click_id` (`click_id`),
    KEY `idx_smartlink_id` (`smartlink_id`),
    KEY `idx_offer_id` (`offer_id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_clicked_at` (`clicked_at`),
    KEY `idx_converted` (`converted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Per-click log for smartlink routing + conversion attribution';

-- ===========================================================================
-- 6. SUPPORTING TABLES  (referenced by adminController, pre-create to avoid
--    on-the-fly DDL in request handlers)
-- ===========================================================================

-- adminController.getStats reads 1ai_settings WHERE name='db_version'
CREATE TABLE IF NOT EXISTS `1ai_settings` (
    `name` VARCHAR(100) NOT NULL,
    `value` TEXT DEFAULT NULL,
    `updated_at` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Key/value app settings';

-- adminController click-server management
CREATE TABLE IF NOT EXISTS `1ai_clickserver_domains` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `domain` VARCHAR(255) NOT NULL,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `status` ENUM('active','pending','disabled') NOT NULL DEFAULT 'pending',
    `created_at` INT UNSIGNED NOT NULL,
    `updated_at` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_domain` (`domain`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Custom click-server / tracking domains';

-- adminController.ensureVipTable() creates this on the fly; pre-create here.
CREATE TABLE IF NOT EXISTS `1ai_affiliate_vip_profiles` (
    `user_id` INT UNSIGNED NOT NULL,
    `monthly_traffic` INT UNSIGNED DEFAULT NULL,
    `primary_vertical` VARCHAR(100) DEFAULT NULL,
    `preferred_payout` VARCHAR(50) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `status` ENUM('active','pending','rejected') NOT NULL DEFAULT 'pending',
    `updated_at` INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='VIP affiliate intake profiles';

-- ===========================================================================
-- 7. SCHEMA VERSION MARKER
-- ===========================================================================
INSERT INTO `1ai_settings` (`name`, `value`, `updated_at`)
VALUES ('db_version', '006', UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE `value` = '006', `updated_at` = UNIX_TIMESTAMP();
