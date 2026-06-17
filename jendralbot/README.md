# jendralbot — LANDING PAGE CANDIDATE

> **Status**: Static marketing landing page. **Not absorbed** yet — intended to become the public landing page served at `/` with tracked smartlink CTAs.

## Overview

Single-file static HTML landing page (`index.html`, ~1011 lines) featuring ~10 AI tool CTAs pointing to `lynk.id/jendralbot/*` affiliate links.

### Current state
- **Tech**: Pure HTML + inline CSS + vanilla JS (no build step)
- **CTAs**: All buttons link to `https://lynk.id/jendralbot/<slug>` (bare lynk.id affiliate links)
- **Products**: JobMagnet AI, AI Creative Ad Engine, Food Menu AI Studio, Studio Marketplace Pro, AI Creative Tools, Guru Pintar AI, Sekarang Gratis, Belanja Duit Balik, Kelas Affiliate TikTok

### Intended integration (not yet done)

1. **Serve as root landing**: In `server/app.js`, change `app.get('/')` to serve `jendralbot/index.html` (move to `public/landing/index.html` or serve via PHP `landing.php`)
2. **Register products as offers**: Seed each product as a row in `1ai_offers` (see `../server/scripts/seed_jendralbot_offers.js`)
3. **Mint tracked smartlinks**: Run seed script → each offer gets a `/go/<slug>` smartlink
4. **Rewrite CTAs**: Replace `href="lynk.id/jendralbot/..."` with `href="/go/<slug>"` (tracked redirect)
5. **Route split**: `app.get('/')` → landing; `app.get('/admin/*')` → admin SPA

### Benefits of integration
- **Click tracking**: Every CTA click goes through `/go/<slug>` → click recorded → 302 to real offer → attribution available
- **Revenue visibility**: Affiliate commissions now trackable through platform
- **SEO**: Landing page served from root domain, not orphan static file
- **Unified platform**: Single entry point for the entire 1ai-Affiliate suite

### Migration steps (TODO)

1. Move `index.html` → `../server/public/landing/index.html`
2. Run `node ../server/scripts/seed_jendralbot_offers.js`
3. Update `../server/controllers/smartlinkController.js` smartlink generation
4. Update `../server/app.js` route split
5. Rewrite CTAs in HTML to use `/go/<slug>` URLs
5. Remove orphan `jendralbot/` directory (or keep as design source)

### Current CTAs → lynk.id URLs
```
JobMagnet AI          → https://lynk.id/jendralbot/45r5yvze3vy4
AI Creative Ad Engine → https://lynk.id/jendralbot/6821op5e24kn
Food Menu AI Studio   → https://lynk.id/jendralbot/89d30qd3ddnj
Studio Marketplace Pro→ https://lynk.id/jendralbot/9r8rj1o38q59
AI Creative Tools     → https://lynk.id/jendralbot/emne05mm7v25
Guru Pintar AI        → https://lynk.id/jendralbot/kkjk0mv1vg7o
Sekarang Gratis       → https://lynk.id/jendralbot/l4q49jj3z383
Belanja Duit Balik    → https://lynk.id/jendralbot/regxdn7xkpz6
Kelas Affiliate TikTok→ https://lynk.id/jendralbot/kkjk0mv1vg7o
```

---

**Last updated**: 2026-07-01
**Related**: `../server/scripts/seed_jendralbot_offers.js`, `../server/scripts/import_promo_queue.js`