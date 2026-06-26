import { useState } from 'react';
import { formatCurrency, formatIDR } from "../lib/currency";
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import {
  MousePointerClick, TrendingUp, DollarSign, Clock, CheckCircle,
  Link as LinkIcon, Copy, Loader2, Search, ExternalLink, Package, BarChart3,
} from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

const fmt = (v) => formatIDR(v || 0);

const linkColumns = [
  { accessorKey: 'slug', header: 'Slug', cell: ({ getValue }) => <code className="text-indigo-light text-sm">{getValue()}</code> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
    const s = getValue();
    const colors = { active: 'bg-green-success/20 text-green-success', paused: 'bg-yellow-warning/20 text-yellow-warning' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[s] || 'bg-surface-3 text-slate-400'}`}>{s}</span>;
  }},
  { accessorKey: 'clicks', header: 'Clicks', cell: ({ getValue }) => <span className="font-mono">{getValue() || 0}</span> },
  { accessorKey: 'conversions', header: 'Conv', cell: ({ getValue }) => <span className="font-mono">{getValue() || 0}</span> },
  { accessorKey: 'created_at', header: 'Created', cell: ({ getValue }) => getValue() ? new Date(getValue() * 1000).toLocaleDateString('id-ID') : '—' },
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
  const [activeTab, setActiveTab] = useState('overview');
  const [offerSearch, setOfferSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: stats, isLoading: loadingStats, isError: errorStats, error: statsError, refetch: refetchStats } = useSafeQuery({
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

  const { data: offersData, isLoading: loadingOffers } = useSafeQuery({
    queryKey: ['browse-offers', offerSearch],
    queryFn: async () => {
      const params = offerSearch ? `?search=${encodeURIComponent(offerSearch)}` : '';
      const r = await api.get(`/api/offers${params}`);
      return r.data;
    },
    enabled: activeTab === 'browse',
  });

  const generateLinkMutation = useMutation({
    mutationFn: (offerId) => api.post(`/api/offers/${offerId}/generate-link`),
    onSuccess: () => {
      queryClient.invalidateQueries(['affiliate-links']);
    },
  });

  const copyLink = (slug) => {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/go/${slug}`);
  };

  if (errorStats && (!stats || (Array.isArray(stats) && !stats.length))) return <ErrorState error={statsError} onRetry={refetchStats} />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'browse', label: 'Browse Offers', icon: Package },
    { id: 'links', label: 'My Links', icon: LinkIcon },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Affiliate Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Your performance at a glance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06]">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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

          {/* Recent Links */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-accent-light" /> My Links
              </h3>
              <button onClick={() => setActiveTab('browse')} className="text-sm text-indigo-400 hover:text-indigo-300">Browse Offers →</button>
            </div>
            <DataTable data={(links || []).slice(0, 5)} columns={[...linkColumns, { id: 'copy', header: '', cell: ({ row }) => (
              <button onClick={() => copyLink(row.original.slug)} className="p-1.5 text-slate-400 hover:text-accent-light transition-colors"><Copy className="w-4 h-4" /></button>
            )}]} searchable={false} exportable={false} emptyMessage="No links yet. Browse offers to generate your first link." />
          </GlassCard>
        </div>
      )}

      {/* Browse Offers Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={offerSearch} onChange={(e) => setOfferSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                placeholder="Search offers..." />
            </div>
            <span className="text-sm text-slate-500">{offersData?.total || 0} offers</span>
          </div>

          {loadingOffers ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(offersData?.data || []).map(offer => (
                <GlassCard key={offer.id} className="hover:border-indigo-500/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{offer.name}</h4>
                        <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-[10px] font-mono">{offer.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{offer.advertiser_name || 'Direct'} • {offer.vertical || 'General'} • {offer.geo || 'Global'}</p>
                      {offer.notes && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{offer.notes}</p>}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{offer.affiliate_count || 0} affiliates</span>
                        <span>{offer.total_conversions || 0} conversions</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-400">{formatCurrency(offer.payout || 0)}</div>
                      <div className="text-xs text-slate-500">{offer.payout_currency || 'USD'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => generateLinkMutation.mutate(offer.id)}
                      disabled={generateLinkMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all disabled:opacity-50">
                      <LinkIcon className="w-4 h-4" /> Generate Link
                    </button>
                    {offer.affiliate_url && (
                      <a href={offer.affiliate_url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 bg-white/[0.04] text-slate-400 rounded-lg hover:bg-white/[0.08] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {generateLinkMutation.isSuccess && (
                    <div className="mt-2 text-xs text-green-400">✓ Link generated! Check "My Links" tab.</div>
                  )}
                </GlassCard>
              ))}
              {(!offersData?.data || offersData.data.length === 0) && (
                <div className="col-span-2 text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No approved offers available yet.</p>
                  <p className="text-xs mt-1">Check back later or contact your affiliate manager.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Links Tab */}
      {activeTab === 'links' && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-accent-light" /> My Links
          </h3>
          <DataTable data={links || []} columns={[...linkColumns, { id: 'copy', header: '', cell: ({ row }) => (
            <button onClick={() => copyLink(row.original.slug)} className="p-1.5 text-slate-400 hover:text-accent-light transition-colors"><Copy className="w-4 h-4" /></button>
          )}]} searchable={false} exportable emptyMessage="No links yet." />
        </GlassCard>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-success" /> Earnings History
          </h3>
          <DataTable data={earnings || []} columns={earningColumns} searchable={false} exportable emptyMessage="No earnings yet." />
        </GlassCard>
      )}
    </div>
  );
}
