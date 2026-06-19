# Frontend — React 19 SPA (Crystal UI)

28-page affiliate tracking dashboard built with React 19, Vite 8, Tailwind CSS v4.

## Architecture

```
main.jsx → QueryClientProvider → App.jsx → BrowserRouter → Shell (layout) → lazy Routes
```

- **State**: TanStack Query v5 for server state (auto-cache, polling, refetch)
- **Tables**: TanStack Table v8 (headless — Crystal UI styling via className)
- **Motion**: Framer Motion v12 (spring easing, 60fps)
- **Modals**: Radix UI Dialog/DropdownMenu (accessible primitives)
- **Icons**: Lucide React (consistent, tree-shakeable)
- **HTTP**: Axios with JWT interceptor (`lib/api.js`)

## Directory

```
frontend/src/
├── components/ui/      # GlassCard, StatCard, DataTable, Modal, SlideOver
├── hooks/              # useStats (useQuery wrapper)
├── layout/Shell.jsx    # Sidebar (27 items) + glass header + search
├── lib/api.js          # Axios instance, auth interceptor
├── pages/              # 28 lazy-loaded pages
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

## Build

```bash
npm run dev        # Vite dev server (HMR, proxies /api → :3001)
npm run build      # Production → ../server/public/dist/
npm run lint       # ESLint
```

Build output: 23 chunks, 146KB gzip core, lazy-loaded pages (1-14KB each).

## API Proxy

In dev: Vite proxies `/api/*` → `http://localhost:3001`
In prod: Express serves `dist/` at root via catch-all route.
