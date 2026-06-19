import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { SlideOver } from '../components/ui/SlideOver';
import { Radio, Plus, Globe, Settings, Check, RefreshCw, Link2, Loader2 } from 'lucide-react';
import api from '../lib/api';

const TEMPLATES = [
  { id: 'meta', label: 'Meta Ads', icon: '📘', platform_type: 'meta', cost_model: 'CPC', desc: 'Facebook & Instagram ads' },
  { id: 'google', label: 'Google Ads', icon: '🔍', platform_type: 'google', cost_model: 'CPC', desc: 'Search & Display campaigns' },
  { id: 'tiktok', label: 'TikTok Ads', icon: '🎵', platform_type: 'tiktok', cost_model: 'CPC', desc: 'TikTok For Business' },
  { id: 'propellerads', label: 'PropellerAds', icon: '🌐', platform_type: 'propellerads', cost_model: 'CPM', desc: 'Pop & Push traffic' },
  { id: 'custom', label: 'Custom', icon: '⚙️', platform_type: 'custom', cost_model: 'CPC', desc: 'Any other traffic source' },
];

export function TrafficSources() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', platform_type: '', cost_model: 'CPC', currency: 'IDR', tracking_domain: '' });
  const [formError, setFormError] = useState('');
  const [detailRow, setDetailRow] = useState(null);
  const [metaForm, setMetaForm] = useState({ act_id: '', access_token: '' });
  const [metaError, setMetaError] = useState('');
  const [metaConnecting, setMetaConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const queryClient = useQueryClient();

  const { data: sources, isLoading } = useQuery({
    queryKey: ['traffic-sources'],
    queryFn: async () => {
      const res = await api.get('/api/admin/traffic-sources');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/traffic-sources', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-sources'] });
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create traffic source'),
  });

  const connectMetaMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/api/admin/traffic-sources/${id}/connect-meta`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-sources'] });
      setMetaConnecting(false);
      setMetaError('');
      setDetailRow(null);
      setMetaForm({ act_id: '', access_token: '' });
    },
    onError: (err) => {
      setMetaConnecting(false);
      setMetaError(err.response?.data?.error || 'Failed to connect Meta account');
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id) => api.post(`/api/admin/traffic-sources/${id}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traffic-sources'] });
      setSyncingId(null);
    },
    onError: () => setSyncingId(null),
  });

  function resetForm() {
    setSelectedTemplate(null);
    setFormData({ name: '', platform_type: '', cost_model: 'CPC', currency: 'IDR', tracking_domain: '' });
    setFormError('');
  }

  function selectTemplate(tpl) {
    setSelectedTemplate(tpl);
    setFormData(prev => ({ ...prev, platform_type: tpl.platform_type, cost_model: tpl.cost_model }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.name) {
      setFormError('Name is required');
      return;
    }
    if (!formData.platform_type) {
      setFormError('Select a template first');
      return;
    }
    createMutation.mutate(formData);
  }

  function handleMetaConnect(e) {
    e.preventDefault();
    setMetaError('');
    if (!metaForm.act_id || !metaForm.access_token) {
      setMetaError('Both Account ID and Access Token are required');
      return;
    }
    setMetaConnecting(true);
    connectMetaMutation.mutate({ id: detailRow.id, data: metaForm });
  }

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <button onClick={() => setDetailRow(row.original)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-slate-400">
            <Radio className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-white">{row.original.name}</div>
            {row.original.tracking_domain && (
              <div className="text-xs text-slate-500">{row.original.tracking_domain}</div>
            )}
          </div>
        </button>
      ),
    },
    {
      header: 'Platform',
      accessorKey: 'platform_type',
      cell: ({ getValue }) => {
        const val = getValue();
        const colors = {
          meta: 'bg-blue-500/20 text-blue-400',
          google: 'bg-red-500/20 text-red-400',
          tiktok: 'bg-pink-500/20 text-pink-400',
          propellerads: 'bg-orange-500/20 text-orange-400',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[val] || 'bg-slate-600/20 text-slate-400'}`}>
            {val || '—'}
          </span>
        );
      },
    },
    {
      header: 'Cost Model',
      accessorKey: 'cost_model',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono text-sm">{getValue() || '—'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const active = getValue() === 'active';
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-success shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'}`} />
            <span className="capitalize">{getValue() || 'active'}</span>
          </div>
        );
      },
    },
    {
      header: 'Synced',
      accessorKey: 'last_synced_at',
      cell: ({ getValue }) => {
        const ts = getValue();
        return ts
          ? <span className="text-slate-400 text-sm">{new Date(ts * 1000).toLocaleDateString()}</span>
          : <span className="text-slate-600">Never</span>;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSyncingId(row.original.id); syncMutation.mutate(row.original.id); }}
            disabled={syncingId === row.original.id}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Sync"
          >
            {syncingId === row.original.id
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setDetailRow(row.original)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic Sources</h1>
          <p className="text-slate-400 mt-1">Connect and manage ad platforms</p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Source
        </button>
      </div>

      <GlassCard>
        <DataTable columns={columns} data={sources ?? []} isLoading={isLoading} emptyMessage="No traffic sources yet. Connect Meta Ads or Google Ads." />
      </GlassCard>

      {/* Create modal */}
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen} title="New Traffic Source" description="Choose a template or create a custom source." size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Platform Template</label>
            <div className="grid grid-cols-5 gap-3">
              {TEMPLATES.map(tpl => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    selectedTemplate?.id === tpl.id
                      ? 'border-indigo-primary bg-indigo-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'border-white/10 bg-surface-2 hover:border-white/20'
                  }`}
                >
                  {selectedTemplate?.id === tpl.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-indigo-light" />
                    </div>
                  )}
                  <span className="text-2xl">{tpl.icon}</span>
                  <span className="text-xs font-semibold text-white">{tpl.label}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Source Name</label>
              <input
                type="text"
                placeholder="e.g. Meta Ads - Main"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Tracking Domain</label>
              <input
                type="text"
                placeholder="trk.yourdomain.com"
                value={formData.tracking_domain}
                onChange={e => setFormData(p => ({ ...p, tracking_domain: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Platform Type</label>
              <select
                value={formData.platform_type}
                onChange={e => setFormData(p => ({ ...p, platform_type: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none"
              >
                <option value="">Select platform</option>
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="propellerads">PropellerAds</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Cost Model</label>
              <select
                value={formData.cost_model}
                onChange={e => setFormData(p => ({ ...p, cost_model: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none"
              >
                <option value="CPC">CPC</option>
                <option value="CPM">CPM</option>
                <option value="CPA">CPA</option>
                <option value="revshare">RevShare</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Currency</label>
            <select
              value={formData.currency}
              onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary appearance-none"
            >
              <option value="IDR">IDR — Indonesian Rupiah</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Source'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail SlideOver with Meta connect form */}
      <SlideOver
        open={!!detailRow}
        onOpenChange={(open) => { if (!open) { setDetailRow(null); setMetaError(''); setMetaForm({ act_id: '', access_token: '' }); } }}
        title={detailRow?.name || 'Traffic Source'}
        description={detailRow?.platform_type ? `${detailRow.platform_type} · ${detailRow.cost_model}` : ''}
        width="lg"
      >
        {detailRow && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Platform</div>
                <div className="text-white font-semibold capitalize">{detailRow.platform_type || '—'}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Cost Model</div>
                <div className="text-white font-semibold font-mono">{detailRow.cost_model || '—'}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Currency</div>
                <div className="text-white font-semibold">{detailRow.currency || 'IDR'}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Last Synced</div>
                <div className="text-white font-semibold">
                  {detailRow.last_synced_at ? new Date(detailRow.last_synced_at * 1000).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>

            {/* Sync button */}
            <button
              onClick={() => { setSyncingId(detailRow.id); syncMutation.mutate(detailRow.id); }}
              disabled={syncingId === detailRow.id}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-3 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            >
              {syncingId === detailRow.id
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</>
                : <><RefreshCw className="w-4 h-4" /> Sync Now</>}
            </button>

            {/* Meta Ads connect form */}
            {detailRow.platform_type === 'meta' && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-400" />
                  Connect Meta Ads Account
                </h3>
                <p className="text-sm text-slate-400 mb-4">Link your Meta Ads account to auto-sync spend, impressions, and campaign data.</p>

                <form onSubmit={handleMetaConnect} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Ad Account ID</label>
                    <input
                      type="text"
                      placeholder="act_123456789"
                      value={metaForm.act_id}
                      onChange={e => setMetaForm(p => ({ ...p, act_id: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Access Token</label>
                    <input
                      type="password"
                      placeholder="EAAxxxxxxxxxxxxxxx"
                      value={metaForm.access_token}
                      onChange={e => setMetaForm(p => ({ ...p, access_token: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-primary"
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Generate from <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="text-indigo-light hover:underline">Meta Business Suite → System Users</a>. Requires <code className="text-xs bg-black/30 px-1 py-0.5 rounded">ads_read</code> permission.
                    </p>
                  </div>

                  {metaError && <p className="text-red-400 text-sm">{metaError}</p>}

                  <button
                    type="submit"
                    disabled={metaConnecting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {metaConnecting ? 'Connecting...' : 'Connect Meta Account'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
