import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { TemplateSelector } from '../components/ui/TemplateSelector';
import { Plus, Target, Play, Pause, TrendingUp, Download } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import campaignTemplates from '../data/campaignTemplates';

const CMP_CATEGORIES = {
  direct_link: { label: 'Direct Link', color: 'bg-blue-500/20 text-blue-400' },
  landing_page: { label: 'Landing Page', color: 'bg-emerald-500/20 text-emerald-400' },
  smartlink: { label: 'Smartlink', color: 'bg-purple-500/20 text-purple-400' },
  email: { label: 'Email', color: 'bg-orange-500/20 text-orange-400' },
  social: { label: 'Social', color: 'bg-pink-500/20 text-pink-400' },
  native: { label: 'Native', color: 'bg-cyan-500/20 text-cyan-400' },
};

export function Campaigns() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tplSelectorOpen, setTplSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '', status: 'active', traffic_source_id: '', country: 'Global',
    tracking_domain: '', cost_model: 'CPC', currency: 'USD',
    destination_type: 'url', offer_url: '', flow_id: '',
    tags: '', uniqueness_period: 24,
  });
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get('/api/admin/campaigns?limit=100');
      return response.data?.data || response.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/api/admin/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      setCreateModalOpen(false);
      setFormData({ name: '', status: 'active', traffic_source_id: '', country: 'Global', tracking_domain: '', cost_model: 'CPC', currency: 'USD', destination_type: 'url', offer_url: '', flow_id: '', tags: '', uniqueness_period: 24 });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }) => {
      return api.patch(`/api/admin/campaigns/${id}`, { active: !active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const columns = [
    {
      header: 'Campaign',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-primary/10 border border-indigo-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-light" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.name}</div>
            <div className="text-xs text-slate-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }) => {
        const active = row.original.active;
        return (
          <button
            onClick={() => toggleStatusMutation.mutate({ id: row.original.id, active })}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              active
                ? 'bg-green-success/10 text-green-success border border-green-success/20 hover:bg-green-success/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
            }`}
          >
            {active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {active ? 'Active' : 'Paused'}
          </button>
        );
      },
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-green-success font-semibold">
          <TrendingUp className="w-4 h-4" />
          {formatCurrency(getValue() || 0)}
        </div>
      ),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => <span className="font-mono text-slate-300">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'Conversions',
      accessorKey: 'conversions',
      cell: ({ getValue }) => <span className="font-mono text-indigo-light">{(getValue() || 0).toLocaleString()}</span>,
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
      header: 'Created',
      accessorKey: 'created_at',
      cell: ({ getValue }) => (
        <span className="text-slate-400 text-sm">
          {getValue() ? new Date(Number(getValue()) * 1000).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ];


  const exportCSV = () => {
    if (!campaigns?.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = campaigns
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
    a.download = `campaigns-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (isError && (!campaigns || (Array.isArray(campaigns) && !campaigns.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Campaigns
          </h1>
          <p className="text-slate-400 mt-2">Manage your affiliate campaigns and track performance</p>
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
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Campaigns</div>
          <div className="text-3xl font-bold text-white">{campaigns?.length || 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Active Campaigns</div>
          <div className="text-3xl font-bold text-green-success">
            {campaigns?.filter(c => c.active).length || 0}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(campaigns?.reduce((sum, c) => sum + Number(c.revenue || 0), 0) || 0)}
          </div>
        </GlassCard>
      </div>

      <DataTable data={campaigns || []} columns={columns} isLoading={isLoading} emptyMessage="No campaigns yet." />

      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create Campaign"
        description="Set up tracking for your traffic source"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-5">
          {/* Template Quick-Select */}
          <div className="flex items-center gap-3 p-3 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
            <span className="text-sm text-slate-400">Quick start:</span>
            <button type="button" onClick={() => setTplSelectorOpen(true)}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-600/40 transition-colors">
              📋 Browse {campaignTemplates.length} templates
            </button>
            {selectedTemplate && (
              <span className="text-xs text-green-400">✓ {selectedTemplate.name}</span>
            )}
          </div>

          {/* Section 1: Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">1. Campaign Details</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="Summer Sale 2024" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Traffic Source</label>
                <select value={formData.traffic_source_id} onChange={(e) => setFormData({ ...formData, traffic_source_id: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="">None</option>
                  <option value="meta">Facebook</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                  <option value="propellerads">PropellerAds</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
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
                  <option value="KR">South Korea</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tracking Domain</label>
                <select value={formData.tracking_domain} onChange={(e) => setFormData({ ...formData, tracking_domain: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="">Account default</option>
                  <option value="track.berkahkarya.org">track.berkahkarya.org</option>
                  <option value="go.berkahkarya.org">go.berkahkarya.org</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tags</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" placeholder="comma-separated tags" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Cost Model</label>
                <select value={formData.cost_model} onChange={(e) => setFormData({ ...formData, cost_model: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="CPC">CPC</option>
                  <option value="CPM">CPM</option>
                  <option value="CPA">CPA</option>
                  <option value="CPV">CPV</option>
                  <option value="RevShare">RevShare</option>
                  <option value="Auto">Auto</option>
                  <option value="none">Do not track</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Uniqueness (hrs)</label>
                <input type="number" value={formData.uniqueness_period} onChange={(e) => setFormData({ ...formData, uniqueness_period: parseInt(e.target.value) || 24 })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary" min="1" max="720" />
              </div>
            </div>
          </div>

          {/* Section 2: Destination */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">2. Destination</h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Destination Type</label>
              <div className="flex gap-3">
                {['url', 'flow'].map(type => (
                  <button key={type} type="button" onClick={() => setFormData({ ...formData, destination_type: type })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.destination_type === type ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                    }`}>
                    {type === 'url' ? 'Direct URL' : 'Flow'}
                  </button>
                ))}
              </div>
            </div>

            {formData.destination_type === 'url' ? (
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Offer URL *</label>
                <textarea value={formData.offer_url} onChange={(e) => setFormData({ ...formData, offer_url: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                  rows={3} placeholder="https://example.com/offer?clickid={clickId}&campaign={campaignId}" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['{clickId}', '{campaignId}', '{campaignName}', '{trafficSourceId}', '{country}', '{deviceType}', '{browser}', '{os}', '{ip}', '{cost.USD}'].map(token => (
                    <button key={token} type="button" onClick={() => setFormData({ ...formData, offer_url: formData.offer_url + token })}
                      className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-[10px] font-mono hover:bg-indigo-600/40 transition-colors">
                      + {token}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Select Flow</label>
                <select value={formData.flow_id} onChange={(e) => setFormData({ ...formData, flow_id: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none">
                  <option value="">Select flow for your campaign…</option>
                  <option value="1">Global - Default Flow</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all">Cancel</button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Save Campaign'}
            </button>
          </div>
        </form>
      </Modal>
      <TemplateSelector
        open={tplSelectorOpen}
        onOpenChange={setTplSelectorOpen}
        templates={campaignTemplates}
        categoryMap={CMP_CATEGORIES}
        title="Select Campaign Template"
        onSelect={(tpl) => {
          setFormData(prev => ({ ...prev, name: tpl.name }));
          setCreateModalOpen(true);
        }}
      />
    </div>
  );
}
