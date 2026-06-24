import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';
import { 
  Radio, ShoppingCart, Target, Globe, CheckCircle2, XCircle, 
  Loader2, Settings, RefreshCw, Download, ChevronDown, ChevronRight,
  ExternalLink, Shield, Zap
} from 'lucide-react';

const PLATFORMS = {
  traffic_sources: {
    label: 'Traffic Sources',
    desc: 'Where you buy traffic — ad platforms and media sources',
    icon: Radio,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    platforms: [
      { id: 'facebook', name: 'Facebook / Meta Ads', desc: 'Facebook & Instagram advertising', icon: '📘', fields: [{ key: 'token', label: 'Access Token', type: 'password' }] },
      { id: 'google', name: 'Google Ads', desc: 'Search & Display campaigns', icon: '🔍', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'customer_id', label: 'Customer ID', type: 'text' }] },
      { id: 'tiktok', name: 'TikTok Ads', desc: 'TikTok For Business', icon: '🎵', fields: [{ key: 'access_token', label: 'Access Token', type: 'password' }] },
      { id: 'propellerads', name: 'PropellerAds', desc: 'Pop & Push traffic', icon: '🌐', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'richpush', name: 'RichPush', desc: 'Push notification ads', icon: '📢', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'outbrain', name: 'Outbrain', desc: 'Native advertising', icon: '📰', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
    ]
  },
  offer_sources: {
    label: 'Offer / Advertiser Sources',
    desc: 'Where you get offers, products, and affiliate programs',
    icon: ShoppingCart,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    platforms: [
      { id: 'shopee', name: 'Shopee Affiliate', desc: 'Shopee affiliate program (Indonesia)', icon: '🛒', fields: [{ key: 'affiliate_id', label: 'Affiliate ID', type: 'text' }, { key: 'cookies', label: 'Session Cookies (JSON)', type: 'textarea' }] },
      { id: 'amazon', name: 'Amazon Associates', desc: 'Amazon affiliate program', icon: '📦', fields: [{ key: 'access_key', label: 'Access Key', type: 'password' }, { key: 'secret_key', label: 'Secret Key', type: 'password' }, { key: 'partner_tag', label: 'Partner Tag', type: 'text' }] },
      { id: 'lazada', name: 'Lazada Affiliate', desc: 'Lazada affiliate program (SEA)', icon: '🏪', fields: [{ key: 'app_id', label: 'App ID', type: 'text' }, { key: 'app_secret', label: 'App Secret', type: 'password' }] },
      { id: 'tokopedia', name: 'Tokopedia Affiliate', desc: 'Tokopedia affiliate program', icon: '🟢', fields: [{ key: 'client_id', label: 'Client ID', type: 'text' }, { key: 'client_secret', label: 'Client Secret', type: 'password' }] },
      { id: 'clickbank', name: 'ClickBank', desc: 'Digital product marketplace', icon: '💰', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'cj', name: 'CJ Affiliate', desc: 'Commission Junction', icon: '🔗', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'website_id', label: 'Website ID', type: 'text' }] },
    ]
  },
  trackers: {
    label: 'External Trackers',
    desc: 'Import campaigns and data from other tracking platforms',
    icon: Target,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    platforms: [
      { id: 'bemob', name: 'BeMob', desc: 'Cloud-based affiliate tracker', icon: '🐝', fields: [{ key: 'access_key', label: 'Access Key', type: 'password' }, { key: 'secret_key', label: 'Secret Key', type: 'password' }, { key: 'endpoint', label: 'API Endpoint', type: 'text', default: 'https://api.bemob.com' }] },
      { id: 'voluum', name: 'Voluum', desc: 'AI-powered ad tracker', icon: '📊', fields: [{ key: 'access_id', label: 'Access ID', type: 'text' }, { key: 'access_key', label: 'Access Key', type: 'password' }, { key: 'endpoint', label: 'API Endpoint', type: 'text', default: 'https://api.voluum.com' }] },
      { id: 'redtrack', name: 'RedTrack', desc: 'Performance marketing tracker', icon: '🔴', fields: [{ key: 'api_key', label: 'API Key', type: 'password' }, { key: 'endpoint', label: 'API Endpoint', type: 'text', default: 'https://api.redtrack.io' }] },
      { id: 'prosper202', name: 'Prosper202', desc: 'Self-hosted tracker', icon: '📈', fields: [{ key: 'url', label: 'Instance URL', type: 'text' }, { key: 'api_key', label: 'API Key', type: 'password' }] },
      { id: 'trackpro', name: 'TrackPro', desc: 'Shopee commission tracker', icon: '🎯', fields: [{ key: 'url', label: 'Instance URL', type: 'text', default: 'https://tracker.getflashsale.xyz' }, { key: 'username', label: 'Username', type: 'text' }, { key: 'password', label: 'Password', type: 'password' }] },
    ]
  }
};

