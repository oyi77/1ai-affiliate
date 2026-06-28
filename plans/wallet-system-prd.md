# PRD: Wallet System — Topup, Spending, Admin Finance

> **Status**: Ready for review
> **Date**: 2026-06-28
> **Rules**: ENGINEERING.md §5 (best practices), §6 (core loop), §7 (hard NOs)
> **QA**: QA.md §4 (coverage requirements), VERIFICATION.md (receipt enforcement)

---

## 1. Problem Statement

The platform has no unified wallet system. Affiliates and advertisers cannot topup funds, track spending, or use paid features (AI, boost, ads). Admin cannot manage user finances. Current balance ledger exists but Deposit/Withdrawal buttons are broken (POST route not mounted). Tripay callback doesn't credit balance. Two competing payment controllers.

---

## 2. User Stories (with UI requirements)

### Affiliate

| # | Story | UI Location | UI Elements |
|---|-------|-------------|-------------|
| A1 | Topup wallet via Tripay | Wallet page → "Topup" button → Modal | Amount input (min Rp 155K), gateway selector (QRIS/bank/e-wallet), payment method dropdown, checkout URL/QR display |
| A2 | See wallet balance | Dashboard stat card + Wallet page header | Balance card with IDR format, pending earnings, available balance |
| A3 | Use AI tools with balance deduction | AITools.jsx → cost badge per tool | Cost label "Rp 5,000/call", balance check before generate, insufficient balance → topup prompt |
| A4 | Buy boost service | New Boost page → create order wizard | Offer selector, fanpage count slider (100-3000), content editor, image upload, cost preview, confirm button |
| A5 | See boost performance | Boost Orders page → order detail | Stats cards (impressions, clicks, conversions), timeline, ROI calculation |
| A6 | Withdraw balance | Wallet page → "Withdraw" button → Modal | Amount input, method selector (bank/paypal/crypto), details form, confirmation |
| A7 | See transaction history | Wallet page → Transactions tab | Filterable DataTable (type, date range, amount), type badges, running balance |

### Advertiser

| # | Story | UI Location | UI Elements |
|---|-------|-------------|-------------|
| D1 | Topup wallet | Wallet page (same as affiliate) | Same topup flow |
| D2 | Create offers (auto-deduct CPL) | Offers page → create offer form | Offer form, CPL display "Rp 5,000/lead", balance check, auto-deduct on lead |
| D3 | Use boost/ads | Boost page (same as affiliate) | Same boost flow |
| D4 | See spending breakdown | Wallet page → Spending tab | Pie chart (leads, boost, ads, AI), DataTable with feature breakdown |

### Admin/Management

| # | Story | UI Location | UI Elements |
|---|-------|-------------|-------------|
| M1 | Manual credit user wallet | Admin Finance → Users → "Credit" button | User search/selector, amount input, note field, confirmation modal |
| M2 | Manual debit user wallet | Admin Finance → Users → "Debit" button | Same as credit but negative |
| M3 | Per-user finance dashboard | Admin Finance → Users tab | DataTable: user_id, name, role, earnings, deposits, spending, balance, last activity |
| M4 | Configure feature pricing | Admin Finance → Pricing tab | Editable table: feature_key, price, unit, description, save button |
| M5 | Set minimum topup (USD) | Admin Finance → Settings tab | Number input (USD), live IDR preview (USD × rate), save button |
| M6 | Set exchange rate | Admin Finance → Settings tab | Rate input, source selector (manual/api), fetch button, last updated display |
| M7 | Platform revenue overview | Admin Finance → Overview tab | Stat cards: total deposits, total spending, total withdrawals, net revenue, chart |

---

## 3. Data Model

### 3.1 New Tables

