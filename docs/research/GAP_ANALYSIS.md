# Gap Analysis
> Platform: 1AI Affiliate | Updated: 2026-06-24 | Read with: FEATURE_MATRIX.md

## Scoreboard
- Total features tracked: 42
- Our ✅/⭐: 36 (86%)
- Our ❌: 0 (0%)
- Our 🚧: 6 (14%)
- P0 open: 4 | P1 open: 6 | P2 open: 3

---

## P0 — Critical Gaps (fix before anything else)

### GAP-001: SQL Injection in Legacy PHP Code
- **Status:** 🚧 (70.5% raw queries, 1,129 vulnerable)
- **Competitors who have it:** All competitors use parameterized queries
- **User impact:** Data breach, full database compromise
- **Done looks like:** 100% parameterized queries in all PHP code
- **Effort:** XL
- **Sprint:** 1
- **Closed:** [ ]

### GAP-002: Production Security Hardening
- **Status:** 🚧 (display_errors=On, httponly=false, no CSRF)
- **Competitors who have it:** All production competitors
- **User impact:** Session hijacking, XSS exploitation, error info leaks
- **Done looks like:** display_errors=Off, httponly=true, CSRF tokens on all forms
- **Effort:** M
- **Sprint:** 1
- **Closed:** [ ]

### GAP-003: Test Coverage (15-20% → 70%+)
- **Status:** 🚧 (tracking_support has 0 tests, ~15-20% overall)
- **Competitors who have it:** RedTrack (80%+), Voluum (75%+)
- **User impact:** Regressions, broken features in production
- **Done looks like:** 70%+ coverage on critical paths (tracking, attribution, fraud)
- **Effort:** XL
- **Sprint:** 1-2
- **Closed:** [ ]

### GAP-004: Mobile-Responsive Dashboard
- **Status:** 🚧 (React SPA is responsive, vanilla SPA is not)
- **Competitors who have it:** BeMob (✅), RedTrack (✅), Voluum (✅)
- **User impact:** Can't manage campaigns on mobile
- **Done looks like:** Full mobile-responsive React SPA replaces vanilla SPA
- **Effort:** M
- **Sprint:** 1
- **Closed:** [ ]

---

## P1 — Strategic Gaps (surpass, not just match)

### GAP-010: Native Ad Platform Integrations (200+)
- **Status:** 🚧 (BeMob API, TrackPro, Shopee done; need Meta Ads, Google Ads, TikTok Ads APIs)
- **Best competitor version:** RedTrack — 200+ native integrations
- **Our current state:** 3 integrations (BeMob, TrackPro, Shopee)
- **Surpassed looks like:** 20+ native integrations with auto-sync
- **Effort:** L
- **Sprint:** 2
- **Closed:** [ ]

### GAP-011: Advanced Reporting (75+ Dimensions)
- **Status:** 🚧 (basic reports done, need multi-dimensional breakdowns)
- **Best competitor version:** Offer18 — 75+ report dimensions
- **Our current state:** 8 report types, basic filtering
- **Surpassed looks like:** 50+ dimensions with custom report builder
- **Effort:** L
- **Sprint:** 2
- **Closed:** [ ]

### GAP-012: God Files Refactoring (6 files > 3000 LOC)
- **Status:** 🚧 (connect2.php, functions-tracking1ai.php, class-dataengine.php, etc.)
- **Best competitor version:** N/A (internal quality)
- **Our current state:** 6 PHP files exceed 3,000 LOC each
- **Surpassed looks like:** No file exceeds 500 LOC, proper module separation
- **Effort:** XL
- **Sprint:** 2-3
- **Closed:** [ ]

### GAP-013: Landing Page Visual Builder (Drag & Drop)
- **Status:** 🚧 (template gallery done, need drag-and-drop editor)
- **Best competitor version:** Voluum — visual landing page builder
- **Our current state:** Template gallery with HTML customization
- **Surpassed looks like:** Drag-and-drop builder with live preview
- **Effort:** L
- **Sprint:** 2
- **Closed:** [ ]

