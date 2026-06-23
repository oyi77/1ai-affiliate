# Gap Fill Plan — 15 Missing Pages + SSE Fix

## Pages to Build

### Group 1: Core Tracking Pages (5 pages)
| Page | DB Table | API Route | Nav Label |
|------|----------|-----------|-----------|
| traffic-sources | 1ai_traffic_sources | GET/POST /api/admin/traffic-sources | Traffic Sources |
| deep-links | deep_link_pages | GET/POST /api/admin/deep-links | Deep Links |
| landing-pages | landing_pages | GET /api/admin/landing-pages | Landing Pages |
| conversion-log | 1ai_conversion_logs, conversion_logs | GET /api/admin/conversion-log | Conversion Log |
| postback-builder | 1ai_postback_templates | GET/POST/PUT/DELETE /api/admin/postback-templates | Postback Builder |

### Group 2: Report Pages (5 pages)
| Page | Source | API Route | Nav Label |
|------|--------|-----------|-----------|
| laporan-iklan | 1ai_clicks + 1ai_aff_campaigns | GET /api/admin/laporan-iklan | Laporan Iklan |
| analytic-harian | 1ai_clicks (grouped by day) | GET /api/admin/analytic-harian | Analytic Harian |
| laporan-taglink | 1ai_taglink_mappings | GET /api/admin/laporan-taglink | Laporan Taglink |
| laporan-order | 1ai_conversion_logs | GET /api/admin/laporan-order | Laporan Order |
| laporan-pembayaran | 1ai_affiliate_payments | Alias → payments | Laporan Pembayaran |

### Group 3: Advanced Pages (5 pages)
| Page | DB Table | API Route | Nav Label |
|------|----------|-----------|-----------|
| ab-tests | 1ai_ab_tests, 1ai_ab_test_results | GET/POST /api/admin/ab-tests | A/B Tests |
| automation | 1ai_automation_rules | GET/POST/PUT /api/admin/automation | Automation |
| day-parting | (config-based) | GET/PUT /api/admin/day-parting | Day Parting |
| webhooks | 1ai_webhooks | GET/POST/PUT/DELETE /api/admin/webhooks | Webhooks |
| saldo-budget | 1ai_balance_ledger | GET /api/admin/saldo-budget | Saldo & Budget |

### Group 4: Aliases + Fixes (5 pages)
| Page | Fix |
|------|-----|
| realtime | Alias → clicks (already has SSE) |
| click-tracker | Alias → clicks |
| api-docs | Alias → docs |
| laporan-pembayaran | Alias → payments |
| SSE 401 fix | Remove dead EventSource constructor |

## Implementation Order
1. Create backend API routes (Group 1+2+3)
2. Create frontend PageRenderers (Group 1+2+3)
3. Add nav items + aliases (Group 4)
4. Fix SSE 401
5. Manual UI test all 25 pages
