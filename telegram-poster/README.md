# telegram-poster — DEPRECATED

> **Status**: Absorbed into root Node.js server (`server/services/posterService.js` + `posterWorker.js`)

## What happened

This Python-based Telegram poster (`poster.py`) has been **fully absorbed** into the root 1ai-Affiliate platform as a native Node.js module.

### New location
- Service: `../server/services/posterService.js`
- Worker: `../server/services/posterWorker.js`
- API routes: `../server/routes/poster.js` (mounted at `/api/poster`)
- Scheduler: Started automatically in `../server/app.js`
- Queue table: `1ai_promo_queue` (MySQL, created by migration `2026_06_10_add_promo_queue.sql`)

### Key improvements in the absorbed version

| Feature | Python (deprecated) | Node (current) |
|---------|---------------------|----------------|
| **Smartlink tracking** | ❌ Posted bare `lynk.id` links | ✅ Auto-mints `/go/<slug>` smartlinks via `smartlinkService.mintSmartlink()` |
| **Database** | PostgreSQL (separate) | MySQL (unified platform) |
| **Dedup** | Basic | Row-level lock + `FOR UPDATE SKIP LOCKED` |
| **Discount calc** | Manual | Auto-generated `discount_pct` stored column |
| **Security** | Hardcoded TG token in source | Env vars only (`TG_BOT_TOKEN`, `TG_CHANNEL_ID`) |
| **Scheduling** | External cron | Native `node-cron` in `app.js` |
| **Admin API** | None | `/api/poster/*` (list, add, remove, mark) |

### Migration path

The PG→MySQL data migration was performed by `../server/scripts/import_promo_queue.js` (run once). All historical queue data is now in `1ai_promo_queue`.

### Running the new service

1. Ensure `TG_BOT_TOKEN` and `TG_CHANNEL_ID` are set in `.env`
2. Start the Node server: `node server/app.js` (port 3001)
3. The `posterWorker` (cron) starts automatically with the server

### Deprecation timeline

- **2026-06-10**: Python code absorbed, MySQL migration + PG→MySQL import completed
- **2026-07-01**: Smartlink tracking loop closed (minted tracked links instead of bare `lynk.id`)
- **Future**: This directory will be removed. Use `../server/services/posterService.js` directly.

---

**Last updated**: 2026-07-01
**Migration commit**: `c5d384c feat(affiliate): close tracking loop with smartlink integration in poster and pipeline`