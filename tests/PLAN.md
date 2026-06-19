# Test Plan — 1AI Affiliate vs Industry Standards

Comprehensive QA plan covering all user roles, fraud vectors, and scenarios matching
BeMob, Offer18, Voluum, and RedTrack capabilities.

## Existing Coverage

| Layer | Tests | Files | ~Cases |
|-------|-------|-------|--------|
| PHP Unit | Attribution, Click, Conversion, Offer, Rotator, User, Auth, AI, Fraud | 55+ PHP files | ~250 |
| Go Unit | Fraud detection (edge) | 1 file | 8 |
| Node E2E | OM, AM, Multi-Model, Fraud, Margin | 1 file (631 lines) | 15 |
| Playwright | Attribution dashboard | 1 file | 1 (broken on Kali) |
| Matrix | E2E_MATRIX.md (all layers) | 1 doc | 110 scenarios |

## User Role Test Matrix

### 1. Admin (Super Admin)

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| ADMIN-001 | Login with valid credentials | HIGH | ✓ E2E |
| ADMIN-002 | View all offers across advertisers | HIGH | — |
| ADMIN-003 | Create offer on behalf of advertiser | HIGH | — |
| ADMIN-004 | Override margin floor | HIGH | — |
| ADMIN-005 | View all affiliate earnings | HIGH | — |
| ADMIN-006 | Approve/reject payout batches | HIGH | — |
| ADMIN-007 | Manage custom domains (CRUD) | MED | — |
| ADMIN-008 | Manage URL shortener integrations | MED | — |
| ADMIN-009 | View system health dashboard | MED | — |
| ADMIN-010 | Manage users (create/disable/delete) | HIGH | — |
| ADMIN-011 | View audit logs | HIGH | — |
| ADMIN-012 | Configure fraud detection thresholds | HIGH | — |
| ADMIN-013 | Blacklist IP/UA/geo | HIGH | — |
| ADMIN-014 | Export reports (CSV/PDF) | MED | — |
| ADMIN-015 | Set global rate limits | MED | — |

### 2. Advertiser (Offer Owner)

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| ADV-001 | Create CPA offer | HIGH | ✓ E2E |
| ADV-002 | Create CPM offer | HIGH | — |
| ADV-003 | Create CPS offer with rev share | HIGH | — |
| ADV-004 | Create CPV offer with view duration | HIGH | — |
| ADV-005 | Set daily/monthly caps | HIGH | — |
| ADV-006 | Configure postback URL | HIGH | — |
| ADV-007 | Set geo-targeting rules | MED | — |
| ADV-008 | Set device targeting rules | MED | — |
| ADV-009 | View own offer performance | HIGH | — |
| ADV-010 | View conversion log | HIGH | — |
| ADV-011 | Cannot see other advertisers' offers | HIGH | — |
| ADV-012 | Cannot approve own offers | HIGH | ✓ E2E |
| ADV-013 | Cannot assign offers to affiliates | HIGH | — |
| ADV-014 | Set margin floor | HIGH | — |
| ADV-015 | Configure conversion window | MED | — |
| ADV-016 | Set traffic caps per affiliate | MED | — |

### 3. Publisher (Affiliate)

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| PUB-001 | View assigned offers only | HIGH | — |
| PUB-002 | Generate smartlink for assigned offer | HIGH | ✓ E2E |
| PUB-003 | Generate deep link with subid | HIGH | — |
| PUB-004 | Generate landing page code | MED | — |
| PUB-005 | View own earnings dashboard | HIGH | — |
| PUB-006 | View click/conversion stats | HIGH | — |
| PUB-007 | Request payout | HIGH | — |
| PUB-008 | View payout history | HIGH | — |
| PUB-009 | Cannot generate link for unassigned offer | HIGH | ✓ E2E |
| PUB-010 | Cannot see other publishers' stats | HIGH | — |
| PUB-011 | Cannot modify offer settings | HIGH | — |
| PUB-012 | Manage subids | MED | — |
| PUB-013 | View commission tier progress | MED | — |
| PUB-014 | Export own reports | MED | — |
| PUB-015 | Use custom domain for smartlinks | MED | — |

### 4. Account Manager (AM)

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| AM-001 | Assign offer to specific affiliate | HIGH | ✓ E2E |
| AM-002 | Assign offer globally | HIGH | ✓ E2E |
| AM-003 | Set custom payout per affiliate | HIGH | ✓ E2E |
| AM-004 | Enforce margin floor on assignment | HIGH | ✓ E2E |
| AM-005 | Remove assignment | MED | — |
| AM-006 | Set temporary assignment with expiry | MED | — |
| AM-007 | Cannot assign below margin floor | HIGH | ✓ E2E |
| AM-008 | Cannot assign to inactive affiliate | MED | — |
| AM-009 | View assigned affiliates' performance | HIGH | — |
| AM-010 | Bulk assign offers | MED | — |
| AM-011 | Override cap per affiliate | MED | — |
| AM-012 | Set auto-approve for affiliate applications | MED | — |

