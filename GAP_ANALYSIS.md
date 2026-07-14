# 1ai-Affiliate: Comprehensive Gap Analysis

**Date**: 2026-07-14  
**Method**: Full codebase audit — 94 DB tables, 50+ services, 30+ controllers, 40+ route files, frontend SPA  
**Baseline**: Everflow, CAKE/HasOffers/TUNE, Post Affiliate Pro, Impact.com

---

## Existing Feature Inventory (Strengths)

| Category | Features Present |
|---|---|
| **Tracking** | Click pipeline w/ HMAC signing, 4 redirect modes (302/301/iframe/meta-refresh), S2S postback w/ HMAC verification, cookieless/pixel/JS tracking, redirect chain + hop logging, 5 attribution models (FT/LT/linear/time-decay/position-based) |
| **Offers** | Full CRUD, approval workflow (OM — pending/approve/reject/request changes), landing pages w/ geo/device targeting + weights, creatives (img/video/html/text/email), per-offer caps (daily/monthly) |
| **Smartlinks** | Minting w/ domain resolution, 5-layer visitor classification, bot detection + canary pages, geo/device rules schema, weight algorithm schema (random/round_robin/weighted/priority), URL shortening (Rebrandly/Bitly/tinyurl) |
| **Campaigns** | CRUD, offer linking, offer rotation (campaign-level), auto-optimizer (metric-based auto-pause), auto-rules engine, A/B testing w/ consistent hashing |
| **Fraud** | Configurable rules engine, ML behavioral detection (timing regularity/geo anomaly/device switch/zero-conversion/multi-affiliate), IP reputation scoring, CGNAT detection w/ composite fingerprinting, platform reviewer detection (FB/Google/TikTok), click/conversion analysis |
| **Payouts** | Auto-pay above threshold, multi-method (Bank ID, PayPal, Crypto BTC/ETH/USDT/USDC, Tripay), batch processing, rules engine, invoice generation |
| **Finance** | Wallet (topup/withdraw/balance/transactions/pricing/gateways), payment gateway abstraction (Tripay/Midtrans/Manual), margin negotiation (propose/approve/reject/expire) |
| **Advertiser Portal** | Dashboard (summary stats), offer CRUD, conversion approve/reject + batch approve, payout history, profile management |
| **Affiliate Portal** | Dashboard (stats/links/earnings), offer browser/marketplace w/ categories, deep links, tag links, white-label branding, referral codes |
| **Integrations** | Shopee Open Platform API + CSV import + CloakBrowser scraping, Meta CAPI, Google Ads API, TikTok pipeline (download → process → create smartlinks), 3rd party network sync (Passio.eco, Indoleads), BeMob import, Zapier-style webhooks |
| **Content/AI** | Gemini-powered banner/carousel/caption/brand-kit/A-B test/bg-remove generation, landing page templates |
| **Infrastructure** | Cloudflare DNS management, Nginx config generation, Let's Encrypt SSL auto-provisioning, domain lifecycle, API keys w/ scoped permissions (SHA-256 hashed) |
| **Reporting** | Clicks, conversions, attribution (5 models), campaign comparison, Laporan Iklan (Indonesian ad report), Laporan Harian (daily analytics), Laporan Taglink, order reports, custom report builder, CSV export, PDF export, SSE real-time dashboard |
| **Notifications** | In-app (list/mark-read/mark-all), Telegram (daily summary + balance alerts), webhook/Zapier |
| **Security** | HMAC-signed click IDs, SHA-256 hashed API keys, rate limiting, device fingerprinting, role-based auth (admin/affiliate/advertiser/AM/OM) |

---

## Gap Analysis

### 🟥 CORE (Must-Have — Shipping Blocker)

