# 1AI-Affiliate — Product Roadmap & Competitive Gap Analysis
## Meta Ads × Shopee Affiliate Tracking Platform

**Date:** 2026-06-19  
**Status:** Active  
**Based on:** Live reverse-engineering of tracker.getflashsale.xyz (TrackPro SaaS) + market research

---

## Part 1: What TrackPro (Flashsale) Does — Full Architecture

### Business Model
TrackPro is a **Shopee Affiliate + Meta Ads profit tracker** for Indonesian media buyers running Facebook/Instagram ads → Shopee affiliate links. It solves one problem: **"Am I making money or losing money on each ad campaign?"**

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Meta Ads API (graph.facebook.com/v19.0)                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ act_1041 │    │ act_0858 │    │ act_681  │  ← Multiple accounts│
│  │ Selow ID │    │ Selow ID │    │ KomAds   │                   │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘                   │
│       │               │               │                          │
│       └───────────────┼───────────────┘                          │
│                       ▼                                          │
│         Spend, Clicks, Campaign Status, Budget                  │
│         per ad account per day                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                   TrackPro PHP Backend                           │
│                       ▼                                          │
│  ┌────────────────────────────────────────────┐                 │
│  │ api_settings.php                           │                 │
│  │  - Telegram bot config                     │                 │
│  │  - Meta Ads accounts (ACT_ID + token)      │                 │
│  │  - Balance alerts                          │                 │
│  │  - Shopee payouts CRUD                     │                 │
│  └────────────────────────────────────────────┘                 │
│  ┌────────────────────────────────────────────┐                 │
│  │ api_shopee.php                             │                 │
│  │  - CSV upload (Shopee commission reports)  │                 │
│  │  - Shopee account management               │                 │
│  │  - Taglink mapping (Sub_ID → campaign)     │                 │
│  │  - Order/commission aggregation            │                 │
│  └────────────────────────────────────────────┘                 │
│  ┌────────────────────────────────────────────┐                 │
│  │ api_meta.php?date=YYYY-MM-DD               │                 │
│  │  - Pull spend/clicks per Meta account      │                 │
│  │  - Campaign-level breakdown                │                 │
│  │  - Account limits & topups                 │                 │
│  └────────────────────────────────────────────┘                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Single PHP page + obfuscated JS)                     │
│                                                                 │
│  1. Dashboard      — Net Profit, ROAS, KPI summary             │
│  2. Laporan Iklan  — Campaign-by-campaign: spend vs commission  │
│  3. Analytic Harian — Daily breakdown: spend, profit, orders    │
│  4. Laporan Taglink — Sub_ID performance: which links convert   │
│  5. Laporan Klik   — Click details per taglink                  │
│  6. Laporan Order  — Order details per transaction              │
│  7. Laporan Pembayaran — Shopee payout tracking                │
│  8. Growth Center  — Winning campaigns, scaling recommendations │
│  9. Insight Pro    — AI analysis (paid feature, Rp 50K)         │
│ 10. Saldo & Budget — Meta ad account balance tracking           │
│ 11. Settings       — Telegram, Meta accounts, upload, users     │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoints Discovered

| Endpoint | Method | Purpose |
|---|---|---|
| `api_settings.php` | GET | Full settings (telegram, meta accounts, balance alerts) |
| `api_settings.php?action=get_shopee_payouts` | GET | All Shopee payout records |
| `api_settings.php?action=get_maintenance` | GET | Maintenance mode status |
| `api_settings.php?action=get_dashboard_announcement` | GET | Admin announcements |
| `api_meta.php?date=YYYY-MM-DD` | GET | Meta Ads spend/clicks/campaigns for date |
| `api_shopee.php?mode=full` | GET | Full Shopee data (commission, orders, taglinks) |
| `api_shopee.php` | POST | Upload/import operations (CSRF-protected) |
| `graph.facebook.com/v19.0/{act_id}` | GET | Direct Meta API calls from frontend |
| `graph.facebook.com/v19.0/debug_token` | GET | Token validation |

### Data Schemas

**Shopee Payout:**
```json
{
  "id": 158,
  "shopee_account_id": "shopee_kakriput",
  "shopee_account_name": "kakriput",
  "report_id": "PAY-20260616-94IMRE",
  "issued_date": "2026-06-16",
  "paid_at": "2026-06-16 00:00:00",
  "amount": 177409,
  "status": "paid",
  "bank_account": null,
  "note": null,
  "created_at": "2026-06-16 14:20:44"
}
```