```sql
-- Wallet spending log
CREATE TABLE 1ai_wallet_spending (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  feature ENUM('ai_tool', 'boost', 'ads', 'lead_cost', 'other') NOT NULL,
  feature_id VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL COMMENT 'Always positive',
  currency VARCHAR(10) DEFAULT 'IDR',
  description VARCHAR(255),
  metadata JSON,
  created_at INT UNSIGNED NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_feature (feature),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Boost orders
CREATE TABLE 1ai_boost_orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  offer_id INT UNSIGNED,
  status ENUM('pending','running','completed','failed','cancelled') DEFAULT 'pending',
  fanpage_count INT DEFAULT 0,
  post_content TEXT,
  post_images JSON,
  target_url VARCHAR(2048),
  cost_per_fanpage DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  started_at INT UNSIGNED,
  completed_at INT UNSIGNED,
  created_at INT UNSIGNED NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feature pricing (admin-configurable)
CREATE TABLE 1ai_feature_pricing (
  feature_key VARCHAR(50) PRIMARY KEY,
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  unit VARCHAR(50),
  description VARCHAR(255),
  updated_at INT UNSIGNED,
  updated_by INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exchange rates
CREATE TABLE 1ai_exchange_rates (
  currency_pair VARCHAR(10) PRIMARY KEY,
  rate DECIMAL(12,4) NOT NULL,
  source VARCHAR(50),
  fetched_at INT UNSIGNED,
  updated_at INT UNSIGNED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 New Settings (1ai_settings)

| Key | Default | Description | Type |
|---|---|---|---|
| `wallet_enabled` | `true` | Master toggle | bool |
| `wallet_min_topup_usd` | `10` | Minimum topup in USD | number |
| `wallet_usd_idr_rate` | `15500` | Exchange rate | number |
| `wallet_rate_source` | `manual` | `manual` or `api` | string |
| `wallet_rate_api_url` | `` | Exchange rate API URL | string |

### 3.3 Existing Tables (reuse)

| Table | Purpose |
|---|---|
| `1ai_balance_ledger` | Central balance truth |
| `1ai_affiliates.balance` | Denormalized balance |
| `1ai_payments` | Payment gateway records |
| `1ai_daily_spend` | Ad spend tracking |

---

## 4. API Design

### 4.1 Wallet (User-facing, all roles)

```
GET    /api/wallet                     → { balance, deposits, withdrawals, spending, pending_earnings, currency }
GET    /api/wallet/transactions        → paginated ledger + spending (filterable by type, date_range)
GET    /api/wallet/spending            → spending breakdown by feature (for charts)
POST   /api/wallet/topup               → { amount, gateway, method } → { checkout_url, qr_url, reference }
GET    /api/wallet/topup/status/:ref   → { status, amount, paid_at }
POST   /api/wallet/withdraw            → { amount, method, details } → payout request
GET    /api/wallet/pricing             → { feature_key: { price, unit, description } }
```

### 4.2 Spending (Internal, called by feature services)

```
POST   /api/internal/spend             → { user_id, feature, feature_id, amount, description, metadata }
        → Validates balance >= amount
        → INSERT 1ai_balance_ledger (type='spend')
        → INSERT 1ai_wallet_spending
        → UPDATE 1ai_affiliates.balance
        → Returns { success, remaining_balance }
        → Returns 402 if insufficient balance
```

### 4.3 Boost (User-facing, all roles)

```
POST   /api/boost/orders               → { offer_id, fanpage_count, content, images } → create order
GET    /api/boost/orders               → user's boost orders (paginated)
GET    /api/boost/orders/:id           → single order with stats
POST   /api/boost/orders/:id/cancel    → cancel pending order (refund to wallet)
```

### 4.4 Admin Finance (Admin only)

```
GET    /api/admin/finance/overview      → platform totals
GET    /api/admin/finance/users         → per-user finance table (paginated, searchable)
POST   /api/admin/finance/credit        → { user_id, amount, note } → manual credit
POST   /api/admin/finance/debit         → { user_id, amount, note } → manual debit
GET    /api/admin/finance/pricing       → list all feature prices
PUT    /api/admin/finance/pricing       → { feature_key, price } → update price
GET    /api/admin/finance/exchange-rate → { USD_IDR, source, fetched_at }
POST   /api/admin/finance/exchange-rate → { rate, source } → manual override
GET    /api/admin/finance/boost-orders  → all boost orders with stats
```

---

## 5. UI Pages (ALL NEW)

### 5.1 Wallet.jsx (`/wallet`)

```
┌─────────────────────────────────────────────────────────────┐
│  Wallet                                    [Topup] [Withdraw]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Balance  │ │ Deposits │ │Withdrawals│ │ Spending │        │
│ │ Rp 5.2M  │ │ Rp 8.0M  │ │ Rp 1.0M  │ │ Rp 1.8M  │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│ [Transactions] [Spending] [Boost Orders]    ← Tabs          │
├─────────────────────────────────────────────────────────────┤
│ Transactions Tab:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date       │ Type      │ Feature  │ Amount    │ Balance │ │
│ │ 28 Jun     │ Deposit   │ Tripay   │ +500,000  │ 5.2M   │ │
│ │ 27 Jun     │ Spend     │ AI Banner│ -5,000    │ 4.7M   │ │
│ │ 27 Jun     │ Earning   │ Conv #42 │ +25,000   │ 4.7M   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Spending Tab:                                               │
│ ┌──────────────┐  ┌─────────────────────────────────────┐   │
│ │  Pie Chart   │  │  Feature     │ Amount    │ %        │   │
│ │  by feature  │  │  AI Tools    │ 45,000    │ 25%      │   │
│ │              │  │  Boost       │ 120,000   │ 67%      │   │
│ │              │  │  Ads         │ 15,000    │ 8%       │   │
│ └──────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 AdminFinance.jsx (`/admin/finance`)

