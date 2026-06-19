# 1ai-Affiliate — Competitive Gap Analysis & Integration Plan

## Competitors Analyzed
| Tracker | Market Position | Pricing | Differentiator |
|---|---|---|---|
| **Voluum** | #1 enterprise | $199-$999/mo | AI traffic distribution, 30+ integrations |
| **Bemob** | #1 free tier | Free + $99-$499/mo | Free tier, clean UX, auto-rules |
| **RedTrack** | Best UI/UX | $149-$699/mo | IFTTT-style automation, white-label |
| **Binom** | Self-hosted king | $69-$249/mo | Sub-ms redirect, click-level retention |
| **Keitaro** | Budget self-hosted | $49-$299/mo | Landing page builder, WP plugin |

---

## Section 1: Tracking & Redirect
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Direct tracking pixel | ⚠️ exists, untested | ✓ | ✓ | ✓ | ✓ | P1 |
| S2S postback | ⚠️ HMAC works, queue broken | ✓ | ✓ | ✓ | ✓ | P1 |
| Campaign-level redirect | ⚠️ hash-based, hardcoded fallback | ✓ | ✓ | ✓ | ✓ | P1 |
| Custom tracking domains | ⚠️ Clickserver CRUD works, edge not wired | ✓ | ✓ | ✓ | ✓ | P1 |
| SSL for custom domains | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Cookie-based tracking fallback | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| Impression tracking | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Deep link / app tracking | ⚠️ page exists, no backend | ✓ | ✓ | ✓ | ❌ | P2 |
| Redirect method selection (301/302/meta/JS) | ❌ | ✓ | ✓ | ✓ | ✓ | P3 |

## Section 2: Traffic Distribution & Optimization
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Weight-based split testing | ✓ in-memory router | ✓ | ✓ | ✓ | ✓ | — |
| AI auto-optimization | ❌ | ✓ | ✓ | ✓ | ❌ | P2 |
| Landing page rotation | ⚠️ router supports, no UI | ✓ | ✓ | ✓ | ✓ | P1 |
| Offer rotation | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Rule-based traffic distribution | ✓ geo/device/carrier/time | ✓ | ✓ | ✓ | ✓ | — |
| Day-parting (time scheduling) | ⚠️ router logic exists, no UI | ✓ | ✓ | ✓ | ✓ | P2 |
| Connection-type routing | ⚠️ router supports, no UI | ✓ | ❌ | ✓ | ❌ | P2 |
| ISP routing | ❌ | ✓ | ❌ | ✓ | ❌ | P3 |
| Multi-offer flow (paths) | ❌ | ✓ | ✓ | ✓ | ❌ | P2 |

## Section 3: Analytics & Reporting
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Real-time dashboard | ⚠️ 30s polling, placeholder charts | ✓ | ✓ | ✓ | ✓ | P1 |
| Time-series charts | ❌ page says "Chart.js placeholder" | ✓ | ✓ | ✓ | ✓ | P1 |
| Custom report builder | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| CSV/PDF export | ⚠️ CSV works, no PDF | ✓ | ✓ | ✓ | ✓ | P3 |
| Scheduled reports (email) | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Drill-down by any dimension | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Hourly/day/week/month grouping | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| Custom dashboards per user | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| EPC/EPV/CR metrics | ⚠️ Dashboard shows some, no CR | ✓ | ✓ | ✓ | ✓ | P1 |
| Click log with all parameters | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Conversion log with payout | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| GEO/device/browser/OS breakdown | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Campaign comparison side-by-side | ❌ | ✓ | ✓ | ✓ | ❌ | P2 |

## Section 4: Anti-Fraud
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Bot UA detection | ✓ 35 signatures | ✓ | ✓ | ✓ | ✓ | — |
| Proxy/VPN detection | ⚠️ proxyIPs never loaded | ✓ | ✓ | ✓ | ✓ | P1 |
| Click frequency analysis | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| IP range blacklist | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| Click-to-conversion time analysis | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Duplicate click detection | ❌ | ✓ | ✓ | ✓ | ✓ | P1 |
| Referer spam detection | ⚠️ basic check only | ✓ | ✓ | ✓ | ✓ | P2 |

