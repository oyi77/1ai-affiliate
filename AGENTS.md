# 1ai-Affiliate — High-Throughput Affiliate Tracking Platform

One-stop platform for CPA tracking, affiliate marketing, AI content generation, and sales automation.
Architected for massive event ingestion with sub-millisecond redirect latency and zero data loss.

## Architecture: Hot/Cold Path Split with React SPA Frontend

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   React 19 SPA (frontend/)                              │
│           Crystal UI — Dark Glassmorphism, 28 pages                     │
├─────────────────────────────────────────────────────────────────────────┤
│              Node.js Express (server/) :3001                            │
│       Routes API calls → PHP backend, serves SPA at root               │
├─────────────────────────────────────────────────────────────────────────┤
│                        EDGE LAYER (Go)                                  │
│              cmd/edgeredirect — sub-ms redirect                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Inbound Request → GeoIP → Fraud Detection → Route → HTTP 302          │
│                          ↓                                              │
│                    Kafka (1ai-clicks)                                   │
│                    ┌──────┴──────┐                                      │
│                    ↓              ↓                                      │
│              Redis Cache    ClickHouse (analytics)                      │
│                    ↓                                                     │
│              Cold Path Consumer (cmd/clickconsumer)                     │
│              → Batch flush to ClickHouse                                │
│              → Session-based attribution                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
1ai-affiliate/
├── frontend/                      # React 19 SPA (Crystal UI)
│   ├── src/
│   │   ├── components/ui/         # GlassCard, StatCard, DataTable, Modal, SlideOver
│   │   ├── hooks/                 # useStats — TanStack Query hooks
│   │   ├── layout/Shell.jsx       # Sidebar nav (27 items), glass header
│   │   ├── lib/api.js             # Axios client with JWT interceptor
│   │   ├── pages/                 # 28 lazy-loaded feature pages (see below)
│   │   ├── App.jsx                # Router with Suspense + React.lazy
│   │   ├── main.jsx               # QueryClientProvider bootstrap
│   │   └── index.css              # Crystal UI design tokens (@theme)
│   ├── vite.config.js             # Build → ../server/public/dist
│   └── package.json               # React 19, Tailwind v4, TanStack Query
│
├── server/                        # Node.js Express (port 3001)
│   ├── app.js                     # Entry — CORS, JWT, serves SPA at /
│   ├── routes/                    # /api/auth, /api/admin, /api/content, /api/smartlink, ...
│   ├── controllers/               # auth, admin, payment (Tripay), content (Gemini), poster, pipeline
│   ├── services/                  # Gemini SDK, smartlinkService, posterService, pipelineService
│   ├── middleware/                # idempotency, auditLog
│   ├── db/mysql.js                # Pool to MySQL (shared with PHP)
│   └── public/dist/               # Production React build output
│
├── config/                        # PHP 8.3+ tracking platform (Data Engine)
│   ├── connect2.php               # DB connection (145KB — core bootstrap)
│   ├── Affiliate/                 # Affiliate profiles + auth
│   ├── Margin/                    # Payout calculator + commission handler
│   ├── Offer/                     # Offer management + access control
│   ├── Commission/                # Ledger + payout batch system
│   ├── Attribution/               # Multi-touch attribution engine
│   ├── Click/                     # Click processing
│   ├── Tracking/                  # Campaign tracking
│   ├── AI/                        # Agent framework (Agent, ToolRegistry, Guardrails)
│   └── Validation/                # Input validation
│
├── edge/                          # Go edge layer
│   ├── cmd/
│   │   ├── edgeredirect/main.go   # Edge redirect server (hot path)
│   │   └── clickconsumer/main.go  # Cold path consumer worker
│   ├── internal/
│   │   ├── config/                # Env-based configuration
│   │   ├── model/                 # Domain models
│   │   ├── redis/                 # Redis client
│   │   ├── kafka/                 # Kafka producer + consumer group
│   │   ├── router/                # In-memory traffic routing engine
│   │   ├── detect/                # Fraud detection pipeline
│   │   ├── clickhouse/            # ClickHouse analytics client
│   │   └── webhook/               # Outbound webhook dispatch
│   └── deploy/k8s.yaml            # Kubernetes manifests + HPA
│
├── api/                           # PHP REST API
│   ├── V3/                        # REST API — affiliates, commissions, offers
│   ├── v2/                        # Attribution API (Slim framework)
│   └── v1/                        # Legacy reporting API
│
├── tracking_support/              # PHP redirect engine
│   ├── static/                    # Click handlers (landing.php, deeplink.php, record_adv.php)
│   ├── setup/                     # Admin CRUD (campaigns, networks, deep links)
│   └── update/                    # CPC/SubID management
│
├── account/                       # Legacy PHP admin panels (preserved for reference)
├── mcp/                           # Unified MCP gateway
│   ├── unified_hub.py             # FastMCP server
│   └── mcp.json                   # Claude Desktop / Code config
│
├── cli/                           # PHP CLI (OneAIAffiliateCli)
├── go-cli/                        # Go cross-platform CLI
├── scripts/                       # DB migrations (001-020+)
├── tests/                         # PHP unit + E2E (Playwright)
├── docker/                        # nginx, php-fpm, supervisord configs
└── pipeline/ + poster/            # Python (legacy — now absorbed into Node)
```

## React SPA Pages (28 total, all lazy-loaded)

| Category | Pages | Description |
|----------|-------|-------------|
| Core | Dashboard, Campaigns, Offers, Affiliates | CRUD with TanStack Table |
| Tracking | Smartlink Gen, Landing Page Builder, Deep Link Gen, Postback Builder, Click Servers | Link generation tools |
| AI Tools | AI Tools hub (Banner, Carousel, Captions, Brand Kit, A/B Test, BG Remove) | Gemini-powered generators |
| Analytics | Analytics, Attribution, Reports, Click Tracker, Day-Parting | OLAP dashboards, heatmap |
| Earnings | Earnings, Commissions | Payout ledger, batch approval |
| Infrastructure | Domains, Shorteners, Integrations, Pipeline, Poster | Domain/URL/sync management |
| System | Settings, API Docs, Admin, VIP Perks, Help, Login | Config, health, support |

## Crystal UI Design System

- **Tokens** — `frontend/src/index.css`: surface levels (1–3), indigo primary palette, border glow, shadow
- **Components** — `GlassCard` (hover lift + border glow), `StatCard` (sparkline + delta), `DataTable` (TanStack Table headless), `Modal` (Radix UI), `SlideOver`
- **Motion** — Framer Motion spring easing, 60fps transitions
- **Build** — Vite 8 + code-split lazy routes (16 chunks, 146KB gzip core)

## Hot Path (Edge Resolution)

```
Request → Campaign lookup (Redis, sub-ms)
       → GeoIP (local MMDB, no external call)
       → Fraud check (in-memory rules: bot UA, proxy IP, missing referer)
       → Traffic routing (geo/device/carrier/time rules)
       → Daily cap check (Redis atomic increment)
       → Click event → Kafka (async, non-blocking)
       → Ephemeral state → Redis
       → HTTP 302 redirect
