import { useState, useMemo } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Calendar, FileText, Download, Filter } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
];

const REPORT_TYPES = [
  { label: 'Summary', value: 'summary' },
  { label: 'Campaign', value: 'campaign' },
  { label: 'Affiliate', value: 'affiliate' },
  { label: 'Offer', value: 'offer' },
];

export function Reports() {
  const [range, setRange] = useState('7d');
  const [reportType, setReportType] = useState('summary');
  const [generated, setGenerated] = useState(false);

  const { data: reportRows = [], isLoading, refetch } = useSafeQuery({
    queryKey: ['reports', range, reportType],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports?range=${range}&type=${reportType}`);
      return res.data || [];
    },
    enabled: generated,
  });

  const handleGenerate = () => {
    setGenerated(true);
    refetch();
  };

  const columns = useMemo(() => [
    {
      header: 'Entity',
      accessorKey: 'entity_name',
      cell: ({ row }) => (
        <span className="font-semibold text-white">{row.original.entity_name || 'Total'}</span>
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
      cell: ({ getValue }) => (
        <span className="font-mono text-indigo-light">{(getValue() || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: ({ getValue }) => (
        <span className="text-white font-bold">{formatCurrency(getValue() || 0)}</span>
      ),
    },
    {
      header: 'EPC',
      accessorKey: 'epc',
      cell: ({ row }) => {
        const epc = row.original.revenue / (row.original.clicks || 1);
        return <span className="text-green-success font-semibold">{formatCurrency(epc)}</span>;
      },
    },
    {
      header: 'CR',
      accessorKey: 'cr',
      cell: ({ row }) => {
        const cr = ((row.original.conversions / (row.original.clicks || 1)) * 100).toFixed(2);
        return <span className="text-slate-400">{cr}%</span>;
      },
    },
  ], []);

  const exportCSV = () => {
    if (!reportRows.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = reportRows
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.accessorKey];
            return typeof val === 'string' ? `"${val}"` : (val ?? '');
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Reports
        </h1>
        <p className="text-slate-400 mt-2">Generate and export performance reports across campaigns and affiliates</p>
      </div>

      {/* Controls */}
      <GlassCard hover={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Date Range Presets */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1 bg-surface-1/50 rounded-lg p-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setRange(preset.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    range === preset.value
                      ? 'bg-indigo-primary/20 text-indigo-light font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Type */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-surface-1/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-primary"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} Breakdown
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-primary/20 text-indigo-light rounded-lg hover:bg-indigo-primary/30 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            {generated && reportRows.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-success/10 text-green-success rounded-lg hover:bg-green-success/20 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Report Table */}
      {generated ? (
        isLoading ? (
          <GlassCard hover={false}>
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-indigo-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-slate-400">Generating report…</span>
            </div>
          </GlassCard>
        ) : reportRows.length > 0 ? (
          <DataTable data={reportRows} columns={columns} searchable exportable />
        ) : (
          <GlassCard hover={false}>
            <div className="text-center py-16 text-slate-400">
              No data found for the selected criteria.
            </div>
          </GlassCard>
        )
      ) : (
        <GlassCard hover={false}>
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Select a date range and report type, then click <strong>Generate Report</strong>.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
