# E2E Testing Matrix - AdTech Platform

## Test Coverage Overview

| Test Case ID | Component/Role | Scenario Description | Expected Result | Risk Level |
|--------------|----------------|---------------------|-----------------|------------|
| **AUTH-001** | Authentication | Admin login with valid credentials | JWT token returned, role=admin | Low |
| **AUTH-002** | Authentication | Advertiser login with valid credentials | JWT token returned, role=advertiser | Low |
| **AUTH-003** | Authentication | Publisher login with valid credentials | JWT token returned, role=publisher | Low |
| **AUTH-004** | Authentication | AM login with valid credentials | JWT token returned, role=am | Low |
| **AUTH-005** | Authentication | OM login with valid credentials | JWT token returned, role=om | Low |
| **AUTH-006** | Authentication | Invalid credentials login attempt | 401 Unauthorized, no token | Medium |
| **AUTH-007** | Authentication | Expired token access attempt | 401 Unauthorized, token expired | Medium |
| **AUTH-008** | Authentication | Missing Authorization header | 401 Unauthorized | Low |
| **AUTH-009** | Authentication | Role escalation attempt (affiliate→admin) | 403 Forbidden | High |
| **AUTH-010** | Authentication | SQL injection in login form | Input sanitized, no data leak | High |
| | | | | |
| **OFFER-001** | Offer Creation | Advertiser creates offer with valid data | Offer created, status=pending | Low |
| **OFFER-002** | Offer Creation | Admin creates offer on behalf of advertiser | Offer created, status=approved | Low |
| **OFFER-003** | Offer Creation | Advertiser creates offer with negative payout | 400 Bad Request, payout must be >= 0 | Medium |
| **OFFER-004** | Offer Creation | Advertiser creates offer with excessive margin_floor | 400 Bad Request, margin_floor <= 100 | Medium |
| **OFFER-005** | Offer Creation | Offer creation with CPM payout model | Offer created, tracking_type=cpm | Low |
| **OFFER-006** | Offer Creation | Offer creation with CPS payout model | Offer created, tracking_type=cps, revenue_share_pct required | Low |
| **OFFER-007** | Offer Creation | Offer creation with CPV payout model | Offer created, tracking_type=cpv, view_duration required | Low |
| **OFFER-008** | Offer Creation | Affiliate attempts to create offer | 403 Forbidden | High |
| **OFFER-009** | Offer Creation | Duplicate offer name same advertiser | 409 Conflict | Medium |
| **OFFER-010** | Offer Creation | Offer with daily/monthly caps | Cap fields set correctly | Low |
| | | | | |
| **OM-001** | OM Approval | OM approves pending offer | status=approved, approved_by set, approved_at set | Low |
| **OM-002** | OM Approval | OM rejects pending offer | status=rejected, rejection_reason required | Low |
| **OM-003** | OM Approval | OM requests changes | status=changes_requested, om_notes required | Low |
| **OM-004** | OM Approval | OM approves already approved offer | 400 Bad Request, offer already approved | Low |
| **OM-005** | OM Approval | OM rejects already approved offer | 400 Bad Request, cannot reject approved offer | Low |
| **OM-006** | OM Approval | Non-OM attempts approval | 403 Forbidden | High |
| **OM-007** | OM Approval | Advertiser attempts to approve own offer | 403 Forbidden | High |
| **OM-008** | OM Approval | OM approves offer with missing required fields | 400 Bad Request, required fields validation | Medium |
| **OM-009** | OM Approval | Bulk approval of multiple offers | All offers approved atomically | Medium |
| **OM-010** | OM Approval | Approval with modified margin_floor | New margin_floor applied | Low |
| | | | | |
| **AM-001** | AM Assignment | AM assigns offer to specific affiliate | Assignment created, assignment_type=primary | Low |
| **AM-002** | AM Assignment | AM assigns offer globally (all affiliates) | Global flag set, visible to all | Low |
| **AM-003** | AM Assignment | AM assigns offer with margin_override | affiliate_margin set, payout adjusted | Low |
| **AM-004** | AM Assignment | AM assigns offer below margin_floor | 400 Bad Request, margin below safety floor | High |
| **AM-005** | AM Assignment | Non-AM attempts assignment | 403 Forbidden | High |
| **AM-006** | AM Assignment | Assign already assigned offer | Assignment updated or conflict | Medium |
| **AM-007** | AM Assignment | Remove assignment | Assignment deleted, affiliate access revoked | Low |
| **AM-008** | AM Assignment | Assignment with cap_override | Affiliate-specific cap applied | Low |
| **AM-009** | AM Assignment | Assignment with temporary expiration | expiration_date set, auto-cleanup | Medium |
| **AM-010** | AM Assignment | Assignment to inactive affiliate | 400 Bad Request, affiliate not active | Medium |
| | | | | |
| **SMARTLINK-001** | Smartlink Gen | Publisher generates smartlink for assigned offer | Smartlink created, unique slug | Low |
| **SMARTLINK-002** | Smartlink Gen | Publisher generates smartlink for unassigned offer | 403 Forbidden, offer not assigned | High |
| **SMARTLINK-003** | Smartlink Gen | Smartlink with custom domain | URL uses custom domain | Low |
| **SMARTLINK-004** | Smartlink Gen | Smartlink with URL shortener | short_url populated | Low |
| **SMARTLINK-005** | Smartlink Gen | Smartlink with subid tracking | subid parameter preserved | Low |
| **SMARTLINK-006** | Smartlink Gen | Rate limit on smartlink generation | 429 Too Many Requests after limit | Medium |
| **SMARTLINK-007** | Smartlink Gen | Duplicate slug collision | New unique slug generated | Medium |
| **SMARTLINK-008** | Smartlink Gen | Smartlink for offer at daily cap | 403 Forbidden, cap reached | Medium |
| **SMARTLINK-009** | Smartlink Gen | Smartlink for offer at monthly cap | 403 Forbidden, cap reached | Medium |
| **SMARTLINK-010** | Smartlink Gen | Smartlink with deep_link parameter | deep_link parameter preserved in redirect | Low |
| | | | | |
| **TRACKING-001** | Click Tracking | Valid click recorded | Click logged, click_id generated, redirect happens | Low |
| **TRACKING-002** | Click Tracking | Click with bot user-agent | Fraud score elevated, click logged with flag | High |
| **TRACKING-003** | Click Tracking | Click from blacklisted IP | 403 Forbidden or redirect to safe page | High |
| **TRACKING-004** | Click Tracking | Click with missing referrer | Fraud score elevated, click logged | Medium |
| **TRACKING-005** | Click Tracking | Click with proxy/VPN IP | Fraud score elevated, click logged | High |
| **TRACKING-006** | Click Tracking | Rapid clicks from same IP (velocity fraud) | Rate limited, fraud score elevated | High |
| **TRACKING-007** | Click Tracking | Click with GeoIP mismatch | Redirect to geo-appropriate offer or block | Medium |
| **TRACKING-008** | Click Tracking | CPM impression tracking | impression_id logged, payout calculated | Low |
| **TRACKING-009** | Click Tracking | CPV view tracking (partial view) | Partial credit calculated | Medium |
| **TRACKING-010** | Click Tracking | Click with duplicate click_id | Deduplication, existing click_id returned | Medium |
| | | | | |
| **CONVERSION-001** | Conversion | Valid postback received | Conversion logged, payout calculated | Low |
| **CONVERSION-002** | Conversion | Postback with invalid click_id | 404 Not Found or ignored | Medium |
| **CONVERSION-003** | Conversion | Postback with duplicate txid | Deduplication, existing conversion returned | High |
| **CONVERSION-004** | Conversion | Postback with negative margin (payout > revenue) | Conversion blocked or flagged | High |
| **CONVERSION-005** | Conversion | Postback with margin below safety floor | Conversion flagged for review | High |
| **CONVERSION-006** | Conversion | Postback for CPM offer | Impression-based payout calculated | Low |
| **CONVERSION-007** | Conversion | Postback for CPS offer | Revenue share calculated | Low |
| **CONVERSION-008** | Conversion | Postback for CPV offer | View duration credit calculated | Low |
| **CONVERSION-009** | Conversion | Postback with HMAC signature validation | Signature validated, conversion accepted | High |
| **CONVERSION-010** | Conversion | Postback with invalid HMAC signature | 401 Unauthorized, conversion rejected | High |
| | | | | |
| **FRAUD-001** | Fraud Detection | Bot traffic detection (user-agent analysis) | Click blocked, fraud_score > 0.8 | High |
| **FRAUD-002** | Fraud Detection | Click farm detection (IP velocity) | Click blocked, rate limiting applied | High |
| **FRAUD-003** | Fraud Detection | Conversion fraud (duplicate conversions) | Duplicate rejected, fraud_flag set | High |
| **FRAUD-004** | Fraud Detection | Lead fraud (fake leads) | Lead flagged for manual review | High |
| **FRAUD-005** | Fraud Detection | Negative margin protection | Conversion blocked, margin_floor enforced | High |
| **FRAUD-006** | Fraud Detection | Click injection detection | Click invalidated, fraud_score elevated | High |
| **FRAUD-007** | Fraud Detection | Cookie stuffing detection | Click invalidated, affiliate flagged | High |
| **FRAUD-008** | Fraud Detection | Proxy/VPN detection | fraud_score elevated, click logged | Medium |
| **FRAUD-009** | Fraud Detection | Geo-mismatch detection | Click redirected or blocked | Medium |
| **FRAUD-010** | Fraud Detection | Device fingerprint collision | Click flagged, fraud_score elevated | Medium |
| | | | | |
| **MARGIN-001** | Margin Calc | Standard margin calculation (revenue - payout) / revenue | Margin % calculated correctly | Low |
| **MARGIN-002** | Margin Calc | Margin with affiliate override | Override margin applied | Low |
| **MARGIN-003** | Margin Calc | Margin below safety floor | Conversion blocked or flagged | High |
| **MARGIN-004** | Margin Calc | Margin with tier-based adjustment | Tier margin applied | Low |
| **MARGIN-005** | Margin Calc | Real-time margin adjustment | Dynamic margin calculated | Medium |
| **MARGIN-006** | Margin Calc | Negative margin scenario | Conversion blocked, no payout | High |
| **MARGIN-007** | Margin Calc | Margin with CPM model | CPM rate calculated per 1000 impressions | Low |
| **MARGIN-008** | Margin Calc | Margin with CPS model | Revenue share percentage applied | Low |
| **MARGIN-009** | Margin Calc | Margin with CPV model | View duration credit calculated | Low |
| **MARGIN-010** | Margin Calc | Margin with currency conversion | Exchange rate applied | Medium |
| | | | | |
| **DASHBOARD-001** | Dashboard | Admin views all offers | All offers returned with pagination | Low |
| **DASHBOARD-002** | Dashboard | Advertiser views own offers | Only advertiser's offers returned | Low |
| **DASHBOARD-003** | Dashboard | Publisher views assigned offers | Only assigned offers visible | Low |
| **DASHBOARD-004** | Dashboard | AM views assigned affiliates' offers | Affiliates under AM visible | Low |
| **DASHBOARD-005** | Dashboard | OM views pending offers | Only pending offers visible | Low |
| **DASHBOARD-006** | Dashboard | Real-time stats sync | Stats updated within 5 seconds | Medium |
| **DASHBOARD-007** | Dashboard | Stats with date range filter | Filtered stats returned | Low |
| **DASHBOARD-008** | Dashboard | Stats with affiliate breakdown | Per-affiliate stats returned | Low |
| **DASHBOARD-009** | Dashboard | Stats with offer breakdown | Per-offer stats returned | Low |
| **DASHBOARD-010** | Dashboard | Export stats to CSV | CSV file generated correctly | Low |
| | | | | |
| **RBAC-001** | RBAC | Admin accesses all endpoints | All endpoints accessible | Low |
| **RBAC-002** | RBAC | Advertiser accesses only own resources | Only own offers/editable | Medium |
| **RBAC-003** | RBAC | Publisher accesses only assigned resources | Only assigned offers visible | Medium |
| **RBAC-004** | RBAC | AM accesses assigned affiliates' resources | Assigned affiliates visible | Medium |
| **RBAC-005** | RBAC | OM accesses pending offers only | Only pending offers accessible | Medium |
| **RBAC-006** | RBAC | Role escalation attempt | 403 Forbidden | High |
| **RBAC-007** | RBAC | Cross-role data access attempt | 403 Forbidden, data isolation | High |
| **RBAC-008** | RBAC | Inactive user access attempt | 403 Forbidden, account inactive | High |
| **RBAC-009** | RBAC | Deleted user access attempt | 401 Unauthorized | High |
| **RBAC-010** | RBAC | API key authentication | Access granted with valid key | Low |
| | | | | |
| **EDGE-001** | Edge Server | Health check endpoint | 200 OK, status:ok returned | Low |
| **EDGE-002** | Edge Server | Click redirect (hot path) | Redirect within 1ms | Low |
| **EDGE-003** | Edge Server | Click with fraud detection | Fraud score calculated, redirect decision | Medium |
| **EDGE-004** | Edge Server | Click with geo routing | Geo-appropriate offer returned | Low |
| **EDGE-005** | Edge Server | Click with device routing | Device-appropriate offer returned | Low |
| **EDGE-006** | Edge Server | Click with Kafka unavailable | Click logged to fallback, redirect continues | Medium |
| **EDGE-007** | Edge Server | Click with ClickHouse unavailable | Click buffered, redirect continues | Medium |
| **EDGE-008** | Edge Server | Click with Redis unavailable | Click rejected, 503 Service Unavailable | High |
| **EDGE-009** | Edge Server | Postback endpoint | Postback queued for processing | Low |
| **EDGE-010** | Edge Server | Rate limiting per IP | 429 Too Many Requests after limit | Medium |

