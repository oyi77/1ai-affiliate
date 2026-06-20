import { useState } from 'react';
import { Database, Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';
import { useMutation } from '@tanstack/react-query';

export function Migration() {
  const [tab, setTab] = useState('bemob');
  const [creds, setCreds] = useState({ access_key: '', secret_key: '' });
  const [lastResult, setLastResult] = useState(null);

  const importMutation = useMutation({
    mutationFn: (dryRun) => api.post('/api/migration/bemob', {
      access_key: creds.access_key,
      secret_key: creds.secret_key,
      dry_run: dryRun,
    }),
    onSuccess: (resp) => setLastResult(resp.data),
  });

  const tabs = [
    { id: 'bemob', label: 'BeMob Import', icon: Database },
    { id: 'csv', label: 'CSV Import', icon: Upload },
    { id: 'history', label: 'Import History', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Migration
        </h1>
        <p className="text-slate-400 mt-2">Import campaigns, offers, and traffic data from other platforms</p>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-indigo-primary/20 text-indigo-light border border-indigo-primary/40'
                : 'bg-surface-2 text-slate-400 border border-white/5 hover:border-white/20'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'bemob' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-6">BeMob API Credentials</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Access Key</label>
                <input
                  type="text"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                  placeholder="4CA5B4E9350942E3..."
                  value={creds.access_key}
                  onChange={(e) => setCreds({ ...creds, access_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Secret Key</label>
                <input
                  type="password"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                  placeholder="cbaj4UMK1qBnnZou..."
                  value={creds.secret_key}
                  onChange={(e) => setCreds({ ...creds, secret_key: e.target.value })}
                />
              </div>

              <div className="bg-surface-3/50 border border-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">Entities to Import</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-success" /> Networks</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-success" /> Traffic Sources</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-success" /> Offers</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-success" /> Campaigns</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-success" /> Flows → Traffic Rules</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => importMutation.mutate(true)}
                  disabled={importMutation.isPending || !creds.access_key || !creds.secret_key}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-3 hover:bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
                >
                  {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Test Connection
                </button>
                <button
                  onClick={() => importMutation.mutate(false)}
                  disabled={importMutation.isPending || !creds.access_key || !creds.secret_key}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light transition-all disabled:opacity-50"
                >
                  {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {importMutation.isPending ? 'Importing...' : 'Start Import'}
                </button>
              </div>

              {importMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {importMutation.error?.response?.data?.error || importMutation.error?.message || 'Import failed'}
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-6">Results</h3>
            {lastResult ? (
              <div className="space-y-4">
                {lastResult.dry_run && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium">
                    Dry Run — No data was imported
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Networks', count: lastResult.networks, color: 'text-purple-400' },
                    { label: 'Traffic Sources', count: lastResult.traffic_sources, color: 'text-blue-400' },
                    { label: 'Offers', count: lastResult.offers, color: 'text-green-400' },
                    { label: 'Campaigns', count: lastResult.campaigns, color: 'text-orange-400' },
                    { label: 'Flows', count: lastResult.flows, color: 'text-pink-400' },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-surface-3/50 border border-white/5 rounded-lg text-center">
                      <div className={`text-3xl font-bold ${item.color}`}>{item.count}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>

                {lastResult.errors?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-yellow-400">Warnings ({lastResult.errors.length})</p>
                    {lastResult.errors.map((err, i) => (
                      <div key={i} className="text-xs text-slate-400 p-2 bg-yellow-500/5 rounded">{err}</div>
                    ))}
                  </div>
                )}

                {!lastResult.dry_run && lastResult.offers > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                    Import complete! Visit <a href="/campaigns" className="underline">Campaigns</a> and <a href="/offers" className="underline">Offers</a> to see imported data.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                <Database className="w-12 h-12 mb-4 opacity-30" />
                <p>Enter credentials and start an import</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {tab === 'csv' && (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Upload className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">CSV Import</p>
            <p className="text-sm">Coming soon — import offers, campaigns, and traffic sources from CSV files</p>
          </div>
        </GlassCard>
      )}

      {tab === 'history' && (
        <GlassCard>
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Import History</p>
            <p className="text-sm">Coming soon — view past import runs and their results</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