```

**Latency target**: < 1ms per request. Zero database calls in hot path.

## Cold Path (Ingestion & Attribution)

```
Kafka consumer (cmd/clickconsumer)
  → Batch to ClickHouse (every 5s or 1000 events)
  → Session-based conversion matching
  → Time-series OLAP queries
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 | Crystal UI SPA, 28 pages |
| Frontend State | TanStack Query v5, TanStack Table v8 | Server cache, headless tables |
| Frontend Motion | Framer Motion v12, Radix UI | Animations, accessible modals |
| API Gateway | Node.js Express | Auth, routing, SPA serving |
| Core Logic | PHP 8.3+ | Tracking engine, attribution, commissions |
| Edge | Go 1.22 | Sub-ms redirect, concurrent handling |
| Event Stream | Apache Kafka / Redpanda | Immutable click/conversion log |
| Fast State | Redis Cluster | Campaign rules, ephemeral clicks |
| Analytics | ClickHouse | Time-series OLAP |
| Persistent State | MySQL 8.0+ | Relational metadata, users, billing |
| Orchestration | Kubernetes + HPA | Auto-scaling on CPU + Kafka lag |
| Containerization | Docker Compose | Multi-service local dev |

## Core Feature Set

### S2S Postback Tracking
- Async server-to-server event logging, decoupled from redirect path
- Postback endpoint: `POST /postback` on edge server
- Conversion events → Kafka → ClickHouse