**Meta Ads Account:**
```json
{
  "name": "Ads_nyamiresep",
  "act_id": "act_380721031313330",
  "token": "EAAK...long-lived...",
  "ppn": "6.00"
}
```

**Meta Ads API Response (per day):**
```json
{
  "spend": 0,
  "clicks": 0,
  "campaigns": [],
  "account_spend": [],
  "account_limits": [],
  "account_topups": []
}
```

### Shopee CSV Upload Flow
1. User downloads CSV from Shopee Affiliate dashboard (commission report + click report)
2. Opens TrackPro → "Upload Laporan" button in header
3. Selects report type (shopee), selects Shopee account (default/kakriput/etc)
4. Drags CSV file → clicks "Proses & Simpan Laporan"
5. Backend parses CSV, stores per-taglink commission data
6. Frontend merges Meta spend data with Shopee commission data → calculates ROAS/ROI

### Key Business Tables

**Laporan Iklan (Ad Report):**
| NO | NAMA KAMPANYE | TAGLINK SHOPEE | SPEND ADS | KOMISI | ORDER | TRAFFIC | KLIK | KEBOCORAN | ROAS |

**Laporan Taglink:**
| # | NAMA TAGLINK | SPEND ADS | KOMISI | NET PROFIT | ORDER | KLIK META | LPV | CPR | WIN RATE | ROAS |

**Laporan Order:**
| TANGGAL TRANSAKSI | SPEND ADS | ESTIMASI KOTOR | KOMISI UPDATE | PROFIT LOSS | KOMISI BERSIH | STATUS |

**Analytic Harian:**
| TANGGAL | SPEND | TOTAL KOMISI | NET PROFIT | KOMISI IKLAN | KOMISI ORGANIK | PESANAN | ROI | ROAS | KLIK META | KLIK SHOPEE | TREND |

### Automation Features
- **Meta AI Automation** — Auto-pause campaigns after N days with no results
- **Budget Guard** — Sleep schedule (23:55-04:00) + max budget limit
- **Scale Ladder** — Auto-scale budgets for winning campaigns
- **Telegram Alerts** — Balance low, performance warnings, daily summary
- **Balance Tracking** — Track Meta ad account balances with deposit ledger

---

## Part 2: What We Need to Build (Flashsale Features in 1AI)

### Sprint 1 — Shopee × Meta Integration Core (The Killer Feature)

This is the feature that sells the platform to every Indonesian affiliate marketer.

**Backend (server/):**

1. **POST /api/admin/shopee/upload** — Accept Shopee CSV file upload
   - Parse CSV headers (auto-detect format: commission report vs click report)
   - Store in `1ai_shopee_reports` table
   - Dedup by (shopee_account_id + order_id + date)
   - Schema:
     ```sql
     CREATE TABLE 1ai_shopee_reports (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       user_id INT UNSIGNED NOT NULL,
       shopee_account_id VARCHAR(64) NOT NULL,
       taglink VARCHAR(255) DEFAULT NULL,
       order_id VARCHAR(128) DEFAULT NULL,
       product_name VARCHAR(512) DEFAULT NULL,
       commission_gross DECIMAL(12,2) DEFAULT 0,
       commission_net DECIMAL(12,2) DEFAULT 0,
       order_status VARCHAR(64) DEFAULT NULL,
       click_time INT UNSIGNED DEFAULT NULL,
       order_time INT UNSIGNED DEFAULT NULL,
       report_date DATE NOT NULL,
       raw_data JSON DEFAULT NULL,
       created_at INT UNSIGNED NOT NULL,
       UNIQUE KEY uq_order (shopee_account_id, order_id, report_date),
       KEY idx_user_date (user_id, report_date),
       KEY idx_taglink (taglink, report_date)
     ) ENGINE=InnoDB;
     ```

