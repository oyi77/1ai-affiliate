import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Building2, Plus, Globe } from 'lucide-react';
import api from '../lib/api';

export function Advertisers() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', company_name: '', website: '' });
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const { data: advertisers, isLoading } = useQuery({
    queryKey: ['advertisers'],
    queryFn: async () => {
      const res = await api.get('/api/admin/advertisers');
      return res.data?.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/advertisers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['advertisers']);
      setCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', company_name: '', website: '' });
      setFormError('');
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to create advertiser'),
  });

  const columns = [
    {
      header: 'Advertiser',
      accessorKey: 'user_name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-slate-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.user_name}</div>
            <div className="text-xs text-slate-500">{row.original.user_email}</div>
          </div>
        </div>
      ),
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
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }
    createMutation.mutate(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advertisers</h1>
          <p className="text-slate-400 mt-1">Manage advertiser accounts and registrations</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Advertiser
        </button>
      </div>

      <GlassCard>
        <DataTable
          columns={columns}
          data={advertisers ?? []}
          isLoading={isLoading}
        />
      </GlassCard>

      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen} title="New Advertiser" description="Create an advertiser account. They can log in and manage their own offers.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
            <input
              type="text"
              placeholder="Company name"
              value={formData.company_name}
              onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
              className="bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            required
          />
          <input
            type="url"
            placeholder="Website (https://...)"
            value={formData.website}
            onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
          />
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Advertiser'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
