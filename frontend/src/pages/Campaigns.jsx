import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Target, Play, Pause, TrendingUp, Download } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function Campaigns() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', status: 'active' });
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
      setFormData({ name: '', status: 'active' });
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
        title="Create New Campaign"
        description="Set up a new campaign to start tracking performance"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Summer Sale 2024"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
