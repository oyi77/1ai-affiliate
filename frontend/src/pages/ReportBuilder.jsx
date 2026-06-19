import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Filter,
  Download,
  Play,
  Loader2,
  X,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import api from '../lib/api';

const DIMENSIONS = [
  { value: 'campaign', label: 'Campaign' },
  { value: 'offer', label: 'Offer' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'country', label: 'Country' },
  { value: 'device', label: 'Device' },
  { value: 'date', label: 'Date' },
];

const METRICS = [
  { value: 'clicks', label: 'Clicks' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'spend', label: 'Spend' },
  { value: 'epc', label: 'EPC' },
  { value: 'cr', label: 'CR (%)' },
  { value: 'roas', label: 'ROAS' },
];

function fmtMetric(val, metric) {
  if (val == null) return '—';
  if (metric === 'revenue' || metric === 'spend')
    return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (metric === 'epc')
    return `$${Number(val).toFixed(2)}`;
  if (metric === 'cr')
    return `${Number(val).toFixed(2)}%`;
  if (metric === 'roas')
    return `${Number(val).toFixed(2)}x`;
  return Number(val).toLocaleString();
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

export function ReportBuilder() {
  const defaults = getDefaultDates();
  const [selectedDimensions, setSelectedDimensions] = useState(['campaign']);
  const [selectedMetrics, setSelectedMetrics] = useState(['clicks', 'conversions', 'revenue']);
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);

  const toggleDimension = (val) =>
    setSelectedDimensions((d) => (d.includes(val) ? d.filter((x) => x !== val) : [...d, val]));
  const toggleMetric = (val) =>
    setSelectedMetrics((m) => (m.includes(val) ? m.filter((x) => x !== val) : [...m, val]));

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/admin/reports/custom', {
        dimensions: selectedDimensions,
        metrics: selectedMetrics,
        filters: { date_from: dateFrom, date_to: dateTo },
      });
      return data?.data ?? data ?? [];
    },
  });

  const columns = useMemo(() => {
    const cols = [];
    if (selectedDimensions.includes('campaign'))
      cols.push({ accessorKey: 'campaign_name', header: 'Campaign', cell: ({ getValue }) => <span className="font-semibold text-white">{getValue() || '—'}</span> });
    if (selectedDimensions.includes('offer'))
      cols.push({ accessorKey: 'offer_name', header: 'Offer', cell: ({ getValue }) => <span className="text-slate-300">{getValue() || '—'}</span> });
    if (selectedDimensions.includes('affiliate'))
      cols.push({ accessorKey: 'affiliate_name', header: 'Affiliate', cell: ({ getValue }) => <span className="text-slate-300">{getValue() || '—'}</span> });
    if (selectedDimensions.includes('country'))
      cols.push({ accessorKey: 'country_code', header: 'Country', cell: ({ getValue }) => <span className="text-slate-300">{getValue() || '—'}</span> });
    if (selectedDimensions.includes('device'))
      cols.push({ accessorKey: 'device_type', header: 'Device', cell: ({ getValue }) => <span className="text-slate-300 capitalize">{getValue() || '—'}</span> });
    if (selectedDimensions.includes('date'))
      cols.push({ accessorKey: 'date', header: 'Date', cell: ({ getValue }) => <span className="text-slate-400 font-mono text-xs">{getValue() || '—'}</span> });

    selectedMetrics.forEach((m) => {
      const isRatio = m === 'epc' || m === 'cr' || m === 'roas';
      cols.push({
        accessorKey: m,
        header: m.toUpperCase(),
        cell: ({ getValue }) => (
          <span className={isRatio ? 'text-indigo-400 font-semibold' : 'text-white font-semibold'}>
            {fmtMetric(getValue(), m)}
          </span>
        ),
      });
    });

    return cols;
  }, [selectedDimensions, selectedMetrics]);

  const exportCSV = () => {
    const rows = generateMutation.data;
    if (!rows?.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const body = rows.map((row) =>
      columns.map((c) => {
        const val = row[c.accessorKey];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? '';
      }).join(',')
    ).join('\n');
    const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report-${Date.now()}.csv`;
    a.click();
  };

  const hasResults = generateMutation.data?.length > 0;

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Custom Report Builder
          </h1>
          <p className="text-slate-400 mt-2">Select dimensions and metrics to build custom analytics reports</p>
        </div>
        <div className="flex gap-3">
          {hasResults && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || selectedDimensions.length === 0 || selectedMetrics.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/25 hover:bg-indigo-600 disabled:opacity-50 transition-all"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Config */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Dimensions
            </h3>
            <div className="space-y-1.5">
              {DIMENSIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggleDimension(d.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDimensions.includes(d.value)
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {d.label}
                  {selectedDimensions.includes(d.value) && (
                    <X className="w-3.5 h-3.5 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Metrics
            </h3>
            <div className="space-y-1.5">
              {METRICS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => toggleMetric(m.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetrics.includes(m.value)
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m.label}
                  {selectedMetrics.includes(m.value) && (
                    <X className="w-3.5 h-3.5 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Date Range</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Results</h3>
              {hasResults && (
                <span className="text-sm text-slate-400">
                  {generateMutation.data.length} row{generateMutation.data.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {generateMutation.isError && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                Failed to generate report. {generateMutation.error?.response?.data?.message || 'Please try again.'}
              </div>
            )}

            {!generateMutation.data && !generateMutation.isPending && !generateMutation.isError && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <BarChart3 className="w-12 h-12 mb-4 text-slate-600" />
                <p className="text-lg font-medium text-slate-400">No report generated yet</p>
                <p className="text-sm mt-1">Select dimensions and metrics, then click Generate Report</p>
              </div>
            )}

            {generateMutation.isPending && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            )}

            {hasResults && (
              <DataTable
                data={generateMutation.data}
                columns={columns}
                searchable
                exportable={false}
              />
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
