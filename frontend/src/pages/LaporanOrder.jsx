import { formatCurrency, formatIDR } from "../lib/currency";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { StatCard } from '../components/ui/StatCard';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  const val = Number(n) || 0;
  return formatIDR(val);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function LaporanOrder() {
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['laporan-order', dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
      const res = await api.get(`/api/admin/reports/orders?${params}`);
      return res.data?.data ?? res.data ?? [];
    },
  });

  const rows = Array.isArray(reportData) ? reportData : [];
  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + (Number(r.spend) || 0),
    estimasi_kotor: acc.estimasi_kotor + (Number(r.estimasi_kotor) || 0),
    komisi_update: acc.komisi_update + (Number(r.komisi_update) || 0),
    profit_loss: acc.profit_loss + (Number(r.profit_loss) || 0),
    komisi_bersih: acc.komisi_bersih + (Number(r.komisi_bersih) || 0),
  }), { spend: 0, estimasi_kotor: 0, komisi_update: 0, profit_loss: 0, komisi_bersih: 0 });

  const columns = [
    {
      accessorKey: 'tanggal_transaksi',
      header: 'TANGGAL TRANSAKSI',
      cell: ({ getValue }) => (
        <span className="text-slate-300 text-sm">{getValue() || '-'}</span>
      ),
    },
    {
      accessorKey: 'spend',
      header: 'SPEND ADS',
      cell: ({ getValue }) => (
        <span className="font-semibold text-white">{fmtRp(getValue())}</span>
      ),
    },
    {
      accessorKey: 'estimasi_kotor',
      header: 'ESTIMASI KOTOR',
      cell: ({ getValue }) => (
        <span className="text-blue-400">{fmtRp(getValue())}</span>
      ),
    },
    {
      accessorKey: 'komisi_update',
      header: 'KOMISI UPDATE',
      cell: ({ getValue }) => (
        <span className="text-indigo-light">{fmtRp(getValue())}</span>
      ),
    },
    {
      accessorKey: 'profit_loss',
      header: 'PROFIT LOSS',
      cell: ({ getValue }) => {
        const val = Number(getValue()) || 0;
        return (
          <span className={val >= 0 ? 'text-green-success font-semibold' : 'text-red-error font-semibold'}>
            {fmtRp(val)}
          </span>
        );
      },
    },
    {
      accessorKey: 'komisi_bersih',
      header: 'KOMISI BERSIH',
      cell: ({ getValue }) => (
        <span className="font-semibold text-white">{fmtRp(getValue())}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ getValue }) => {
        const status = String(getValue() || '').toLowerCase();
        const colors = {
          completed: 'bg-green-success/10 text-green-success border-green-success/20',
          pending: 'bg-yellow-warning/10 text-yellow-warning border-yellow-warning/20',
          cancelled: 'bg-red-error/10 text-red-error border-red-error/20',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Laporan Order
        </h1>
        <p className="text-slate-400 mt-2">Order transactions report with spend and commission tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Spend" value={fmtRp(totals.spend)} color="indigo" />
        <StatCard icon={ShoppingCart} label="Estimasi Kotor" value={fmtRp(totals.estimasi_kotor)} color="blue" />
        <StatCard icon={TrendingUp} label="Komisi Update" value={fmtRp(totals.komisi_update)} color="green" />
        <StatCard icon={totals.profit_loss >= 0 ? TrendingUp : TrendingDown} label="Profit/Loss" value={fmtRp(totals.profit_loss)} color={totals.profit_loss >= 0 ? 'green' : 'red'} />
      </div>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div className="flex-1" />
          <div className="text-sm text-slate-400">
            Komisi Bersih: <span className="font-bold text-white">{fmtRp(totals.komisi_bersih)}</span>
          </div>
        </div>
        <DataTable data={rows} columns={columns} isLoading={isLoading} />
      </GlassCard>
    </div>
  );
}
