import { useQuery } from '@tanstack/react-query';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { GlassCard } from '../components/ui/GlassCard';

export function Commissions() {
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/commissions?limit=100');
      return data;
    },
  });

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalCommissions = commissions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
  
  const now = new Date();
  const thisMonthCommissions = commissions?.filter(c => {
    const d = new Date(c.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

  const avgCommission = commissions?.length > 0 ? totalCommissions / commissions.length : 0;

  const columns = [
    { 
      accessorKey: 'affiliate_id', 
      header: 'Affiliate ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-slate-300">#{getValue()}</span>
      )
    },
    { 
      accessorKey: 'source', 
      header: 'Source',
      cell: ({ getValue }) => (
        <span className="text-slate-300">{getValue() || 'Direct'}</span>
      )
    },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold text-white">{formatRp(getValue())}</span>
      )
    },
    { 
      accessorKey: 'created_at', 
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-slate-400">
          {new Date(getValue()).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Commissions Ledger
        </h1>
        <p className="text-slate-400 mt-2">Track real-time commission data across all sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Total Commissions</p>
              <h3 className="text-2xl font-bold text-white">{formatRp(totalCommissions)}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">This Month</p>
              <h3 className="text-2xl font-bold text-white">{formatRp(thisMonthCommissions)}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Avg Commission</p>
              <h3 className="text-2xl font-bold text-indigo-light">{formatRp(avgCommission)}</h3>
            </div>
            <div className="p-2 bg-indigo-primary/10 rounded-lg text-indigo-light">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <DataTable 
        data={commissions || []} 
        columns={columns} 
        isLoading={isLoading}
      />
    </div>
  );
}