2. **POST /api/admin/meta-accounts** — Add Meta Ads account
   - Store ACT_ID, long-lived access token, label, PPN%
   - Validate token via graph.facebook.com/v19.0/debug_token
   - Schema:
     ```sql
     CREATE TABLE 1ai_meta_accounts (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT UNSIGNED NOT NULL,
       label VARCHAR(128) NOT NULL,
       act_id VARCHAR(32) NOT NULL,
       access_token TEXT NOT NULL,
       ppn_percent DECIMAL(5,2) DEFAULT 0,
       status ENUM('active','expired','error') DEFAULT 'active',
       last_synced_at INT UNSIGNED DEFAULT NULL,
       created_at INT UNSIGNED NOT NULL,
       updated_at INT UNSIGNED NOT NULL,
       UNIQUE KEY uq_act (act_id),
       KEY idx_user (user_id)
     ) ENGINE=InnoDB;
     ```

3. **GET /api/admin/meta/ads?date=YYYY-MM-DD** — Pull Meta spend/clicks
   - Fetch from graph.facebook.com/v19.0/{act_id}/insights
   - Fields: spend, impressions, clicks, cpc, ctr
   - Breakdown: campaign_name, adset_name, ad_name
   - Cache in `1ai_meta_daily_stats`:
     ```sql
     CREATE TABLE 1ai_meta_daily_stats (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       meta_account_id INT NOT NULL,
       campaign_id VARCHAR(64) NOT NULL,
       campaign_name VARCHAR(255) DEFAULT NULL,
       report_date DATE NOT NULL,
       spend DECIMAL(12,2) DEFAULT 0,
       impressions INT DEFAULT 0,
       clicks INT DEFAULT 0,
       cpc DECIMAL(8,4) DEFAULT 0,
       ctr DECIMAL(6,4) DEFAULT 0,
       created_at INT UNSIGNED NOT NULL,
       UNIQUE KEY uq_campaign_date (meta_account_id, campaign_id, report_date),
       KEY idx_date (report_date)
     ) ENGINE=InnoDB;
     ```

4. **POST /api/admin/shopee-payouts** — Record Shopee payouts
   - Manual entry: issued_date, paid_at, amount, report_id, shopee_account
   - Schema:
     ```sql
     CREATE TABLE 1ai_shopee_payouts (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT UNSIGNED NOT NULL,
       shopee_account_id VARCHAR(64) NOT NULL,
       shopee_account_name VARCHAR(128) DEFAULT NULL,
       report_id VARCHAR(64) NOT NULL,
       issued_date DATE NOT NULL,
       paid_at DATE DEFAULT NULL,
       amount DECIMAL(14,2) NOT NULL DEFAULT 0,
       status ENUM('pending','paid','cancelled') DEFAULT 'pending',
       bank_account VARCHAR(128) DEFAULT NULL,
       note TEXT DEFAULT NULL,
       created_at INT UNSIGNED NOT NULL,
       updated_at INT UNSIGNED NOT NULL,
       UNIQUE KEY uq_report (report_id),
       KEY idx_user_date (user_id, issued_date)
     ) ENGINE=InnoDB;
     ```

5. **POST /api/admin/taglinks** — Taglink/Sub_ID management
   - Map Sub_IDs → Meta campaign names (the core mapping)
   - Schema:
     ```sql
     CREATE TABLE 1ai_taglink_mappings (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT UNSIGNED NOT NULL,
       taglink VARCHAR(255) NOT NULL,
       meta_campaign_id VARCHAR(64) DEFAULT NULL,
       meta_campaign_name VARCHAR(255) DEFAULT NULL,
       meta_account_id INT DEFAULT NULL,
       shopee_account_id VARCHAR(64) DEFAULT 'default',
       status ENUM('active','paused','archived') DEFAULT 'active',
       created_at INT UNSIGNED NOT NULL,
       updated_at INT UNSIGNED NOT NULL,
       KEY idx_user_tag (user_id, taglink),
       KEY idx_campaign (meta_campaign_id)
     ) ENGINE=InnoDB;
     ```

**Frontend (frontend/src/pages/):**

6. **ShopeeReport.jsx** — Upload Shopee CSV + view parsed data
   - Drag-and-drop CSV upload zone
   - Auto-detect CSV format (commission vs click)
   - Show parsed preview table before confirming
   - View uploaded reports by date range

7. **LaporanIklan.jsx** — Ad Performance Report
   - Merge Meta spend × Shopee commission by taglink/campaign
   - Columns: NAMA KAMPANYE | TAGLINK SHOPEE | SPEND ADS | KOMISI | ORDER | KLIK | ROAS
   - Date range filter + Meta account filter + Shopee account filter
   - Color-coded ROAS (green > 2, yellow 1-2, red < 1)