| # | Gap | Current State | Target | Effort |
|---|---|---|---|---|
| 1 | **Smartlink rotation not wired** | `1ai_smartlinks` has `weight_algorithm`(ENUM: random/round_robin/weighted/priority), `geo_rules`(JSON), `device_rules`(JSON). `1ai_offer_landing_pages` has weights + geo/device targeting. But `routeTrafficByHash()` queries `1ai_affiliate_links.offer_id`→single offer. Rotation logic never implemented. Campaign-level `setOfferRotation` exists but controls campaign offer sequence, not smartlink routing. | Route offers/landing pages from `1ai_smartlinks` based on weight_algorithm + rules | 2-3d |
|---|---|---|---|---|
| 2 | **Sub-affiliate / 2-tier program** | Referral system exists (`1ai_referral_codes`, `1ai_user_referrals`). No `parent_affiliate_id`, no commission splitting, no sub-affiliate tree UI. Everflow/Impact/PAP all have multi-tier. | Add commission split config (flat/pct per-level), sub-affiliate tree + hierarchy reports | 3-5d |
|---|---|---|---|---|
| 3 | **Cross-device tracking** | Device fingerprint exists for fraud detection only. No persistent user graph across devices. CAKE/HasOffers use deterministic + probabilistic matching (IP cohort, login bridge, email hash). | Add login-based bridging + fingerprint linking. Attribution currently session-scoped only. | 5-7d |
|---|---|---|---|---|
| 4 | **Real-time push notifications** | Notifications are pull-based (in-app DB table) + Telegram (polled via cron). No WebSocket channels. Everflow/Impact have WS push for clicks, conversions, approvals. | Add Socket.io channels per user: click stream, conversion stream, balance changes | 3-4d |

### 🟧 GROWTH (Should-Have — Competitive Parity)

| # | Gap | Current State | Target | Effort |
|---|---|---|---|---|
| 5 | **Mobile SDK (iOS/Android)** | No SDK. Tracking works via JS pixel / S2S postback only. No deep-link re-engagement, no install attribution, no in-app event tracking. Everflow/CAKE/Adjust/Branch all have SDKs. | Build lightweight SDK w/ test app; integrate w/ existing postback pipeline | 5-10d |
|---|---|---|---|---|
| 6 | **Retargeting / remarketing pixels** | No segment-based retargeting. Affiliates can't build audiences or deploy tracking pixels. Impact/TUNE have pixel management. | Add pixel manager: create/deploy per offer+affiliate, segment builder | 3-5d |
|---|---|---|---|---|
| 7 | **Advanced analytics (cohort, funnel, predictive LTV)** | Basic reports exist (clicks, conversions, attribution, custom). No cohort retention, no funnel visualization, no LTV prediction. | Add cohort queries, funnel builder, LTV projection model | 4-7d |
|---|---|---|---|---|
| 8 | **Automated offer recommendations** | No ML-based offer suggestions. Affiliates browse manually. Post Affiliate Pro/Impact use traffic-based recommendations. | Score affiliate traffic profile → ranked offer suggestions w/ rationale | 3-5d |
|---|---|---|---|---|
| 9 | **Private marketplace / deal IDs** | No PMP / exclusive deal infrastructure. Offers are either accessible (approved) or not. HasOffers/CAKE have invite-only deal flows. | Add invitation system w/ time-bound exclusive deals + deal IDs | 2-4d |
|---|---|---|---|---|
| 10 | **Affiliate compliance system** | Fraud detection exists (click-quality level). No policy violation system, no creative pre-approval, no disclosure/NIH tracking. | Add compliance rules, creative review workflow, violation tracking | 3-5d |
|---|---|---|---|---|
| 11 | **Recurring commissions / subscription tracking** | Commissions are flat per conversion. No subscription billing tracking (recurring CPA, revshare over sub life). | Add subscription lifecycle events, recurring commission schedules | 4-7d |
|---|---|---|---|---|
| 12 | **In-platform messaging** | No messaging between advertiser↔affiliate↔AM. HasOffers/CAKE have built-in messaging. | Add WebSocket chat between roles + message history | 3-5d |

### 🟦 ADVANCED (Nice-to-Have — Market Leader Territory)

