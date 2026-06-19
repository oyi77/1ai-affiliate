# CODEBASE.md — 1ai-affiliate

> Auto-generated codebase memory for AI agents. Last updated: 2026-06-19.

## Purpose
Self-hosted affiliate tracking platform ("1ai-Affiliate ClickServer"). Tracks clicks, conversions, and attribution for affiliate marketing campaigns with multi-touch attribution, rotator management, and a modern React SPA dashboard.

## Tech Stack
- **Languages**: PHP 8.3+, JavaScript (Node.js), Go 1.22
- **Frameworks**: Slim 3 (PHP), Express 4 (Node.js), Chi (Go)
- **Runtime**: PHP-FPM, Node.js, Go binary
- **Database**: MySQL/MariaDB, Redis, ClickHouse (edge), SQLite (Go CLI)
- **Key Libraries**: PHP: slim/slim, geoip2, ua-parser, symfony/console; Node: mysql2, express, zod, jsonwebtoken, @ai-sdk/*; Go: clickhouse-go, sarama (Kafka), chi, redis, geoip2, zerolog, prometheus

## Entry Points
- **PHP App**: `index.php` — Main web application (tracking, admin, API v2/v3)
- **Node Server**: `server/app.js` — Express companion (smartlinks, poster, pipeline, auth)
- **Go Edge**: `edge/edgeredirect` — High-performance click redirector binary
- **PHP CLI**: `bin/p1ai` — Symfony Console CLI for remote management
- **Go CLI**: `go-cli/main.go` — Cross-platform CLI with JSON output
- **React SPA**: `frontend/` — Crystal UI dashboard (React 19, Tailwind v4, TanStack Query)


## Key Files
| File | Purpose |
|------|---------|
| `index.php` | PHP app entry point |
| `server/app.js` | Node.js Express companion server |
| `config/functions-tracking1ai.php` | Core tracking engine (171KB, largest file) |
| `config/functions.php` | Shared PHP utilities (22.5KB) |
| `config/functions-auth.php` | Authentication functions |
| `config-sample.php` | PHP config template (DB credentials) |
| `composer.json` | PHP dependencies (Slim, GeoIP2, UA-Parser) |
| `server/package.json` | Node.js dependencies (Express, MySQL2, Zod, AI SDK) |
| `edge/go.mod` | Go edge redirector dependencies |
| `docker-compose.yml` | Full stack: db, redis, php, node, (phpmyadmin, mailhog) |
| `frontend/package.json` | React 19 SPA dependencies |
| `docs/openapi.yaml` | Full API specification (92.9KB) |

## Architecture
Polyglot system: PHP handles core tracking/admin UI, Node.js serves companion API (smartlinks, auth, social posting, AI features), Go edge binary handles high-performance click redirects with GeoIP and Kafka event streaming. React 19 SPA ("Crystal UI") replaces legacy PHP admin pages. Docker Compose orchestrates all services behind nginx, with cf-router managing Cloudflare DNS and SSL termination.

## Dependencies & Integration
- **External APIs**: Meta Ads, Tripay payment gateway, Telegram bot, Shopee affiliate, Google AI (Gemini), Anthropic, MaxMind GeoIP
- **Internal Services**: MySQL, Redis, ClickHouse, cf-router (Cloudflare), nginx
- **MCP Tools**: `mcp/unified_hub.py` for AI agent integration

## Run Commands
```bash
# Docker (recommended)
docker compose up -d                    # Default: db, redis, php, node
docker compose --profile tools up -d    # + phpmyadmin, mailhog

# PHP
composer install                        # Install PHP deps
composer test                           # PHPUnit tests

# Node.js
cd server && npm install && npm start   # Start companion API

# Go Edge
cd edge && go build -o edgeredirect ./cmd/... && ./edgeredirect

# Go CLI
cd go-cli && make build && ./p1ai campaign list --json

# Frontend
cd frontend && npm install && npm run dev
```

## Environment Variables
- `DB_ROOT_PASSWORD`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `CF_DOMAIN`, `TG_BOT_TOKEN`, `TG_CHANNEL_ID`
- `TRIPAY_*`, `META_ACCESS_TOKEN`, `FB_PAGES_JSON`, `IG_ACCOUNTS_JSON`
- `SHOPEE_LINKS_JSON`, `EBOOK_API_URL`
- PHP config: `config.php` (DB host/user/pass, Memcached)