8. **AnalyticHarian.jsx** — Daily Analytics
   - Date range picker
   - Chart: daily spend vs commission vs net profit (line chart)
   - Table: TANGGAL | SPEND | KOMISI | NET PROFIT | ORDER | ROI | ROAS

9. **LaporanTaglink.jsx** — Taglink Performance
   - Table: NAMA TAGLINK | SPEND ADS | KOMISI | NET PROFIT | ORDER | WIN RATE | ROAS
   - Auto-ranking by ROAS

10. **LaporanOrder.jsx** — Order Details
    - Filter by month
    - Table: TANGGAL | SPEND | ESTIMASI KOTOR | KOMISI UPDATE | PROFIT | STATUS

11. **LaporanPembayaran.jsx** — Payout Tracking
    - CRUD for Shopee payouts
    - Table: TANGGAL | ID LAPORAN | AKUN SHOPEE | NOMINAL | STATUS

12. **SaldoBudget.jsx** — Balance & Budget
    - Track Meta ad account balances
    - Deposit ledger (manual top-up entries)
    - Budget guard settings (max budget, sleep schedule)

13. **MetaAccountSettings.jsx** — Meta Ads Account Config
    - Add/remove Meta accounts (ACT_ID + token + PPN%)
    - Token status indicator (active/expired/error)
    - Test connection button

### Sprint 2 — Dashboard & Charts (Makes It Look Professional)

14. **Enhanced Dashboard.jsx**
    - KPI cards: Net Profit, Gross Revenue, Komisi Kotor, Biaya Iklan, Total Order, ROI, ROAS
    - Performance Trajectory chart (line chart: commission, spend, profit, orders over time)
    - Auto-refresh on page load

15. **Charts throughout**
    - Recharts line/bar charts on every report page
    - Sparklines in KPI cards
    - Loading skeletons while data fetches

### Sprint 3 — Automation (The "AI" Differentiator)

16. **Telegram Integration**
    - Bot token + chat ID config
    - Daily summary push (spend, commission, profit, ROAS)
    - Balance alert when Meta account drops below threshold
    - "Test kirim pesan" button

17. **Meta Automation Rules**
    - Auto-pause campaigns with 0 orders after N days
    - Budget scaling: if ROAS > X, increase budget by Y%
    - Sleep schedule: pause all campaigns during hours

---

## Part 3: Competitive Gap Analysis — What Everyone Has That We Don't

### Status Legend
- ✅ = We have this
- ⚠️ = Partial/broken/untested
- ❌ = Missing entirely
- 🔥 = TrackPro has it, we need it

### Critical Gaps (Lose to TrackPro)

| Feature | 1AI Status | TrackPro | Impact |
|---|---|---|---|
| Shopee CSV upload + parse | ❌ | ✅ | Core workflow — without this, platform is useless for Shopee affiliates |
| Meta Ads API integration | ❌ | ✅ | Can't calculate ROAS without ad spend data |
| Taglink ↔ Campaign mapping | ❌ | ✅ | Can't attribute sales to ad spend |
| Daily spend vs commission merge | ❌ | ✅ | Can't see profit per day/per campaign |
| Shopee payout tracking | ❌ | ✅ | Can't track when Shopee actually pays |
| Multi-account (multiple Shopee shops) | ❌ | ✅ | Users run 2-3 shops simultaneously |
| Balance/deposit ledger | ❌ | ✅ | Track Meta ad account balances |

### Table Stakes Gaps (Every Competitor Has)

| Feature | 1AI Status | Voluum | BeMob | RedTrack | TrackPro |
|---|---|---|---|---|---|
| Real-time charts | ❌ placeholders | ✅ | ✅ | ✅ | ✅ |
| Click log with all params | ❌ | ✅ | ✅ | ✅ | ✅ |
| Conversion log UI | ❌ | ✅ | ✅ | ✅ | ✅ |
| Drill-down reports | ❌ | ✅ | ✅ | ✅ | ✅ |
| Affiliate self-registration | ❌ | N/A | ✅ | ✅ | ✅ |
| Affiliate dashboard | ❌ | N/A | ✅ | ✅ | ✅ |
| Email/Telegram notifications | ❌ | ✅ | ✅ | ✅ | ✅ |

