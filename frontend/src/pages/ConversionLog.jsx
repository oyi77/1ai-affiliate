import { formatCurrency } from '../lib/currency';

import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { GlassCard } from '../components/ui/GlassCard';
import { ShoppingCart, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function ConversionLog() {
  const [page, setPage] = useState(1);

  const { data: convData, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['conversion-log', page],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports/conversions?page=${page}&limit=50`);
      return res.data;
    },
  });

  const conversions = convData?.data ?? [];
  const total = convData?.total ?? 0;
  const totalPages = convData?.pages ?? 1;

  const totalPayout = conversions.reduce((sum, c) => sum + (Number(c.payout_amount) || 0), 0);
  const approvedCount = conversions.filter(c => c.earning_status === 'approved' || c.earning_status === 'paid').length;

  const statusColors = {
    pending: 'bg-yellow-warning/20 text-yellow-warning',
    approved: 'bg-green-success/20 text-green-success',
    paid: 'bg-green-success/20 text-green-success',
    rejected: 'bg-red-error/20 text-red-error',
  };

  const columns = [
    {
      header: 'Conversion ID',
      accessorKey: 'conversion_id',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-300">{getValue() || '—'}</span>,
    },
    {
      header: 'Click ID',
      accessorKey: 'click_id',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-400">{getValue() || '—'}</span>,
    },
    {
      header: 'Offer',
      accessorKey: 'offer_name',
      cell: ({ row }) => (
        <span className="text-white text-sm">{row.original.offer_name || `Offer #${row.original.offer_id}`}</span>
      ),
    },
    {
      header: 'Affiliate',
      accessorKey: 'affiliate_id',
      cell: ({ getValue }) => <span className="text-slate-300 text-sm">#{getValue()}</span>,
    },
    {
      header: 'Payout',
      accessorKey: 'payout_amount',
      cell: ({ getValue }) => (
        <span className="text-green-400 font-semibold text-sm">{formatCurrency(getValue() || 0)}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'earning_status',
      cell: ({ getValue }) => {
        const status = getValue() || 'pending';
        return (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[status] || statusColors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      header: 'TX ID',
      accessorKey: 'transaction_id',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-400">{getValue() || '—'}</span>,
    },
    {
      header: 'Time',
      accessorKey: 'conversion_time',
      cell: ({ getValue }) => {
        const ts = getValue();
        return (
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {ts ? new Date(typeof ts === 'number' ? ts * 1000 : ts).toLocaleString() : '—'}
          </span>
        );
      },
    },
  ];

  if (isError && (!convData || (Array.isArray(convData) && !convData.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Conversion Log
        </h1>
        <p className="text-slate-400 mt-2">Track all conversions with payout and status details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Conversions</div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-light" />
            <span className="text-2xl font-bold text-white">{total.toLocaleString()}</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">This Page Payout</div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-success" />
            <span className="text-2xl font-bold text-white">{formatCurrency(totalPayout)}</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Approved (Page)</div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-success" />
            <span className="text-2xl font-bold text-white">{approvedCount}</span>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Pending (Page)</div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-warning" />
            <span className="text-2xl font-bold text-white">{conversions.length - approvedCount}</span>
          </div>
        </GlassCard>
      </div>

      <DataTable data={conversions} columns={columns} isLoading={isLoading} searchable={false} exportable />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg bg-surface-3 text-slate-300 hover:bg-surface-hover disabled:opacity-40 text-sm"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg bg-surface-3 text-slate-300 hover:bg-surface-hover disabled:opacity-40 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
