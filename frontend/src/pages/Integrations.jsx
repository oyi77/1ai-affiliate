import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import TemplatePicker from '../components/TemplatePicker';
import api from '../lib/api';

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [connecting, setConnecting] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/traffic-sources/integrations').then(r => setIntegrations(r.data?.data || [])),
      api.get('/admin/traffic-sources').then(r => setTrafficSources(r.data?.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const connectedPlatforms = new Set(trafficSources.map(ts => ts.platform_type).filter(Boolean));

  const handleConnect = async () => {
    if (!connecting) return;
    try {
      setTestResult({ status: 'testing', message: 'Testing connection...' });
      const res = await api.post(`/admin/traffic-sources/${connecting.tsId || 0}/connect`, {
        platform_type: connecting.id,
        ...credentials,
      });
      setTestResult({ status: 'success', message: `Connected: ${res.data?.account || 'OK'}` });
      // Refresh traffic sources
      const ts = await api.get('/admin/traffic-sources');
      setTrafficSources(ts.data?.data || []);
      setTimeout(() => { setConnecting(null); setCredentials({}); setTestResult(null); }, 1500);
    } catch (err) {
      setTestResult({ status: 'error', message: err.response?.data?.error || err.message });
    }
  };

  const handleSync = async (tsId) => {
    setSyncing(tsId);
    try {
      const res = await api.post(`/admin/traffic-sources/${tsId}/sync`);
      alert(`Synced ${res.data?.synced || 0} rows`);
    } catch (err) {
      alert(`Sync failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setSyncing(null);
    }
  };

  if (loading) return <div className="text-white p-8">Loading integrations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{integrations.length} available</span>
          <TemplatePicker entityType="traffic-sources" title="Quick Add Traffic Source" onSubmit={async (values) => {
            await api.post('/admin/traffic-sources', values);
            const ts = await api.get('/admin/traffic-sources');
            setTrafficSources(ts.data?.data || []);
          }}>
            <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">+ Quick Add</button>
          </TemplatePicker>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map(int => {
          const connected = connectedPlatforms.has(int.id);
          const ts = trafficSources.find(t => t.platform_type === int.id);
          return (
            <GlassCard key={int.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{int.name}</h3>
                    <p className="text-xs text-gray-400">{int.description}</p>
                  </div>
                </div>
                {connected && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Connected</span>}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setConnecting(int); setCredentials({}); setTestResult(null); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${connected ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {connected ? 'Reconnect' : 'Connect'}
                </button>
                {connected && ts && (
                  <button
                    onClick={() => handleSync(ts.id)}
                    disabled={syncing === ts.id}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {syncing === ts.id ? 'Syncing...' : 'Sync'}
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Connected Sources Table */}
      {trafficSources.length > 0 && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-white mb-4">Connected Sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Platform</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Last Synced</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map(ts => {
                  const int = integrations.find(i => i.id === ts.platform_type);
                  return (
                    <tr key={ts.id} className="border-b border-white/5">
                      <td className="py-2 px-3 text-gray-300">{int?.icon} {int?.name || ts.platform_type}</td>
                      <td className="py-2 px-3 text-gray-300">{ts.name}</td>
                      <td className="py-2 px-3 text-gray-400">{ts.last_synced_at ? new Date(ts.last_synced_at * 1000).toLocaleString() : 'Never'}</td>
                      <td className="py-2 px-3 text-right">
                        <button onClick={() => handleSync(ts.id)} disabled={syncing === ts.id} className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50">
                          {syncing === ts.id ? 'Syncing...' : 'Sync Now'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Connect Modal */}
      <AnimatePresence>
        {connecting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConnecting(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-2 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{connecting.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Connect {connecting.name}</h3>
                  <p className="text-xs text-gray-400">{connecting.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Traffic source name */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Source Name</label>
                  <input type="text" placeholder={`My ${connecting.name}`} onChange={e => setCredentials(c => ({ ...c, _name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                {/* Dynamic auth fields */}
                {connecting.auth_fields?.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-400 mb-1">{field.label}{field.required && <span className="text-red-400 ml-1">*</span>}</label>
                    <input
                      type={field.type || 'text'}
                      placeholder={field.label}
                      onChange={e => setCredentials(c => ({ ...c, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {testResult && (
                <div className={`mt-3 p-2 rounded-lg text-sm ${testResult.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : testResult.status === 'testing' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
                  {testResult.message}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button onClick={() => setConnecting(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleConnect} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Connect</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