### 5. Offer Manager (OM)

| ID | Scenario | Priority | Status |
|----|----------|----------|--------|
| OM-001 | Approve pending offer | HIGH | ✓ E2E |
| OM-002 | Reject offer with reason | HIGH | ✓ E2E |
| OM-003 | Request changes | MED | — |
| OM-004 | Cannot approve already-approved offer | MED | ✓ E2E |
| OM-005 | Cannot reject already-rejected offer | MED | — |
| OM-006 | View pending offers queue | HIGH | — |
| OM-007 | Set approval notes | MED | — |
| OM-008 | Bulk approve offers | MED | — |
| OM-009 | Non-OM cannot approve | HIGH | ✓ E2E |
| OM-010 | Advertiser cannot approve own offer | HIGH | ✓ E2E |

## Fraud Detection Test Matrix

### A. Bot Traffic Detection

| ID | Scenario | Expected | Status |
|----|----------|----------|--------|
| FRAUD-B01 | Googlebot UA | fraud_score ≥ 0.4, logged | ✓ Go test |
| FRAUD-B02 | Python requests UA | fraud_score ≥ 0.4 | ✓ Go test |
| FRAUD-B03 | curl/wget UA | fraud_score ≥ 0.4 | ✓ Go test |
| FRAUD-B04 | Empty user agent | fraud_score +0.2 | ✓ Go test |
| FRAUD-B05 | Headless Chrome UA | fraud_score elevated | — |
| FRAUD-B06 | Custom bot UA (not in base list) | blacklist check | ✓ Node |
| FRAUD-B07 | 40+ known bot signatures | all detected | ✓ Go |

### B. IP-Based Fraud

| ID | Scenario | Expected | Status |
|----|----------|----------|--------|
| FRAUD-I01 | Known proxy IP | fraud_score +0.3 | ✓ Go test |
| FRAUD-I02 | Known VPN IP | fraud_score +0.3 | ✓ Go test |
| FRAUD-I03 | IP velocity attack (50+ clicks/min) | blocked | ✓ Node E2E |
| FRAUD-I04 | Rapid clicks (3+ in 1s) | blocked | ✓ Node E2E |
| FRAUD-I05 | Datacenter IP range | fraud_score elevated | — |
| FRAUD-I06 | Tor exit node | fraud_score elevated | — |
| FRAUD-I07 | IP reputation via IPQS | score from API | ✓ PHP test |
| FRAUD-I08 | IP geo-mismatch with offer geo | fraud_score +0.2 | ✓ PHP test |
| FRAUD-I09 | Country blacklist (e.g., North Korea) | blocked | — |
| FRAUD-I10 | IP blacklist from admin panel | blocked | — |

### C. Conversion Fraud

| ID | Scenario | Expected | Status |
|----|----------|----------|--------|
| FRAUD-C01 | Duplicate click_id conversion | blocked | ✓ Node E2E |
| FRAUD-C02 | Duplicate transaction ID | deduplicated | — |
| FRAUD-C03 | Conversion without prior click | rejected | — |
| FRAUD-C04 | Conversion outside attribution window | rejected | — |
| FRAUD-C05 | Negative margin conversion | blocked | ✓ Node E2E |
| FRAUD-C06 | Conversion rate anomaly (>50%) | fraud_score +0.2 | ✓ PHP test |
| FRAUD-C07 | Time-clustered conversions | fraud_score +0.4 | ✓ PHP test |
| FRAUD-C08 | Conversion with stale click (>72h) | rejected | — |
| FRAUD-C09 | Click injection (timestamp anomaly) | flagged | — |
| FRAUD-C10 | Cookie stuffing detection | flagged | — |

### D. Advanced Fraud (Industry-Standard)

