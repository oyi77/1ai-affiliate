# 1ai-Affiliate ClickServer

Self-hosted campaign tracking and marketing analytics platform. Track clicks, conversions, and revenue across any traffic source with full data ownership — your data stays on your servers.

## 🏗️ Integrated Architecture

This platform now runs as a **polyglot stack** with three cooperating servers:

| Layer | Tech | Purpose |
|-------|------|---------|
| **PHP 8.3+** | Laravel-style + Slim | Core tracking & APIs (v2/v3), admin SPA, offer/rotator/attribution engines, Go CLI, edge redirector |
| **Node.js (Express)** | `server/app.js` on port 3001 | Companion services: auth, payment (Tripay), smartlinks, **Telegram poster**, **Funnel pipeline** (FB/IG video), AI content, geo, settings, postback queue |
| **Go** | `edge/cmd/edgeredirect` | Ultra-fast redirect microservice (Redis + GeoIP + fraud + Kafka) |

> **Key integration**: The Node.js companion server now **absorbs** the external Telegram poster and Funnel pipeline services — they are no longer external Python scripts but native Node modules (`server/services/posterService.js`, `server/services/pipelineService.js`). Both services mint **tracked smartlinks** via `smartlinkService.mintSmartlink()` so every posted affiliate link becomes a `/go/<slug>` redirect that the PHP platform attributes for click→conversion tracking.

### Sibling Services (absorbed)

| Service | Was | Now | Integration |
|---------|-----|-----|-------------|
| **Telegram Poster** | `telegram-poster/poster.py` (Python) | `server/services/posterService.js` + `posterWorker.js` + `/api/poster` | Native Node; mints smartlinks via `mintSmartlink()`; scheduled cron |
| **Funnel Pipeline** | `funnel-pipeline/scripts/affiliate_content_pipeline.py` (Python) | `server/services/pipelineService.js` + `pipelineWorker.js` + `/api/pipeline` | Native Node; mints tracked smartlinks per niche; FB/IG posting |
| **Affiliate Core** | `affiliate-core/` (Supabase + Fly.io) | Separate product; shared JWT contract | Not merged — runs independently on Fly.io |
| **jendralbot** | `jendralbot/index.html` (static) | Landing page candidate | To be served as root `/` with tracked smartlink CTAs |

### Data Layer

- **MySQL 8** — System of record for all PHP + Node services
- **Redis** — Session cache, edge redirector lookup, rate limits
- **ClickHouse** — Cold-path click analytics (via Go consumer)
- **Kafka** — Click event stream (Go edge → ClickHouse)

### Telemetry & Monitoring

- **Prometheus + Grafana** (included in docker-compose)
- **BullMQ Dashboard** (`/api/bull-dashboard` on Node) for queue observability
- **Structured logging** via Pino (Node) + Monolog (PHP)

---

## Key Features


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
