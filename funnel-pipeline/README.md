# funnel-pipeline — DEPRECATED

> **Status**: Absorbed into root Node.js server (`server/services/pipelineService.js` + `pipelineWorker.js`)

## What happened

This Python-based affiliate content pipeline (`scripts/affiliate_content_pipeline.py`) has been **fully absorbed** into the root 1ai-Affiliate platform as a native Node.js module.

### New location
- Service: `../server/services/pipelineService.js`
- Worker: `../server/services/pipelineWorker.js`
- API routes: `../server/routes/pipeline.js` (mounted at `/api/pipeline`)
- Scheduler: Manual trigger via API (`/api/pipeline/enqueue`)
- Queue table: `1ai_pipeline_jobs` (MySQL, created by migration `2026_06_10_add_pipeline_jobs.sql`)

### Key improvements in the absorbed version

| Feature | Python (deprecated) | Node (current) |
|---------|---------------------|----------------|
| **Smartlink tracking** | ❌ Posted bare `lynk.id` links | ✅ Auto-mints `/go/<slug>` tracked smartlinks via `mintSmartlink()` per niche |
| **Database** | SQLite (`pipeline.db`) | MySQL (unified platform, `1ai_pipeline_jobs`) |
| **Smartlink mapping** | Bare `SHOPEE_LINKS_JSON` env | Niche → `1ai_offers.id` map, auto-mints tracked links |
| **Meta token** | Committed in `config/config.example.json` ⚠️ | Env vars only (`FB_PAGES_JSON`, `IG_ACCOUNTS_JSON`) |
| **Video mutation** | FFmpeg subprocess | FFmpeg via `execFileAsync` (same) |
| **TikTok download** | `tikwm.com` API | Same, wrapped with `fetch` |
| **Scheduling** | External cron | Manual trigger via API (`/api/pipeline/enqueue`) |
| **Admin API** | None | `/api/pipeline/*` (enqueue, status, list, get) |

### Security note

The Python `config/config.example.json` contained a **live Meta access token + 16 FB page IDs + IG account ID** (committed secret). The Node version uses only environment variables.

### Missing data migration

Unlike the Telegram poster (which has `import_promo_queue.js`), **no SQLite → MySQL migrator exists yet** for the funnel pipeline's `pipeline.db`. If you have historical jobs in SQLite, a migrator should be written (mirroring `import_promo_queue.js`).

### Running the new service

1. Ensure `FB_PAGES_JSON`, `IG_ACCOUNTS_JSON`, `SHOPEE_LINKS_JSON` are set in `.env`
2. Ensure MySQL migrations have run (including `2026_07_01_add_promo_queue_smartlink.sql`)
3. Start the Node server: `node server/app.js` (port 3001)
4. Enqueue jobs via API: `POST /api/pipeline/enqueue { "url": "https://tiktok.com/@user/video/...", "niche": "hijab" }`

### Deprecation timeline

- **2026-06-10**: Python code absorbed, MySQL migration completed
- **2026-07-01**: Smartlink tracking loop closed (minted tracked links per niche instead of bare `lynk.id`)
- **Future**: This directory will be removed. Use `../server/services/pipelineService.js` directly.

---

**Last updated**: 2026-07-01
**Migration commit**: `c5d384c feat(affiliate): close tracking loop with smartlink integration in poster and pipeline`