## Section 5: Conversions & Attribution
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Postback URL builder | ⚠️ page exists, untested | ✓ | ✓ | ✓ | ✓ | P1 |
| Multi-touch attribution | ⚠️ page exists, no data | ✓ | ✓ | ✓ | ✓ | P2 |
| Conversion pixel | ⚠️ exists, untested | ✓ | ✓ | ✓ | ✓ | P1 |
| Server-to-server postback | ✓ HMAC works | ✓ | ✓ | ✓ | ✓ | — |
| Manual conversion upload | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| Conversion statuses (approved/pending/rejected) | ⚠️ DB schema has, no UI | ✓ | ✓ | ✓ | ✓ | P2 |

## Section 6: Team & Multi-User
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Role-based access (RBAC) | ✓ admin/affiliate/advertiser | ✓ | ✓ | ✓ | ✓ | — |
| Workspace isolation | ⚠️ same DB, role-filtered | ✓ | ✓ | ✓ | ❌ | P2 |
| Granular permissions per campaign | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Activity/audit log | ⚠️ auditLog middleware exists | ✓ | ✓ | ✓ | ❌ | P3 |
| White-label (custom branding) | ❌ | ✓ | ❌ | ✓ | ❌ | P3 |

## Section 7: Integrations
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Traffic source API integrations | ❌ | 30+ | 10+ | 20+ | ❌ | P2 |
| Webhook outbound | ⚠️ Go webhook dispatcher exists | ✓ | ✓ | ✓ | ✓ | P2 |
| Zapier / Make.com | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Google Sheets sync | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Payment gateway (Tripay) | ✓ | ❌ | ❌ | ❌ | ❌ | — |
| Email notifications | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Slack/Telegram alerts | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |

## Section 8: Developer Experience
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| REST API | ✓ Node.js + PHP V3 | ✓ | ✓ | ✓ | ✓ | — |
| Swagger/OpenAPI docs | ✓ | ❌ | ✓ | ❌ | ❌ | — |
| GraphQL API | ❌ schema in Go, no resolvers | ❌ | ❌ | ❌ | ❌ | P3 |
| Webhook signing (HMAC) | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| API rate limiting | ⚠️ in-memory only | ✓ | ✓ | ✓ | ✓ | P1 |
| Postman collection | ❌ | ✓ | ✓ | ❌ | ❌ | P3 |
| SDK (JS/Python/PHP) | ❌ | ❌ | ✓ | ❌ | ❌ | P3 |

## Section 9: Infrastructure & Operations
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| TLS/SSL | ❌ | ✓ | ✓ | ✓ | ✓ | P0 |
| Horizontal scaling | ⚠️ K8s manifests exist | ✓ | ✓ | ✓ | ✓ | P2 |
| Redis HA | ❌ single node | ✓ | ✓ | ✓ | N/A | P2 |
| GeoIP auto-update | ❌ static file | ✓ | ✓ | ✓ | ✓ | P2 |
| Database backups | ❌ | ✓ | ✓ | ✓ | ❌ | P2 |
| Health monitoring (Prometheus) | ⚠️ /metrics stubbed | ✓ | ✓ | ✓ | ❌ | P2 |
| Uptime SLA | ❌ | 99.9% | 99.9% | 99.9% | N/A | P2 |
| Docker/K8s deployment | ✓ compose + k8s manifests | ✓ | ✓ | ✓ | ❌ | — |
| Graceful shutdown | ⚠️ Node no, Go ordered wrong | ✓ | ✓ | ✓ | ✓ | P1 |