### Competitive Advantages (Only We Have)

| Feature | 1AI Status | Notes |
|---|---|---|
| ✅ AI creative tools (6 tools) | Working | No competitor has this |
| ✅ Multi-touch attribution | Working | Only RedTrack + Everflow |
| ✅ Smartlink + Deep Link generators | Working | Unique UI tools |
| ✅ Commission ledger + payouts | Working | Only Tier 2 platforms |
| ✅ Self-hosted at $0 | Working | Only Binom/Keitaro are self-hosted |
| ✅ Go edge layer (sub-ms) | Working | Matches Binom speed |
| ✅ Day-parting heatmap | Working | Only Voluum + BeMob |

---

## Part 4: Implementation Priority

```
Priority  Sprint  Feature                           Effort   Impact
─────────────────────────────────────────────────────────────────────
1         1       Shopee CSV upload + parse          2 days   🔥 Critical
2         1       Meta Ads API integration           2 days   🔥 Critical
3         1       Taglink ↔ Campaign mapping         1 day    🔥 Critical
4         1       Laporan Iklan page (merged view)   2 days   🔥 Critical
5         1       Shopee payout CRUD                 1 day    🔥 High
6         2       Dashboard with real charts          2 days   High
7         2       Analytic Harian (daily breakdown)  1 day    High
8         2       Laporan Taglink page                1 day    High
9         2       Laporan Order page                  1 day    Medium
10        3       Telegram integration                1 day    Medium
11        3       Meta automation rules               2 days   Medium
12        3       Balance/deposit tracking            1 day    Medium
13        4       Affiliate self-registration portal  2 days   High
14        4       Affiliate dashboard                 2 days   High
15        4       Click log page                      1 day    High
16        4       Conversion log page                 1 day    High
17        5       White-label config                  2 days   Medium
18        5       SSL for custom domains              1 day    P0 blocker
19        5       Error boundaries on all pages       1 day    P0 blocker
20        5       Loading skeletons                   1 day    P1
─────────────────────────────────────────────────────────────────────
Total: ~26 days for full parity with TrackPro + all competitors
```

---

## Part 5: How Manual Conversion Upload Enables Meta × Shopee

The key insight from TrackPro: **Meta Ads spend data is pulled via API, but Shopee commission data is uploaded manually via CSV.** These two data streams are merged by the "taglink" (Sub_ID) field.

### The Flow:
```
1. Affiliate creates Shopee link with Sub_ID = "campaign_name"
2. Affiliate runs Meta ad → landing page → Shopee link
3. Customer clicks Shopee link → tracked by Sub_ID
4. Customer buys → Shopee records order with Sub_ID
5. Affiliate downloads Shopee CSV (commission report)
6. Affiliate uploads CSV to platform
7. Platform matches Sub_ID → Meta campaign → calculates ROAS
```

### Why Manual Upload (Not API):
- Shopee doesn't have a public affiliate API
- Commission data has a validation delay (days/weeks)
- CSV is the only reliable export method
- Meta Ads API is open but requires long-lived tokens

### What We Already Built (Manual Conversion):
- `POST /api/admin/conversions/manual` — Already working
- Frontend `/conversions/manual` page — Already working
- `1ai_conversion_logs` table — Already exists

### What We Need to Add:
- Shopee CSV parser (detect headers, map columns, bulk insert)
- Meta Ads API client (fetch insights by date, cache in DB)
- Taglink mapping UI (link Sub_IDs to campaigns)
- Merged report view (Meta spend + Shopee commission = ROAS)

---

## Part 6: Database Schema Additions (Migration 023)

