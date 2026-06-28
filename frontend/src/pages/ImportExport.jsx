import { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import api from '../lib/api';
import {
  Download, Upload, RefreshCw, Loader2, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Target,
  BarChart3, Eye, MousePointer
} from 'lucide-react';

export function ImportExport() {
  const [sources, setSources] = useState([]);
  const [roas, setRoas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/import-export/sources').then(r => setSources(r.data?.data || [])),
      api.get('/api/import-export/roas?days=30').then(r => setRoas(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await api.post('/api/import-export/sync');
      setImportResult({ type: 'success', message: `Synced ${r.data?.results?.length || 0} platforms` });
      // Refresh ROAS
      const roasR = await api.get('/api/import-export/roas?days=30');
      setRoas(roasR.data);
    } catch (err) {
      setImportResult({ type: 'error', message: err.response?.data?.error || err.message });
    }
    setSyncing(false);
  };

  const handleImport = async (platform, type) => {
    setImporting(`${platform}-${type}`);
    try {
      const r = await api.post('/api/import-export/import', { platform, type });
      setImportResult({ type: 'success', message: `${platform}: Imported ${r.data?.imported || 0} ${type}` });
    } catch (err) {
      setImportResult({ type: 'error', message: err.response?.data?.error || err.message });
    }
    setImporting(null);
  };

  const handleExport = async (type, format) => {
    setExporting(type);
    try {
      if (format === 'csv') {
        const r = await api.post('/api/import-export/export', { type, format: 'csv' }, { responseType: 'blob' });
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const r = await api.post('/api/import-export/export', { type });
        setImportResult({ type: 'success', message: `Exported ${r.data?.count || 0} ${type} records` });
      }
    } catch (err) {
      setImportResult({ type: 'error', message: err.response?.data?.error || err.message });
    }
    setExporting(null);
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const r = await api.post('/api/import-export/import', {
        platform: 'csv_upload',
        type: 'campaigns',
        data: Array.isArray(data) ? data : [data],
      });
      setImportResult({ type: 'success', message: `Imported ${r.data?.imported || 0} records from CSV` });
    } catch {
      setImportResult({ type: 'error', message: 'Invalid JSON file. Expected array of objects.' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;

  const totals = roas?.totals || {};
  const daily = roas?.daily || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Import & Export</h1>
          <p className="text-slate-400 mt-2">Sync data across platforms, track ROAS, import/export campaigns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-sm font-bold disabled:opacity-50">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Sync All
          </button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${importResult.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {importResult.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {importResult.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {[['dashboard', 'ROAS Dashboard'], ['import', 'Import Data'], ['export', 'Export Data']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ROAS Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Total Spend" value={`Rp ${Math.round(totals.total_spend || 0).toLocaleString()}`} accent="red" icon={DollarSign} />
            <StatCard label="Total Revenue" value={`Rp ${Math.round(totals.total_revenue || 0).toLocaleString()}`} accent="green" icon={TrendingUp} />
            <StatCard label="ROAS" value={totals.roas ? `${totals.roas}x` : '-'} accent={totals.roas >= 1 ? 'green' : 'red'} icon={BarChart3} />
            <StatCard label="Profit" value={`Rp ${Math.round(totals.profit || 0).toLocaleString()}`} accent={totals.profit >= 0 ? 'green' : 'red'} icon={DollarSign} />
            <StatCard label="Clicks" value={totals.total_clicks?.toLocaleString() || '0'} accent="blue" icon={MousePointer} />
            <StatCard label="Conversions" value={totals.total_conversions?.toLocaleString() || '0'} accent="purple" icon={Target} />
          </div>

          {/* Daily ROAS Table */}
          {daily.length > 0 && (
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Daily ROAS Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-right py-2 px-3">Spend</th>
                      <th className="text-right py-2 px-3">Revenue</th>
                      <th className="text-right py-2 px-3">ROAS</th>
                      <th className="text-right py-2 px-3">Profit</th>
                      <th className="text-right py-2 px-3">Clicks</th>
                      <th className="text-right py-2 px-3">Conv</th>
                      <th className="text-right py-2 px-3">CPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.slice(0, 14).map(d => (
                      <tr key={d.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-2 px-3 font-mono text-xs">{d.date}</td>
                        <td className="py-2 px-3 text-right text-red-400">Rp {Math.round(d.spend).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-green-400">Rp {Math.round(d.revenue).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={d.roas >= 1 ? 'text-green-400' : 'text-red-400'}>
                            {d.roas ? `${d.roas}x` : '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={d.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                            Rp {Math.round(d.profit).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">{d.clicks}</td>
                        <td className="py-2 px-3 text-right">{d.conversions}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{d.cpa ? `Rp ${Math.round(d.cpa).toLocaleString()}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {daily.length === 0 && (
            <GlassCard className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No ROAS Data Yet</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Connect your traffic sources (Meta Ads, Google Ads) and offer sources (Shopee) in Integrations,
                then click "Sync All" to start tracking spend vs revenue.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Import Tab */}
      {tab === 'import' && (
        <div className="space-y-6">
          {/* Connected Sources */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Import from Connected Platforms</h3>
            {sources.length === 0 ? (
              <p className="text-slate-400 text-sm">No platforms connected. Go to Integrations to connect platforms first.</p>
            ) : (
              <div className="space-y-3">
                {sources.map(s => (
                  <div key={s.platform} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                    <div>
                      <h4 className="font-bold text-white text-sm capitalize">{s.platform}</h4>
                      <p className="text-xs text-slate-400">Available: {s.types.join(', ')}</p>
                    </div>
                    <div className="flex gap-2">
                      {s.types.map(t => (
                        <button key={t} onClick={() => handleImport(s.platform, t)} disabled={importing === `${s.platform}-${t}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400 disabled:opacity-50">
                          {importing === `${s.platform}-${t}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* CSV/JSON Upload */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Import from File</h3>
            <p className="text-xs text-slate-400 mb-4">Upload a JSON array of campaigns/conversions to import directly.</p>
            <input type="file" accept=".json" onChange={handleCSVImport}
              className="text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:cursor-pointer" />
          </GlassCard>
        </div>
      )}

      {/* Export Tab */}
      {tab === 'export' && (
        <div className="space-y-4">
          {[
            ['campaigns', 'Campaigns', 'All campaign/offer data'],
            ['conversions', 'Conversions', 'Conversion events with payouts'],
            ['clicks', 'Clicks', 'Click tracking data'],
            ['spend', 'Daily Spend', 'Ad spend by platform/campaign'],
            ['earnings', 'Earnings', 'Affiliate earnings data'],
            ['roas', 'ROAS Report', 'Cross-platform spend vs revenue'],
          ].map(([type, name, desc]) => (
            <GlassCard key={type} className="flex items-center justify-between p-5">
              <div>
                <h4 className="font-bold text-white text-sm">{name}</h4>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExport(type, 'json')} disabled={exporting === type}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-50">
                  {exporting === type ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} JSON
                </button>
                <button onClick={() => handleExport(type, 'csv')} disabled={exporting === type}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400 disabled:opacity-50">
                  {exporting === type ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} CSV
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
