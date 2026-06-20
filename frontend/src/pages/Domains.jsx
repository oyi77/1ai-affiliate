import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Globe, Shield, ShieldOff, Check, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function Domains() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [domainToDelete, setDomainToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    ssl_enabled: false,
    cloudflare_zone_id: '',
    is_default: false,
    active: true
  });

  const queryClient = useQueryClient();

  const { data: domains, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const response = await api.get('/api/admin/domains');
      return response.data?.data ?? response.data
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/domains', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['domains']);
      closeModal();
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/api/admin/domains/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['domains']);
      closeModal();
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/domains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['domains']);
      setDeleteConfirmOpen(false);
      setDomainToDelete(null);
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const openModal = (domain = null) => {
    if (domain) {
      setEditingDomain(domain);
      setFormData({
        name: domain.name,
        ssl_enabled: domain.ssl_enabled,
        cloudflare_zone_id: domain.cloudflare_zone_id || '',
        is_default: domain.is_default,
        active: domain.active
      });
    } else {
      setEditingDomain(null);
      setFormData({
        name: '',
        ssl_enabled: false,
        cloudflare_zone_id: '',
        is_default: false,
        active: true
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDomain(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDomain) {
      updateMutation.mutate({ ...formData, id: editingDomain.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      header: 'Domain',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-medium text-white">{row.original.name}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          row.original.active 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {row.original.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      header: 'SSL',
      accessorKey: 'ssl_enabled',
      cell: ({ row }) => (
        row.original.ssl_enabled ? (
          <Shield className="w-4 h-4 text-green-400" />
        ) : (
          <ShieldOff className="w-4 h-4 text-slate-500" />
        )
      ),
    },
    {
      header: 'Default',
      accessorKey: 'is_default',
      cell: ({ row }) => (
        row.original.is_default && <Check className="w-4 h-4 text-indigo-400" />
      ),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openModal(row.original)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setDomainToDelete(row.original);
              setDeleteConfirmOpen(true);
            }}
            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isError && (!domains || (Array.isArray(domains) && !domains.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Custom Domains
          </h1>
          <p className="text-slate-400 mt-2">Manage your tracking domains and SSL certificates</p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Domain
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Domains</div>
          <div className="text-3xl font-bold text-white">{domains?.length || 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Active Domains</div>
          <div className="text-3xl font-bold text-green-success">
            {domains?.filter(d => d.active).length || 0}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">SSL Enabled</div>
          <div className="text-3xl font-bold text-indigo-light">
            {domains?.filter(d => d.ssl_enabled).length || 0}
          </div>
        </GlassCard>
      </div>

      <DataTable data={domains || []} columns={columns} isLoading={isLoading} />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingDomain ? "Edit Domain" : "Add Custom Domain"}
        description={editingDomain ? "Update domain settings" : "Configure a new custom domain for tracking"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Domain Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="track.example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Cloudflare Zone ID (Optional)</label>
            <input
              type="text"
              value={formData.cloudflare_zone_id}
              onChange={(e) => setFormData({ ...formData, cloudflare_zone_id: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="023e105f4ecef8ad9ca31a8372d0c353"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.ssl_enabled ? 'bg-indigo-primary' : 'bg-slate-700'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.ssl_enabled}
                  onChange={(e) => setFormData({ ...formData, ssl_enabled: e.target.checked })}
                />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.ssl_enabled ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Enable SSL (HTTPS)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.is_default ? 'bg-indigo-primary' : 'bg-slate-700'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_default ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Set as Default Domain</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingDomain ? 'Update' : 'Add Domain'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Domain"
        description="Are you sure you want to delete this domain? This action cannot be undone."
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">Deleting <strong>{domainToDelete?.name}</strong> will break any active tracking links using this domain.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate(domainToDelete.id)}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Domain'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
