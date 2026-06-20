import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { GlassCard } from '../components/ui/GlassCard';
import { MousePointer, Radio, ShieldCheck, Filter } from 'lucide-react';

function maskIP(ip) {
  if (!ip) return '—';
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return ip.replace(/(\d+)$/, '*');
}

export function ClickTracker() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    offer_id: '',
    country: '',
    device: '',
    date_from: '',
    date_to: '',
  });

  const buildQuery = () => {
    const p = new URLSearchParams({ page: String(page), limit: '50' });
    if (filters.offer_id) p.set('offer_id', filters.offer_id);
    if (filters.country) p.set('country', filters.country);
    if (filters.device) p.set('device', filters.device);
    if (filters.date_from) p.set('date_from', filters.date_from);
    if (filters.date_to) p.set('date_to', filters.date_to);
    return p.toString();
  };

  const { data: clickData, isLoading } = useSafeQuery({
    queryKey: ['click-log', page, filters],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports/clicks?${buildQuery()}`);
      return res.data;
    },
  });

  const { data: stats } = useSafeQuery({
    queryKey: ['click-tracker-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  const clicks = clickData?.data ?? [];
  const total = clickData?.total ?? 0;
  const totalPages = clickData?.pages ?? 1;

  const columns = [
    {
      header: 'Click ID',
      accessorKey: 'click_id',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-300">{getValue()}</span>,
    },
    {
      header: 'Offer',
      accessorKey: 'offer_name',
      cell: ({ row }) => (
        <span className="text-white text-sm">{row.original.offer_name || `Offer #${row.original.offer_id}`}</span>
      ),
    },
    {
      header: 'Affiliate',
      accessorKey: 'affiliate_code',
      cell: ({ getValue }) => <span className="text-slate-300 text-sm">{getValue() || '—'}</span>,
    },
    {
      header: 'SubID',
      accessorKey: 'subid',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-400">{getValue() || '—'}</span>,
    },
    {
      header: 'IP',
      accessorKey: 'ip',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-300">{maskIP(getValue())}</span>,
    },
    {
      header: 'Country',
      accessorKey: 'country_code',
      cell: ({ getValue }) => <span className="text-sm">{getValue() || '—'}</span>,
    },
    {
      header: 'Device',
      accessorKey: 'device_type',
      cell: ({ getValue }) => {
        const d = getValue();
        const icons = { mobile: '📱', desktop: '🖥️', tablet: '📱' };
        return <span className="text-sm">{icons[d] || '❓'} {d || 'unknown'}</span>;
      },
    },
    {
      header: 'OS',
      accessorKey: 'os',
      cell: ({ getValue }) => <span className="text-slate-300 text-sm">{getValue() || '—'}</span>,
    },
    {
      header: 'Browser',
      accessorKey: 'browser',
      cell: ({ getValue }) => <span className="text-slate-300 text-sm">{getValue() || '—'}</span>,
    },
    {
      header: 'Payout',
      accessorKey: 'payout',
      cell: ({ getValue }) => (
        <span className="text-green-400 font-semibold text-sm">{formatCurrency(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Converted',
      accessorKey: 'converted',
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-success/20 text-green-success">Yes</span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">No</span>
        ),
    },
    {
      header: 'Time',
      accessorKey: 'clicked_at',
      cell: ({ getValue }) => {
        const ts = getValue();
        return (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {ts ? new Date(ts * 1000).toLocaleString() : '—'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Click Tracker
        </h1>
        <p className="text-slate-400 mt-2">Full click log with filters and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Clicks 24h</div>
          <div className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-indigo-light" />
            <span className="text-2xl font-bold text-white">{(stats?.clicks_24h ?? 0).toLocaleString()}</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Clicks</div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-green-success" />
            <span className="text-2xl font-bold text-white">{total.toLocaleString()}</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Fraud Blocked</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-error" />
            <span className="text-2xl font-bold text-white">{(stats?.fraud_blocked ?? 0).toLocaleString()}</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-indigo-light" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Offer ID"
            value={filters.offer_id}
            onChange={(e) => { setFilters(f => ({ ...f, offer_id: e.target.value })); setPage(1); }}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-primary"
          />
          <input
            type="text"
            placeholder="Country (e.g. US)"
            value={filters.country}
            onChange={(e) => { setFilters(f => ({ ...f, country: e.target.value })); setPage(1); }}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-primary"
          />
          <select
            value={filters.device}
            onChange={(e) => { setFilters(f => ({ ...f, device: e.target.value })); setPage(1); }}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-primary"
          >
            <option value="">All Devices</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
          </select>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1); }}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-primary"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1); }}
            className="bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-primary"
          />
        </div>
      </GlassCard>

      <DataTable data={clicks} columns={columns} isLoading={isLoading} searchable={false} exportable />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg bg-surface-3 text-slate-300 hover:bg-surface-hover disabled:opacity-40 text-sm"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg bg-surface-3 text-slate-300 hover:bg-surface-hover disabled:opacity-40 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
