import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // When a query fails, log the error so it doesn't silently hang.
      // Pages should check isError for custom UI, but this prevents
      // the "infinite loading" anti-pattern when they don't.
      onError: (err) => {
        if (err?.response?.status === 403) {
          console.warn('[403] Access denied:', err.config?.url);
        }
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