```
┌─────────────────────────────────────────────────────────────┐
│  Finance Management                                         │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Users] [Pricing] [Settings] [Boost Orders]      │
├─────────────────────────────────────────────────────────────┤
│ Overview Tab:                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Total    │ │ Total    │ │ Total    │ │ Net      │        │
│ │ Deposits │ │ Spending │ │Withdrawals│ │ Revenue  │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│ Users Tab:                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Search: [_______________]  Role: [All ▼]                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Name     │ Role      │ Earnings │ Spending │ Balance    │ │
│ │ John     │ affiliate │ 500,000  │ 45,000   │ 455,000    │ │
│ │ [Credit] [Debit] [View]                                 │ │
│ │ Acme Corp│ advertiser│ -        │ 200,000  │ 800,000    │ │
│ │ [Credit] [Debit] [View]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Pricing Tab:                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Feature Key    │ Price (Rp) │ Unit       │ Description │ │
│ │ ai_banner      │ 5,000      │ per_call   │ Banner Gen  │ │
│ │ ai_carousel    │ 8,000      │ per_call   │ IG Carousel │ │
│ │ boost_per_fp   │ 100        │ per_fanpage│ Boost blast │ │
│ │ lead_cpl       │ 5,000      │ per_lead   │ Lead cost   │ │
│ │ [Edit] each row                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Settings Tab:                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Minimum Topup: [10] USD  = Rp [155,000] (auto-calc)    │ │
│ │ Exchange Rate: [15500] IDR/USD                          │ │
│ │ Rate Source:   [Manual ▼]  [Fetch Live Rate]            │ │
│ │ Last Updated:  28 Jun 2026 14:30                        │ │
│ │ [Save Settings]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 TopupModal (reusable component)

```
┌─────────────────────────────────────────┐
│  Topup Wallet                           │
├─────────────────────────────────────────┤
│  Amount (Rp):                           │
│  [200000        ]  Min: Rp 155,000      │
│                                         │
│  Quick amounts: [155K] [250K] [500K]    │
│                 [1M]   [2M]   [5M]      │
│                                         │
│  Gateway: [Tripay ▼]                    │
│  Method:  [QRIS ▼]                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ You will pay: Rp 200,000        │    │
│  │ Gateway fee: Rp 0 (included)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Cancel]              [Proceed to Pay]  │
└─────────────────────────────────────────┘
```

### 5.4 Modified Existing Pages

| Page | Change |
|---|---|
| `Dashboard.jsx` | Add wallet balance StatCard (next to existing 5 metrics) |
| `AffiliateDashboard.jsx` | Add "Topup" button next to Balance stat card |
| `AITools.jsx` | Add cost badge "Rp 5,000" per tool, balance check before generate |
| `Admin.jsx` | Add "Finance" tab → renders AdminFinance component |

### 5.5 Sidebar Update

```
Revenue section:
  ├── Earnings
  ├── Commissions
  ├── Conversion Log
  ├── Orders
  ├── Payments
  ├── Wallet           ← NEW (replaces "Balance & Budget")
  └── Boost Orders     ← NEW

System section:
  ├── Admin
  ├── Finance          ← NEW (admin only)
  └── ...
```

---

## 6. Spending Flow (with idempotency)

```
User clicks "Generate Banner" (cost: Rp 5,000)
    │
    ▼
Frontend checks: balance >= cost?
    ├─ NO  → Show "Insufficient balance" + Topup button
    └─ YES ↓
    │
