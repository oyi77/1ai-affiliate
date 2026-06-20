import { formatCurrency, formatIDR } from "../lib/currency";
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import { CheckCircle, Clock, Wallet, CreditCard } from 'lucide-react';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { ErrorState } from '../components/ErrorState';

export function Earnings() {
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const queryClient = useQueryClient();

  const { data: earningsResponse, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/affiliates/earnings?limit=100');
      return data?.data ?? data ?? [];
    },
  });

  const earnings = Array.isArray(earningsResponse) ? earningsResponse : [];

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return api.post(`/api/admin/affiliates/earnings/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['earnings']);
      setApproveModalOpen(false);
      setSelectedEarning(null);
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const formatRp = (amount) => formatIDR(amount);

  const stats = {
    total: earnings.reduce((sum, e) => sum + Number(e.payout_amount || 0), 0),
    pending: earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.payout_amount || 0), 0),
    approved: earnings.filter(e => e.status === 'approved').reduce((sum, e) => sum + Number(e.payout_amount || 0), 0),
    paid: earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.payout_amount || 0), 0),
  };

  const columns = [
    { 
      accessorKey: 'affiliate_id', 
      header: 'Affiliate ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-slate-300">#{getValue()}</span>
      )
    },
    { 
      accessorKey: 'payout_amount', 
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold text-white">{formatRp(getValue())}</span>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        const colors = {
          pending: 'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
          approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          paid: 'bg-green-success/10 text-green-success border-green-success/20'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    { 
      accessorKey: 'method', 
      header: 'Method',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-slate-400 capitalize">
          <CreditCard className="w-3.5 h-3.5" />
          {getValue()}
        </div>
      )
    },
    { 
      accessorKey: 'created_at', 
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-slate-400">
          {new Date(typeof getValue() === 'number' ? getValue() * 1000 : getValue()).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.original.status === 'pending') {
          return (
            <button 
              onClick={() => { setSelectedEarning(row.original); setApproveModalOpen(true); }}
              className="px-3 py-1 bg-indigo-primary/20 text-indigo-light hover:bg-indigo-primary hover:text-white rounded transition-all text-xs font-bold"
            >
              Approve
            </button>
          );
        }
        return null;
      }
    }
  ];

  if (isError && (!earningsResponse || (Array.isArray(earningsResponse) && !earningsResponse.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Earnings & Payouts
        </h1>
        <p className="text-slate-400 mt-2">Manage affiliate earnings and process payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Earnings</p>
              <h3 className="text-2xl font-bold text-white">{formatRp(stats.total)}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-warning">{formatRp(stats.pending)}</h3>
            </div>
            <div className="p-2 bg-yellow-warning/10 rounded-lg text-yellow-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Approved</p>
              <h3 className="text-2xl font-bold text-blue-400">{formatRp(stats.approved)}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Paid</p>
              <h3 className="text-2xl font-bold text-green-success">{formatRp(stats.paid)}</h3>
            </div>
            <div className="p-2 bg-green-success/10 rounded-lg text-green-success">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <DataTable 
        data={earnings} 
        columns={columns} 
        isLoading={isLoading}
      />

      <Modal
        open={approveModalOpen}
        onOpenChange={setApproveModalOpen}
        title="Approve Earning"
        description="Are you sure you want to approve this earning? This will mark it as ready for payout."
      >
        <div className="space-y-4 mt-4">
          {selectedEarning && (
            <div className="p-4 bg-surface-1 rounded-lg border border-white/5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Affiliate:</span>
                <span className="text-white font-mono">#{selectedEarning.affiliate_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-white font-bold">{formatRp(selectedEarning.payout_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-white capitalize">{selectedEarning.method}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => approveMutation.mutate(selectedEarning?.id)}
              disabled={approveMutation.isPending}
              className="px-6 py-2 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light disabled:opacity-50 transition-all"
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
