import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Gift, DollarSign, Network, Download } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function Offers() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    payout: '',
    network_id: '',
    status: 'active',
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
      setFormData({ name: '', payout: '', network_id: '', status: 'active' });
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
        title="Create New Offer"
        description="Add a new offer to your affiliate network"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Offer Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="iPhone 15 Pro - Sweepstakes"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Payout (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.payout}
              onChange={(e) => setFormData({ ...formData, payout: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="25.00"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Network</label>
            <select
              value={formData.network_id}
              onChange={(e) => setFormData({ ...formData, network_id: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="">Direct (No Network)</option>
              {networks?.map(network => (
                <option key={network.id} value={network.id}>{network.name}</option>
              ))}
            </select>
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
              {createMutation.isPending ? 'Creating...' : 'Create Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
