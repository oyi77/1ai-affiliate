# Meta × Shopee Integration Architecture

## Principle: Generic vs Platform-Specific

```
┌─────────────────────────────────────────────────────────────┐
│                    GENERIC (always visible)                  │
│  Analytics, Tracking, Affiliate Hub, Reports, Operations,   │
│  Tools, System                                              │
├─────────────────────────────────────────────────────────────┤
│              PLATFORM-SPECIFIC (conditional)                 │
│  Meta × Shopee section: only visible when BOTH are active   │
│  - Meta Ads traffic source configured                       │
│  - Shopee advertiser configured                             │
├─────────────────────────────────────────────────────────────┤
│                   TOGGLE (Settings/Integrations)             │
│  Feature: "Meta × Shopee Automation"                        │
│  → ON:  show Meta×Shopee section in sidebar                 │
│  → OFF: hide section, disable auto-rules                    │
└─────────────────────────────────────────────────────────────┘
```

## Feature Classification

### GENERIC — Available to ALL users (any traffic source, any advertiser)

| Feature | Current | Source |
|---------|---------|--------|
| Performance Dashboard | ✅ Overview page | Already exists |
| Date Range Filters | ❌ Need to add | TrackPro pattern |
| ROAS/ROI Calculation | ❌ Need to add | TrackPro pattern |
| Profit Ranking (campaigns) | ❌ Need to add | TrackPro pattern |
| Winning Campaign Detector | ❌ Need to add | TrackPro pattern |
| Daily Recommendations | ❌ Need to add | TrackPro pattern |
| Export PDF/WA | ❌ Need to add | TrackPro pattern |
| Budget Management | ✅ Saldo & Budget | Already exists |
| Multi-account support | ✅ Multi-user | Already exists |

### META × SHOPEE — Only when integration is active

| Feature | TrackPro Equivalent | DB/Config Needed |
|---------|--------------------|-----------------|
| Meta Ads Sync | Full Sync button | Meta API token + ACT ID |
| Shopee CSV Upload | Upload Data tab | Shopee account config |
| Campaign → Taglink Mapping | Mapping Tag tab | `campaign_taglinks` table |
| Iklan vs Organik Split | Separate commission tracking | `commission_source` field |
| Auto-Pause Rules | Auto Pause config | `automation_rules` extension |
| Auto-Scale Budget | Auto Scale config | Meta API write access |
| Sleep Schedule | Sleep Schedule config | `day_parting` extension |
| Budget Guard | Balance alert | Meta balance API |
| Shopee Payout Tracking | Laporan Pembayaran | `shopee_payouts` table |
| Tax/Fee per Account | Tax/Fee config | `meta_accounts` config |
| Tag Source Config | Pembeda tag | `tag_source` setting |

## DB Schema

```sql
-- Feature toggles
INSERT INTO 1ai_settings (name, value) VALUES
('feature_meta_shopee', '{"enabled":false}'),
('feature_telegram_alerts', '{"enabled":false}');

-- Meta ad accounts
CREATE TABLE IF NOT EXISTS 1ai_meta_accounts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  act_id VARCHAR(64) NOT NULL,
  account_name VARCHAR(255),
  access_token TEXT,
  status ENUM('active','inactive','expired') DEFAULT 'active',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  daily_budget DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  last_synced_at INT UNSIGNED,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  UNIQUE KEY (act_id)
);

-- Shopee affiliate accounts
CREATE TABLE IF NOT EXISTS 1ai_shopee_accounts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  report_count INT DEFAULT 0,
  last_upload_at INT UNSIGNED,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP())
);

-- Campaign → Taglink mapping
CREATE TABLE IF NOT EXISTS 1ai_campaign_taglinks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  taglink VARCHAR(255) NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  notes TEXT,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  UNIQUE KEY (campaign_name, taglink)
);

-- Shopee payout tracking
CREATE TABLE IF NOT EXISTS 1ai_shopee_payouts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id VARCHAR(100),
  shopee_account VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending','paid','cancelled') DEFAULT 'pending',
  issued_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP())
);

-- Daily ad spend tracking
CREATE TABLE IF NOT EXISTS 1ai_daily_spend (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  meta_account_id INT UNSIGNED,
  campaign_name VARCHAR(255),
  spend DECIMAL(12,2) DEFAULT 0,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  created_at INT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  KEY idx_date (date),
  KEY idx_campaign (campaign_name)
);
```

## Sidebar Structure

```
Analytics       ← generic
Tracking        ← generic
Affiliate Hub   ← generic
Reports         ← generic
Operations      ← generic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Meta × Shopee   ← CONDITIONAL (only if feature_meta_shopee.enabled)
  ├─ Performance    ← chart + ROAS + insights
  ├─ Data Manager   ← upload Shopee CSV, sync Meta
  ├─ Tag Mapping    ← campaign → taglink
  ├─ Auto Rules     ← pause/scale/sleep
  └─ Payouts        ← Shopee payout tracking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tools           ← generic
System          ← generic (includes Integrations toggle)
```

## Implementation Order

1. **DB migration** — create tables + feature toggle settings
2. **Settings API** — GET/PUT `/api/settings/features` for toggle
3. **Integrations page** — toggle Meta×Shopee on/off
4. **Conditional sidebar** — show/hide Meta×Shopee section
5. **Generic enhancements** — date filters, ROAS, charts (all users)
6. **Meta×Shopee pages** — platform-specific features
