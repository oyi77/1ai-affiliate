import { formatCurrency } from '../lib/currency';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Filter,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import api from '../lib/api';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'paid', label: 'Paid', color: 'blue' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function ConversionStatuses() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/commissions');
      return data;
    },
  });

  const commissions = useMemo(() => {
    const list = Array.isArray(rawData) ? rawData : rawData?.data ?? [];
    if (statusFilter === 'all') return list;
    return list.filter((c) => c.status === statusFilter);
  }, [rawData, statusFilter]);

  const stats = useMemo(() => {
    const all = Array.isArray(rawData) ? rawData : rawData?.data ?? [];
    return {
      total: all.length,
      pending: all.filter((c) => c.status === 'pending').length,
      approved: all.filter((c) => c.status === 'approved').length,
      paid: all.filter((c) => c.status === 'paid').length,
      rejected: all.filter((c) => c.status === 'rejected').length,
    };
  }, [rawData]);

  const bulkApprove = useMutation({
    mutationFn: async () => {
      await Promise.all([...selected].map((id) => api.post(`/api/admin/commissions/${id}/approve`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['commissions']);
      setSelected(new Set());
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const bulkReject = useMutation({
    mutationFn: async () => {
      await Promise.all([...selected].map((id) => api.post(`/api/admin/commissions/${id}/reject`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['commissions']);
      setSelected(new Set());
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === commissions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(commissions.map((c) => c.id)));
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={selected.size === commissions.length && commissions.length > 0}
            onChange={toggleSelectAll}
            className="accent-indigo-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
            className="accent-indigo-500"
          />
        ),
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
          <span className="font-mono text-slate-400 text-xs">#{getValue()}</span>
        ),
      },
      {
        accessorKey: 'affiliate_name',
        header: 'Affiliate',
        cell: ({ row }) => (
          <span className="text-white font-medium">
            {row.original.affiliate_name || `#${row.original.affiliate_id}`}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => (
          <span className="text-white font-bold">
            {formatCurrency(getValue() || 0)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                STATUS_COLORS[status] || STATUS_COLORS.pending
              }`}
            >
              {status === 'pending' && <Clock className="w-3 h-3" />}
              {status === 'approved' && <CheckCircle className="w-3 h-3" />}
              {status === 'paid' && <DollarSign className="w-3 h-3" />}
              {status === 'rejected' && <XCircle className="w-3 h-3" />}
              {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'offer_name',
        header: 'Offer',
        cell: ({ getValue }) => (
          <span className="text-slate-400 text-sm">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ getValue }) => (
          <span className="text-slate-400 text-sm">
            {getValue()
              ? new Date(Number(getValue()) * 1000).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </span>
        ),
      },
    ],
    [selected, commissions]
  );

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Conversion Statuses
        </h1>
        <p className="text-slate-400 mt-2">Review, approve, and manage affiliate conversion earnings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map((s) => (
          <GlassCard
            key={s.value}
            className={`cursor-pointer transition-all ${
              statusFilter === s.value
                ? 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                : 'hover:border-white/20'
            }`}
            onClick={() => setStatusFilter(s.value)}
          >
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '—' : (s.value === 'all' ? stats.total : stats[s.value])}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              {statusFilter === 'all' ? 'All' : STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label}{' '}
              Conversions
            </h3>
            {selected.size > 0 && (
              <span className="text-sm text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {selected.size} selected
              </span>
            )}
          </div>

          {selected.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => bulkApprove.mutate()}
                disabled={bulkApprove.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {bulkApprove.isPending ? 'Approving...' : 'Approve All'}
              </button>
              <button
                onClick={() => bulkReject.mutate()}
                disabled={bulkReject.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 text-white rounded-lg text-sm font-bold hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                {bulkReject.isPending ? 'Rejecting...' : 'Reject All'}
              </button>
            </div>
          )}
        </div>

        {(bulkApprove.isError || bulkReject.isError) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Bulk operation failed. Please try again.
          </div>
        )}

        {(bulkApprove.isSuccess || bulkReject.isSuccess) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            <CheckSquare className="w-4 h-4 shrink-0" />
            Bulk operation completed successfully.
          </div>
        )}

        <DataTable
          data={commissions}
          columns={columns}
          isLoading={isLoading}
          searchable
          emptyMessage="No conversions found for this filter"
        />
      </GlassCard>
    </motion.div>
  );
}
