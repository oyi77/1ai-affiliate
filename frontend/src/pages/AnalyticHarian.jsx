import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { StatCard } from '../components/ui/StatCard';
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import api from '../lib/api';

function fmtRp(n) {
  const val = Number(n) || 0;
  return 'Rp ' + val.toLocaleString('id-ID');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const RANGES = [
  { label: '7 Hari', days: 7 },
  { label: '30 Hari', days: 30 },
  { label: '90 Hari', days: 90 },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
};

export function AnalyticHarian() {
  const [range, setRange] = useState(7);

  const dateFrom = daysAgo(range);
  const dateTo = today();

  const { data: dailyData, isLoading } = useQuery({
    queryKey: ['analytic-harian', dateFrom, dateTo],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports/daily?date_from=${dateFrom}&date_to=${dateTo}`);
      return res.data?.data ?? res.data ?? [];
    },
  });

  const rows = Array.isArray(dailyData) ? dailyData : [];
  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + (Number(r.spend) || 0),
    komisi: acc.komisi + (Number(r.komisi) || 0),
    profit: acc.profit + (Number(r.net_profit) || 0),
  }), { spend: 0, komisi: 0, profit: 0 });

  const columns = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: ({ getValue }) => <span className="font-mono text-white">{getValue() || '—'}</span>,
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
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'Orders',
      accessorKey: 'orders',
      cell: ({ getValue }) => <span className="text-slate-300 font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytic Harian</h1>
          <p className="text-slate-400 mt-1">Daily spend, commission, and profit trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex bg-surface-2 border border-white/10 rounded-lg p-1">
            {RANGES.map(r => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  range === r.days ? 'bg-indigo-primary text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Spend" value={fmtRp(totals.spend)} icon={DollarSign} accent="red" />
        <StatCard label="Total Komisi" value={fmtRp(totals.komisi)} icon={ShoppingCart} accent="green" />
        <StatCard label="Total Profit" value={fmtRp(totals.profit)} icon={TrendingUp} accent={totals.profit >= 0 ? 'green' : 'red'} />
      </div>

      {/* Chart */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Trend Harian</h3>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Spend
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              Komisi
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              Net Profit
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          {rows.length > 0 ? (
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value) => fmtRp(value)} />
              <Line type="monotone" dataKey="spend" stroke="#f87171" strokeWidth={2} dot={false} name="Spend" />
              <Line type="monotone" dataKey="komisi" stroke="#4ade80" strokeWidth={2} dot={false} name="Komisi" />
              <Line type="monotone" dataKey="net_profit" stroke="#818cf8" strokeWidth={2} dot={false} name="Net Profit" />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data yet</div>
          )}
        </ResponsiveContainer>
      </GlassCard>

      {/* Data table */}
      <GlassCard>
        <DataTable columns={columns} data={rows} isLoading={isLoading} />
      </GlassCard>
    </div>
  );
}
