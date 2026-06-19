import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { SlideOver } from '../components/ui/SlideOver';
import { Building2, Plus, Globe, Settings, Upload, FileSpreadsheet, X } from 'lucide-react';
import api from '../lib/api';

const TEMPLATES = [
  { id: 'shopee', label: 'Shopee', icon: '🛒', platform_type: 'shopee', desc: 'Shopee Affiliate Program' },
  { id: 'tokopedia', label: 'Tokopedia', icon: '🏪', platform_type: 'tokopedia', desc: 'Tokopedia Affiliate' },
  { id: 'lazada', label: 'Lazada', icon: '🛍️', platform_type: 'lazada', desc: 'Lazada Affiliate' },
  { id: 'custom', label: 'Custom', icon: '⚙️', platform_type: 'custom', desc: 'Custom advertiser' },
];

export function Advertisers() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', company_name: '', website: '', platform_type: '' });
  const [formError, setFormError] = useState('');
  const [detailRow, setDetailRow] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedShopeeAccount, setSelectedShopeeAccount] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const queryClient = useQueryClient();

  const { data: advertisers, isLoading } = useQuery({
    queryKey: ['advertisers'],
    queryFn: async () => {
      const res = await api.get('/api/admin/advertisers');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/advertisers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['advertisers']);
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create advertiser'),
  });

  const { data: shopeeAccounts = [] } = useQuery({
    queryKey: ['shopee-accounts'],
    queryFn: async () => {
      const res = await api.get('/api/admin/shopee-accounts');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createShopeeAccountMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/shopee-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shopee-accounts']);
      setNewAccountName('');
    },
  });

  const columns = [
    {
      header: 'Advertiser',
      accessorKey: 'user_name',
      cell: ({ row }) => (
        <button onClick={() => setDetailRow(row.original)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-slate-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-white">{row.original.user_name}</div>
            <div className="text-xs text-slate-500">{row.original.user_email}</div>
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
          shopee: 'bg-orange-500/20 text-orange-400',
          tokopedia: 'bg-green-500/20 text-green-400',
          lazada: 'bg-blue-500/20 text-blue-400',
        };
        return val
          ? <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[val] || 'bg-slate-600/20 text-slate-400'}`}>{val}</span>
          : <span className="text-slate-600">—</span>;
      },
    },
    {
      header: 'Company',
      accessorKey: 'company_name',
      cell: ({ getValue }) => <span className="text-slate-300">{getValue() || '—'}</span>,
    },
    {
      header: 'Website',
      accessorKey: 'website',
      cell: ({ getValue }) => {
        const url = getValue();
        return url
          ? <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-light hover:underline"><Globe className="w-3 h-3" />{url.replace(/^https?:\/\//, '')}</a>
          : <span className="text-slate-600">—</span>;
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getValue() === 'active' ? 'bg-green-success shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'}`} />
          <span className="capitalize">{getValue() || 'active'}</span>
        </div>
      ),
    },
    {
      header: 'Joined',
      accessorKey: 'user_date_added',
      cell: ({ getValue }) => {
        const ts = getValue();
        return <span className="text-slate-400 text-sm">{ts ? new Date(ts * 1000).toLocaleDateString() : '—'}</span>;
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <button onClick={() => setDetailRow(row.original)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      ),
    },
  ];

  function resetForm() {
    setSelectedTemplate(null);
    setFormData({ name: '', email: '', password: '', company_name: '', website: '', platform_type: '' });
    setFormError('');
  }

  function selectTemplate(tpl) {
    setSelectedTemplate(tpl);
    setFormData(prev => ({ ...prev, platform_type: tpl.platform_type }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }
    createMutation.mutate(formData);
  }

  const handleCsvUpload = useCallback(async (file) => {
    if (!file || !detailRow) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (selectedShopeeAccount) {
        const acct = shopeeAccounts.find(a => a.account_id === selectedShopeeAccount);
        fd.append('shopee_account_id', selectedShopeeAccount);
        if (acct?.name) fd.append('shopee_account_name', acct.name);
      }
      const res = await api.post(`/api/admin/advertisers/${detailRow.id}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      queryClient.invalidateQueries(['advertisers']);
    } catch (err) {
      setUploadResult({ error: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }, [detailRow, queryClient, selectedShopeeAccount, shopeeAccounts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advertisers</h1>
          <p className="text-slate-400 mt-1">Manage advertiser accounts and program integrations</p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Advertiser
        </button>
      </div>

      <GlassCard>
        <DataTable columns={columns} data={advertisers ?? []} isLoading={isLoading} emptyMessage="No advertisers yet. Add your first advertiser." />
      </GlassCard>

      {/* Create modal with template selector */}
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen} title="New Advertiser" description="Choose a platform template and create an advertiser account." size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Platform Template</label>
            <div className="grid grid-cols-4 gap-3">
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
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-primary flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
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
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Company Name</label>
              <input
                type="text"
                placeholder="PT Example"
                value={formData.company_name}
                onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="advertiser@example.com"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Website</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Advertiser'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail SlideOver with CSV upload */}
      <SlideOver
        open={!!detailRow}
        onOpenChange={(open) => { if (!open) { setDetailRow(null); setUploadResult(null); setSelectedShopeeAccount(''); } }}
        title={detailRow?.user_name || 'Advertiser Detail'}
        description={detailRow?.user_email}
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
                <div className="text-xs text-slate-500 mb-1">Company</div>
                <div className="text-white font-semibold">{detailRow.company_name || '—'}</div>
              </div>
            </div>

            {detailRow.website && (
              <a href={detailRow.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-light hover:underline text-sm">
                <Globe className="w-4 h-4" /> {detailRow.website}
              </a>
            )}

            {/* Shopee Account Selector — only for Shopee advertisers */}
            {detailRow.platform_type === 'shopee' && (
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  🛒 Shopee Account
                </h3>
                <p className="text-xs text-slate-400 mb-3">Select which Shopee account this CSV belongs to, or add a new one.</p>
                <div className="flex gap-2">
                  <select
                    value={selectedShopeeAccount}
                    onChange={e => setSelectedShopeeAccount(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary appearance-none"
                  >
                    <option value="">— No specific account —</option>
                    {shopeeAccounts.map(a => (
                      <option key={a.account_id} value={a.account_id}>{a.name || a.account_id}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="New account name (e.g. Shopee Toko A)"
                    value={newAccountName}
                    onChange={e => setNewAccountName(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
                  />
                  <button
                    type="button"
                    disabled={!newAccountName.trim()}
                    onClick={() => {
                      const id = `shopee_${Date.now()}`;
                      createShopeeAccountMutation.mutate(
                        { account_id: id, name: newAccountName.trim() },
                        { onSuccess: () => setSelectedShopeeAccount(id) }
                      );
                    }}
                    className="px-3 py-2 bg-surface-3 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* CSV Upload zone */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-light" />
                Upload Commission Report
              </h3>
              <p className="text-sm text-slate-400 mb-4">Upload a CSV file from {detailRow.platform_type || 'the advertiser'} to import commission data.</p>

              <div
                className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-primary/50 transition-colors cursor-pointer"
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCsvUpload(file);
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv';
                  input.onchange = (e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCsvUpload(file);
                  };
                  input.click();
                }}
              >
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <div className="text-sm text-slate-300 font-medium">
                  {uploading ? 'Uploading...' : 'Drop CSV file here or click to browse'}
                </div>
                <div className="text-xs text-slate-500 mt-1">Supports Shopee commission CSV format</div>
              </div>

              {uploadResult && (
                <div className={`mt-4 rounded-lg p-4 border ${uploadResult.error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                  {uploadResult.error ? (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">{uploadResult.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Upload successful</span>
                      </div>
                      {uploadResult.format && <div className="text-xs text-slate-400">Format: {uploadResult.format}</div>}
                      {uploadResult.inserted != null && <div className="text-xs text-slate-400">Rows imported: {uploadResult.inserted}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