## Test Execution Priority

### High Priority (Must Pass)
- All AUTH tests (authentication is critical)
- All FRAUD tests (revenue protection)
- All MARGIN tests (financial accuracy)
- All CONVERSION tests (tracking integrity)
- RBAC-006, RBAC-007 (security)
- EDGE-008 (availability)

### Medium Priority (Should Pass)
- All OFFER tests (core functionality)
- All OM tests (workflow)
- All AM tests (workflow)
- All SMARTLINK tests (core functionality)
- TRACKING-003, TRACKING-004, TRACKING-006 (fraud detection)
- CONVERSION-003, CONVERSION-004 (edge cases)
- All DASHBOARD tests (reporting)

### Low Priority (Nice to Have)
- TRACKING-001, TRACKING-002 (happy path)
- EDGE-001 (health check)
- DASHBOARD-010 (export)

## Test Data Requirements

### Users
- 1 Admin (full access)
- 1 Account Manager (AM)
- 1 Offer Manager (OM)
- 2 Advertisers (offer creators)
- 3 Publishers (affiliates with different tiers)
- 1 Inactive user
- 1 Deleted user

### Offers
- 5 Pending offers (for OM approval)
- 3 Approved offers (for AM assignment)
- 2 Rejected offers (for history)
- 1 Offer at daily cap
- 1 Offer at monthly cap
- 1 Offer with negative margin setup

