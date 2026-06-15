# 1ai-Affiliate — High-Throughput Tracking Engine

One-stop platform for CPA tracking, affiliate marketing, content distribution, and sales automation.
Architected for massive event ingestion with sub-millisecond redirect latency and zero data loss.

## Architecture: Hot/Cold Path Split

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EDGE LAYER (Go)                              │
│              cmd/edgeredirect — sub-ms redirect                     │
├─────────────────────────────────────────────────────────────────────┤
│  Inbound Request → GeoIP → Fraud Detection → Route → Redirect      │
│                          ↓                                          │
│                    Kafka (1ai-clicks)                               │
│                    ┌──────┴──────┐                                  │
│                    ↓              ↓                                  │
│              Redis Cache    ClickHouse (analytics)                  │
│              (ephemeral      (time-series reporting)                │
│               click state)                                           │
│                    ↓                                                 │
│              Cold Path Consumer (cmd/clickconsumer)                 │
│              → Batch flush to ClickHouse                            │
│              → Session-based attribution                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
1ai-affiliate/
├── edge/                          # Go edge layer (NEW)
│   ├── cmd/
│   │   ├── edgeredirect/main.go   # Edge redirect server (hot path)
│   │   ├── clickconsumer/main.go  # Cold path consumer worker
│   │   └── cli/main.go            # CLI tooling
│   ├── internal/
│   │   ├── config/                # Env-based configuration
│   │   ├── model/                  # Domain models (ClickEvent, ConversionEvent, etc.)
│   │   ├── redis/                 # Redis client (campaign state, click records)
│   │   ├── kafka/                 # Kafka producer + consumer group
│   │   ├── router/                # In-memory traffic routing engine
│   │   ├── detect/                # Fraud detection pipeline
│   │   ├── clickhouse/            # ClickHouse analytics client
│   │   ├── graphql/               # GraphQL schema
│   │   └── webhook/               # Outbound webhook dispatch
│   ├── deploy/k8s.yaml            # Kubernetes manifests + HPA
│   ├── Dockerfile                 # Multi-stage build
│   └── go.mod
│
├── api/                           # PHP REST API
│   ├── V3/                        # REST API — affiliates, commissions, offers
│   ├── v2/                        # Attribution API (Slim framework)
│   └── v1/                        # Legacy reporting API
│
├── config/                        # PHP 8.3+ tracking platform
│   ├── Affiliate/                 # Affiliate profiles + auth
│   ├── Margin/                    # Payout calculator + commission handler
│   ├── Offer/                     # Offer management + access control
│   ├── Commission/                # Ledger + payout batch system
│   ├── Attribution/               # Multi-touch attribution engine
│   ├── Click/                     # Click processing
│   ├── Tracking/                  # Campaign tracking
│   └── Validation/               # Input validation
│
├── server/                        # Node.js Express (port 3001)
│   ├── app.js                     # Entry — CORS, JWT, static SPA
│   ├── routes/                    # /api/auth, /api/admin, /api/payment, /api/content
│   ├── controllers/               # auth + admin + payment (Tripay) + content (6 Gemini tools)
│   ├── services/gemini.js         # Gemini SDK wrapper + circuit breaker
│   ├── agents/                    # AI agent framework (VoltAgent)
│   ├── db/mysql.js                # Pool to MySQL (shared with PHP)
│   └── public/
│       ├── admin/index.html       # Dashboard-first SPA
│       ├── client/index.html
│       └── assets/app.js
│
├── mcp/                           # Unified MCP gateway
│   ├── unified_hub.py             # FastMCP server — all services via HTTP proxy
│   └── mcp.json                   # Claude Desktop / Code config
│
├── cli/                           # PHP CLI tooling (OneAIAffiliateCli)
├── tracking_support/              # PHP redirect engine (OneAIAffiliate namespace)
├── scripts/                       # DB migrations
├── pipeline/                      # TikTok → Shopee → FB/IG (Python)
└── poster/                        # Hourly Shopee poster → Telegram (Python)
```

## Hot Path (Edge Resolution)

The Go edge server (`cmd/edgeredirect`) handles all inbound tracking requests:

1. **Campaign lookup** — Redis (in-memory, sub-ms)
2. **GeoIP resolution** — Local MMDB file, no external calls
3. **Fraud detection** — In-memory rules engine (bot UA, proxy IPs, missing referer)
4. **Traffic routing** — Rule-based (geo, device, carrier, connection type, time window)
5. **Daily cap check** — Redis atomic increment
6. **Click event** → Kafka (async, non-blocking)
7. **Ephemeral state** → Redis (for attribution)
8. **Redirect** → HTTP 302 to target URL

**Latency target**: < 1ms per request (no database calls in hot path)

## Cold Path (Ingestion & Attribution)

The consumer worker (`cmd/clickconsumer`) processes the Kafka event stream:

1. **Consume** click events from Kafka
2. **Batch** to ClickHouse (every 5s or 1000 events)
3. **Attribution** — Session-based conversion matching
4. **Analytics** — Time-series OLAP queries via ClickHouse

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Edge | Go 1.22 | Sub-ms redirect, concurrent request handling |
| Event Stream | Apache Kafka / Redpanda | Immutable click/conversion log |
| Fast State | Redis Cluster | Campaign rules, token whitelists, ephemeral clicks |
| Analytics | ClickHouse | Time-series OLAP, sub-second aggregations |
| Persistent State | MySQL 8.0+ | Relational metadata, users, billing, config |
| API | GraphQL + REST | Headless API for all UI components |
| Orchestration | Kubernetes + HPA | Auto-scaling based on CPU + Kafka lag |

## Core Feature Set

### S2S Postback Tracking
- Asynchronous server-to-server event logging, fully decoupled from redirect path
- Postback endpoint: `POST /postback` on edge server
- Conversion events published to Kafka, processed by cold path

### Smart Traffic Routing
- Rule-based distribution: geo (country/region/city), device, OS, browser, carrier, connection type
- Weight-based A/B split testing
- Time-window scheduling
- Fallback rules with priority ordering
- All rules evaluated in-memory — zero database calls

### Real-time OLAP Reporting
- ClickHouse MergeTree tables partitioned by month
- Sub-second aggregations across multidimensional data
- 90-day TTL with configurable retention
- Pre-aggregated materialized views for common queries

### Anti-Fraud Detection
- Bot user-agent detection (40+ known bot signatures)
- Proxy/VPN IP blocking (configurable list)
- Missing/empty referer scoring
- Empty user-agent detection
- Configurable threshold (default: 0.8 blocks, lower scores logged)

### Platform Dashboards
- Decoupled publisher and advertiser interfaces
- All UI components are headless consumers of the GraphQL/REST API
- Real-time stats via SSE stream
### Custom Domains & URL Shorteners
- **Smartlink Custom Domains** — Configure branded domains (go.yourdomain.com) for smartlink redirects
- **Default Domain Selection** — Mark one domain as default for new smartlinks
- **SSL Configuration** — Enable/disable HTTPS per domain, Cloudflare Zone ID integration
- **URL Shortener Integration** — Connect Bitly, TinyURL, Rebrandly, Cutt.ly, Short.io, or custom API endpoints
- **Auto-Shortening** — Automatically shorten smartlinks at generation time
- **Shortener Analytics** — Track shortened URL clicks and sync with external services
- **Admin Panel Management** — Full CRUD via `/admin/index.html#domains` and `/admin/index.html#shorteners`