| # | Gap | Current State | Target | Effort |
|---|---|---|---|---|
| 13 | **Generic CAPI server** | Only Meta CAPI exists. No generic server-to-server conversion event API. | Build generic CAPI endpoint w/ multi-channel forwarding | 2-3d |
|---|---|---|---|---|
| 14 | **No-code landing page builder** | Landing page templates (HTML/CSS) exist. No drag-drop builder. PAP/ClickFunnels have WYSIWYG. | Integrate lightweight builder or embed external | 5-10d |
|---|---|---|---|---|
| 15 | **Affiliate performance scorecard** | No automated quality scoring beyond fraud detection. No tier system (bronze/silver/gold). | Build 10+ metric scorecard → tier assignment + benefits | 3-5d |
|---|---|---|---|---|
| 16 | **Tiered LTV / channel analytics** | Attribution exists. No lifetime value by channel/cohort. | Add LTV cohort builder, channel-level projection | 4-7d |
|---|---|---|---|---|
| 17 | **AI traffic optimization** | ML fraud exists. Auto-optimizer is rule-based pause. No reinforcement-learning offer selection. | Build RL model for real-time offer selection per visitor | 7-14d |
|---|---|---|---|---|
| 18 | **Affiliate marketplace profiles** | Offer browser exists. No affiliate profile w/ traffic info, ratings, reviews. | Add affiliate profiles, availability status, reviews | 3-5d |
|---|---|---|---|---|
| 19 | **Multi-currency payouts** | Currency formatter supports 11 currencies. Payouts are single-currency. No FX conversion. | Add FX rates service, multi-currency payout selection | 4-7d |
|---|---|---|---|---|
| 20 | **Ad-block detection** | No ad-block detection during redirect. | Add JS-based ad-block detection → fallback routing | 1-2d |

---

## Architecture-Specific Issues

| Issue | Detail | Impact |
|---|---|---|
| **API-first maturity** | Some routes inline business logic (gapfill.js: 79KB). ~50% use clean controller/service pattern. | Harder to version/scale; inconsistent auth patterns |
| **Monolithic admin controller** | `adminController.js`: 36 exports duplicating dedicated controllers | Maintenance burden, unclear ownership |
| **Migration file mismatch** | Consolidated migration creates 13 tables; live DB has 94 `1ai_*` tables from 30+ separate files | Dev onboarding friction, non-reproducible clean DB |
| **No declarative data fetching** | REST over-fetching. No GraphQL or field selectors. | API payload bloat, slower mobile experience |
| **Search via SQL LIKE** | No Elasticsearch/MeiliSearch for offers/products/fraud search | Poor UX at 10K+ scale (11K+ Shopee links) |

---

## Quick Wins (≤2 days each)

1. **Wire smartlink rotation** — schema exists (weight_algorithm, geo_rules, device_rules), just plumb `routeTrafficByHash()` through `1ai_smartlinks` instead of `1ai_affiliate_links.offer_id`
2. **Add Socket.io for push notifications** — SSE already streams clicks; WS adds instant push
3. **Add `parent_affiliate_id` to earnings** — schema + insert change unlocks 2-tier foundation
4. **Add generic CAPI endpoint** — single POST forwarding to multiple channels
5. **Add ad-block detection snippet** — JS in redirect path, flag in logs

---

## Summary

**1ai-affiliate is ~80% feature-complete vs world-class platforms**, with solid foundations across the affiliate lifecycle. The gaps cluster in three areas:

### 🥇 Blockers (must ship before marketing as "world-class")
1. **Smartlink rotation** — schema shows intent, routing ignores it. Top priority.
2. **Sub-affiliate** — no 2-tier = can't recruit other affiliates to scale CPA network
3. **Cross-device tracking** — attribution breaks on multi-device user journeys
4. **Real-time push** — WebSocket notifications missing

### 🥈 Differentiators (focus after blockers)
- Mobile SDK → unlock app install/mobile conversion market
- Advanced analytics → cohort/funnel/predictive LTV beats every competitor
- AI traffic optimization → reinforcement-learning routing is genuinely novel

### 📊 Effort Estimate
- **Phase 1 (2-3 weeks)**: Smartlink rotation + Sub-affiliate + Real-time WS
- **Phase 2 (3-5 weeks)**: Cross-device tracking + Advanced analytics
- **Phase 3 (5-8 weeks)**: Mobile SDK + CAPI + Platform features
  
**Current test suite**: 276 tests pass (16/16 suites, 0 failures)

**Commit**: `18e2108` — `main` branch, clean working tree (env-var sweep + payment gateway refactor committed)
