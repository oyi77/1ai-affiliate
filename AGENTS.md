# 1ai-Affiliate — Unified Marketing, Sales & Affiliate Hub

One-stop platform for CPA tracking, affiliate marketing, content distribution, and sales automation.

## Architecture

```
1ai-affiliate/                    # PHP 8.3+ CPA tracking (Prosper202-based)
├── api/V3/                       # REST API — affiliates, commissions, offers
├── 202-config/Affiliate/         # Affiliate profiles + auth
├── 202-config/Margin/            # Payout calculator + commission handler
├── 202-config/Offer/             # Offer management + access control
├── 202-config/Commission/        # Ledger + payout batch system
├── scripts/                      # DB migrations (4 SQL files)
│
├── pipeline/                     # TikTok → Shopee → FB/IG (Python)
│   └── 21 Meta accounts, 27 affiliate links, 5 niches
│
├── poster/                       # Hourly Shopee poster → Telegram (Python)
│
├── server/                       # Node.js Express (port 3001)
│   ├── app.js                     # Entry — CORS, JWT, static SPA
│   ├── routes/                    # /api/auth, /api/admin, /api/payment, /api/content
│   ├── controllers/               # auth + admin + payment (Tripay) + content (6 Gemini tools)
│   ├── services/gemini.js         # Gemini SDK wrapper + circuit breaker
│   ├── db/mysql.js                # Pool to prosper202 (shared with PHP)
│   └── public/
│       ├── admin/index.html       # Dashboard-first SPA — Tailwind CDN, dark, mobile-first
│       ├── client/index.html
│       └── assets/app.js          # Vanilla JS, fetch(), JWT in localStorage
│
├── mcp/                            # Unified MCP gateway
    ├── unified_hub.py              # FastMCP server — all services via HTTP proxy
    ├── requirements.txt            # mcp + httpx
    └── mcp.json                    # Claude Desktop / Code config
```

## Architecture: API/MCP Integration (NOT symlinks)

```
┌─────────────────────────────────────────────────────────┐
│              1ai-affiliate Unified MCP Hub              │
│         mcp/unified_hub.py (FastMCP + httpx)            │
├─────────────────────────────────────────────────────────┤
│  Tool                          │  Target Service        │
│  ads_generate()                │  1ai-ads :5000         │
│  ads_generate_landing()        │  1ai-ads :5000         │
│  social_blast()                │  1ai-social :8200      │
│  social_analytics()            │  1ai-social :8200      │
│  social_shopee_sync()          │  1ai-social :8200      │
│  social_shopee_commission()    │  1ai-social :8200      │
│  content_status()              │  1ai-content :3000     │
│  content_banner()              │  1ai-affiliate :3001   │
│  content_carousel()            │  1ai-affiliate :3001   │
│  content_caption()             │  1ai-affiliate :3001   │
│  content_brand_kit()           │  1ai-affiliate :3001   │
│  content_ab_test()             │  1ai-affiliate :3001   │
│  content_bg_remove()           │  1ai-affiliate :3001   │
│  ebook_generate()              │  1ai-ebook :8100       │
│  ebook_status()                │  1ai-ebook :8100       │
│  ebook_market_research()       │  1ai-ebook :8100       │
│  tracking_affiliates()         │  PHP V3 API (localhost)│
│  tracking_commissions()        │  PHP V3 API (localhost)│
│  tracking_offers()             │  PHP V3 API (localhost)│
│  unified_campaign()            │  CROSS-SERVICE 🔥      │
│  unified_affiliate_onboarding()│  CROSS-SERVICE 🔥      │
│  unified_content_funnel()      │  CROSS-SERVICE 🔥      │
└─────────────────────────────────────────────────────────┘
```

Each MCP tool = HTTP REST proxy to native API with circuit breaker.
Cross-service tools chain multiple services (e.g., generate ad → create tracking link → blast social).

## Modules

### Content Generation: 6 Gemini Tools (Node, port 3001)
- `POST /api/content/banner` — banner concepts (headline/subtext/palette/layout/CTA/font mood)
- `POST /api/content/carousel` — Instagram carousel (hook→value→CTA, configurable slide count)
- `POST /api/content/caption` — social caption + 3 alt hooks + hashtags
- `POST /api/content/brand-kit` — palette (5 hex), fonts, voice, logo concept, taglines
- `POST /api/content/ab-test` — 3 landing-page variants with predicted CTR + reasoning
- `POST /api/content/bg-remove` — optimized prompt for AI bg-removal
- `GET  /api/content/status` — public: checks `GEMINI_API_KEY` configured
- Circuit breaker: 5 failures → 30s open. Auth: JWT Bearer (admin/affiliate)

### Core: CPA Tracking (PHP 8.3+)
- Campaign tracking with click/pixel/postback
- Sub-affiliate network with commission engine
- Offer management with affiliate access control
- Commission ledger with payout batch processing
- V3 REST API (router/controller pattern, `Connection` DI)

### MCP Gateway (Python)
- 17 tools covering 5 services
- Circuit breaker per service (5 failures → 30s open)
- Cross-service workflows: `unified_campaign`, `unified_affiliate_onboarding`
- Config via env vars: `ADS_URL`, `SOCIAL_URL`, `CONTENT_URL`, `EBOOK_URL`, `TRACKING_URL`

### Pipeline: Content Distribution (Python)
- TikTok download (no watermark) → FFmpeg hash mod (Meta-safe)
- AI niche detection (Omniroute + keyword fallback)
- 27 Shopee affiliate links, 5 niches, 21 Meta accounts
- Anti-spam: 45-120min delay, 4 posts/acct/day

### Poster: Telegram Affiliate (Python)
- Hourly Shopee product posting to Telegram
- PostgreSQL-backed product queue, dual-mode (photo+text)

### Connected Services (via MCP/API)
- **1ai-ads** (port 5000): AdForge — generate ads, landing pages, campaigns
- **1ai-social** (port 8200): SMMA — 27 routers, blast/reach/outreach/Shopee
- **1ai-content** (port 3000): AI Video Marketing — Telegram bot
- **1ai-ebook** (port 8100): AI ebook pipeline — multi-language, novel, comics

### 6 Gemini Content Tools (1ai-affiliate server :3001)
6 affiliate-marketing content endpoints, all wired through `services/gemini.js` (circuit breaker):
- `POST /api/content/banner` — banner concepts (headline/palette/layout/CTA)
- `POST /api/content/carousel` — Instagram carousel slides
- `POST /api/content/caption` — caption + alt versions + hashtags
- `POST /api/content/brand-kit` — palette/fonts/voice/logo/tagline
- `POST /api/content/ab-test` — 3 landing-page variants w/ predicted CTR
- `POST /api/content/bg-remove` — optimized prompt for client-side bg removal

Exposed via MCP hub: `content_banner`, `content_carousel`, `content_caption`, `content_brand_kit`, `content_ab_test`, `content_bg_remove`, `unified_content_funnel`.

## Quick Start

```bash
# Core tracking platform
composer install && cp 202-config-sample.php 202-config.php
php scripts/run_migrations.php

# Pipeline
cd pipeline && pip install -r requirements.txt

# Poster
cd poster && pip install -r requirements.txt
```

## Testing

```bash
# Core
php8.4 vendor/bin/phpunit --no-configuration tests/

# Pipeline + Poster — check individual READMEs
```

## Related
- Upstream: tracking202/prosper202
- 1ai-ads: ~/projects/1ai-ads
- 1ai-social: ~/projects/1ai-social
