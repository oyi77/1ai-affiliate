import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { BadgeCheck, Clock, Plus, User } from 'lucide-react';

export function Affiliates() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const queryClient = useQueryClient();

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ['affiliates'],
    queryFn: async () => {
      const response = await api.get('/api/admin/affiliates?limit=100');
      return response.data?.data ?? response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => api.post('/api/admin/affiliates', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['affiliates']);
      setCreateModalOpen(false);
      setFormData({ name: '', email: '' });
    },
  });

  const columns = [
    {
      header: 'Affiliate',
      accessorKey: 'username',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.username || row.original.user_email}</div>
            <div className="text-xs text-slate-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Tracking Code',
      accessorKey: 'affiliate_code',
      cell: ({ getValue }) => <code className="text-indigo-light">{getValue()}</code>,
    },
    {
      header: 'Tier',
      accessorKey: 'tier',
      cell: ({ getValue }) => {
        const tier = getValue() || 'Starter';
        const colors = {
          Starter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          Pro: 'bg-indigo-primary/10 text-indigo-light border-indigo-primary/20',
          Premium: 'bg-green-success/10 text-green-success border-green-success/20',
        };
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[tier] || colors.Starter}`}>
            {tier}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getValue() === 'active' ? 'bg-green-success shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'}`} />
          <span className="capitalize">{getValue() || 'Active'}</span>
        </div>
      ),
    },
    {
      header: 'Joined',
      accessorKey: 'joined_at',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4" />
          {getValue() ? new Date(getValue()).toLocaleDateString() : '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Affiliates
          </h1>
          <p className="text-slate-400 mt-2">Manage and monitor your affiliate network</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-primary/20 border border-indigo-primary/40 rounded-lg flex items-center gap-2 text-indigo-light font-bold text-sm hover:bg-indigo-primary/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Affiliate
          </button>
          <div className="px-4 py-2 bg-indigo-primary/10 border border-indigo-primary/20 rounded-lg flex items-center gap-2 text-indigo-light">
            <BadgeCheck className="w-5 h-5" />
            <span className="font-bold text-sm">{affiliates?.length || 0} Total Partners</span>
          </div>
        </div>
      </div>

      <DataTable 
        data={affiliates || []} 
        columns={columns} 
        isLoading={isLoading}
      />
      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen} title="New Affiliate">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
          />
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
          />
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setCreateModalOpen(false)} className="px-4 py-2 bg-surface-3 text-slate-300 rounded-lg text-sm font-bold hover:bg-surface-hover transition-all">Cancel</button>
            <button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-primary text-white rounded-lg text-sm font-bold hover:bg-indigo-hover transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Affiliate'}
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-red-400 text-sm">{createMutation.error?.response?.data?.error || 'Failed to create affiliate'}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
