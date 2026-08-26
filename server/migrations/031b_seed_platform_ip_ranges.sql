-- Migration 031b: Seed platform IP ranges from hardcoded constants
-- Sources: PLATFORM_REVIEWER_RANGES + PLATFORM_EMPLOYEE_RANGES

-- Facebook reviewer IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('facebook', 'reviewer', '66.220.144.0/20', 'Meta crawler range'),
('facebook', 'reviewer', '69.63.176.0/20', 'Meta crawler range'),
('facebook', 'reviewer', '69.171.224.0/20', 'Meta crawler range'),
('facebook', 'reviewer', '74.119.76.0/22', 'Meta crawler range'),
('facebook', 'reviewer', '103.4.96.0/22', 'Meta crawler range'),
('facebook', 'reviewer', '173.252.64.0/18', 'Meta crawler range'),
('facebook', 'reviewer', '204.15.20.0/22', 'Meta crawler range');

-- Meta employee/internal IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('meta', 'employee', '157.240.0.0/16', 'Meta primary'),
('meta', 'employee', '129.134.0.0/16', 'Meta internal'),
('meta', 'employee', '157.240.192.0/18', 'Meta internal'),
('meta', 'employee', '31.13.24.0/21', 'Meta/WhatsApp'),
('meta', 'employee', '31.13.64.0/18', 'Meta/Instagram'),
('meta', 'employee', '66.220.144.0/20', 'Meta infrastructure'),
('meta', 'employee', '69.171.224.0/18', 'Meta'),
('meta', 'employee', '69.171.248.0/21', 'Meta employees');

-- Google reviewer IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('google', 'reviewer', '66.249.64.0/19', 'Google crawler range'),
('google', 'reviewer', '72.14.192.0/18', 'Google crawler range'),
('google', 'reviewer', '74.125.0.0/16', 'Google crawler range'),
('google', 'reviewer', '108.177.8.0/21', 'Google crawler range'),
('google', 'reviewer', '173.194.0.0/16', 'Google crawler range'),
('google', 'reviewer', '209.85.128.0/17', 'Google crawler range');

-- Google employee/internal IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('google', 'employee', '8.8.8.0/24', 'Google DNS'),
('google', 'employee', '8.8.4.0/24', 'Google DNS'),
('google', 'employee', '23.236.48.0/20', 'Google Cloud'),
('google', 'employee', '34.64.0.0/10', 'Google Cloud'),
('google', 'employee', '35.186.0.0/16', 'Google Cloud'),
('google', 'employee', '35.190.0.0/16', 'Google Cloud'),
('google', 'employee', '35.191.0.0/16', 'Google Cloud'),
('google', 'employee', '104.154.0.0/15', 'Google Cloud'),
('google', 'employee', '142.250.0.0/15', 'Google'),
('google', 'employee', '172.217.0.0/16', 'Google'),
('google', 'employee', '216.58.192.0/19', 'Google');

-- TikTok reviewer IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('tiktok', 'reviewer', '161.117.0.0/16', 'TikTok content review'),
('tiktok', 'reviewer', '47.74.0.0/16', 'TikTok content review'),
('tiktok', 'reviewer', '47.88.0.0/16', 'TikTok content review');

-- TikTok employee/internal IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('tiktok', 'employee', '161.117.0.0/16', 'ByteDance'),
('tiktok', 'employee', '47.74.0.0/16', 'ByteDance'),
('tiktok', 'employee', '47.88.0.0/16', 'ByteDance'),
('tiktok', 'employee', '103.126.92.0/23', 'ByteDance'),
('tiktok', 'employee', '103.155.56.0/23', 'ByteDance');

-- Bing reviewer IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('bing', 'reviewer', '13.64.0.0/11', 'Bing crawler range'),
('bing', 'reviewer', '40.64.0.0/10', 'Bing crawler range'),
('bing', 'reviewer', '104.208.0.0/13', 'Bing crawler range');

-- Bing employee/internal IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('bing', 'employee', '104.208.0.0/13', 'Microsoft internal'),
('bing', 'employee', '20.33.0.0/16', 'Microsoft internal');

-- Twitter/X reviewer IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('twitter', 'reviewer', '199.16.156.0/22', 'Twitter primary'),
('twitter', 'reviewer', '199.96.57.0/24', 'Twitter'),
('twitter', 'reviewer', '199.96.58.0/24', 'Twitter'),
('twitter', 'reviewer', '199.96.59.0/24', 'Twitter'),
('twitter', 'reviewer', '199.59.148.0/22', 'Twitter'),
('twitter', 'reviewer', '202.160.128.0/22', 'Twitter Asia'),
('twitter', 'reviewer', '209.237.192.0/19', 'Twitter legacy'),
('twitter', 'reviewer', '104.244.42.0/21', 'Twitter'),
('twitter', 'reviewer', '185.45.5.0/24', 'X Corp');

-- Twitter/X employee/internal IP ranges
INSERT IGNORE INTO `1ai_platform_ip_ranges` (`platform`, `range_type`, `ip_range`, `description`) VALUES
('twitter', 'employee', '104.244.42.0/24', 'X Corp internal'),
('twitter', 'employee', '199.16.156.0/22', 'X Corp internal');
