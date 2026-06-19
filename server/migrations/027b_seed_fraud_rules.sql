-- Migration 027b: Seed fraud rules from consolidated bot signatures
-- Inserts ~85 deduplicated bot UA patterns and velocity rules into 1ai_fraud_rules

-- Bot UA patterns (consolidated from Node 64 + PHP 20 + Go 33)
INSERT IGNORE INTO `1ai_fraud_rules` (name, rule_type, target, `condition`, score_weight, priority, is_active, created_at, updated_at) VALUES
('Search Engine Bots', 'ua_blacklist', 'click', '{"patterns":["googlebot","bingbot","slurp","duckduckbot","baiduspider","yandexbot","facebot","facebookexternalhit","twitterbot","linkedinbot","pinterestbot","applebot","ia_archiver"]}', 0.500, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('SEO Tools', 'ua_blacklist', 'click', '{"patterns":["ahrefsbot","semrushbot","mozbot","majestic-12","rogerbot","exabot","screaming frog","seznambot","dotbot","spider","megaindex","sogou","exalead","gigablast"]}', 0.500, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Monitoring Tools', 'ua_blacklist', 'click', '{"patterns":["pingdom","newrelicpinger","datadog","uptimerobot","site24x7","statuscake","monitis","keycdn","gtmetrix","webpagetest","lighthouse","pagespeed"]}', 0.300, 200, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Headless Browsers', 'ua_blacklist', 'click', '{"patterns":["headlesschrome","headless","phantomjs","slimerjs","selenium","puppeteer","playwright","cypress","nightmare","zombie","casperjs"]}', 0.800, 50, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Generic Crawlers', 'ua_blacklist', 'click', '{"patterns":["crawler","crawling","scraper","scrapy","wget","python-requests","python-urllib","go-http-client","libwww-perl","httpclient","okhttp","apache-httpclient","node-fetch"]}', 0.600, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Bot Frameworks', 'ua_blacklist', 'click', '{"patterns":["bot","nutch","heritrix","mj12bot","btwebclient","a6-indexer","netcraft","masscan","zgrab","nmap","nikto","nessus","openvas"]}', 0.700, 80, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Attack Tools', 'ua_blacklist', 'click', '{"patterns":["sqlmap","dirbuster","gobuster","wfuzz","hydra","metasploit","burpsuite"]}', 0.900, 30, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Misc Bots', 'ua_blacklist', 'click', '{"patterns":["msnbot","mediapartners-google","adsbot-google","feedfetcher-google","proximic","zoominfobot","meanpathbot","spinn3r","genieo","bloglovin","flipboardproxy","tumblr","archive.org","wayback","ccbot","commoncrawl","bytespider","petalbot","yisouspider"]}', 0.400, 150, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('Empty User-Agent', 'ua_blacklist', 'click', '{"patterns":[""]}', 0.200, 200, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- Velocity rules
('Extreme Click Velocity', 'click_velocity', 'click', '{"threshold":50,"window_seconds":60}', 0.400, 60, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('High Click Velocity', 'click_velocity', 'click', '{"threshold":10,"window_seconds":60}', 0.200, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('IP Velocity Spike', 'ip_velocity', 'click', '{"threshold":30,"window_seconds":60}', 0.300, 80, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- Geo/VPN rules
('Datacenter IP', 'geo_vpn', 'both', '{"check":"datacenter"}', 0.300, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('VPN/Proxy IP', 'geo_vpn', 'both', '{"check":"proxy"}', 0.400, 80, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
