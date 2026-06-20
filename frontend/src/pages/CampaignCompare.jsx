import { formatCurrency, formatIDR } from "../lib/currency";
import { useState, useMemo } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { BarChart3, TrendingUp, TrendingDown, Minus, Search, X } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

const METRICS = [
  { key: 'clicks', label: 'Clicks', format: v => Number(v).toLocaleString() },
  { key: 'conversions', label: 'Conversions', format: v => Number(v).toLocaleString() },
  { key: 'revenue', label: 'Revenue', format: v => formatIDR(v) },
  { key: 'spend', label: 'Spend', format: v => formatIDR(v) },
  { key: 'epc', label: 'EPC', format: v => formatCurrency(v, 'IDR') },
  { key: 'cr', label: 'CR %', format: v => `${Number(v).toFixed(2)}%` },
  { key: 'roi', label: 'ROI %', format: v => `${Number(v).toFixed(2)}%` },
  { key: 'roas', label: 'ROAS', format: v => `${Number(v).toFixed(2)}x` },
];

export function CampaignCompare() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const { data: campaigns, isLoading: campaignsLoading, isError: campErr, error: campError, refetch: refetchCamp } = useSafeQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get('/api/admin/campaigns');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const idsParam = selectedIds.join(',');
  const { data: compareResult, isLoading: compareLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['campaign-compare', idsParam],
    queryFn: async () => {
      const res = await api.get(`/api/admin/reports/compare?ids=${idsParam}`);
      return res.data;
    },
    enabled: selectedIds.length >= 2,
  });

  const comparisonData = compareResult?.data || [];
  const bestWorst = compareResult?.bestWorst || {};

  const addCampaign = (id) => {
    const numId = parseInt(id);
    if (!isNaN(numId) && numId > 0 && !selectedIds.includes(numId) && selectedIds.length < 10) {
      setSelectedIds([...selectedIds, numId]);
      setInputValue('');
    }
  };

  const removeCampaign = (id) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  const addFromDropdown = (e) => {
    const id = parseInt(e.target.value);
    if (!isNaN(id) && id > 0) {
      addCampaign(id);
      e.target.value = '';
    }
  };

  const getCellHighlight = (metric, value) => {
    const bw = bestWorst[metric];
    if (!bw || comparisonData.length < 2) return '';
    const numVal = Number(value) || 0;
    // For spend, lower is better
    if (metric === 'spend') {
      if (numVal <= bw.worst && bw.worst !== bw.best) return 'text-green-success font-bold';
      if (numVal >= bw.best && bw.worst !== bw.best) return 'text-red-400';
      return '';
    }
    if (numVal >= bw.best && bw.best !== bw.worst) return 'text-green-success font-bold';
    if (numVal <= bw.worst && bw.best !== bw.worst) return 'text-red-400';
    return '';
  };

  const getCellBg = (metric, value) => {
    const bw = bestWorst[metric];
    if (!bw || comparisonData.length < 2) return '';
    const numVal = Number(value) || 0;
    if (metric === 'spend') {
      if (numVal <= bw.worst && bw.worst !== bw.best) return 'bg-green-success/5';
      if (numVal >= bw.best && bw.worst !== bw.best) return 'bg-red-500/5';
      return '';
    }
    if (numVal >= bw.best && bw.best !== bw.worst) return 'bg-green-success/5';
    if (numVal <= bw.worst && bw.best !== bw.worst) return 'bg-red-500/5';
    return '';
  };

  if (isError && (!campaigns || (Array.isArray(campaigns) && !campaigns.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Campaign Comparison
        </h1>
        <p className="text-slate-400 mt-2">Compare performance across multiple campaigns side by side</p>
      </div>

      {/* Campaign selector */}
      <GlassCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-slate-400">Selected:</span>
            {selectedIds.map(id => {
              const camp = campaigns?.find(c => c.id === id);
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-primary/10 border border-indigo-primary/20 rounded-full text-sm text-indigo-light"
                >
                  {camp?.name || `Campaign #${id}`}
                  <button onClick={() => removeCampaign(id)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {selectedIds.length === 0 && (
              <span className="text-slate-500 text-sm">Select campaigns to compare</span>
            )}
          </div>

          <div className="flex gap-3">
            <select
              onChange={addFromDropdown}
              className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              defaultValue=""
            >
              <option value="" disabled>Select a campaign to add...</option>
              {campaigns?.filter(c => !selectedIds.includes(c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCampaign(inputValue); } }}
                placeholder="ID"
                className="w-24 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
              <button
                onClick={() => addCampaign(inputValue)}
                disabled={selectedIds.length >= 10}
                className="px-4 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">Select 2-10 campaigns to compare. Best per metric shown in green, worst in red.</div>
        </div>
      </GlassCard>

      {/* Comparison table */}
      {selectedIds.length >= 2 && (
        <GlassCard>
          {compareLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">Loading comparison...</div>
            </div>
          ) : comparisonData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-400">No data found for the selected campaigns.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase sticky left-0 bg-surface-2">
                      Metric
                    </th>
                    {comparisonData.map(camp => (
                      <th key={camp.id} className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-white text-sm font-semibold">{camp.name}</span>
                          <span className="text-slate-500">#{camp.id}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map(metric => (
                    <tr key={metric.key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-300 sticky left-0 bg-surface-2">
                        {metric.label}
                      </td>
                      {comparisonData.map(camp => (
                        <td
                          key={camp.id}
                          className={`py-3 px-4 text-right text-sm font-mono ${getCellHighlight(metric.key, camp[metric.key])} ${getCellBg(metric.key, camp[metric.key])}`}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {bestWorst[metric.key] && Number(camp[metric.key]) >= bestWorst[metric.key].best && bestWorst[metric.key].best !== bestWorst[metric.key].worst && (
                              <TrendingUp className="w-3 h-3 text-green-success" />
                            )}
                            {bestWorst[metric.key] && Number(camp[metric.key]) <= bestWorst[metric.key].worst && bestWorst[metric.key].best !== bestWorst[metric.key].worst && (
                              <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                            {metric.format(camp[metric.key] || 0)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Quick stats when data loaded */}
      {comparisonData.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="text-slate-400 text-sm font-semibold mb-2">Best ROAS</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-success" />
              <span className="text-2xl font-bold text-white">
                {Math.max(...comparisonData.map(c => Number(c.roas) || 0)).toFixed(2)}x
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {comparisonData.find(c => Number(c.roas) === Math.max(...comparisonData.map(d => Number(d.roas) || 0)))?.name}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-slate-400 text-sm font-semibold mb-2">Best ROI</div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-light" />
              <span className="text-2xl font-bold text-white">
                {Math.max(...comparisonData.map(c => Number(c.roi) || 0)).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {comparisonData.find(c => Number(c.roi) === Math.max(...comparisonData.map(d => Number(d.roi) || 0)))?.name}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-slate-400 text-sm font-semibold mb-2">Highest CR</div>
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold text-white">
                {Math.max(...comparisonData.map(c => Number(c.cr) || 0)).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {comparisonData.find(c => Number(c.cr) === Math.max(...comparisonData.map(d => Number(d.cr) || 0)))?.name}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
