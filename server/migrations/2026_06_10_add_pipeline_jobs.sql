CREATE TABLE IF NOT EXISTS 1ai_pipeline_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  niche VARCHAR(50) DEFAULT 'auto',
  status ENUM('queued','downloading','processing','posting_fb','posting_ig','completed','failed') DEFAULT 'queued',
  steps JSON NULL,
  result JSON NULL,
  error TEXT NULL,
  created_at INT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
