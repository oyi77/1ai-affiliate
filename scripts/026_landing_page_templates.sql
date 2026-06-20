-- Landing page templates table
-- Supports built-in (user_id=0), admin-created, and user-uploaded templates

CREATE TABLE IF NOT EXISTS `landing_page_templates` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0 = built-in/system template',
  `name`            VARCHAR(200) NOT NULL,
  `slug`            VARCHAR(200) NOT NULL,
  `category`        ENUM('sweepstakes','vsl','ecommerce','crypto','dating','gaming','finance','leadgen','custom') NOT NULL DEFAULT 'custom',
  `description`     TEXT,
  `thumbnail_url`   VARCHAR(500) DEFAULT NULL,
  `html_template`   LONGTEXT NOT NULL COMMENT 'Full HTML with {{placeholders}}',
  `fields`          JSON NOT NULL COMMENT 'Array of configurable field definitions',
  `tags`            JSON DEFAULT NULL,
  `ctr_score`       DECIMAL(5,2) DEFAULT 0 COMMENT 'Historical CTR if tracked',
  `is_public`       TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = visible to all users',
  `status`          ENUM('active','draft','archived') NOT NULL DEFAULT 'active',
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_user` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User template collections (for import/upload tracking)
CREATE TABLE IF NOT EXISTS `user_template_collections` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`         INT UNSIGNED NOT NULL,
  `template_id`     INT UNSIGNED NOT NULL,
  `custom_name`     VARCHAR(200) DEFAULT NULL,
  `custom_html`     LONGTEXT DEFAULT NULL COMMENT 'User-overridden HTML',
  `custom_fields`   JSON DEFAULT NULL COMMENT 'User-overridden field values',
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_template` (`user_id`, `template_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
