import { formatCurrency, formatIDR } from "../lib/currency";
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import {
  MousePointerClick, TrendingUp, DollarSign, Clock, CheckCircle,
  Link as LinkIcon, Copy, Loader2,
} from 'lucide-react';

const fmt = (v) => formatIDR(v || 0);

const linkColumns = [
  { accessorKey: 'slug', header: 'Slug', cell: ({ getValue }) => <code className="text-indigo-light text-sm">{getValue()}</code> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
    const s = getValue();
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s === 'active' ? 'bg-green-success/20 text-green-success' : 'bg-yellow-warning/20 text-yellow-warning'}`}>{s}</span>;
  }},
  { accessorKey: 'click_count', header: 'Clicks' },
  { accessorKey: 'default_url', header: 'URL', cell: ({ getValue }) => <span className="text-slate-400 text-xs truncate max-w-[200px] block">{getValue() || '—'}</span> },
];

const earningColumns = [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'payout_amount', header: 'Amount', cell: ({ getValue }) => fmt(getValue()) },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
    const s = getValue();
    const colors = { pending: 'bg-yellow-warning/20 text-yellow-warning', approved: 'bg-blue-500/20 text-blue-400', paid: 'bg-green-success/20 text-green-success', rejected: 'bg-red-error/20 text-red-error' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[s] || 'bg-surface-3 text-slate-400'}`}>{s}</span>;
  }},
  { accessorKey: 'created_at', header: 'Date', cell: ({ getValue }) => getValue() ? new Date(getValue() * 1000).toLocaleDateString('id-ID') : '—' },
];

export function AffiliateDashboard() {
  const { data: stats, isLoading: loadingStats } = useSafeQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async () => { const r = await api.get('/api/affiliate/stats'); return r.data?.data ?? r.data; },
  });

  const { data: links, isLoading: loadingLinks } = useSafeQuery({
    queryKey: ['affiliate-links'],
    queryFn: async () => { const r = await api.get('/api/affiliate/links'); return r.data?.data ?? r.data; },
  });

  const { data: earnings, isLoading: loadingEarnings } = useSafeQuery({
    queryKey: ['affiliate-earnings'],
    queryFn: async () => { const r = await api.get('/api/affiliate/earnings'); return r.data?.data ?? r.data; },
  });

  const copyLink = (slug) => {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/go/${slug}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Affiliate Dashboard
        </h1>
        <p className="text-slate-400 mt-2">Your performance at a glance</p>
      </div>

      {/* KPI Cards */}
      {loadingStats ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Clicks" value={stats?.total_clicks ?? 0} icon={MousePointerClick} accent="blue" />
          <StatCard label="Conversions" value={stats?.total_conversions ?? 0} icon={TrendingUp} accent="green" />
          <StatCard label="Total Earnings" value={fmt(stats?.total_earnings)} icon={DollarSign} accent="green" />
          <StatCard label="Balance" value={fmt(stats?.balance)} icon={DollarSign} accent="blue" />
          <StatCard label="Pending" value={fmt(stats?.pending)} icon={Clock} accent="yellow" />
          <StatCard label="Approved" value={fmt(stats?.approved)} icon={CheckCircle} accent="green" />
          <StatCard label="Paid" value={fmt(stats?.paid)} icon={DollarSign} accent="blue" />
          <StatCard label="This Month" value={fmt(stats?.this_month)} icon={TrendingUp} accent="green" />
        </div>
      )}

      {/* Smartlinks */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-accent-light" />
            My Links
          </h3>
        </div>
        {loadingLinks ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-light" /></div>
        ) : (
          <DataTable
            data={links || []}
            columns={[
              ...linkColumns,
              {
                id: 'copy',
                header: '',
                cell: ({ row }) => (
                  <button onClick={() => copyLink(row.original.slug)} className="p-1.5 text-slate-400 hover:text-accent-light transition-colors" title="Copy link">
                    <Copy className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
            searchable={false}
            exportable={false}
          />
        )}
      </GlassCard>

      {/* Earnings History */}
      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-success" />
          Earnings History
        </h3>
        {loadingEarnings ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-light" /></div>
        ) : (
          <DataTable
            data={earnings || []}
            columns={earningColumns}
            searchable={false}
            exportable
          />
        )}
      </GlassCard>
    </div>
  );
}
