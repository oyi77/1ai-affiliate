-- Ad-block visitor tracking table
-- Created: 2026-07-14

CREATE TABLE IF NOT EXISTS `1ai_ad_block_visitors` (
    `visitor_id` VARCHAR(128) NOT NULL COMMENT 'Browser/device fingerprint',
    `hits` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total ad-block hits',
    `first_seen` INT UNSIGNED NOT NULL COMMENT 'First detection timestamp',
    `last_seen` INT UNSIGNED NOT NULL COMMENT 'Last detection timestamp',
    PRIMARY KEY (`visitor_id`),
    KEY `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Ad-block visitor hit counter';
