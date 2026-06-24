# Competitive Gap Plan — 1AI Affiliate vs Top-Tier Platforms

> Target parity with BeMob, Offer18, RedTrack, Prosper202, Voluum
> QA Date: 2026-06-24 | Commit: 79c18f6

## Current State Summary

- 33 pages tested
- 4 completely empty (Landing Pages, Laporan Taglink, Creative Assets, Invoices)
- 12 pages read-only (no CRUD)
- 8 pages have partial CRUD
- 9 pages fully functional

## Phase 1 — Fix Empty Pages (Critical)

### 1.1 Landing Pages → Template Gallery + CRUD
- [ ] Show DB-backed templates from `landing_page_templates` table
- [ ] Category filter tabs (sweepstakes, VSL, ecommerce, crypto, finance, leadgen)
- [ ] Template card grid with preview thumbnails
- [ ] "Use Template" → customize with fields → save as user template
- [ ] "Create Blank" → HTML editor
- [ ] Edit / Delete user templates
- [ ] Publish / Unpublish toggle

### 1.2 Creative Assets → Banner & HTML Management
- [ ] List creatives per offer (from `1ai_offer_creatives` table)
- [ ] Upload banner image
- [ ] Add HTML creative (rich text / code editor)
- [ ] Tracking pixel generator
- [ ] Preview creative in iframe
- [ ] Copy tracking code button
- [ ] Edit / Delete creatives

### 1.3 Invoices → Invoice CRUD
- [ ] List invoices from `1ai_affiliate_invoices` table
- [ ] Create invoice (select affiliate, period, items)
- [ ] Invoice detail view with line items
- [ ] Status workflow: Draft → Sent → Paid → Overdue
- [ ] Download as PDF
- [ ] Mark as paid

### 1.4 Laporan Taglink → Taglink Mapping
- [ ] List taglink mappings from `1ai_taglink_mappings` table
- [ ] Create mapping (tag → campaign/offer)
- [ ] Edit / Delete mappings
- [ ] Click/conversion stats per tag

## Phase 2 — Add CRUD to Read-Only Pages

### 2.1 Campaigns CRUD
- [ ] "Create Campaign" modal (name, offer, payout, daily cap, URL)
- [ ] Edit campaign inline or modal
- [ ] Pause / Resume toggle
- [ ] Delete (soft delete)
- [ ] Duplicate campaign

### 2.2 Traffic Sources CRUD
- [ ] "Add Traffic Source" modal (name, type, postback URL)
- [ ] Edit / Delete
- [ ] Type selector (Facebook, Google, TikTok, Native, Push, etc.)

### 2.3 Deep Links CRUD
- [ ] "Create Deep Link" modal (URL, campaign, sub-params)
- [ ] Edit / Delete
- [ ] Copy link button

### 2.4 Affiliates Management
- [ ] "Add Affiliate" modal (name, email, tier)
- [ ] Edit affiliate (tier, status, payout method)
- [ ] Suspend / Activate toggle
- [ ] View affiliate detail (clicks, conversions, earnings)

### 2.5 Commissions CRUD
- [ ] "Add Commission" modal (affiliate, amount, source)
- [ ] Edit / Delete
- [ ] Approve / Reject bulk

## Phase 3 — Universal Features (All Pages)

### 3.1 Search & Filter Bar
- [ ] Global search input on every table page
- [ ] Date range picker (Today, 7d, 30d, Custom)
- [ ] Status filter dropdown (Active, Paused, Archived)
- [ ] Column sorting (click header to sort)

### 3.2 Export
- [ ] "Export CSV" button on every table page
- [ ] "Export PDF" on report pages
- [ ] Date range for export

### 3.3 Bulk Actions
- [ ] Checkbox column on all tables
- [ ] "Select All" checkbox in header
- [ ] Bulk action bar (Approve, Pause, Delete, Export selected)

### 3.4 Empty States
- [ ] Every empty table shows helpful CTA ("Create your first campaign")
- [ ] Illustration + description + action button

## Phase 4 — Advanced Features (Competitive Parity)

### 4.1 Postback Builder Enhancement
- [ ] Test postback button (send test event)
- [ ] Macro list (available placeholders)
- [ ] Postback log viewer
- [ ] Retry failed postbacks

### 4.2 Smartlink Enhancement
- [ ] A/B split testing (% allocation)
- [ ] Device/geo routing rules editor
- [ ] Smartlink performance analytics

### 4.3 Analytics Enhancement
- [ ] Chart.js charts on all report pages
- [ ] Comparison mode (this period vs last period)
- [ ] Drill-down (click campaign → see daily breakdown)

### 4.4 Settings Enhancement
- [ ] Webhook configuration UI
- [ ] API key management (create, revoke, scope)
- [ ] Team member management (invite, roles)
- [ ] Notification preferences (email, Telegram, Slack)

## Implementation Order

1. Phase 1.1 (Landing Pages) — high visibility, already has DB table
2. Phase 2.1 (Campaigns CRUD) — core entity, most used
3. Phase 2.2 (Traffic Sources) — simple CRUD
4. Phase 2.3 (Deep Links) — simple CRUD
5. Phase 1.2 (Creative Assets) — important for affiliates
6. Phase 2.4 (Affiliates) — core entity
7. Phase 3.1 (Search/Filter) — universal improvement
8. Phase 3.2 (Export) — universal improvement
9. Phase 1.3 (Invoices) — billing workflow
10. Phase 1.4 (Taglinks) — data mapping
11. Phase 4.x — advanced features

## Success Criteria

- All 33 pages: NO empty states without CTA
- All entity pages: full CRUD (Create, Read, Update, Delete)
- All table pages: search, filter, sort, export
- Zero "Page renderer unavailable" errors
- All data from real DB queries (no mocks)
