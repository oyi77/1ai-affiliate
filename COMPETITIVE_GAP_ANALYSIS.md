# Competitive Gap Analysis: 1ai-Affiliate vs Industry

## Research: 8 Commercial + 6 Open-Source Platforms Analyzed

### Strategic Position

**We own a niche nobody else does**: free, self-hosted, Go edge + Kafka + ClickHouse + CAPI + anti-fraud. Binom charges $149/mo for less. Keitaro charges €40/mo for less. No modern open-source tracker exists with our stack.

**Biggest threat**: RedTrack — 200+ integrations, server-side CAPI, AI co-pilot, $83/mo. They're what we should look like.

**Biggest opportunity**: Be the open-source Binom/Keitaro. Self-hosted, fixed pricing (free), ClickHouse-powered, with AI tools nobody else has.

### Feature Comparison

| Feature | Voluum | RedTrack | Everflow | Binom | Keitaro | **Us** |
|---|---|---|---|---|---|---|
| Self-hosted | ❌ | ❌ | ❌ | ✅ | ✅ | **✅** |
| ClickHouse | ❌ | ❌ | ❌ | ✅ | ❌ | **✅** |
| Go edge redirect | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Kafka event stream | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Integration templates | 30+ | 200+ | 50+ | 20+ | **500+** | **28+** ✅ |
| Anti-fraud | ✅ | ✅+IPQS | ✅+IPQS | ✅ add-on | ✅ | **✅** |
| CAPI (Meta/Google) | ✅ | ✅ | ✅ | ❌ | ❌ | **✅** |
| Cookieless tracking | ✅ | ✅ | ✅ | ✅ | ✅ | **✅** |
| Multi-currency | ✅ | ✅ | ✅ | ✅ | ✅ | **✅** |
| Attribution | 1st/last | multi | multi+LTV | weighted | 1st/last | **1st/last/linear** |
| Auto-rules | Automizer | Rules+AI | Monitoring | Triggers | Auto-offer | **✅** |
| Affiliate portal | ❌ | ❌ | **✅** | ❌ | ❌ | **✅ building** |
| Batch payouts | ❌ | ❌ | **✅** | ❌ | ❌ | **✅ building** |
| White-label | ❌ | ❌ | ❌ | ✅ | ✅ | **planned** |
| AI creative tools | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ unique** |
| Shopee CSV | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ unique** |
| MCP/Agent API | ❌ | ❌ | ❌ | ❌ | ❌ | **✅ unique** |
| Price | $149+/mo | $83/mo | $750/mo | $149/mo | €40/mo | **Free** |

### Gaps Closed This Session

| Gap | Status | Evidence |
|---|---|---|
| Integration framework | ✅ Done | `server/integrations/registry.js` + `platforms/` |
| Template system | ✅ Done | 28+ traffic source, 9 advertiser, 3 offer templates |
| CAPI gclid fix | ✅ Fixed | `capiService.js` line 192 |
| CAPI event_id dedup | ✅ Done | `handleConversion` 48h dedup check |
| Fraud scoring engine | ✅ Done | `fraudRuleEngine.js` — scoring 0-100 |
| Campaign auto-rules | ✅ Done | `campaignAutoRules.js` — budget/ROAS/CPA caps |
| Auto-sync cron | ✅ Done | Daily at 06:00 UTC via `autoSyncService.js` |
| MCP server | ✅ Done | `mcp/server.js` — 10 tools |
| llms.txt | ✅ Done | Project root |
| API docs | ✅ Done | `server/public/integration-api-docs.md` |
| Affiliate portal | 🔨 Building | Subagent working |
| Batch payouts | 🔨 Building | Subagent working |

### Remaining Gaps (P1 — next session)

1. **White-label support** — custom domain + branding per affiliate
2. **Scheduled report exports** — daily/weekly email with PDF/CSV
3. **Postback template library** — pre-built URLs per network
4. **API key management** — per-affiliate API keys
5. **A/B testing for landing pages** — split traffic between LPs
6. **ML fraud detection** — behavioral analysis

### Open-Source Competitive Landscape

No modern open-source self-hosted tracker exists with:
- ClickHouse analytics ✅
- Go edge redirect ✅
- Kafka event streaming ✅
- CAPI integration ✅
- Anti-fraud engine ✅
- AI creative tools ✅
- MCP/Agent API ✅

**We are the only one.** This is the moat.
