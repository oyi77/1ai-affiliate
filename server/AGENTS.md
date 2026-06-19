# Server — Node.js Express API Gateway

Port 3001. Serves the React SPA at `/`, routes all API calls to PHP backend.

## Files

```
server/
├── app.js                 # Entry: middleware stack, route mounting, SPA fallback
├── routes/                # /api/auth, /api/admin, /api/content, /api/smartlink, /api/payment, ...
├── controllers/           # Request handlers (auth, admin, advertiser, trafficSource, report, offer, campaign, affiliate)
├── services/              # Gemini SDK, smartlinkService, posterService, pipelineService, metaService, shopeeService, telegramService, payoutService
├── utils/                 # queryHelpers, validate (Zod), apiResponse, asyncHandler
├── middleware/             # auth.js, roleMiddleware.js, idempotency.js, auditLog.js
├── db/mysql.js            # MySQL2 connection pool (shared with PHP)
├── public/                # Static assets + dist/ (React build output)
│   ├── dist/              # Production React SPA (npm run build output)
│   ├── admin/             # Legacy PHP admin SPA (preserved for reference)
│   └── client/            # Legacy PHP client SPA
├── config/                # Server config
├── migrations/            # Node-managed DB migrations
├── scripts/               # Utility scripts
├── logger.js              # Pino structured logger
├── metrics.js             # Prometheus metrics
└── package.json           # Node dependencies
```

## Middleware Stack (in order)

1. `helmet` — security headers
2. `cors` — cross-origin (configurable)
3. `express.json()` — body parsing
4. `pinoHttp` — request logging
5. `idempotency` — idempotency key enforcement for mutating requests
6. `auditLog` — mutation audit trail
7. `express.static('public')` — static files (dist/, admin/, client/)
8. SPA catch-all — serves `dist/index.html` for all non-API routes
9. Error handler — logs via Pino, returns request_id for 500s

## Route Map

| Prefix | Router File | Purpose |
|--------|-------------|---------|
| `/api/auth` | `routes/auth.js` | Login, register, JWT, password reset |
| `/api/admin` | `routes/admin.js` | Users, stats, commissions, payments, system, VIP, domains, shorteners, margin, networks, postback logs, manual conversions |
| `/api/admin/advertisers` | `routes/advertisers.js` | Advertiser CRUD, CSV upload, reports, payouts |
| `/api/admin/traffic-sources` | `routes/trafficSources.js` | Traffic source CRUD, Meta Ads connect, sync, daily stats |
| `/api/admin/offers` | `routes/offers.js` | Offer CRUD, postback config, landing pages |
| `/api/admin/campaigns` | `routes/campaigns.js` | Campaign CRUD, rotation |
| `/api/admin/reports` | `routes/reports.js` | Clicks, conversions, ad reports, daily analytics, taglink, PDF export |
| `/api/admin/affiliates` | `routes/affiliates.js` | Affiliate CRUD, earnings, approve |
| `/api/admin/notifications` | `routes/notifications.js` | In-app notifications, mark read |
| `/api/admin/stats` | `routes/statsSSE.js` | Stats with SSE streaming |
| `/api/affiliate` | `routes/affiliate.js` | Affiliate self-service: stats, links, earnings |
| `/api/am` | `routes/am.js` | Affiliate manager endpoints |
| `/api/om` | `routes/om.js` | Offer manager endpoints |
| `/api/payment` | `routes/payment.js` | Tripay payment gateway |
| `/api/content` | `routes/content.js` | Gemini AI (banner, carousel, captions, brand-kit, ab-test, bg-remove) |
| `/api/smartlink` | `routes/smartlink.js` | Smartlink generation + list |
| `/api/settings` | `routes/settings.js` | User preferences, profile, API keys, integrations |
| `/api/settings/telegram` | `routes/telegram.js` | Telegram bot config + test message |
| `/api/settings/payouts` | `routes/payouts.js` | Automated payout rules |
| `/api/docs` | `routes/docs.js` | API documentation |
| `/api/geo` | `routes/geoip.js` | GeoIP lookups |
| `/api/ai` | `routes/ai.js` | AI agent endpoints |
| `/api/poster` | `routes/poster.js` | Telegram poster queue |
| `/api/pipeline` | `routes/pipeline.js` | TikTok/FB pipeline status |
| `/api` | `routes/postback.js` | Postback webhook receiver |
| `/go/:hash` | `controllers/smartlinkController.js` | Redirect traffic by smartlink hash |
| `/health` | inline in app.js | Deep health probe (DB + queue check) |

## SPA Serving Logic

```
GET /                → dist/index.html (React SPA)
GET /admin/*         → public/admin/index.html (legacy)
GET /client/*        → public/client/index.html (legacy)
GET /api/*           → respective route handler
GET /metrics         → Prometheus metrics
GET /health          → Deep health check
GET *                → dist/index.html (SPA client-side routing)
```

## Key Services

### smartlinkService.js
- `mintSmartlink()` — creates tracked `/go/<slug>` redirects
- Used by posterService and pipelineService for tracking

### posterService.js
- Telegram channel posting queue
- Schedules posts, mints smartlinks for each

### pipelineService.js
- TikTok → Shopee → FB/IG pipeline
- Scrapes trending content, mints smartlinks per niche

### gemini.js
- Gemini SDK wrapper
- Circuit breaker pattern for AI content generation

### metaService.js
- Meta Ads Graph API client
- Token validation, account name fetch, daily insights, stat sync

### shopeeService.js
- Shopee CSV parser with Indonesian number format support
- Bulk insert in batches of 500 rows

### telegramService.js
- Telegram bot message sending
- Daily summary, balance alerts, test connection

### payoutService.js
- Automated payout rule processing
- Configurable min amount, payment method, schedule
