import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MousePointerClick,
  TrendingUp,
  Clock,
  CheckCircle,
  Link as LinkIcon,
  Copy,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';

const fmt = (v) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (v) => {
  if (!v) return '—';
  const d = typeof v === 'number' ? new Date(v * 1000) : new Date(v);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const clickColumns = [
  {
    accessorKey: 'click_id',
    header: 'Click ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-slate-300">{getValue()}</span>
    ),
  },
  {
    accessorKey: 'offer_name',
    header: 'Offer',
    cell: ({ getValue }) => (
      <span className="text-white text-sm">{getValue() || '—'}</span>
    ),
  },
  {
    accessorKey: 'country_code',
    header: 'Country',
    cell: ({ getValue }) => (
      <span className="text-slate-300 text-sm">{getValue() || '—'}</span>
    ),
  },
  {
    accessorKey: 'device_type',
    header: 'Device',
    cell: ({ getValue }) => (
      <span className="text-slate-400 text-sm capitalize">
        {getValue() || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'ip',
    header: 'IP',
    cell: ({ getValue }) => {
      const ip = getValue();
      if (!ip) return <span className="text-slate-500 text-xs">—</span>;
      const parts = ip.split('.');
      const masked =
        parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : ip;
      return (
        <span className="font-mono text-xs text-slate-400">{masked}</span>
      );
    },
  },
  {
    accessorKey: 'clicked_at',
    header: 'Time',
    cell: ({ getValue }) => (
      <span className="text-slate-400 text-xs">{fmtDate(getValue())}</span>
    ),
  },
];

const earningColumns = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ getValue }) => (
      <span className="font-mono text-slate-400 text-xs">#{getValue()}</span>
    ),
  },
  {
    accessorKey: 'payout_amount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="font-semibold text-white">{fmt(getValue())}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const s = getValue();
      const colors = {
        pending:
          'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
        approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        paid: 'bg-green-success/10 text-green-success border-green-success/20',
        rejected: 'bg-red-error/10 text-red-error border-red-error/20',
      };
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[s] || 'bg-surface-3 text-slate-400 border-white/10'}`}
        >
          {s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'}
        </span>
      );
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ getValue }) => (
      <span className="text-slate-400 text-sm capitalize">
        {getValue() || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ getValue }) => (
      <span className="text-slate-400 text-sm">{fmtDate(getValue())}</span>
    ),
  },
];

export function AffiliatePortal() {
  const [offerId, setOfferId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const queryClient = useQueryClient();

  /* ── data fetching ── */
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async () => {
      const r = await api.get('/api/affiliate/stats');
      return r.data?.data ?? r.data;
    },
  });

  const { data: clicksData, isLoading: loadingClicks } = useQuery({
    queryKey: ['affiliate-clicks'],
    queryFn: async () => {
      const r = await api.get('/api/admin/reports/clicks?limit=50');
      return r.data?.data ?? r.data ?? [];
    },
  });

  const { data: earningsData, isLoading: loadingEarnings } = useQuery({
    queryKey: ['affiliate-earnings'],
    queryFn: async () => {
      const r = await api.get('/api/affiliate/earnings');
      return r.data?.data ?? r.data ?? [];
    },
  });

  /* ── smartlink mutation ── */
  const smartlinkMutation = useMutation({
    mutationFn: async (oid) => {
      const r = await api.post('/api/smartlink/generate', {
        offer_id: Number(oid),
      });
      return r.data;
    },
    onSuccess: (data) => {
      setGeneratedUrl(data.url || `${window.location.origin}/go/${data.slug}`);
      queryClient.invalidateQueries(['affiliate-links']);
      setOfferId('');
    },
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!offerId.trim()) return;
    setGeneratedUrl(null);
    smartlinkMutation.mutate(offerId.trim());
  };

  const copyUrl = () => {
    if (generatedUrl) navigator.clipboard.writeText(generatedUrl);
  };

  const clicks = Array.isArray(clicksData) ? clicksData : [];
  const earnings = Array.isArray(earningsData) ? earningsData : [];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Affiliate Portal
        </h1>
        <p className="text-slate-400 mt-2">
          Your performance at a glance — clicks, conversions, and earnings
        </p>
      </div>

      {/* stats cards */}
      {loadingStats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-light" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <StatCard
              label="Clicks Today"
              value={stats?.clicks24h ?? stats?.total_clicks ?? 0}
              icon={MousePointerClick}
              accent="blue"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              label="Conversions"
              value={stats?.total_conversions ?? 0}
              icon={TrendingUp}
              accent="green"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <StatCard
              label="Earnings Pending"
              value={fmt(stats?.pending)}
              icon={Clock}
              accent="yellow"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              label="Earnings Approved"
              value={fmt(stats?.approved)}
              icon={CheckCircle}
              accent="green"
            />
          </motion.div>
        </div>
      )}

      {/* generate smartlink */}
      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-accent-light" />
          Generate Smartlink
        </h3>

        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="offer-id-input"
              className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide"
            >
              Offer ID
            </label>
            <input
              id="offer-id-input"
              type="text"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              placeholder="e.g. 42"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-primary focus:ring-1 focus:ring-indigo-primary/40 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={smartlinkMutation.isPending || !offerId.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            {smartlinkMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Generate
          </button>
        </form>

        {smartlinkMutation.isError && (
          <p className="mt-3 text-red-error text-sm">
            {smartlinkMutation.error?.response?.data?.error ||
              'Failed to generate smartlink'}
          </p>
        )}

        {generatedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 p-3 bg-green-success/5 border border-green-success/20 rounded-lg"
          >
            <ExternalLink className="w-4 h-4 text-green-success shrink-0" />
            <code className="flex-1 text-sm text-green-success break-all">
              {generatedUrl}
            </code>
            <button
              onClick={copyUrl}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </GlassCard>

      {/* recent clicks */}
      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-accent-light" />
          Recent Clicks
        </h3>
        <DataTable
          data={clicks}
          columns={clickColumns}
          isLoading={loadingClicks}
          searchable={false}
          exportable
          emptyMessage="No clicks recorded yet"
        />
      </GlassCard>

      {/* earnings */}
      <GlassCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-success" />
          Earnings History
        </h3>
        <DataTable
          data={earnings}
          columns={earningColumns}
          isLoading={loadingEarnings}
          searchable={false}
          exportable
          emptyMessage="No earnings recorded yet"
        />
      </GlassCard>
    </motion.div>
  );
}