POST /api/content/banner { ... inputs }
    │
    ▼
Backend (contentController.js):
    │
    ├─ 1. Check 1ai_feature_pricing for 'ai_banner' price
    ├─ 2. Begin transaction (SELECT FOR UPDATE on balance)
    ├─ 3. Verify balance >= price
    │   ├─ NO  → 402 { error: 'Insufficient balance', required, available }
    │   └─ YES ↓
    ├─ 4. INSERT 1ai_balance_ledger (type='spend', amount=-price)
    ├─ 5. INSERT 1ai_wallet_spending (feature='ai_tool', feature_id='banner', amount=price)
    ├─ 6. UPDATE 1ai_affiliates.balance = balance - price
    ├─ 7. Commit transaction
    ├─ 8. Call Gemini API (actual work)
    └─ 9. Return result + { wallet: { deducted: 5000, remaining: 495000 } }
```

**Idempotency**: Each spend request includes a client-generated `idempotency_key` (UUID). The `1ai_wallet_spending` table has a UNIQUE index on `(user_id, idempotency_key)` to prevent double-spending on retry.

---

## 7. Admin Credit/Debit Flow

```
Admin clicks "Credit" on user row
    │
    ▼
Modal: Amount [500000]  Note [Bank transfer BCA]
    │
POST /api/admin/finance/credit { user_id: 42, amount: 500000, note: "..." }
    │
    ▼
Backend:
    ├─ Validate: amount > 0, user exists, note present
    ├─ INSERT 1ai_balance_ledger (type='adjustment', amount=+500000, note)
    ├─ UPDATE 1ai_affiliates.balance = balance + 500000
    └─ Return { success, new_balance }
```

---

## 8. Default Feature Pricing (seed data)

```sql
INSERT INTO 1ai_feature_pricing (feature_key, price, currency, unit, description) VALUES
('ai_banner',     5000,  'IDR', 'per_call',     'Banner Generator'),
('ai_carousel',   8000,  'IDR', 'per_call',     'IG Carousel Generator'),
('ai_caption',    2000,  'IDR', 'per_call',     'Social Caption Generator'),
('ai_brand_kit',  10000, 'IDR', 'per_call',     'Brand Kit Generator'),
('ai_ab_test',    3000,  'IDR', 'per_call',     'A/B Test Ideas Generator'),
('ai_bg_remove',  1500,  'IDR', 'per_image',    'Background Removal'),
('boost_per_fp',  100,   'IDR', 'per_fanpage',  'Boost per fanpage post'),
('lead_cpl',      5000,  'IDR', 'per_lead',     'Advertiser cost per lead');
```

---

## 9. Minimum Topup (Dynamic)

```
Settings:
  wallet_min_topup_usd = 10
  wallet_usd_idr_rate = 15500

Computed:
  min_topup_idr = wallet_min_topup_usd × wallet_usd_idr_rate
                = 10 × 15500 = Rp 155,000

If wallet_rate_source = 'api':
  - Fetch from exchangerate-api.com every 6h
  - Cache in 1ai_exchange_rates table
  - Fallback to manual rate if API fails

If wallet_rate_source = 'manual':
  - Admin sets rate in Admin Finance → Settings tab
  - Stored in 1ai_settings