### GAP-014: Automated Campaign Rules Engine
- **Status:** 🚧 (basic rules done, need visual rule builder)
- **Best competitor version:** Voluum Automizer — AI-driven rules
- **Our current state:** Text-based rule configuration
- **Surpassed looks like:** Visual rule builder with AI suggestions
- **Effort:** M
- **Sprint:** 2
- **Closed:** [ ]

### GAP-015: Multi-Currency & Multi-Language
- **Status:** 🚧 (IDR default, need multi-currency conversion)
- **Best competitor version:** RedTrack — 50+ currencies, 10+ languages
- **Our current state:** IDR-only, English UI
- **Surpassed looks like:** 20+ currencies with live exchange rates, i18n support
- **Effort:** M
- **Sprint:** 2
- **Closed:** [ ]

---

## P2 — Moat Opportunities (nobody has this)

### MOAT-001: AI Traffic Optimization (Autonomous)
- **Source of insight:** Voluum has AI, but it's rule-based. We can do autonomous.
- **User pain it solves:** Manual campaign optimization takes hours daily
- **Why competitors haven't done it:** Requires ML infrastructure + real-time data pipeline
- **Our edge:** Go edge server + ClickHouse + Kafka = real-time data foundation
- **Effort:** XL
- **Target sprint:** 3
- **Closed:** [ ]

### MOAT-002: Self-Hosted + Cloud Hybrid with Auto-Sync
- **Source of insight:** Prosper202 is self-hosted but no cloud. Others are cloud-only.
- **User pain it solves:** Data sovereignty + convenience
- **Why competitors haven't done it:** Architecture complexity
- **Our edge:** Already have both (Go edge + Node API + PHP core)
- **Effort:** L
- **Target sprint:** 3
- **Closed:** [ ]

### MOAT-003: AI Co-Pilot for Campaign Creation
- **Source of insight:** RedTrack has beta AI. Nobody has full co-pilot.
- **User pain it solves:** New affiliates don't know how to set up campaigns
- **Why competitors haven't done it:** Requires LLM integration + domain knowledge
- **Our edge:** Already have AI agent framework (VoltAgent)
- **Effort:** M
- **Target sprint:** 2
- **Closed:** [ ]

---

## Closed (Archive)
| Gap ID | Name | Sprint | Result |
|--------|------|--------|--------|
| GAP-005 | Landing Page Builder | 1 | Template gallery with categories |
| GAP-006 | BeMob Integration | 1 | API connected, campaigns importable |
| GAP-007 | TrackPro Integration | 1 | Commission sync working |
| GAP-008 | Shopee Integration | 1 | Cookie-based API connected |
| GAP-009 | Clean URL Routing | 1 | /campaigns, /offers, etc. (no /dist/) |

## Discovery Log
| Date | Gap | Source | Priority |
|------|-----|--------|----------|
| 2026-06-24 | SQL injection surface | Codebase audit | P0 |
| 2026-06-24 | display_errors=On | Codebase audit | P0 |
| 2026-06-24 | No CSRF protection | Codebase audit | P0 |
| 2026-06-24 | httponly=false cookies | Codebase audit | P0 |
| 2026-06-24 | 15-20% test coverage | Codebase audit | P0 |
| 2026-06-24 | 6 god files >3000 LOC | Codebase audit | P1 |
| 2026-06-24 | 200+ integrations gap | Competitor research | P1 |
| 2026-06-24 | 75+ report dimensions | Competitor research | P1 |

## Sprint 1 Updates (2026-06-24)

### Closed This Sprint
| Gap ID | Name | Result |
|--------|------|--------|
| GAP-002 | Production Security Hardening | display_errors Off, session security, CSRF tokens |
| GAP-015 | Multi-Currency | 16 exchange rates seeded, conversion API, live sync |
| GAP-010 | Meta Ads Integration | Account fetch, spend sync, spend view (token needs refresh) |
| MOAT-003 | AI Co-Pilot | Rule-based + Gemini-powered campaign suggestions |
