-- Rollback for 026_landing_page_templates.sql
-- Generated from forward migration
-- REVIEW before applying: verify no data loss is acceptable

DROP TABLE IF EXISTS `user_template_collections`;
DROP TABLE IF EXISTS `landing_page_templates`;