### Assignments
- 3 Specific assignments (AM to affiliate)
- 2 Global assignments
- 1 Assignment with margin override
- 1 Temporary assignment with expiration

### Traffic
- 100 Valid clicks
- 20 Bot clicks
- 10 Proxy/VPN clicks
- 5 Velocity fraud attempts
- 10 Valid conversions
- 5 Duplicate conversion attempts

## Advanced Fraud Scenarios (Industry-Standard)

| Test Case ID | Component | Scenario Description | Expected Result | Risk Level |
|--------------|-----------|---------------------|-----------------|------------|
| **FRAUD-C03** | Conversion | Postback with nonexistent click_id | 404 or rejected | High |
| **FRAUD-C04** | Conversion | Conversion outside attribution window | Rejected, attribution window enforced | High |
| **FRAUD-C08** | Conversion | Stale click (>72h) conversion attempt | Rejected, click_expired reason | High |
| **FRAUD-C09** | Conversion | Click injection (conversion timestamp < click) | Flagged, fraud_score elevated | High |
| **FRAUD-D01** | Pixel Stuffing | 1x1 iframe impression fraud | Detected, blocked, publisher flagged | High |
| **FRAUD-D02** | Ad Stacking | Multiple ads layered on single placement | Detected, fraud_score elevated | High |
| **FRAUD-D03** | Domain Spoofing | Fake Referer header mismatch | Referer validation fails, fraud_score +0.3 | High |
| **FRAUD-D04** | Impression Fraud | Auto-refresh CPM pages | Rate limited, CPM not counted | High |
| **FRAUD-D05** | Incentivized Traffic | CR > 80% anomaly | Fraud flag raised, manual review | High |
| **FRAUD-D06** | Device ID Rotation | Rapid device fingerprint changes | Collision detected, fraud_score elevated | Medium |
| **FRAUD-A07** | Conversion Timing | Click-to-conversion < 1 second | Flagged as anomalous | High |
| **FRAUD-A08** | Geo-Spoofing | VPN IP + mismatched GeoIP | Multi-signal detection, fraud_score +0.5 | High |
| **FRAUD-A09** | SDK Spoofing | Fake app events without SDK | HMAC validation fails, rejected | High |
| **FRAUD-A10** | Attribution Hijack | Last-click steal attempt | Attribution model preserves original source | High |
| **FRAUD-I05** | Datacenter IP | AWS/GCP/Azure IP ranges | Fraud score elevated, logged | Medium |
| **FRAUD-I06** | Tor Exit Node | Known Tor exit relay IP | Flagged for review, blocked if confirmed | Medium |
| **FRAUD-I09** | Country Blacklist | Sanctioned country traffic | Blocked at edge, 403 | Medium |
| **FRAUD-I10** | Manual Blacklist | Admin-added IP to blacklist | Subsequent clicks blocked | Medium |