## Section 10: UI/UX
| Feature | Us | Voluum | Bemob | RedTrack | Binom | Priority |
|---|---|---|---|---|---|---|
| Professional design | ⚠️ just upgraded | ✓✓✓ | ✓✓✓ | ✓✓✓ | ✓✓ | P1 |
| Mobile responsive | ⚠️ sidebar off-canvas, hidden search | ✓ | ✓ | ✓ | ✓ | P2 |
| Dark mode | ✓ | ❌ | ✓ | ✓ | ✓ | — |
| Onboarding wizard | ❌ | ✓ | ✓ | ❌ | ❌ | P3 |
| In-app notifications | ❌ | ✓ | ✓ | ✓ | ❌ | P3 |
| Guided tours | ❌ | ✓ | ❌ | ❌ | ❌ | P3 |
| Error boundaries (no white screen) | ❌ | ✓ | ✓ | ✓ | ✓ | P0 |
| Loading states / skeletons | ❌ DataTable ignores isLoading | ✓ | ✓ | ✓ | ✓ | P1 |
| Empty states (helpful messaging) | ❌ | ✓ | ✓ | ✓ | ✓ | P2 |
| Undo on delete | ❌ | ❌ | ❌ | ✓ | ❌ | P3 |

---

## Summary: 10 Categories, 80+ Features

| Priority | Count | Definition |
|---|---|---|
| **P0** — Launch blockers | 3 | TLS, error boundaries, proxy fraud loading |
| **P1** — MVP table stakes | 21 | SSL domains, charts, click logs, loading states, graceful shutdown |
| **P2** — Competitive parity | 26 | Landing page rotation, multi-touch, webhooks, scaling |
| **P3** — Nice to have | 16 | White-label, email reports, SDK |
| **Done** ✓ | 14 | Routing, bot detection, S2S, Swagger, RBAC, HMAC |

---

## Implementation Phases

### Phase A: "Solid Core" (P0 + critical P1) — 2 weeks
```
Goal: Can process real traffic without data loss or white screens
```
- [ ] TLS/SSL on edge + Node
- [ ] Proxy IP loading into fraud detector
- [ ] Error boundaries on all 28 pages
- [ ] DataTable loading/skeleton states
- [ ] 401 redirect to login
- [ ] Graceful shutdown (Node + Go)
- [ ] ClickHouse live charting (replacing placeholder)
- [ ] Fix postback queue (missing table, state machine)
- [ ] Campaign redirect wiring (hash → campaign lookup → router)
- [ ] SSL cert provisioning for custom domains

### Phase B: "Feature Complete" (remaining P1 + key P2) — 3 weeks
```
Goal: Can demo against Voluum/Bemob feature-for-feature
```
- [ ] Real-time dashboard with Chart.js/Recharts
- [ ] Drill-down analytics (by geo/device/browser/OS/offer/affiliate)
- [ ] Click log + conversion log views
- [ ] Landing page rotation UI
- [ ] Offer rotation UI
- [ ] Traffic distribution rule builder (visual)
- [ ] Conversion pixel w/ test mode
- [ ] Postback URL builder w/ validation
- [ ] Multi-touch attribution (first/last/linear/time-decay)
- [ ] EPC/CR/ROI metrics on all views
- [ ] Campaign comparison tool
- [ ] Webhook management UI (outbound)
- [ ] API rate limiting (Redis-backed)
- [ ] Mobile-responsive full audit
- [ ] Hot-reload campaign rules from Redis into edge router

### Phase C: "Operational Ready" (P2 operations + P3) — 2 weeks
```
Goal: Can sell to first paying customer
```
- [ ] One-click deploy (Docker Compose → production)
- [ ] Prometheus metrics (edge + Node)
- [ ] GeoIP auto-update cron
- [ ] Redis HA config
- [ ] Database backup/restore scripts
- [ ] Uptime monitoring integration
- [ ] White-label config
- [ ] Onboarding wizard
- [ ] Email/Slack notification webhooks
- [ ] PDF report export
- [ ] Traffic source template integrations (TikTok, Meta, Google)

### Phase D: "Market Leader" (P3 + innovations) — 2 weeks
```
Goal: Features Voluum/Bemob DON'T have
```
- [ ] AI traffic optimization (Gemini-powered auto-routing)
- [ ] Built-in landing page builder with Gemini
- [ ] AI creative A/B test analysis
- [ ] WhatsApp/Telegram conversion notifications
- [ ] Instagram/TikTok comment-to-click tracking
- [ ] Crypto payment integration (USDC payouts)
- [ ] Real-time bid optimization feedback loop
- [ ] Affiliate marketplace (built into platform)
