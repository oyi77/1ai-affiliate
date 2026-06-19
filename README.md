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

## 🐳 Deployment with cf-router (Recommended)

The platform is designed to run behind **cf-router** for nginx reverse proxy, Cloudflare DNS, and SSL management. cf-router handles Cloudflare DNS, TLS (via Cloudflare proxy), and nginx reverse proxy configs automatically.

### Prerequisites
| Component | Version |
|-----------|---------|
| Docker | 24+ |
| Docker Compose | v2+ |
| cf-router | Running separately on host/port 3002 |
| Cloudflare Account | With API Token (Zone:DNS:Edit) |

### Quick Start (Docker + cf-router)

```bash
# 1. Clone and prepare
git clone https://github.com/oyi77/1ai-affiliate.git
cd 1ai-affiliate
cp .env.example .env
# Edit .env with your credentials

# 2. Build and start the stack
docker compose up -d --build

# 3. Run migrations
docker compose exec php php scripts/migrate.php

# 4. Verify services
docker compose ps
# Should show: db, redis, php, node, (phpmyadmin if profile tools)
```

### Register with cf-router (Automated nginx + Cloudflare DNS)

Run cf-router on a separate host/port (default port 3002):
```bash
# On cf-router host
cd ~/projects/1ai-cf-router
npm install
npm run dev
```

```bash
# 1. Add Cloudflare account
cf-router account:add --name "BerkahKarya" --email "your@email.com" --api-key "cf_api_token_with_zone_dns_edit"

# 2. Discover zones
cf-router zone:discover --account <account_id>

# 3. Add your domain zone
cf-router zone:add --account <account_id> --zone-id <zone_id> --domain berkahkarya.org

# 4. Add mapping for affiliate subdomains
cf-router mapping:add --domain berkahkarya.org --subdomain affiliate --port 80 --host php
cf-router mapping:add --domain berkahkarya.org --subdomain affiliate-api --port 3001 --host node
cf-router mapping:add --domain berkahkarya.org --subdomain affiliate-tools --port 80 --host phpmyadmin
cf-router mapping:add --domain berkahkarya.org --subdomain docs --port 3000 --host playbook
```

> After adding mappings, cf-router automatically:
> 1. Creates Cloudflare DNS records (proxied = true, SSL via Cloudflare)
> 3. Generates nginx reverse proxy configs pointing to `php:80`, `node:3001`, etc.
> 4. Reloads nginx
> 4. SSL handled by Cloudflare proxy (orange cloud)

### Resulting URLs
| Subdomain | Proxies To | Purpose |
|-----------|------------|---------|
| `affiliate.berkahkarya.org` | `php:80` | Main PHP app (tracking, admin, API v2/v3) |
| `affiliate-api.berkahkarya.org` | `node:3001` | Node companion (smartlinks, poster, pipeline, auth) |
| `affiliate-tools.berkahkarya.org` | `phpmyadmin:80` | phpMyAdmin (optional, `tools` profile) |

### SSL/TLS
- **Terminated at Cloudflare** (orange cloud = proxied)
- No SSL cert management needed on your server
- Cloudflare handles TLS 1.3, automatic cert renewal

### Docker Compose Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| `default` | db, redis, php, node | Production |
| `tools` | + phpmyadmin, mailhog | Development/debug |

```bash
# Start with tools
docker compose --profile tools up -d

# Access phpMyAdmin at http://localhost:8080 (if local) or via cf-router tools subdomain
# Access Mailhog UI at http://localhost:8025
```

### Environment Variables

All configuration via `.env` file (copy from `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_ROOT_PASSWORD` | MySQL root password | `secure_root_pass` |
| `DB_NAME` | Database name | `Prosper1ai` |
| `DB_USER` | DB user | `affiliate` |
| `DB_PASSWORD` | DB password | `affiliate_pass` |
| `DB_ROOT_PASSWORD` | MySQL root | `root_password` |
| `JWT_SECRET` | Shared JWT secret (PHP + Node) | `long_random_string` |
| `CF_DOMAIN` | Base domain for smartlinks | `affiliate.berkahkarya.org` |
| `TG_BOT_TOKEN` | Telegram bot token (for poster) | `123:ABC...` |
| `TG_CHANNEL_ID` | Telegram channel | `-1001234567890` |
| `TRIPAY_*` | Tripay payment gateway | (see .env.example) |
| `FB_PAGES_JSON` | Facebook pages config | `'[{"id":"...","token":"...","niche":"hijab"}]'` |
| `IG_ACCOUNTS_JSON` | Instagram accounts | `'[{"id":"...","token":"...","niche":"hijab"}]'` |
| `SHOPEE_LINKS_JSON` | Shopee affiliate links per niche | `'{"hijab":"https://lynk.id/..."}'` |
| `EBOOK_API_URL` | Ebook service URL | `http://ebook:8765` |

### Manual Installation (Legacy)
### Docker Compose Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| `default` | db, redis, php, node | Production |
| `tools` | + phpmyadmin, mailhog | Development/debug |
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

## React SPA Frontend (Crystal UI)

As of June 2026, the platform ships with a modern React 19 Single Page Application:

```
frontend/
├── src/pages/         # 28 production pages
├── src/components/ui/ # GlassCard, StatCard, DataTable, Modal, SlideOver
├── src/layout/        # Shell with 27-item sidebar navigation
├── src/lib/api.js     # Axios + JWT auth interceptor
├── vite.config.js     # Builds → server/public/dist/
└── package.json       # React 19, Tailwind v4, TanStack Query
```

**Quick start (dev):**
```bash
cd frontend && npm install && npm run dev    # Dev server with HMR, proxies /api → :3001
```

**Production build:**
```bash
cd frontend && npm run build                  # Outputs to server/public/dist/
```

The Express server serves the built SPA at `/` and proxies all API calls to the PHP backend.
Legacy PHP admin panels (`/admin`, `/client`) remain accessible alongside the new React UI.

See [frontend/AGENTS.md](frontend/AGENTS.md) for component patterns and design tokens.

## Directory Structure
## License

Business Source License 1.1 (BUSL-1.1) — see [LICENSE](LICENSE) for the full text.

- **Licensor:** Blue Terra LLC
- **Licensed Work:** 1ai-Affiliate
- **Additional Use Grant:** You may use the Licensed Work for any purpose, including production use, except you may not offer it as a hosted or managed service to third parties.
- **Change Date:** 2031-02-22
- **Change License:** GPL-2.0-or-later