## Role-Based Scenarios (Production Parity)

### Admin (Super Admin)

| Test Case ID | Scenario Description | Expected Result | Status |
|--------------|---------------------|-----------------|--------|
| ADMIN-001 | Login valid credentials | JWT, role=admin | — |
| ADMIN-002 | View all offers across advertisers | All offers returned | — |
| ADMIN-005 | View all affiliate earnings | All earnings returned | — |
| ADMIN-006 | Approve payout batch | Batch status = approved | — |
| ADMIN-009 | View system stats | Visits, conversions, revenue | — |
| ADMIN-010 | Create user | 201, user created | — |
| ADMIN-010b | Disable user | User status = inactive | — |
| ADMIN-013 | Add IP to blacklist | IP blacklisted, clicks blocked | — |

### Advertiser

| ADV-001 | Create CPA offer | status=pending | — |
| ADV-003 | Create CPS offer with rev share | revenue_share_pct stored | — |
| ADV-004 | Create CPV offer | view_duration stored | — |
| ADV-005 | Create offer with daily cap | cap fields stored | — |
| ADV-011 | Cannot see other advertisers' offers | Own offers only | — |
| ADV-012 | Cannot approve own offer | 403 Forbidden | — |
| ADV-006 | Configure postback URL | Postback URL stored | — |

### Publisher

| PUB-001 | View assigned offers only | Only assigned visible | — |
| PUB-002 | Generate smartlink | Smartlink + slug returned | — |
| PUB-003 | Generate smartlink with subid | subid in URL preserved | — |
| PUB-005 | View own earnings | Only own earnings | — |
| PUB-009 | Generate link for unassigned offer | 403 Forbidden | — |
| PUB-011 | Cannot modify offer | 403 Forbidden | — |

## Industry Comparison Matrix

| Feature | BeMob | Offer18 | Voluum | RedTrack | 1AI Target |
|---------|-------|---------|--------|----------|------------|
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
| API Rate Limiting | ✓ | ✓ | ✓ | ✓ | In Plan |
| Audit Log | ✓ | — | ✓ | ✓ | ✓ |
| Pixel Stuffing Detect | ✓ | — | ✓ | ✓ | In Plan |
| Domain Spoofing | ✓ | — | — | ✓ | In Plan |
| Incentivized Traffic | ✓ | ✓ | ✓ | ✓ | In Plan |
| Load Testing | ✓ | ✓ | ✓ | ✓ | In Plan |