| ID | Scenario | Expected | Status |
|----|----------|----------|--------|
| FRAUD-A01 | Pixel stuffing (1x1 invisible iframe) | detected, blocked | — |
| FRAUD-A02 | Ad stacking (overlay abuse) | detected, flagged | — |
| FRAUD-A03 | Domain spoofing (fake referrer) | referrer validation fails | — |
| FRAUD-A04 | Impression fraud (auto-refresh) | CPM rate limited | — |
| FRAUD-A05 | Incentivized traffic (offerwall) | conversion rate anomaly | — |
| FRAUD-A06 | Device ID rotation | fingerprint collision | — |
| FRAUD-A07 | Click-to-conversion time anomaly | < 1s conversions flagged | — |
| FRAUD-A08 | Geo-spoofing (VPN + matching geo UA) | multi-signal detection | — |
| FRAUD-A09 | SDK spoofing (fake app events) | HMAC validation | — |
| FRAUD-A10 | Attribution hijacking (last-click steal) | attribution model check | — |

## Industry Comparison

| Feature | BeMob | Offer18 | Voluum | RedTrack | 1AI |
|---------|-------|---------|--------|----------|-----|
| S2S Postback | ✓ | ✓ | ✓ | ✓ | ✓ |
| Multi-Touch Attribution | ✓ | ✓ | ✓ | ✓ | ✓ |
| Smart Traffic Routing | ✓ | ✓ | ✓ | ✓ | ✓ |
| Real-time Reporting | ✓ | ✓ | ✓ | ✓ | ✓ |
| Click Fraud Detection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Conversion Fraud | ✓ | ✓ | ✓ | ✓ | ✓ |
| IP Velocity Check | ✓ | — | ✓ | ✓ | ✓ |
| Bot UA Database | ✓ | ✓ | ✓ | ✓ | ✓ |
| Proxy/VPN Detection | ✓ | — | ✓ | ✓ | ✓ |
| Custom Domains | ✓ | ✓ | ✓ | ✓ | ✓ |
| URL Shortener Integr. | — | — | — | ✓ | ✓ |
| AI Content Tools | — | — | — | — | ✓ |
| Telegram/FB Pipeline | — | — | — | — | ✓ |
| RBAC (5 roles) | ✓ | ✓ | ✓ | ✓ | ✓ |
| API Rate Limiting | ✓ | ✓ | ✓ | ✓ | — |
| Load Testing | ✓ | ✓ | ✓ | ✓ | — |
| Audit Log | ✓ | — | ✓ | ✓ | ✓ |
| GEO + Device Targeting | ✓ | ✓ | ✓ | ✓ | ✓ |
| Day-Parting | ✓ | ✓ | ✓ | ✓ | — |

## Gap Analysis — Priority Implementation Order

### Tier 1 — Must Implement (Blocks production parity)
1. **Role-based API tests** (ADMIN, ADVERTISER, PUBLISHER) — 30 scenarios
2. **Advanced fraud tests** — Pixel stuffing, ad stacking, domain spoofing
3. **Conversion window enforcement** — Tests for stale conversions
4. **Rate limiting tests** — API and click-level

### Tier 2 — Should Implement
5. **Geo-targeting tests** — Country/region/city routing validation
6. **Device targeting tests** — OS/browser/carrier routing
7. **Day-parting tests** — Time-window rule validation
8. **Load/stress tests** — k6 or artillery for 10K concurrent clicks

### Tier 3 — Nice to Have
9. **Cross-platform fingerprint tests** — Device ID consistency
10. **GDPR/CCPA compliance tests** — Consent-based tracking
11. **Multi-currency tests** — IDR, USD, EUR conversions
12. **SSE streaming tests** — Real-time dashboard updates

## Test Runner Architecture

```
tests/
├── e2e/                          # Full integration tests (Node + real DB)
│   ├── roles/                    # Per-role test suites
│   │   ├── admin.test.js
│   │   ├── advertiser.test.js
│   │   ├── publisher.test.js
│   │   ├── am.test.js
│   │   └── om.test.js
│   ├── fraud/                    # Fraud scenario tests
│   │   ├── bot-detection.test.js
│   │   ├── ip-fraud.test.js
│   │   ├── conversion-fraud.test.js
│   │   └── advanced-fraud.test.js
│   ├── tracking/                 # Click/conversion/attribution
│   │   ├── click-flow.test.js
│   │   ├── conversion-flow.test.js
│   │   └── attribution.test.js
│   └── smoke/                    # Quick sanity (30s)
│       └── health.test.js
├── playwright/                   # Visual/browser tests
│   └── *.spec.js
└── runner.js                     # Unified test orchestrator
```

## Running Tests

```bash
# Quick smoke (all roles + basic fraud, ~30s)
node tests/runner.js smoke

# Full E2E (all scenarios, ~5min)
node tests/runner.js e2e

# Role-specific
node tests/runner.js roles:admin
node tests/runner.js roles:publisher

# Fraud only
node tests/runner.js fraud

# Watch mode (dev)
node tests/runner.js --watch
```