```sql
-- Migration 023: Meta Ads + Shopee Affiliate Integration

CREATE TABLE IF NOT EXISTS `1ai_meta_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(128) NOT NULL,
  `act_id` VARCHAR(32) NOT NULL,
  `access_token` TEXT NOT NULL,
  `ppn_percent` DECIMAL(5,2) DEFAULT 0.00,
  `status` ENUM('active','expired','error') DEFAULT 'active',
  `last_synced_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_act` (`act_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_meta_daily_stats` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `meta_account_id` INT NOT NULL,
  `campaign_id` VARCHAR(64) NOT NULL,
  `campaign_name` VARCHAR(255) DEFAULT NULL,
  `adset_name` VARCHAR(255) DEFAULT NULL,
  `report_date` DATE NOT NULL,
  `spend` DECIMAL(12,2) DEFAULT 0.00,
  `impressions` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `cpc` DECIMAL(8,4) DEFAULT 0.00,
  `ctr` DECIMAL(6,4) DEFAULT 0.00,
  `conversions` INT DEFAULT 0,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_campaign_date` (`meta_account_id`, `campaign_id`, `report_date`),
  KEY `idx_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_shopee_reports` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `shopee_account_id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `shopee_account_name` VARCHAR(128) DEFAULT NULL,
  `taglink` VARCHAR(255) DEFAULT NULL,
  `order_id` VARCHAR(128) DEFAULT NULL,
  `product_name` VARCHAR(512) DEFAULT NULL,
  `product_category` VARCHAR(128) DEFAULT NULL,
  `commission_gross` DECIMAL(12,2) DEFAULT 0.00,
  `commission_net` DECIMAL(12,2) DEFAULT 0.00,
  `order_amount` DECIMAL(12,2) DEFAULT 0.00,
  `order_status` VARCHAR(64) DEFAULT NULL,
  `order_type` VARCHAR(64) DEFAULT NULL COMMENT 'Same Shop / Different Shop',
  `click_time` INT UNSIGNED DEFAULT NULL,
  `order_time` INT UNSIGNED DEFAULT NULL,
  `validation_time` INT UNSIGNED DEFAULT NULL,
  `report_date` DATE NOT NULL,
  `raw_data` JSON DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_order` (`shopee_account_id`, `order_id`, `report_date`),
  KEY `idx_user_date` (`user_id`, `report_date`),
  KEY `idx_taglink` (`taglink`, `report_date`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_shopee_payouts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `shopee_account_id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `shopee_account_name` VARCHAR(128) DEFAULT NULL,
  `report_id` VARCHAR(64) NOT NULL,
  `issued_date` DATE NOT NULL,
  `paid_at` DATE DEFAULT NULL,
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','paid','cancelled') DEFAULT 'pending',
  `bank_account` VARCHAR(128) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_report` (`report_id`),
  KEY `idx_user_date` (`user_id`, `issued_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_taglink_mappings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `taglink` VARCHAR(255) NOT NULL,
  `meta_campaign_id` VARCHAR(64) DEFAULT NULL,
  `meta_campaign_name` VARCHAR(255) DEFAULT NULL,
  `meta_account_id` INT DEFAULT NULL,
  `shopee_account_id` VARCHAR(64) DEFAULT 'default',
  `budget_daily` DECIMAL(10,2) DEFAULT NULL,
  `status` ENUM('active','paused','archived') DEFAULT 'active',
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_tag` (`user_id`, `taglink`),
  KEY `idx_campaign` (`meta_campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_balance_ledger` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `meta_account_id` INT DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `type` ENUM('deposit','withdrawal','spend','adjustment') DEFAULT 'deposit',
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_date` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `1ai_automation_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `rule_type` ENUM('auto_pause','auto_scale','sleep_schedule','balance_alert') NOT NULL,
  `config` JSON NOT NULL COMMENT 'Rule-specific config (thresholds, schedules, etc)',
  `enabled` TINYINT(1) DEFAULT 1,
  `last_triggered_at` INT UNSIGNED DEFAULT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  `updated_at` INT UNSIGNED NOT NULL,
  KEY `idx_user_type` (`user_id`, `rule_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Part 7: Frontend Route Plan

```
New pages to add:
/shopee/upload     → Shopee CSV upload + parse preview
/reports/ads       → Laporan Iklan (Meta spend × Shopee commission merged)
/reports/daily     → Analytic Harian (daily breakdown with charts)
/reports/taglink   → Laporan Taglink (Sub_ID performance)
/reports/orders    → Laporan Order (transaction details)
/reports/payouts   → Laporan Pembayaran (Shopee payout tracking)
/meta-accounts     → Meta Ads account management
/balance           → Saldo & Budget (balance tracking + deposit ledger)
/automation        → Automation rules config

Modified pages:
/dashboard         → Add real KPI data + charts (currently placeholders)
/settings          → Add Telegram config section
```
