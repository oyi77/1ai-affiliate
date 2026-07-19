# Route Coverage Audit

Generated: 2026-07-14

## Summary

- **72** route files in `server/routes/`
- **56** mounted in `server/app.js`
- **16** unmounted (dead code — not required anywhere)
- **4** Jest E2E tests (mocked DB via `mockPool`)
- **8** real-DB integration tests (raw Node, no Jest)
- **2** Playwright/browser tests (1 SPA, 1 fixture)
- **~25%** mounted route files have any HTTP-level test coverage

## Test Layers

### Layer 1: Jest E2E (mocked DB, supertest)

| File | Routes Tested | Notes |
|------|---------------|-------|
| `api.e2e.test.js` | GET/POST /api/auth/*, /api/admin/*, /api/ai/*, /health, /api/postback | Most comprehensive mock test. Covers admin CRUD, auth flow, AI endpoints. |
| `auth.e2e.test.js` | POST /login, GET /me, POST /forgot-password, POST /reset-password, PUT /password | Full auth lifecycle. |
| `phase-a-foundation.e2e.test.js` | POST /api/admin/offers, GET /health, GET /metrics | Idempotency, RBAC, metrics endpoint. |
| `rbac.e2e.test.js` | GET /api/admin/{users,stats,earnings,commissions}, GET /api/ai/spend, GET /health | Role-based access control verification. |

### Layer 2: Real-DB Integration Tests (raw Node, live server)

| File | Routes Tested | Notes |
|------|---------------|-------|
| `tests/e2e/roles/admin.test.js` | POST /api/auth/login, GET /api/admin/earnings, GET /api/admin/offers, GET /api/admin/stats, POST /api/admin/users | Admin role CRUD, runs against real DB. |
| `tests/e2e/roles/publisher.test.js` | GET /api/admin/earnings, GET/POST /api/admin/offers, POST /api/smartlink/generate | Publisher role flows. |
| `tests/e2e/roles/advertiser.test.js` | GET/POST /api/admin/offers | Advertiser role flows. |
| `tests/e2e/roles/integration.test.js` | ~35 routes: /api/admin/{advertisers,users,offers,affiliates,campaigns,reports,notifications}, /api/affiliate/*, /api/settings/* | Most comprehensive real-DB test. |
| `tests/e2e/smoke/health.test.js` | GET /health, GET /api/admin/stats, POST /api/auth/login, POST /api/smartlink/generate | Server alive + DB connectivity. |
| `tests/e2e_om_am_multimodel.test.js` | POST /api/am/assign, POST /api/am/assign-global | Multi-model assignment. |
| `tests/e2e/fraud/advanced-fraud.test.js` | POST /api/postback | Fraud detection via postback. |
| `tests/e2e/fraud/ip-fraud.test.js` | (reads IP fraud configs, no HTTP route test) | |
| `tests/e2e/fraud/bot-detection.test.js` | (reads bot detection configs, no HTTP route test) | |

### Layer 3: Service Unit Tests

| File | What It Tests | Notes |
|------|---------------|-------|
| `server/tests/unit/ltvService.test.js` | LTV calculation service | Service-level only, no route handler testing |
| `server/tests/unit/fraudService.test.js` | Fraud detection service | Service-level only |
| `server/tests/unit/crossDeviceService.test.js` | Cross-device tracking | Service-level only |
| `server/tests/unit/recurringCommissionService.test.js` | Recurring commissions | Service-level only |
| `server/tests/unit/commissionService.test.js` | Commission computation | Service-level only |
| `server/tests/unit/payoutCalculation.test.js` | Payout math | Service-level only |
| `server/tests/unit/contentService.test.js` | Content/integration logic | Service-level only |
| `server/tests/unit/capiService.test.js` | CAPI integration | Service-level only |
| `server/tests/unit/retargetingService.test.js` | Retargeting logic | Service-level only |
| `server/tests/unit/bidderOptimizer.test.js` | Bid optimization | Service-level only |
| `server/tests/unit/landingPageBlocks.test.js` | Landing page blocks | Service-level only |
| `server/tests/agent/aiRoutes.test.js` | AI route handlers | Mocks auth + pool, tests routes directly |
| `server/tests/messaging.test.js` | Messaging service | Service-level only |
| `server/tests/shopeeParser.test.js` | Shopee CSV parsing | Parsing utility test |

### Layer 4: Browser/UI Tests

| File | What It Tests | Notes |
|------|---------------|-------|
| `server/tests/ui.spec.js` | React SPA: Network Overview, Offers table, role dashboard render | Uses actual SPA + Playwright. Injects JWT, tests admin/affiliate/advertiser views. NOT in playwright.config.js — excluded from default run. |
| `tests/playwright/attribution-dashboard.spec.js` | Analytics metrics cards, chart, anomaly alerts | Uses isolated HTML fixture + mocked API. Does NOT test the React SPA. |

**No other browser tests exist** (no Cypress, no Puppeteer, no Selenium). `ui.spec.js` provides basic SPA smoke tests but is excluded from the default Playwright run.

## Mounted Route Files by Coverage Status

### Covered (at least one endpoint tested at HTTP level)

| Route File | Mount Path | Tested In |
|------------|-----------|-----------|
| `auth.js` | `/api/auth` | api.e2e, auth.e2e, admin.test, health |
| `admin.js` | `/api/admin` | api.e2e, rbac.e2e, admin.test, integration |
| `ai.js` | `/api/ai` | api.e2e, aiRoutes.test.js |
| `am.js` | `/api/am` | e2e_om_am_multimodel |
| `postback.js` | `/api` | api.e2e, advanced-fraud |
| `smartlink.js` | `/api/smartlink` | health.test, publisher.test |
| `settings.js` | `/api/settings` | integration |
| `app.get('/health')` | inline | api.e2e, phase-a-foundation, rbac, health |
| `app.get('/metrics')` | inline | phase-a-foundation |

**Also indirectly covered** (mounted as sub-routers, partially overlaps admin.js):
| `offers.js` | `/api/admin/offers` | integration |
| `campaigns.js` | `/api/admin/campaigns` | integration |
| `affiliates.js` | `/api/admin/affiliates` | integration |

### NO Test Coverage (mounted, no HTTP-level test found)

These 42 mounted route files have ZERO HTTP test coverage:

| Route File | Mount Path |
|------------|-----------|
| `om.js` | `/api/om` |
| `notifications-rt.js` | `/api/notifications` |
| `content.js` | `/api/content` |
| `geoip.js` | `/api/geo` |
| `capi.js` | `/api/capi` |
| `docs.js` | `/api/docs` |
| `smartlink-routing.js` | `/r` |
| `smartlink-rotation.js` | `/api` |
| `ad-block.js` | `/api` |
| `statsSSE.js` | `/api/admin/stats` |
| `poster.js` | `/api/poster` |
| `pipeline.js` | `/api/pipeline` |
| `gapfill.js` | `/api/admin` |
| `services.js` | `/api/admin/services` |
| `content-integration.js` | `/api/affiliate` |
| `cross-device.js` | `/api/affiliate/cross-device` |
| `landingTemplates.js` | `/api/templates/landing` |
| `templates.js` | `/api/templates` |
| `enterprise.js` | `/api/enterprise` |
| `integrations.js` | `/api/integrations` |
| `copilot.js` | `/api/copilot` |
| `twoFactor.js` | `/api/2fa` |
| `importExport.js` | `/api/import-export` |
| `sub-affiliates.js` | `/api/admin/sub-affiliates` |
| `migration.js` | `/api/migration` |
| `advertiserSelfService.js` | `/api/advertiser` |
| `offerBrowser.js` | `/api/offers` |
| `paymentRoutes.js` | `/api/payment` |
| `balance.js` | `/api/admin/balance` |
| `wallet.js` | `/api/wallet` |
| `adminFinance.js` | `/api/admin/finance` |
| `sdk.js` | `/api/sdk` |
| `retargeting.js` | `/api/retargeting` |
| `analytics.js` | `/api/analytics` |
| `recommendations.js` | `/api/recommendations` |
| `pmp.js` | `/api/pmp` |
| `compliance.js` | `/api/compliance` |
| `recurring-commissions.js` | `/api/recurring-commissions` |
| `messaging.js` | `/api/messaging` |
| `landing-page-blocks.js` | `/api/landing-page-blocks` |
| `scorecard.js` | `/api/scorecard` |
| `ltv.js` | `/api/ltv` |
| `ai-traffic.js` | `/api/ai-traffic` |
| `marketplace.js` | `/api/marketplace` |
| `currency-payouts.js` | `/api/currency-payouts` |
| `boost.js` | `/api/boost` |

**Also no coverage for inline routes:**
- `GET /api/platform/public`
- `GET /pixel.gif`
- `GET /api/attribution/report`
- `GET /api/admin/optimization/history`
- `POST /api/admin/optimization/run`
- `GET /go/:hash`
- `GET /api/admin/stats/stream`
- `GET /api/notifications` (WebSocket upgrade)

## Unmounted/Dead Route Files

These 16 files exist in `server/routes/` but are NOT required anywhere in `server/app.js` or any other server file. All are dead code:

| File | Likely Purpose |
|------|---------------|
| `advertisers.js` | Advertiser CRUD (replaced by admin.js or advertiserSelfService.js) |
| `affiliate.js` | Affiliate operations (replaced by affiliates.js or admin.js) |
| `automation.js` | Automation rules |
| `deepLinks.js` | Deep link management |
| `notifications.js` | Notifications (replaced by notifications-rt.js) |
| `payment.js` | Payments (replaced by paymentRoutes.js) |
| `payouts.js` | Payouts |
| `reports.js` | Reports (replaced by admin.js's report routes) |
| `settingsApi.js` | Settings API |
| `shopeeAccounts.js` | Shopee account management |
| `taglinks.js` | Tag link management |
| `telegram.js` | Telegram integration |
| `tracking.js` | Click tracking |
| `trafficRules.js` | Traffic rules |
| `trafficSources.js` | Traffic source management |
| `webhooks.js` | Webhook endpoints |

## Key Gaps

1. **75% of mounted route files have zero HTTP test coverage.** Only ~14 of 56 mounted files are tested.
2. **Browser tests for the React SPA exist but are excluded from CI.** `server/tests/ui.spec.js` tests 3 role views with the actual SPA, but is not in the Playwright config (testDir: `./tests/playwright/`). So it never runs automatically.
3. **No E2E tests for core business flows:**
   - Wallet & balance operations
   - Two-factor auth
   - Enterprise features
   - SDK
   - Retargeting & analytics
   - PMP & compliance
   - Messaging & notifications
   - LTV/scorecard
   - AI traffic optimization
   - Marketplace
   - Boost/promotions
   - Landing page blocks & templates
   - Import/export
4. **Dead code**: 16 route files (22%) are not mounted anywhere — likely replaced by newer implementations but never cleaned up.
5. **Mock tests vs real-DB tests**: Jest E2E tests mock the DB pool, so they don't verify SQL correctness or data integrity. Real-DB tests exist but only cover a subset of the same admin/auth/smartlink endpoints.
6. **No negative-path testing**: Error handling, rate limiting, input validation edge cases are lightly tested.