## API & Integration

### GraphQL API
- Single endpoint for all analytics queries
- Types: Click, Conversion, Campaign, Affiliate, Analytics
- Mutations: createCampaign, updateCampaign, scheduleExport
- Resolves against ClickHouse for analytics, MySQL for metadata

### REST API
- V3: Affiliates, commissions, offers
- V2: Attribution models, exports, sandbox
- V1: Legacy reporting (maintained for backward compatibility)

### Webhooks
- Outbound event streaming for external partner integrations
- Events: click, conversion, fraud_block, cap_reached, campaign_paused
- HMAC-SHA256 payload signing
- Configurable per-user with event type filtering

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
- Pod anti-affinity for edge nodes
- Rolling updates with maxSurge=1, maxUnavailable=0

### Fault Tolerance
- Edge continues queueing events to Kafka even if cold path fails
- No database dependency in redirect path
- Redis cluster provides high availability for campaign state
- Kafka provides durability for all click/conversion events

### Global Edge Deployment
- Edge instances deployed physically close to traffic sources
- Geo-aware DNS routing
- Stateless design enables horizontal scaling

## Quick Start

```bash
# Core tracking platform
composer install && cp 1ai-config-sample.php 1ai-config.php
php scripts/run_migrations.php

# Edge layer (Go)
cd edge && go build ./cmd/edgeredirect && go build ./cmd/clickconsumer

# Pipeline
cd pipeline && pip install -r requirements.txt

# Poster
cd poster && pip install -r requirements.txt
```

## Testing

```bash
# Core
php8.4 vendor/bin/phpunit --no-configuration tests/

# Edge
cd edge && go test ./...

# Pipeline + Poster — check individual READMEs
```

## Related
- 1ai-ads: ~/projects/1ai-ads
- 1ai-social: ~/projects/1ai-social
- 1ai-ebook: ~/projects/1ai-ebook
