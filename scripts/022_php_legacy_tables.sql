-- Migration 022: Create all PHP legacy tracking tables
-- These tables are required by the PHP hot-path tracking engine
-- (tracking_support/redirect/, config/Click/MysqlClickRepository.php, etc.)
-- Run: mysql -u root 1ai_affiliate < scripts/022_php_legacy_tables.sql

SET NAMES utf8mb4;

-- ─── Click core ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `clicks_counter` (
  `click_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Auto-increment only — allocates click IDs without any data';

CREATE TABLE IF NOT EXISTS `clicks` (
  `click_id`        bigint unsigned  NOT NULL,
  `user_id`         int unsigned     NOT NULL DEFAULT 0,
  `aff_campaign_id` int unsigned     NOT NULL DEFAULT 0,
  `landing_page_id` int unsigned     NOT NULL DEFAULT 0,
  `ppc_account_id`  int unsigned     NOT NULL DEFAULT 0,
  `click_cpc`       decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `click_payout`    decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `click_filtered`  tinyint(1)       NOT NULL DEFAULT 0,
  `click_bot`       tinyint(1)       NOT NULL DEFAULT 0,
  `click_alp`       tinyint(1)       NOT NULL DEFAULT 0,
  `click_time`      int unsigned     NOT NULL DEFAULT 0,
  `click_lead`      tinyint(1)       NOT NULL DEFAULT 0,
  `click_cpa`       decimal(10,4)    NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`click_id`),
  KEY `idx_user_id`         (`user_id`),
  KEY `idx_aff_campaign_id` (`aff_campaign_id`),
  KEY `idx_click_time`      (`click_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_record` (
  `click_id`        bigint unsigned  NOT NULL,
  `click_id_public` varchar(128)     NOT NULL DEFAULT '',
  `click_cloaking`  tinyint(1)       NOT NULL DEFAULT 0,
  `click_in`        tinyint(1)       NOT NULL DEFAULT 1,
  `click_out`       tinyint(1)       NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`),
  KEY `idx_click_id_public` (`click_id_public`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_advance` (
  `click_id`    bigint unsigned  NOT NULL,
  `text_ad_id`  int unsigned     NOT NULL DEFAULT 0,
  `keyword_id`  int unsigned     NOT NULL DEFAULT 0,
  `ip_id`       int unsigned     NOT NULL DEFAULT 0,
  `country_id`  int unsigned     NOT NULL DEFAULT 0,
  `region_id`   int unsigned     NOT NULL DEFAULT 0,
  `isp_id`      int unsigned     NOT NULL DEFAULT 0,
  `city_id`     int unsigned     NOT NULL DEFAULT 0,
  `platform_id` int unsigned     NOT NULL DEFAULT 0,
  `browser_id`  int unsigned     NOT NULL DEFAULT 0,
  `device_id`   int unsigned     NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_tracking` (
  `click_id` bigint unsigned NOT NULL,
  `c1_id`    int unsigned    NOT NULL DEFAULT 0,
  `c2_id`    int unsigned    NOT NULL DEFAULT 0,
  `c3_id`    int unsigned    NOT NULL DEFAULT 0,
  `c4_id`    int unsigned    NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_variable` (
  `click_id`        bigint unsigned NOT NULL,
  `variable_set_id` int unsigned    NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_spy` (
  `click_id`        bigint unsigned  NOT NULL,
  `user_id`         int unsigned     NOT NULL DEFAULT 0,
  `aff_campaign_id` int unsigned     NOT NULL DEFAULT 0,
  `landing_page_id` int unsigned     NOT NULL DEFAULT 0,
  `ppc_account_id`  int unsigned     NOT NULL DEFAULT 0,
  `click_cpc`       decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `click_payout`    decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `click_filtered`  tinyint(1)       NOT NULL DEFAULT 0,
  `click_bot`       tinyint(1)       NOT NULL DEFAULT 0,
  `click_alp`       tinyint(1)       NOT NULL DEFAULT 0,
  `click_time`      int unsigned     NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`),
  KEY `idx_user_id`    (`user_id`),
  KEY `idx_click_time` (`click_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clicks_site` (
  `click_id`                   bigint unsigned NOT NULL,
  `click_referer_site_url_id`  int unsigned    NOT NULL DEFAULT 0,
  `click_landing_site_url_id`  int unsigned    NOT NULL DEFAULT 0,
  `click_outbound_site_url_id` int unsigned    NOT NULL DEFAULT 0,
  `click_cloaking_site_url_id` int unsigned    NOT NULL DEFAULT 0,
  `click_redirect_site_url_id` int unsigned    NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── UTM / Google ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `google` (
  `click_id`         bigint unsigned  NOT NULL,
  `gclid`            varchar(255)     NOT NULL DEFAULT '',
  `utm_source_id`    int unsigned     NOT NULL DEFAULT 0,
  `utm_medium_id`    int unsigned     NOT NULL DEFAULT 0,
  `utm_campaign_id`  int unsigned     NOT NULL DEFAULT 0,
  `utm_term_id`      int unsigned     NOT NULL DEFAULT 0,
  `utm_content_id`   int unsigned     NOT NULL DEFAULT 0,
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Lookup / dimension tables referenced in queries ─────────────────────────

CREATE TABLE IF NOT EXISTS `tracking_c1` (
  `c1_id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1`    varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`c1_id`),
  KEY `idx_c1` (`c1`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tracking_c2` (
  `c2_id` int unsigned NOT NULL AUTO_INCREMENT,
  `c2`    varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`c2_id`),
  KEY `idx_c2` (`c2`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tracking_c3` (
  `c3_id` int unsigned NOT NULL AUTO_INCREMENT,
  `c3`    varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`c3_id`),
  KEY `idx_c3` (`c3`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tracking_c4` (
  `c4_id` int unsigned NOT NULL AUTO_INCREMENT,
  `c4`    varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`c4_id`),
  KEY `idx_c4` (`c4`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utm_source` (
  `utm_source_id` int unsigned NOT NULL AUTO_INCREMENT,
  `utm_source`    varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`utm_source_id`),
  UNIQUE KEY `uq_utm_source` (`utm_source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utm_medium` (
  `utm_medium_id` int unsigned NOT NULL AUTO_INCREMENT,
  `utm_medium`    varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`utm_medium_id`),
  UNIQUE KEY `uq_utm_medium` (`utm_medium`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utm_campaign` (
  `utm_campaign_id` int unsigned NOT NULL AUTO_INCREMENT,
  `utm_campaign`    varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`utm_campaign_id`),
  UNIQUE KEY `uq_utm_campaign` (`utm_campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utm_term` (
  `utm_term_id` int unsigned NOT NULL AUTO_INCREMENT,
  `utm_term`    varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`utm_term_id`),
  UNIQUE KEY `uq_utm_term` (`utm_term`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `utm_content` (
  `utm_content_id` int unsigned NOT NULL AUTO_INCREMENT,
  `utm_content`    varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`utm_content_id`),
  UNIQUE KEY `uq_utm_content` (`utm_content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `keywords` (
  `keyword_id` int unsigned NOT NULL AUTO_INCREMENT,
  `keyword`    varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`keyword_id`),
  KEY `idx_keyword` (`keyword`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `site_urls` (
  `site_url_id`      int unsigned NOT NULL AUTO_INCREMENT,
  `site_url_address` varchar(1024) NOT NULL DEFAULT '',
  PRIMARY KEY (`site_url_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Conversion and error logging ─────────────────────────────────────────────

-- Legacy PHP conversion_logs (note: 1ai_conversion_logs also exists for Node layer)
CREATE TABLE IF NOT EXISTS `conversion_logs` (
  `conversion_id`    bigint unsigned  NOT NULL AUTO_INCREMENT,
  `aff_campaign_id`  int unsigned     NOT NULL DEFAULT 0,
  `click_id`         bigint unsigned  NOT NULL DEFAULT 0,
  `click_payout`     decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `conversion_time`  int unsigned     NOT NULL DEFAULT 0,
  `pixel_payout`     decimal(10,4)    NOT NULL DEFAULT 0.0000,
  `use_pixel_payout` tinyint(1)       NOT NULL DEFAULT 0,
  `status`           tinyint(1)       NOT NULL DEFAULT 1,
  `txid`             varchar(255)     NOT NULL DEFAULT '',
  PRIMARY KEY (`conversion_id`),
  KEY `idx_click_id`        (`click_id`),
  KEY `idx_aff_campaign_id` (`aff_campaign_id`),
  KEY `idx_conversion_time` (`conversion_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mysql_errors` (
  `mysql_error_id`   int unsigned  NOT NULL AUTO_INCREMENT,
  `mysql_error_text` text,
  `mysql_error_sql`  text,
  `user_id`          int unsigned  NOT NULL DEFAULT 0,
  `ip_id`            int unsigned  NOT NULL DEFAULT 0,
  `site_id`          int unsigned  NOT NULL DEFAULT 0,
  `mysql_error_time` int unsigned  NOT NULL DEFAULT 0,
  PRIMARY KEY (`mysql_error_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `delayed_sqls` (
  `delayed_sql_id` int unsigned NOT NULL AUTO_INCREMENT,
  `delayed_sql`    text         NOT NULL,
  `delayed_time`   int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`delayed_sql_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Campaign / tracking infrastructure ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS `campaigns` (
  `aff_campaign_id`       int unsigned  NOT NULL AUTO_INCREMENT,
  `user_id`               int unsigned  NOT NULL DEFAULT 0,
  `aff_campaign_name`     varchar(255)  NOT NULL DEFAULT '',
  `aff_campaign_payout`   decimal(10,4) NOT NULL DEFAULT 0.0000,
  `aff_campaign_cloaking` tinyint(1)    NOT NULL DEFAULT 0,
  `aff_campaign_status`   tinyint(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (`aff_campaign_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `trackers` (
  `tracker_id`          int unsigned NOT NULL AUTO_INCREMENT,
  `tracker_id_public`   varchar(32)  NOT NULL DEFAULT '',
  `user_id`             int unsigned NOT NULL DEFAULT 0,
  `aff_campaign_id`     int unsigned NOT NULL DEFAULT 0,
  `landing_page_id`     int unsigned NOT NULL DEFAULT 0,
  `ppc_account_id`      int unsigned NOT NULL DEFAULT 0,
  `text_ad_id`          int unsigned NOT NULL DEFAULT 0,
  `click_cpc`           decimal(10,4) NOT NULL DEFAULT 0.0000,
  `click_cloaking`      tinyint(1)   NOT NULL DEFAULT -1,
  `tracker_status`      tinyint(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`tracker_id`),
  KEY `idx_tracker_id_public` (`tracker_id_public`),
  KEY `idx_user_id`           (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `landing_pages` (
  `landing_page_id`      int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`              int unsigned NOT NULL DEFAULT 0,
  `landing_page_url`     varchar(1024) NOT NULL DEFAULT '',
  `landing_page_status`  tinyint(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`landing_page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ppc_accounts` (
  `ppc_account_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`          int unsigned NOT NULL DEFAULT 0,
  `ppc_account_name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`ppc_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `text_ads` (
  `text_ad_id`     int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`        int unsigned NOT NULL DEFAULT 0,
  `text_ad_name`   varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`text_ad_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Rotator ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `rotators` (
  `rotator_id`        int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`           int unsigned NOT NULL DEFAULT 0,
  `rotator_name`      varchar(255) NOT NULL DEFAULT '',
  `rotator_status`    tinyint(1)   NOT NULL DEFAULT 1,
  `user_keyword_searched_or_bidded` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`rotator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rotator_rules` (
  `rule_id`        int unsigned NOT NULL AUTO_INCREMENT,
  `rotator_id`     int unsigned NOT NULL DEFAULT 0,
  `rule_weight`    int unsigned NOT NULL DEFAULT 1,
  `rule_status`    tinyint(1)   NOT NULL DEFAULT 1,
  `aff_campaign_id` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`rule_id`),
  KEY `idx_rotator_id` (`rotator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── GeoIP lookup tables (populated by GeoIP enrichment pipeline) ─────────────

CREATE TABLE IF NOT EXISTS `ip_addresses` (
  `ip_id`         int unsigned NOT NULL AUTO_INCREMENT,
  `ip_address`    varchar(45)  NOT NULL DEFAULT '',
  `ip_type`       enum('ipv4','ipv6') NOT NULL DEFAULT 'ipv4',
  PRIMARY KEY (`ip_id`),
  KEY `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `countries` (
  `country_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `country_code` char(2)      NOT NULL DEFAULT '',
  `country_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`country_id`),
  UNIQUE KEY `uq_country_code` (`country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `regions` (
  `region_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `region_name` varchar(100) NOT NULL DEFAULT '',
  `country_id`  int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`region_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `cities` (
  `city_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) NOT NULL DEFAULT '',
  `region_id` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `isps` (
  `isp_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `isp_name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`isp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `platforms` (
  `platform_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `platform_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `browsers` (
  `browser_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `browser_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`browser_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `devices` (
  `device_id`   int unsigned NOT NULL AUTO_INCREMENT,
  `device_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── DataEngine aggregation ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `dataengine` (
  `dataengine_id`      bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`            int unsigned    NOT NULL DEFAULT 0,
  `aff_campaign_id`    int unsigned    NOT NULL DEFAULT 0,
  `landing_page_id`    int unsigned    NOT NULL DEFAULT 0,
  `ppc_account_id`     int unsigned    NOT NULL DEFAULT 0,
  `text_ad_id`         int unsigned    NOT NULL DEFAULT 0,
  `keyword_id`         int unsigned    NOT NULL DEFAULT 0,
  `country_id`         int unsigned    NOT NULL DEFAULT 0,
  `region_id`          int unsigned    NOT NULL DEFAULT 0,
  `city_id`            int unsigned    NOT NULL DEFAULT 0,
  `browser_id`         int unsigned    NOT NULL DEFAULT 0,
  `platform_id`        int unsigned    NOT NULL DEFAULT 0,
  `device_id`          int unsigned    NOT NULL DEFAULT 0,
  `isp_id`             int unsigned    NOT NULL DEFAULT 0,
  `dataengine_hour`    int unsigned    NOT NULL DEFAULT 0,
  `clicks`             int unsigned    NOT NULL DEFAULT 0,
  `clicks_filtered`    int unsigned    NOT NULL DEFAULT 0,
  `leads`              int unsigned    NOT NULL DEFAULT 0,
  `revenue`            decimal(12,4)   NOT NULL DEFAULT 0.0000,
  `cost`               decimal(12,4)   NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (`dataengine_id`),
  UNIQUE KEY `uq_dataengine_hour` (`user_id`,`aff_campaign_id`,`landing_page_id`,`ppc_account_id`,`text_ad_id`,`keyword_id`,`country_id`,`browser_id`,`platform_id`,`device_id`,`isp_id`,`dataengine_hour`),
  KEY `idx_user_id`         (`user_id`),
  KEY `idx_aff_campaign_id` (`aff_campaign_id`),
  KEY `idx_dataengine_hour` (`dataengine_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `dataengine_dirty` (
  `click_id`       bigint unsigned NOT NULL,
  `dirty_hour`     int unsigned    NOT NULL DEFAULT 0,
  `processed`      tinyint(1)      NOT NULL DEFAULT 0,
  `created_at`     int unsigned    NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`click_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Attribution tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `conversion_journeys` (
  `journey_id`      bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversion_id`   bigint unsigned NOT NULL,
  `aff_campaign_id` int unsigned    NOT NULL DEFAULT 0,
  `user_id`         int unsigned    NOT NULL DEFAULT 0,
  `touchpoint_count` int unsigned   NOT NULL DEFAULT 0,
  `model_id`        int unsigned    NOT NULL DEFAULT 0,
  `created_at`      int unsigned    NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`journey_id`),
  KEY `idx_conversion_id`   (`conversion_id`),
  KEY `idx_aff_campaign_id` (`aff_campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_models` (
  `model_id`         int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`          int unsigned NOT NULL DEFAULT 0,
  `model_name`       varchar(100) NOT NULL DEFAULT '',
  `model_type`       varchar(50)  NOT NULL DEFAULT 'last_touch',
  `weighting_config` json         DEFAULT NULL,
  `is_default`       tinyint(1)   NOT NULL DEFAULT 0,
  `created_at`       int unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `updated_at`       int unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`model_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_snapshots` (
  `snapshot_id`     bigint unsigned NOT NULL AUTO_INCREMENT,
  `model_id`        int unsigned    NOT NULL DEFAULT 0,
  `snapshot_hour`   int unsigned    NOT NULL DEFAULT 0,
  `total_credit`    decimal(12,4)   NOT NULL DEFAULT 0.0000,
  `created_at`      int unsigned    NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`snapshot_id`),
  KEY `idx_model_id`      (`model_id`),
  KEY `idx_snapshot_hour` (`snapshot_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_touchpoints` (
  `touchpoint_id`  bigint unsigned NOT NULL AUTO_INCREMENT,
  `snapshot_id`    bigint unsigned NOT NULL,
  `click_id`       bigint unsigned NOT NULL DEFAULT 0,
  `conversion_id`  bigint unsigned NOT NULL DEFAULT 0,
  `credit`         decimal(12,6)   NOT NULL DEFAULT 0.000000,
  `position`       int unsigned    NOT NULL DEFAULT 0,
  `created_at`     int unsigned    NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`touchpoint_id`),
  KEY `idx_snapshot_id`   (`snapshot_id`),
  KEY `idx_conversion_id` (`conversion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_settings` (
  `setting_id`  int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`     int unsigned NOT NULL DEFAULT 0,
  `setting_key` varchar(100) NOT NULL DEFAULT '',
  `setting_val` text,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `uq_user_key` (`user_id`, `setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_audit_log` (
  `audit_id`    bigint unsigned NOT NULL AUTO_INCREMENT,
  `model_id`    int unsigned    NOT NULL DEFAULT 0,
  `action`      varchar(50)     NOT NULL DEFAULT '',
  `detail`      text,
  `created_at`  int unsigned    NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attribution_export_jobs` (
  `job_id`      int unsigned NOT NULL AUTO_INCREMENT,
  `user_id`     int unsigned NOT NULL DEFAULT 0,
  `model_id`    int unsigned NOT NULL DEFAULT 0,
  `status`      enum('pending','running','done','failed') NOT NULL DEFAULT 'pending',
  `file_path`   varchar(512) DEFAULT NULL,
  `created_at`  int unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `finished_at` int unsigned DEFAULT NULL,
  PRIMARY KEY (`job_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Users (legacy PHP schema) ────────────────────────────────────────────────

-- PHP tracking code uses bare 'users' table; create it aliased to 1ai_users data
CREATE TABLE IF NOT EXISTS `users` (
  `user_id`           int unsigned NOT NULL AUTO_INCREMENT,
  `user_name`         varchar(100) NOT NULL DEFAULT '',
  `user_email`        varchar(150) NOT NULL DEFAULT '',
  `user_pass`         varchar(255) NOT NULL DEFAULT '',
  `user_level`        tinyint(1)   NOT NULL DEFAULT 1,
  `user_role`         varchar(20)  NOT NULL DEFAULT 'affiliate',
  `user_timezone`     varchar(50)  NOT NULL DEFAULT 'UTC',
  `user_date_added`   int unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  `user_pass_key`     varchar(64)  DEFAULT NULL,
  `user_pass_time`    int unsigned DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `idx_user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Session/server state ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `server_state` (
  `state_key`   varchar(100) NOT NULL,
  `state_value` text,
  `updated_at`  int unsigned NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  PRIMARY KEY (`state_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
