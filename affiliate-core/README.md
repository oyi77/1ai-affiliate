# affiliate-core — SEPARATE PRODUCT (not absorbed)

> **Status**: Independent product, **not absorbed** into root 1ai-Affiliate platform.
> Runs as a separate deployment on Fly.io (`1affiliate-backend`).

## Overview

This is the **1affiliate** project (Gemini Canvas AI image-gen SaaS) that was cloned as a sibling during consolidation. It is a **separate product** with its own tech stack:

| Aspect | affiliate-core | Root 1ai-Affiliate |
|--------|----------------|-------------------|
| **Auth** | Supabase + JWT (`active_sessions`) | MySQL + JWT |
| **Payment** | Tripay (same gateway) | Tripay (same gateway) |
| **Database** | Supabase (PostgreSQL) | MySQL 8 |
| **Deploy** | Fly.io (`1affiliate-backend`) | Self-hosted / Docker |
| **Admin UI** | React SPA (`admin/`) | Hand-written SPA + admin SPA |
| **Client UI** | React SPA (`client-user/`) | PHP + Node SPA |

## Why not absorbed?

1. **Schema duplication**: `affiliate-core/server/src/db/supabase.js` manages `app_users`, `active_sessions`, `transactions` — duplicating root's `1ai_users`, JWT model, and `1ai_transactions` (from `005_payment_table.sql`).
2. **Different runtime**: Supabase/PostgreSQL vs MySQL.
3. **Different product focus**: AI image-gen SaaS vs affiliate tracking platform.
4. **Active external deploy**: Deployed to Fly.io as `1affiliate-backend` with active users.

## Integration path (if desired)

**Option A (Recommended): Documented umbrella**  
Keep as separate product under the 1ai-Affiliate umbrella. Define a **shared-auth contract**:
- Root 1ai-Affiliate issues JWT (via `/api/auth/login`)
- `affiliate-core/server/src/app.js` validates the same JWT (same secret + claims)
- Single sign-on across both platforms

**Option B (Future): SPA merge**  
Replace root's hand-written admin SPA (`server/public/admin/`) with `affiliate-core/admin/` build. Requires:
1. Build `affiliate-core/admin/` → output to `server/public/admin/`
2. Point React router base to `/admin/`
3. Ensure API endpoints match (`/api/auth/*`, `/api/admin/*`)

**Option C (Not recommended): Full MySQL merge**  
Migrate Supabase schema to MySQL, deprecate Fly.io deploy. High effort, low reward.

## Current status

- **Not absorbed** — left as independent sibling
- Documented in root README under "Sibling Services (absorbed)" with status "Separate product"
- Runs on Fly.io at `1affiliate-backend`
- Admin: `admin/` (React), Client: `client-user/` (React), Server: `server/` (Express + Supabase)

## Migration notes

If merging is ever desired:
1. Data migration: `affiliate-core/server/scripts/import_affiliate_core.js` (to be written, modeled on `import_promo_queue.js`)
2. App user migration: `app_users` → `1ai_users` (map email, password hash, role)
3. Session migration: `active_sessions` → drop (root uses stateless JWT)
4. Transaction migration: `transactions` → `1ai_transactions` (schema aligned with `005_payment_table.sql`)
5. Point React SPA build to `server/public/admin/`
6. Remove `affiliate-core/server/` (duplicate auth/payment)

---

**Last updated**: 2026-07-01
**Related commit**: `c5d384c` (affiliate absorption with smartlink integration)