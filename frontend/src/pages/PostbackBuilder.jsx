import { useState, useMemo } from 'react';
import { Copy, CheckCircle2, Play, Info, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

export function PostbackBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://track.1ai.aff/postback');
  const [params, setParams] = useState({
    aff_id: '{aff_id}',
    campaign_id: '{campaign_id}',
    click_id: '{click_id}',
    payout: '{payout}',
    status: '{status}',
  });
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const generatedUrl = useMemo(() => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }, [baseUrl, params]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testPostback = async () => {
    setTesting(true);
    try {
      // Mock test request by replacing placeholders with dummy data
      const testUrl = generatedUrl
        .replace('{aff_id}', '101')
        .replace('{campaign_id}', '202')
        .replace('{click_id}', 'test_click_' + Math.random().toString(36).substring(7))
        .replace('{payout}', '1.50')
        .replace('{status}', 'approved');
      
      await api.get(testUrl);
      setTestResult({ ok: true, message: 'Test postback sent successfully!' });
    } catch (error) {
      console.error('Test postback failed:', error);
      setTestResult({ ok: false, message: 'Test postback failed. Check console for details.' });
    } finally {
      setTesting(false);
    }
  };

  const macros = [
    { key: '{aff_id}', description: 'Affiliate ID' },
    { key: '{campaign_id}', description: 'Campaign ID' },
    { key: '{click_id}', description: 'Unique Click/Transaction ID' },
    { key: '{payout}', description: 'Conversion Payout Amount' },
    { key: '{status}', description: 'Conversion Status (e.g. approved)' },
    { key: '{subid1}', description: 'SubID 1' },
    { key: '{subid2}', description: 'SubID 2' },
    { key: '{subid3}', description: 'SubID 3' },
    { key: '{subid4}', description: 'SubID 4' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Postback URL Builder
        </h1>
        <p className="text-slate-400 mt-2">Configure server-to-server conversion tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-xl font-bold text-white mb-6">Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Base Postback URL</label>
              <input
                type="text"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(params).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{key.replace('_', ' ')}</label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm"
                    value={params[key]}
                    onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="border-indigo-primary/30 shadow-glow-sm">
            <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
              <div className="font-mono text-sm text-indigo-light break-all leading-relaxed">
                {generatedUrl}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light transition-all"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                onClick={testPostback}
                disabled={testing}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-3 hover:bg-green-success/20 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                Test Postback
              </button>
            </div>
            {testResult && (
              <div className={`flex items-center gap-2 mt-3 px-4 py-3 rounded-lg text-sm font-medium ${testResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {testResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {testResult.message}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-indigo-light" />
              <h3 className="text-lg font-bold text-white">Available Macros</h3>
            </div>
            <div className="overflow-hidden border border-white/5 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-2 uppercase text-[10px] tracking-wider">Macro</th>
                    <th className="px-4 py-2 uppercase text-[10px] tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {macros.map((macro) => (
                    <tr key={macro.key} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2 font-mono text-indigo-light">{macro.key}</td>
                      <td className="px-4 py-2 text-slate-400">{macro.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
