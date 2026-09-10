-- Smartlink registration tracking (content_tracked workflow: 1ai-hub -> 1ai-affiliate)
-- Records which smartlink slugs were registered by which workflow/category so
-- attribution and analytics can join slug -> workflow without touching 1ai_affiliate_links.

CREATE TABLE IF NOT EXISTS 1ai_smartlink_registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(80) NOT NULL COMMENT '1ai_affiliate_links.slug',
  category VARCHAR(100) NULL,
  workflow VARCHAR(64) NULL,
  created_at INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  KEY idx_workflow (workflow)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
