import { useState, useMemo } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { motion } from 'framer-motion';
import { GitBranch, Layers, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import api from '../lib/api';
import { formatCurrency } from '../lib/currency';

const MODELS = [
  { value: 'first', label: 'First Touch', icon: GitBranch, desc: 'Credits the first interaction' },
  { value: 'last', label: 'Last Touch', icon: Layers, desc: 'Credits the final interaction' },
  { value: 'linear', label: 'Linear', icon: BarChart3, desc: 'Splits credit equally' },
];

function modelColor(model) {
  if (model === 'first') return { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500', hover: 'hover:bg-indigo-500/15' };
  if (model === 'last') return { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500', hover: 'hover:bg-blue-500/15' };
  return { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400', bar: 'bg-green-500', hover: 'hover:bg-green-500/15' };
}

function getDefaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AttributionView() {
  const defaults = getDefaultDates();
  const [model, setModel] = useState('first');
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);

  const { data: results = [], isLoading } = useSafeQuery({
    queryKey: ['attribution-view', model, dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/reports/attribution', {
        params: { model, date_from: dateFrom, date_to: dateTo },
      });
      return data?.data ?? data ?? [];
    },
  });

  const maxRevenue = useMemo(() => {
    if (!results.length) return 0;
    return Math.max(...results.map((r) => Number(r.revenue) || 0));
  }, [results]);

  const totals = useMemo(() => ({
    conversions: results.reduce((s, r) => s + (Number(r.conversions) || 0), 0),
    revenue: results.reduce((s, r) => s + (Number(r.revenue) || 0), 0),
  }), [results]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'touchpoint_id',
        header: 'Touchpoint',
        cell: ({ getValue }) => (
          <span className="font-mono text-indigo-400">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'touchpoint_name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="text-white font-medium">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'conversions',
        header: 'Conversions',
        cell: ({ getValue }) => (
          <span className="text-white font-bold">{Number(getValue() || 0).toLocaleString()}</span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ getValue }) => (
          <span className="text-white font-bold">
            {formatCurrency(getValue() || 0)}
          </span>
        ),
      },
      {
        id: 'bar',
        header: 'Share',
        cell: ({ row }) => {
          const rev = Number(row.original.revenue) || 0;
          const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
          const c = modelColor(model);
          return (
            <div className="w-full max-w-[200px]">
              <div className="w-full h-5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${c.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [maxRevenue, model]
  );

  const mc = modelColor(model);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Multi-Touch Attribution
        </h1>
        <p className="text-slate-400 mt-2">Analyze how credit is assigned across conversion touchpoints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODELS.map((m) => {
          const Icon = m.icon;
          const active = model === m.value;
          const c = modelColor(m.value);
          return (
            <GlassCard
              key={m.value}
              className={`cursor-pointer transition-all ${active ? `${c.border} shadow-[0_0_20px_rgba(99,102,241,0.1)]` : 'hover:border-white/20'}`}
              onClick={() => setModel(m.value)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${active ? c.bg : 'bg-white/5'}`}>
                  <Icon className={`w-5 h-5 ${active ? c.text : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className={`font-bold ${active ? 'text-white' : 'text-slate-300'}`}>{m.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">From</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
          />
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">To</span>
          </div>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
          />
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Conversions</p>
          <p className="text-2xl font-bold text-white">{isLoading ? '—' : totals.conversions.toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {isLoading
              ? '—'
              : formatCurrency(totals.revenue)}
          </p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            Attribution Results{' '}
            <span className={`text-sm font-normal ${mc.text}`}>
              ({MODELS.find((m) => m.value === model)?.label})
            </span>
          </h3>
          {results.length > 0 && (
            <span className="text-sm text-slate-400">{results.length} touchpoint{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <BarChart3 className="w-12 h-12 mb-4 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">No attribution data</p>
            <p className="text-sm mt-1">Adjust the date range or model selection</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            {/* CSS Bar Chart */}
            <div className="mb-6 space-y-2">
              {results.slice(0, 10).map((row, idx) => {
                const rev = Number(row.revenue) || 0;
                const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                return (
                  <motion.div
                    key={row.touchpoint_id || idx}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="w-28 text-right text-xs text-slate-400 font-medium truncate shrink-0">
                      {row.touchpoint_name || row.touchpoint_id || `TP ${idx + 1}`}
                    </span>
                    <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${mc.bar} flex items-center justify-end pr-2`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                      >
                        {pct > 15 && (
                          <span className="text-[10px] font-bold text-white">
                            {formatCurrency(rev)}
                          </span>
                        )}
                      </motion.div>
                    </div>
                    {pct <= 15 && (
                      <span className="text-xs text-slate-400 w-16 text-right shrink-0">
                        {formatCurrency(rev)}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <DataTable
              data={results}
              columns={columns}
              searchable
              emptyMessage="No results"
            />
          </>
        )}
      </GlassCard>
    </motion.div>
  );
}
