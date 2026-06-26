import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import api from '../lib/api';
import { formatCurrency } from '../lib/currency';
import {
  Package, DollarSign, TrendingUp, Clock, Plus, CheckCircle, XCircle,
  BarChart3, Eye, Download, Settings,
} from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
  paid: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
};

export function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convFilter, setConvFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '', url: '', type: 'CPA', payout: '', vertical: '', geo: 'Global', notes: '', cap_daily: '',
  });
  const queryClient = useQueryClient();

  // Dashboard stats
  const { data: dashboard } = useSafeQuery({
    queryKey: ['advertiser-dashboard'],
    queryFn: async () => { const r = await api.get('/api/advertiser/dashboard'); return r.data?.data; },
  });

  // Offers
  const { data: offers, isLoading: loadingOffers } = useSafeQuery({
    queryKey: ['advertiser-offers'],
    queryFn: async () => { const r = await api.get('/api/advertiser/offers'); return r.data?.data || []; },
  });

  // Conversions
  const { data: conversions, isLoading: loadingConversions } = useSafeQuery({
    queryKey: ['advertiser-conversions', convFilter],
    queryFn: async () => {
      const params = convFilter ? `?status=${convFilter}` : '';
      const r = await api.get(`/api/advertiser/conversions${params}`);
      return r.data?.data || [];
    },
  });

  // Profile
  const { data: profile } = useSafeQuery({
    queryKey: ['advertiser-profile'],
    queryFn: async () => { const r = await api.get('/api/advertiser/profile'); return r.data?.data; },
  });

  // Create offer mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/advertiser/offers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['advertiser-offers']);
      queryClient.invalidateQueries(['advertiser-dashboard']);
      setCreateModalOpen(false);
      setFormData({ name: '', url: '', type: 'CPA', payout: '', vertical: '', geo: 'Global', notes: '', cap_daily: '' });
    },
  });

  // Approve conversion
  const approveMutation = useMutation({
    mutationFn: (id) => api.post(`/api/advertiser/conversions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['advertiser-conversions']);
      queryClient.invalidateQueries(['advertiser-dashboard']);
    },
  });

  // Reject conversion
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/api/advertiser/conversions/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['advertiser-conversions']);
      queryClient.invalidateQueries(['advertiser-dashboard']);
    },
  });

  // Offer columns
  const offerColumns = [
    { accessorKey: 'name', header: 'Offer', cell: ({ row }) => (
      <div>
        <div className="font-semibold text-white">{row.original.name}</div>
        <div className="text-xs text-slate-500">ID: {row.original.id}</div>
      </div>
    )},
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => (
      <span className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded text-xs font-mono">{getValue()}</span>
    )},
    { accessorKey: 'payout', header: 'Payout', cell: ({ getValue }) => (
      <span className="font-mono text-green-400">{formatCurrency(getValue() || 0)}</span>
    )},
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[getValue()] || STATUS_COLORS.draft}`}>{getValue()}</span>
    )},
    { accessorKey: 'approval_status', header: 'Approval', cell: ({ getValue }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[getValue()] || STATUS_COLORS.pending}`}>{getValue()}</span>
    )},
    { accessorKey: 'conversion_count', header: 'Conversions', cell: ({ getValue }) => (
      <span className="font-mono text-slate-300">{getValue() || 0}</span>
    )},
    { accessorKey: 'total_revenue', header: 'Revenue', cell: ({ getValue }) => (
      <span className="font-mono text-indigo-400">{formatCurrency(getValue() || 0)}</span>
    )},
  ];

  // Conversion columns
  const convColumns = [
    { accessorKey: 'conversion_id', header: 'ID', cell: ({ getValue }) => (
      <span className="font-mono text-xs text-slate-400">{getValue()}</span>
    )},
    { accessorKey: 'offer_name', header: 'Offer' },
    { accessorKey: 'conversion_time', header: 'Date', cell: ({ getValue }) => (
      <span className="text-sm text-slate-400">{new Date(getValue() * 1000).toLocaleDateString()}</span>
    )},
    { accessorKey: 'network_payout_snapshot', header: 'Payout', cell: ({ getValue }) => (
      <span className="font-mono text-green-400">{formatCurrency(getValue() || 0)}</span>
    )},
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[getValue()] || STATUS_COLORS.pending}`}>{getValue()}</span>
    )},
    { id: 'actions', header: 'Actions', cell: ({ row }) => {
      if (row.original.status !== 'pending') return null;
      return (
        <div className="flex gap-2">
          <button onClick={() => approveMutation.mutate(row.original.conversion_id)}
            className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs hover:bg-emerald-600/40 transition-colors">
            <CheckCircle className="w-3 h-3 inline mr-1" />Approve
          </button>
          <button onClick={() => rejectMutation.mutate({ id: row.original.conversion_id, reason: 'Rejected' })}
            className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/40 transition-colors">
            <XCircle className="w-3 h-3 inline mr-1" />Reject
          </button>
        </div>
      );
    }},
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'offers', label: 'My Offers', icon: Package },
    { id: 'conversions', label: 'Conversions', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Advertiser Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            {profile?.company_name || 'Your Company'} — Manage offers and track conversions
          </p>
        </div>
        <button onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
          <Plus className="w-5 h-5" /> New Offer
        </button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Offers</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.offers?.total || 0}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Conversions</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.conversions?.total || 0}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-white">{dashboard?.conversions?.pending || 0}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Payout</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(dashboard?.conversions?.total_payout || 0)}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Recent conversions */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Conversions</h3>
            <DataTable columns={convColumns} data={conversions?.slice(0, 5) || []} isLoading={loadingConversions} emptyMessage="No conversions yet." />
          </GlassCard>
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">My Offers</h3>
            <button onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all">
              <Plus className="w-4 h-4" /> New Offer
            </button>
          </div>
          <DataTable columns={offerColumns} data={offers || []} isLoading={loadingOffers} emptyMessage="No offers yet. Create your first offer." />
        </GlassCard>
      )}

      {/* Conversions Tab */}
      {activeTab === 'conversions' && (
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Conversions</h3>
            <div className="flex gap-2">
              {['', 'pending', 'approved', 'rejected', 'paid'].map(s => (
                <button key={s} onClick={() => setConvFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    convFilter === s ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                  }`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
          <DataTable columns={convColumns} data={conversions || []} isLoading={loadingConversions} emptyMessage="No conversions found." />
        </GlassCard>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && profile && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Advertiser Profile</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Company Name</label>
              <p className="text-white">{profile.company_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Website</label>
              <p className="text-white">{profile.website || 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Platform Type</label>
              <p className="text-white">{profile.platform_type || 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Commission Type</label>
              <p className="text-white">{profile.commission_type || 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[profile.status] || STATUS_COLORS.active}`}>
                {profile.status}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Notes</label>
              <p className="text-slate-400 text-sm">{profile.notes || 'No notes'}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Create Offer Modal */}
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen} title="Create Offer" description="Add a new offer for affiliates to promote">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Offer Details</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="My Product Offer" required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Offer URL</label>
              <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                placeholder="https://myproduct.com/landing" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="CPA">CPA</option>
                  <option value="CPL">CPL</option>
                  <option value="CPS">CPS</option>
                  <option value="CPI">CPI</option>
                  <option value="revshare">RevShare</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Payout (USD) *</label>
                <input type="number" step="0.01" value={formData.payout} onChange={(e) => setFormData({ ...formData, payout: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="25.00" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Vertical</label>
                <select value={formData.vertical} onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="">Select vertical</option>
                  <option value="sweepstakes">Sweepstakes</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="finance">Finance</option>
                  <option value="gaming">Gaming</option>
                  <option value="dating">Dating</option>
                  <option value="health">Health/Nutra</option>
                  <option value="crypto">Crypto</option>
                  <option value="mobile">Mobile Apps</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Geo Target</label>
                <input type="text" value={formData.geo} onChange={(e) => setFormData({ ...formData, geo: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="Global" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Daily Cap</label>
              <input type="number" value={formData.cap_daily} onChange={(e) => setFormData({ ...formData, cap_daily: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="Leave empty for no cap" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" rows={2} placeholder="Offer description..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all">Cancel</button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-all disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
