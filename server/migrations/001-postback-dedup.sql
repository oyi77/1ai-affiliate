-- Clean up existing duplicates (KEEP MOST RECENT)
DELETE FROM 1ai_postback_logs WHERE id NOT IN (
  SELECT id FROM (
    SELECT MAX(id) as id FROM 1ai_postback_logs 
    GROUP BY offer_id, click_id
  ) t
);

-- Add unique constraint
ALTER TABLE 1ai_postback_logs 
ADD UNIQUE KEY IF NOT EXISTS uk_offer_click (offer_id, click_id) 
COMMENT 'Prevent duplicate postbacks for same click';
