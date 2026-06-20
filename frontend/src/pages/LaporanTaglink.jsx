import { formatCurrency, formatIDR } from "../lib/currency";
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Link2 } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  const val = Number(n) || 0;
  return formatIDR(val);
}

function roasColor(roas) {
  const n = Number(roas) || 0;
  if (n >= 2) return 'text-green-success';
  if (n >= 1) return 'text-yellow-warning';
  return 'text-red-error';
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function LaporanTaglink() {
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['laporan-taglink', dateFrom, dateTo],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports/taglink?date_from=${dateFrom}&date_to=${dateTo}`);
      return res.data?.data ?? res.data ?? [];
    },
  });

  const rows = useMemo(() => {
    const raw = Array.isArray(reportData) ? reportData : [];
    return raw.map(r => ({
      ...r,
      _roas: Number(r.spend) > 0 ? Number(r.komisi) / Number(r.spend) : 0,
    })).sort((a, b) => b._roas - a._roas);
  }, [reportData]);

  const columns = [
    {
      header: 'Taglink',
      accessorKey: 'taglink',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-indigo-light" />
          <span className="font-mono text-sm text-white">{getValue() || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Spend (Rp)',
      accessorKey: 'spend',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{fmtRp(getValue())}</span>,
    },
    {
      header: 'Komisi (Rp)',
      accessorKey: 'komisi',
      cell: ({ getValue }) => <span className="text-green-success font-mono">{fmtRp(getValue())}</span>,
    },
    {
      header: 'Net Profit (Rp)',
      accessorKey: 'net_profit',
      cell: ({ getValue }) => {
        const val = Number(getValue()) || 0;
        return <span className={`font-bold font-mono ${val >= 0 ? 'text-green-success' : 'text-red-error'}`}>{fmtRp(val)}</span>;
      },
    },
    {
      header: 'Orders',
      accessorKey: 'orders',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'ROAS',
      accessorKey: '_roas',
      cell: ({ getValue }) => {
        const roas = getValue().toFixed(2);
        return <span className={`font-bold font-mono ${roasColor(roas)}`}>{roas}x</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Laporan Taglink</h1>
        <p className="text-slate-400 mt-1">Per-taglink performance breakdown</p>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
        </div>
      </GlassCard>

      {/* Data table */}
      <GlassCard>
        <DataTable columns={columns} data={rows} isLoading={isLoading} />
      </GlassCard>
    </div>
  );
}
