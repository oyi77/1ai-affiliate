import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { TemplateSelector } from '../components/ui/TemplateSelector';
import { Plus, Gift, DollarSign, Network, Download } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import offerTemplates from '../data/offerTemplates';

const OFFER_CATEGORIES = {
  cpa: { label: 'CPA', color: 'bg-emerald-500/20 text-emerald-400' },
  cps: { label: 'CPS', color: 'bg-blue-500/20 text-blue-400' },
  cpl: { label: 'CPL', color: 'bg-purple-500/20 text-purple-400' },
  cpi: { label: 'CPI', color: 'bg-orange-500/20 text-orange-400' },
  revshare: { label: 'RevShare', color: 'bg-pink-500/20 text-pink-400' },
  hybrid: { label: 'Hybrid', color: 'bg-cyan-500/20 text-cyan-400' },
};

export function Offers() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tplSelectorOpen, setTplSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '', payout: '', network_id: '', status: 'active',
    url: '', country: 'Global', currency: 'USD',
    payout_type: 'auto', postback_url: '',
    click_id_param: 'clickid', daily_cap: '',
    vertical: '', type: 'CPA',
  });
  const queryClient = useQueryClient();

  const { data: offers, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const response = await api.get('/api/admin/offers?limit=100');
      return response.data?.data ?? response.data
    },
  });

  const { data: networks } = useSafeQuery({
    queryKey: ['networks'],
    queryFn: async () => {
      const response = await api.get('/api/admin/networks');
      return response.data?.data ?? response.data ?? []
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/api/admin/offers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['offers']);
      setCreateModalOpen(false);
      setFormData({ name: '', payout: '', network_id: '', status: 'active', url: '', country: 'Global', currency: 'USD', payout_type: 'auto', postback_url: '', click_id_param: 'clickid', daily_cap: '', vertical: '', type: 'CPA' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const columns = [
    {
      header: 'Offer',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-success/10 border border-green-success/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-success" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.name}</div>
            <div className="text-xs text-slate-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Network',
      accessorKey: 'network_id',
      cell: ({ getValue }) => {
        const network = networks?.find(n => n.id === getValue());
        return (
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">{network?.name || 'Direct'}</span>
          </div>
        );
      },
    },
    {
      header: 'Payout',
      accessorKey: 'payout',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-green-success font-bold">
          <DollarSign className="w-4 h-4" />
          {formatCurrency(getValue() || 0)}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue() || 'active';
        const colors = {
          active: 'bg-green-success/10 text-green-success border-green-success/20',
          paused: 'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
          archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.active}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      header: 'EPC',
      accessorKey: 'epc',
      cell: ({ getValue }) => {
        const val = Number(getValue()) || 0;
        const color = val > 0.5 ? 'text-green-success' : val > 0 ? 'text-yellow-warning' : 'text-slate-500';
        return <span className={`font-mono text-sm ${color}`}>{formatCurrency(val)}</span>;
      },
    },
    {
      header: 'CR %',
      accessorKey: 'cr',
      cell: ({ getValue }) => {
        const val = Number(getValue()) || 0;
        const color = val > 5 ? 'text-green-success' : val > 1 ? 'text-yellow-warning' : 'text-slate-500';
        return <span className={`font-mono text-sm ${color}`}>{val.toFixed(2)}%</span>;
      },
    },
    {
      header: 'Conversions',
      accessorKey: 'conversions',
      cell: ({ getValue }) => <span className="font-mono text-indigo-light">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: ({ getValue }) => <span className="text-slate-300">{formatCurrency(getValue() || 0)}</span>,
    },
  ];


  const exportCSV = () => {
    if (!offers?.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = offers
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.accessorKey];
            return typeof val === 'string' ? `"${val}"` : (val ?? '');
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (isError && (!offers || (Array.isArray(offers) && !offers.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Offers
          </h1>
          <p className="text-slate-400 mt-2">Manage affiliate offers and network integrations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setTplSelectorOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all"
          >
            📋 From Template
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Offer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Offers</div>
          <div className="text-3xl font-bold text-white">{offers?.length || 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Active</div>
          <div className="text-3xl font-bold text-green-success">
            {offers?.filter(o => o.status === 'active').length || 0}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Avg Payout</div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(offers?.length ? offers.reduce((sum, o) => sum + Number(o.payout || 0), 0) / offers.length : 0)}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Networks</div>
          <div className="text-3xl font-bold text-indigo-light">{networks?.length || 0}</div>
        </GlassCard>
      </div>

      <DataTable data={offers || []} columns={columns} isLoading={isLoading} emptyMessage="No offers yet. Create your first offer." />

      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create Offer"
        description="Add an offer to track conversions and payouts"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-5">
          {/* Template Quick-Select */}
          <div className="flex items-center gap-3 p-3 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
            <span className="text-sm text-slate-400">Quick start:</span>
            <button type="button" onClick={() => setTplSelectorOpen(true)}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-600/40 transition-colors">
              📋 Browse {offerTemplates.length} templates
            </button>
            {selectedTemplate && (
              <span className="text-xs text-green-400">✓ {selectedTemplate.name}</span>
            )}
          </div>

          {/* Section 1: Offer Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">1. Offer Details</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="iPhone 15 Pro - Sweepstakes ID" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Country</label>
                <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="Global">Global</option>
                  <option value="ID">Indonesia</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="MY">Malaysia</option>
                  <option value="TH">Thailand</option>
                  <option value="PH">Philippines</option>
                  <option value="VN">Vietnam</option>
                  <option value="SG">Singapore</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="IN">India</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Affiliate Network</label>
                <select value={formData.network_id} onChange={(e) => setFormData({ ...formData, network_id: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="">None (Direct)</option>
                  {networks?.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">URL *</label>
              <textarea value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                rows={3} placeholder="https://network.com/offer?aff_id=123&clickid={clickId}" required />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['{clickId}', '{campaignId}', '{campaignName}', '{trafficSourceId}', '{country}', '{deviceType}', '{browser}', '{os}', '{ip}', '{cost.USD}'].map(token => (
                  <button key={token} type="button" onClick={() => setFormData({ ...formData, url: formData.url + token })}
                    className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-[10px] font-mono hover:bg-indigo-600/40 transition-colors">
                    + {token}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Advanced Options */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">2. Advanced Options</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Postback URL</label>
              <input type="text" value={formData.postback_url} onChange={(e) => setFormData({ ...formData, postback_url: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                placeholder="https://network.com/postback?clickid={clickId}&payout={payout}" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Click ID Parameter</label>
                <input type="text" value={formData.click_id_param} onChange={(e) => setFormData({ ...formData, click_id_param: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm" placeholder="clickid" />
              </div>
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
                  <option value="saas">SaaS</option>
                  <option value="adult">Adult</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Payout Type</label>
                <select value={formData.payout_type} onChange={(e) => setFormData({ ...formData, payout_type: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="auto">Auto (from postback)</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Payout (USD) *</label>
                <input type="number" step="0.01" value={formData.payout} onChange={(e) => setFormData({ ...formData, payout: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="25.00" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Currency</label>
                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="USD">US Dollar</option>
                  <option value="IDR">Indonesian Rupiah</option>
                  <option value="EUR">Euro</option>
                  <option value="GBP">British Pound</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Daily Cap (conversions)</label>
              <input type="number" value={formData.daily_cap} onChange={(e) => setFormData({ ...formData, daily_cap: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="Leave empty for no cap" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all">Cancel</button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Save Offer'}
            </button>
          </div>
        </form>
      </Modal>
      <TemplateSelector
        open={tplSelectorOpen}
        onOpenChange={setTplSelectorOpen}
        templates={offerTemplates}
        categoryMap={OFFER_CATEGORIES}
        title="Select Offer Template"
        onSelect={(tpl) => {
          setFormData(prev => ({ ...prev, name: tpl.name }));
          setCreateModalOpen(true);
        }}
      />
    </div>
  );
}
