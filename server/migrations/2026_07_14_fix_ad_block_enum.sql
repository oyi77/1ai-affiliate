-- Fix ad_block_log detection_method: ENUM → VARCHAR(64)
-- The ENUM rejects valid method values from browser scripts (e.g. 'canvas')
-- Created: 2026-07-14

ALTER TABLE `1ai_ad_block_log`
  MODIFY COLUMN `detection_method` VARCHAR(64) DEFAULT NULL
  COMMENT 'Detection method (free-form — sent by browser script)';
