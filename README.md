# 1ai-Affiliate ClickServer

Self-hosted campaign tracking and marketing analytics platform. Track clicks, conversions, and revenue across any traffic source with full data ownership — your data stays on your servers.

Since 2007, 1ai-Affiliate has helped marketers take control of their tracking with an open, self-hosted platform that works with any traffic source, any offer, and any network.

## Key Features

- **Self-Hosted & Full Source Code** — Run 1ai-Affiliate 100% on your own servers for ultimate control of your proprietary data and marketing methods. Customize the full source code to meet your needs.
- **Click & Conversion Tracking** — Real-time click capture with sub-ID parameters, referrer tracking, and automatic IP/UA logging. Server-to-server postback and pixel tracking with revenue, payout, and status fields.
- **12+ Report Types** — Keywords, geo, device, browser, OS, referrer, ISP, landing page, and custom dimension reports. Track profit and loss, conversion metrics, EPC per keyword, per text ad, per referrer, and more.
- **Multi-Touch Attribution** — Five attribution models including last-touch, time-decay, position-based, and algorithmic.
- **Split Testing** — Run unlimited weighted split tests to discover your best marketing message and offer. Pause non-converting tests and automatically send all traffic to the winner.
- **Smart Redirector & Traffic Rules** — Rule-based traffic distribution with weighted rotation, geo-targeting, and device filtering.
- **BlazerCache Technology** — Fast redirects that continue working even if the database goes down, preventing lost revenue.
- **Fraud Prevention** — Sentinel Traffic Quality Enforcer (T.Q.E.) redirects potentially fraudulent traffic away from your landing pages.
- **Landing Page Personalization** — Dynamically display ISP, device, postal code, geo location, keyword, UTM variables, browser, OS, and more on your landing pages.
- **Device Detection** — Automatically detect device types and models for full insights into mobile-targeted campaigns.
- **Deep Linking** — Boost conversion rates by deep linking directly into apps, reducing friction for users.
- **Custom Domains for Smartlinks** — Configure custom domains (e.g., go.yourdomain.com, r.yourdomain.com) for branded smartlink redirects. Set default domains, manage SSL, and route traffic through cf-router for high-throughput deployments.
- **URL Shortener Integration** — Connect Bitly, TinyURL, Rebrandly, Cutt.ly, Short.io, or custom API endpoints to automatically shorten smartlinks. Configure API keys, rate limits, and branded short domains.
- **Team Access** — Full role-based authentication with no limit on users and no per-seat costs.

## Requirements

- PHP 8.3+
- MySQL 8.0+
- Web server: **Nginx with PHP-FPM (recommended for manual installs)** or **Apache** (as used in the official Docker image)
- Composer
- Go 1.22+ (optional, for the Go CLI)

## Installation

### Quick Install

```bash
git clone https://github.com/tracking1ai/1ai-affiliate.git
cd 1ai-affiliate
./install.sh
```

The install script will:
- Check for PHP and Composer (installs Composer if missing)
- Install PHP dependencies
- Create config file from sample

### Docker

```bash
git clone https://github.com/tracking1ai/1ai-affiliate.git
cd 1ai-affiliate
docker compose up -d
```

Dependencies are automatically installed on container startup.

- Application: `http://localhost:8000`
- phpMyAdmin: `http://localhost:8080`

### Manual Installation

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/tracking1ai/1ai-affiliate.git
   cd 1ai-affiliate
   composer install --no-dev
   ```

2. Configure the application:
   ```bash
   cp 1ai-config-sample.php 1ai-config.php
   # Edit 1ai-config.php with your database credentials
   ```

3. Configure nginx to point to the project root. Example site configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/1ai-affiliate;
       index index.php index.html;

       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }

       location /api/v3/ {
           try_files $uri $uri/ /api/v3/index.php?$query_string;
       }

       location /api/v2/ {
           try_files $uri $uri/ /api/v2/index.php?$query_string;
       }

       location ~ \.php$ {
           fastcgi_pass unix:/path/to/php-fpm.sock; # or fastcgi_pass 127.0.0.1:9000; adjust to your PHP-FPM setup
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }

       location ~ /\. {
           deny all;
       }
   }
   ```