```

---

## 10. Security (OWASP compliance per QA.md §4.5)

| # | Risk | Mitigation |
|---|---|---|
| API1 | BOLA | All wallet queries scoped by `req.user.id` (user can only see own wallet) |
| API2 | Auth | All routes use `authenticate` + `requireRole` middleware |
| API3 | Field exposure | Wallet response excludes sensitive fields (no gateway keys, no internal IDs) |
| API4 | Rate limit | Topup/withdraw endpoints rate-limited (5/min per user) |
| API5 | Role escalation | Finance routes require `requireAdmin`, wallet routes check role for withdrawals |
| API6 | Business flow abuse | Minimum topup enforced, idempotency keys prevent double-spend |
| API7 | SSRF | Exchange rate API URL validated against allowlist |
| API8 | Config | No hardcoded values — all in 1ai_settings or env |
| API9 | Inventory | All routes documented in api.md |
| API10 | API consumption | Exchange rate API response validated before use |

**Additional:**
- All monetary operations use DB transactions with SELECT FOR UPDATE
- Payment callbacks verify gateway signature before crediting
- Balance never goes negative (constraint + application check)
- All amounts validated as positive numbers at boundary

---

## 11. Testing (per QA.md §4)

### 11.1 Frontend Tests

| Test | Coverage |
|---|---|
| Wallet page renders balance correctly | Stat cards, currency format |
| Topup modal validates minimum amount | Below min → error message |
| Topup modal shows correct gateway/method options | Dynamic from API |
| Transaction history filters work | Type, date range |
| Spending pie chart renders correctly | Feature breakdown |
| Admin Finance: user table loads | Paginated, searchable |
| Admin Finance: credit/debit modals | Valid input → success, invalid → error |
| Admin Finance: pricing table editable | Save updates price |
| Admin Finance: exchange rate update | Manual + fetch live rate |
| AITools: cost badge shows correct price | From /api/wallet/pricing |
| AITools: insufficient balance → topup prompt | Balance < cost |
| Boost: order creation wizard | Offer select → content → confirm |
| Boost: order list with status badges | All statuses |

### 11.2 Backend Tests

| Test | Coverage |
|---|---|
| GET /api/wallet returns correct balance | Matches ledger calculation |
| POST /api/wallet/topup validates minimum | Below min → 400 |
| POST /api/wallet/spend with sufficient balance | Deducts correctly |
| POST /api/wallet/spend with insufficient balance | Returns 402 |
| POST /api/wallet/spend idempotency | Same key → no double deduction |
| POST /api/admin/finance/credit (admin only) | Credits balance + ledger |
| POST /api/admin/finance/debit (non-admin) | Returns 403 |
| GET /api/admin/finance/users (admin only) | Returns per-user data |
| PUT /api/admin/finance/pricing | Updates price |
| Payment callback idempotency | Same ref → no double credit |
| Balance constraint: never negative | Overspend rejected |
| Race condition: concurrent spend | Transaction isolation |

---

## 12. Implementation Phases

### Phase 1: Fix Money Flow (Critical)
1. Mount `balance.js` routes in `app.js` (fix broken SaldoBudget)
2. Consolidate payment controllers (remove legacy, keep modern paymentGateway)
3. Fix Tripay callback to credit balance + ledger
4. Fix approve-earning to update balance + ledger
5. Add wallet settings to settingsService SCHEMA

### Phase 2: Wallet System
6. Create DB tables (wallet_spending, feature_pricing, exchange_rates)
7. Seed default pricing data
8. Build wallet API endpoints (GET /wallet, POST /topup, POST /spend)
9. Build Wallet.jsx page (balance cards, topup modal, transactions tab, spending tab)
10. Wire topup through paymentGateway with min validation
11. Update sidebar navigation

### Phase 3: Admin Finance
12. Build admin finance API endpoints (overview, users, credit, debit, pricing, exchange-rate)
13. Build AdminFinance.jsx page (5 tabs: overview, users, pricing, settings, boost orders)
14. Add Finance tab to Admin.jsx

### Phase 4: Feature Integration
15. Add balance check + deduction to contentController.js (AI tools)
16. Add cost badges to AITools.jsx
17. Add balance check to automation (if applicable)
18. Update Dashboard.jsx with wallet balance card

### Phase 5: Boost System
19. Create boost_orders table
20. Build boost order API (create, list, cancel with refund)
21. Build boost execution engine (posterService integration)
22. Build boost performance tracking
23. Build BoostOrders.jsx page (order list, create wizard, order detail with stats)

---

## 13. Git Workflow (per ENGINEERING.md §4)

Each phase = separate branch + PR:
```
feat/wallet-phase1-fix-money-flow
feat/wallet-phase2-wallet-system
feat/wallet-phase3-admin-finance
feat/wallet-phase4-feature-integration
feat/wallet-phase5-boost-system
```

Each PR includes:
- Code changes
- Tests (failing → passing)
- Documentation updates
- Receipt verification

---

## 14. Rollback Triggers

| Trigger | Action |
|---|---|
| Balance calculation mismatch between ledger and display | Revert to ledger-only calculation |
| Payment callback fails to credit | Log error, alert admin, manual credit available |
| Spending deduction race condition | Revert to serialized transactions |
| Exchange rate API unavailable | Fall back to manual rate |
| Boost order fails after payment | Refund to wallet automatically |
