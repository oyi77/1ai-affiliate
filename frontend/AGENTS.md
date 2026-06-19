# Frontend — React 19 SPA (Crystal UI)

40-page affiliate tracking dashboard built with React 19, Vite 8, Tailwind CSS v4.

## Architecture

```
main.jsx → QueryClientProvider → App.jsx → BrowserRouter → Shell (layout) → lazy Routes
```

- **State**: TanStack Query v5 for server state (auto-cache, polling, refetch)
- **Tables**: TanStack Table v8 (headless — Crystal UI styling via className)
- **Motion**: Framer Motion v12 (spring easing, 60fps)
- **Modals**: Radix UI Dialog/DropdownMenu (accessible primitives)
- **SlideOver**: Radix Dialog with slide-from-right animation for detail views
- **Icons**: Lucide React (consistent, tree-shakeable)
- **HTTP**: Axios with JWT interceptor (`lib/api.js`)

## Directory

```
frontend/src/
├── components/ui/      # GlassCard, StatCard, DataTable, Modal, SlideOver, ErrorBoundary
├── hooks/              # useStats (useQuery wrapper)
├── layout/Shell.jsx    # Sidebar (35+ items) + glass header + search + notification bell
├── lib/api.js          # Axios instance, auth interceptor
├── pages/              # 40 lazy-loaded pages
├── App.jsx             # Router + lazy imports + Suspense
├── main.jsx            # QueryClientProvider + StrictMode
└── index.css           # @theme tokens, @layer base/components, animations
```

## Design Tokens (`index.css`)

- `--color-bg`: #090a0f (deep dark)
- `--color-surface-1/2/3`: rgba glass layers with backdrop-blur
- `--color-indigo-primary`: #6366f1 (accent)
- `--shadow-glow`: 0 0 20px rgba(99,102,241,0.15)
- `--animate-bg-pulse`: subtle radial gradient animation

## Component Patterns

### GlassCard
```jsx
<GlassCard hover>content</GlassCard>
// hover=true → -translate-y-1 + border glow on hover
```

### StatCard
```jsx
<StatCard label="Revenue" value="Rp 12.5M" change={{value:12, direction:'up'}} />
```

### DataTable
```jsx
<DataTable data={rows} columns={columns} />
// Headless TanStack Table with Crystal UI styling
```

### Modal
```jsx
<Modal open={open} onOpenChange={setOpen} title="Title" size="md|lg|xl">
  <form>...</form>
</Modal>
```

### SlideOver
```jsx
<SlideOver open={open} onOpenChange={setOpen} title="Detail" width="sm|md|lg">
  <div>Detail content slides in from right</div>
</SlideOver>
```

## Page Structure

Each page exports a named function component:
```jsx
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';

export function Campaigns() {
  const { data, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: () => api.get('/api/admin/campaigns') });
  // ...
}
```

### Template Selector Pattern
Used by Advertisers, TrafficSources, and other pages that need entity templates:
```jsx
const TEMPLATES = [
  { id: 'shopee', label: 'Shopee', icon: '🛒', platform_type: 'shopee', desc: '...' },
  // ...
];
// Rendered as clickable cards that pre-fill form fields
```

## Pages (40 total)

| Category | Pages |
|----------|-------|
| Dashboard | Dashboard, Affiliate Dashboard |
| Campaigns | Campaigns, Offers, Landing Pages, Deep Links |
| Affiliates | Affiliates, Earnings, Commissions |
| Advertisers | Advertisers (with template selector + CSV upload SlideOver) |
| Traffic | Traffic Sources (with Meta Ads connect + sync), Click Tracker, Day-Parting |
| Reports | Reports, Laporan Iklan, Laporan Order, Laporan Pembayaran, Analytic Harian, Laporan Taglink, Clicks, Conversions |
| Tools | Smartlinks, Postback Builder, AI Tools, Analytics, Attribution |
| System | Settings, Domains, Shorteners, Click Servers, Integrations, Pipeline, Poster, Saldo Budget, Automation |
| Admin | Admin, VIP Perks, Manual Conversion, API Docs, Support, Login |

## Build

```bash
npm run dev        # Vite dev server (HMR, proxies /api → :3001)
npm run build      # Production → ../server/public/dist/
npm run lint       # ESLint
```

Build output: 40+ chunks, lazy-loaded pages (1-16KB each).

## API Proxy

In dev: Vite proxies `/api/*` → `http://localhost:3001`
In prod: Express serves `dist/` at root via catch-all route.
