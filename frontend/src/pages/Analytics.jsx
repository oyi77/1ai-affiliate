import { formatCurrency } from '../lib/currency';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { 
  BarChart3, 
  ChevronDown, 
  Download, 
  Filter,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

export function Analytics() {
  const [range, setRange] = useState('7d');
  const [filterType] = useState('all');

  const { data: stats, isError: statsErr, error: statsError, refetch: refetchStats } = useSafeQuery({
    queryKey: ['analytics-stats', range],
    queryFn: async () => {
      const response = await api.get(`/api/admin/stats?range=${range}`);
      return response.data?.data ?? response.data
    },
  });

  const { data: report, isLoading: reportLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['analytics-report', range, filterType],
    queryFn: async () => {
      const response = await api.get(`/api/admin/reports?range=${range}&type=${filterType}`);
      return response.data?.data ?? response.data ?? []
    },
  });

  const columns = [
    {
      header: 'Entity',
      accessorKey: 'entity_name',
      cell: ({ row }) => (
        <div className="font-semibold text-white">{row.original.entity_name || 'Total'}</div>
      ),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
      cell: ({ getValue }) => <span className="font-mono">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'Conversions',
      accessorKey: 'conversions',
      cell: ({ getValue }) => <span className="font-mono text-indigo-light">{(getValue() || 0).toLocaleString()}</span>,
    },
    {
      header: 'CR',
      accessorKey: 'cr',
      cell: ({ row }) => {
        const cr = ((row.original.conversions / (row.original.clicks || 1)) * 100).toFixed(2);
        return <span className="text-slate-400">{cr}%</span>;
      },
    },
    {
      header: 'EPC',
      accessorKey: 'epc',
      cell: ({ row }) => {
        const epc = (row.original.revenue / (row.original.clicks || 1)).toFixed(2);
        return <span className="text-green-success font-semibold">{formatCurrency(epc)}</span>;
      },
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: ({ getValue }) => <span className="text-white font-bold">{formatCurrency(getValue() || 0)}</span>,
    },
  ];

  const exportCSV = () => {
    const rows = report?.data || report || [];
    if (!rows.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const csvRows = rows
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.accessorKey];
            return typeof val === 'string' ? `"${val}"` : (val ?? '');
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${csvRows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isError && (!stats || (Array.isArray(stats) && !stats.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-slate-400 mt-2">Deep-dive performance data and reporting</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-surface-2 border border-white/10 rounded-lg p-1">
            {['today', '24h', '7d', '30d', 'mtd'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  range === r ? 'bg-indigo-primary text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button onClick={exportCSV} className="p-2 bg-surface-2 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-light" />
              Performance Over Time
            </h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-primary" />
                Clicks
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-success" />
                Conversions
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {report?.data?.length > 0 ? (
              <LineChart data={report.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data yet</div>
            )}
          </ResponsiveContainer>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top Sources</h4>
              <PieChartIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-4">
              {stats?.topSources ? stats.topSources.map(source => (
                <div key={source.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{source.name}</span>
                    <span className="text-white">{source.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full ${source.color || 'bg-indigo-primary'} rounded-full`} style={{ width: `${source.val}%` }} />
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No data available</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-indigo-primary/20 to-transparent">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Network CR</h4>
            <div className="text-3xl font-bold text-white mb-1">{stats?.networkCr ? `${stats.networkCr}%` : '—'}</div>
            <div className="text-xs text-green-success font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats?.networkCrTrend ? `${stats.networkCrTrend}% vs avg` : '—'}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Breakdown</h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-white/10 rounded-lg text-sm text-slate-400 hover:text-white transition-all">
              <Filter className="w-4 h-4" />
              Filter By
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <DataTable data={report || []} columns={columns} isLoading={reportLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Clicks over time</h3>
          <ResponsiveContainer width="100%" height={300}>
            {report?.data?.length > 0 ? (
              <LineChart data={report.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data yet</div>
            )}
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Conversions by offer</h3>
          <ResponsiveContainer width="100%" height={300}>
            {report?.data?.length > 0 ? (
              <BarChart data={report.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="offer_name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#e2e8f0' }} />
                <Bar dataKey="conversions" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">No data yet</div>
            )}
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