export default function Integrations() {
  const [configs, setConfigs] = useState({});
  const [connecting, setConnecting] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [expanded, setExpanded] = useState({ traffic_sources: true, offer_sources: true, trackers: true });

  useEffect(() => {
    api.get('/api/integrations').then(r => {
      setConfigs(r.data?.data || {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isConnected = (platformId) => {
    return configs[`integration_${platformId}_enabled`] === '1';
  };

  const getFieldValue = (platformId, fieldKey) => {
    return configs[`integration_${platformId}_${fieldKey}`] || '';
  };

  const handleTest = async (platformId) => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await api.post(`/api/integrations/${platformId}/test`);
      setTestResult({ status: 'success', message: r.data?.message || 'Connected!' });
    } catch (err) {
      setTestResult({ status: 'error', message: err.response?.data?.error || err.message });
    }
    setTesting(false);
  };

  const handleSave = async (platformId) => {
    try {
      const updates = {};
      for (const [key, val] of Object.entries(credentials)) {
        updates[key.replace(`${platformId}_`, '')] = val;
      }
      updates.enabled = '1';
      await api.put(`/api/integrations/${platformId}`, updates);
      setConnecting(null);
      setCredentials({});
      // Refresh configs
      const r = await api.get('/api/integrations');
      setConfigs(r.data?.data || {});
    } catch (err) {
      alert(`Save failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleImport = async (platformId) => {
    setImporting(true);
    try {
      const r = await api.post(`/api/integrations/${platformId}/import`);
      alert(`Imported ${r.data?.imported || 0} campaigns (${r.data?.total || 0} total)`);
    } catch (err) {
      alert(`Import failed: ${err.response?.data?.error || err.message}`);
    }
    setImporting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Integrations</h1>
        <p className="text-slate-400 mt-2">Connect traffic sources, offer platforms, and external trackers</p>
      </div>

      {Object.entries(PLATFORMS).map(([catKey, cat]) => {
        const Icon = cat.icon;
        const isExpanded = expanded[catKey];
        const connectedCount = cat.platforms.filter(p => isConnected(p.id)).length;
        
        return (
          <div key={catKey}>
            <button onClick={() => setExpanded(e => ({...e, [catKey]: !e[catKey]}))}
              className="flex items-center gap-3 w-full text-left mb-4 group">
              {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${cat.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{cat.label}</h2>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </div>
              <span className="text-xs text-slate-400">{connectedCount}/{cat.platforms.length} connected</span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-hidden">
                  {cat.platforms.map(p => {
                    const connected = isConnected(p.id);
                    return (
                      <GlassCard key={p.id} className="p-5 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-2xl">{p.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">{p.name}</h3>
                            <p className="text-xs text-slate-500">{p.desc}</p>
                          </div>
                          {connected ? (
                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Not connected
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {connected ? (
                            <>
                              <button onClick={() => handleTest(p.id)} disabled={testing}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-all disabled:opacity-50">
                                {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Test
                              </button>
                              {catKey === 'trackers' && (
                                <button onClick={() => handleImport(p.id)} disabled={importing}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400 transition-all disabled:opacity-50">
                                  {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />} Import
                                </button>
                              )}
                              <button onClick={() => { setConnecting(p); setCredentials({}); }}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-400 transition-all">
                                <Settings className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => { setConnecting(p); setCredentials({}); }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all">
                              <ExternalLink className="w-3 h-3" /> Connect
                            </button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Connect Modal */}
      <AnimatePresence>
        {connecting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => { setConnecting(null); setTestResult(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <GlassCard className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{connecting.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Connect {connecting.name}</h3>
                    <p className="text-xs text-slate-400">{connecting.desc}</p>
                  </div>
                </div>

                {connecting.fields.map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea value={credentials[f.key] || ''} onChange={e => setCredentials(c => ({...c, [f.key]: e.target.value}))}
                        placeholder={f.label} rows={4}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm font-mono resize-y focus:outline-none focus:border-indigo-500" />
                    ) : (
                      <input type={f.type} value={credentials[f.key] || ''} onChange={e => setCredentials(c => ({...c, [f.key]: e.target.value}))}
                        placeholder={f.label} defaultValue={f.default || ''}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                    )}
                  </div>
                ))}

                {testResult && (
                  <div className={`p-3 rounded-lg text-sm ${testResult.status === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {testResult.status === 'success' ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                    {testResult.message}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => handleTest(connecting.id)} disabled={testing}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 disabled:opacity-50">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Test Connection
                  </button>
                  <button onClick={() => handleSave(connecting.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white">
                    <Shield className="w-4 h-4" /> Save & Enable
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