4. Reload nginx:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. Access the application in your browser.

## API v3

REST API under `/api/v3/` with bearer token authentication. Covers all 1ai-Affiliate entities: campaigns, networks, traffic sources, trackers, landing pages, text ads, clicks, conversions, rotators, attribution models, users, and system operations.

```bash
curl -H "Authorization: Bearer <api-key>" https://your-server/api/v3/campaigns
```

## CLI Tools

### PHP CLI (`bin/p1ai`)

Symfony Console CLI for managing remote 1ai-Affiliate installations.

```bash
# Configure
bin/p1ai config:set-url https://your-server
bin/p1ai config:set-key <api-key>

# Use
bin/p1ai campaign:list
bin/p1ai tracker:get 42
bin/p1ai rotator:create --name "My Rotator"
```

### Go CLI (`go-cli/`)

Cross-platform Go CLI with `--json` output for scripting and agent consumption.

```bash
cd go-cli
make build

./p1ai config set-url https://your-server
./p1ai config set-key <api-key>
./p1ai campaign list --json
./p1ai sync all
```

## Development Setup

```bash
composer install
```

### Running Tests

```bash
# PHP tests
composer test

# Go CLI tests
cd go-cli && make test
```

### Linting

```bash
./scripts/php-lint.sh
```

## Configuration

- **Main config**: `1ai-config.php` (created from `1ai-config-sample.php`)
- **Database**: MySQL/MariaDB with optional read replica support
- **Caching**: Memcached integration available

## Custom Domains & URL Shorteners

### Smartlink Custom Domains

Configure custom domains for branded smartlink redirects:

1. **Add Domain** — Via admin panel (`/admin/index.html#domains`) or API:
   ```bash
   curl -X POST https://your-server/api/admin/domains \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{"domain":"go.yourdomain.com","is_active":true,"ssl_enabled":true}'
   ```

2. **Set Default** — Mark one domain as default for new smartlinks

3. **DNS Configuration** — Point your domain to the cf-router server:
   ```
   go.yourdomain.com → CNAME → cf-router.example.com
   ```

4. **Generate Smartlink** — Specify domain when creating:
   ```bash
   curl -X POST https://your-server/api/smartlink/generate \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{"offer_id":1,"domain_id":1}'
   ```

### URL Shortener Integration

Configure URL shorteners (Bitly, TinyURL, Rebrandly, Cutt.ly, Short.io, or custom):

1. **Configure Service** — Via admin panel (`/admin/index.html#shorteners`) or API:
   ```bash
   curl -X POST https://your-server/api/admin/shorteners \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{"name":"My Bitly","service_type":"bitly","api_key":"YOUR_API_KEY","is_active":true}'
   ```

2. **Generate Shortened Smartlink**:
   ```bash
   curl -X POST https://your-server/api/smartlink/generate \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{"offer_id":1,"shortener_service_id":1}'
   ```

3. **Test Shortener**:
   ```bash
   curl -X POST https://your-server/api/admin/shorteners/1/test \
     -H "Authorization: Bearer <api-key>" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com"}'
   ```

### Database Tables

- `1ai_smartlink_domains` — Custom domains for smartlinks
- `1ai_url_shortener_services` — URL shortener configurations
- `1ai_short_url_logs` — Analytics for shortened URLs
- `1ai_affiliate_links` — Extended with `domain_id`, `short_url`, `shortener_service_id`

## Directory Structure
## License

Business Source License 1.1 (BUSL-1.1) — see [LICENSE](LICENSE) for the full text.

- **Licensor:** Blue Terra LLC
- **Licensed Work:** 1ai-Affiliate
- **Additional Use Grant:** You may use the Licensed Work for any purpose, including production use, except you may not offer it as a hosted or managed service to third parties.
- **Change Date:** 2031-02-22
- **Change License:** GPL-2.0-or-later