### Smart Traffic Routing
- Rule-based: geo (country/region/city), device, OS, browser, carrier, connection type
- Weight-based A/B split testing, time-window scheduling, fallback rules
- All rules evaluated in-memory — zero DB calls

### Real-time OLAP Reporting
- ClickHouse MergeTree, sub-second aggregations, 90-day TTL
- Pre-aggregated materialized views, multidimensional drill-down

### Anti-Fraud Detection
- 40+ bot UA signatures, proxy/VPN IP blocking, missing referer scoring
- Configurable threshold (default 0.8 blocks, lower scores logged)

### Smartlink Generator
- Multi-step wizard: Select Offer → Choose Rules → Configure URL → Generate
- Custom domains (SSL, Cloudflare), URL shortener integration (Bitly, TinyURL, etc.)

### AI Creative Tools (6 tools)
- Banner Generator, Instagram Carousel, Social Captions, Brand Kit, A/B Test Ideas, Background Removal
- All powered by Gemini via `/api/content/*` endpoints

### Analytics & Reporting
- Attribution Models (First/Last/Linear Touch), Reports (date range + CSV export)
- Click Tracker (real-time 5s polling), Day-Parting heatmap (7×24 grid)

## API & Integration

### GraphQL API
- Types: Click, Conversion, Campaign, Affiliate, Analytics
- Resolves against ClickHouse (analytics) + MySQL (metadata)

### REST API
- V3: Affiliates, commissions, offers (headless JSON)
- V2: Attribution models, exports, sandbox
- V1: Legacy reporting (backward compatibility)

### Webhooks
- Events: click, conversion, fraud_block, cap_reached, campaign_paused
- HMAC-SHA256 signing, per-user event filtering

### CLI Tooling
- `1ai campaign list|get|push` — Campaign management
- `1ai analytics summary|export` — Analytics queries
- `1ai webhook register|list|test` — Webhook management
- `1ai redis flush-campaigns|stats` — Cache management
- `1ai health` — System health check

## Infrastructure & Scaling

### Kubernetes Deployment
- **edge-redirect**: 3-50 replicas, HPA on CPU (70%) + Kafka lag
- **click-consumer**: 2-20 replicas, HPA on CPU (80%) + Kafka lag
- Pod anti-affinity for edge nodes, rolling updates (maxSurge=1, maxUnavailable=0)

### Fault Tolerance
- Edge queues to Kafka even if cold path fails
- No DB dependency in redirect path
- Redis HA for campaign state, Kafka durability for events

## Quick Start

```bash
# Core tracking platform
composer install && cp 1ai-config-sample.php 1ai-config.php
php scripts/run_migrations.php

# Frontend (React SPA)
cd frontend && npm install && npm run build   # outputs to server/public/dist/

# Server (Node.js)
cd server && npm install && node app.js        # port 3001, serves SPA at /

# Edge layer (Go)
cd edge && go build ./cmd/edgeredirect && go build ./cmd/clickconsumer

# Docker (full stack)
docker compose up -d --build
```

## Testing

```bash
# Frontend
cd frontend && npx eslint . && npm run build

# PHP
php8.4 vendor/bin/phpunit --no-configuration tests/

# Edge
cd edge && go test ./...

# E2E
npx playwright test
```

## Related Projects
- 1ai-ads: `~/projects/1ai-ads`
- 1ai-social: `~/projects/1ai-social`
- 1ai-ebook: `~/projects/1ai-ebook`
