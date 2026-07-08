import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Code, TestTube2, Copy, CheckCircle, Globe, Zap } from 'lucide-react';

const EVENT_TYPES = ['purchase', 'lead', 'signup', 'install'];

const STATUS_BADGE = {
  success:   'bg-emerald-500/20 text-emerald-300',
  duplicate: 'bg-yellow-500/20 text-yellow-300',
  rejected:  'bg-red-500/20 text-red-300',
};

function formatTs(ts) {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts > 1e12 ? ts : ts * 1000) : new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ConversionPixel() {
  const queryClient = useQueryClient();

  // pixel builder state
  const [offerId, setOfferId]     = useState('');
  const [eventType, setEventType] = useState('purchase');
  const [copied, setCopied]       = useState(false);

  // test mode state
  const [testMode, setTestMode]   = useState(false);
  const [testClickId, setTestClickId] = useState('');
  const [testResult, setTestResult]   = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // load offers for the selector
  const { data: offers = [], isLoading: offersLoading } = useSafeQuery({
    queryKey: ['pixel-offers'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/offers');
      return Array.isArray(data) ? data : data?.offers || [];
    },
  });

  // recent fires — refetch whenever offerId changes
  const { data: recentFires = [], isLoading: firesLoading } = useSafeQuery(
    {
      queryKey: ['pixel-recent', offerId],
      queryFn: async () => {
        if (!offerId) return [];
        const { data } = await api.get('/api/admin/pixel/recent', { params: { offer_id: offerId } });
        return Array.isArray(data) ? data : data?.fires || [];
      },
      enabled: !!offerId,
    },
    [],
  );

  // derived pixel snippets
  const host = typeof window !== 'undefined' ? window.location.host : 'yourdomain.com';
  const imgPixel = `<img src="https://${host}/pixel?offer=${offerId || 'OFFER_ID'}&event=${eventType}&clickid={clickid}" width="1" height="1" />`;
  const jsPixel  = `(function(){\n  var img = new Image();\n  img.src = '/pixel?offer=${offerId || 'OFFER_ID'}&event=${eventType}&clickid='\n    + encodeURIComponent(document.cookie.match(/clickid=([^;]+)/)?.[1] || '');\n})();`;

  const copyImgPixel = () => {
    navigator.clipboard.writeText(imgPixel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fireTestPixel = async () => {
    if (!offerId) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const { data } = await api.get('/api/admin/pixel/test', {
        params: { offer_id: offerId, event: eventType, clickid: testClickId },
      });
      setTestResult({ ok: true, data });
    } catch (err) {
      setTestResult({ ok: false, message: err.response?.data?.error || err.message || 'Request failed' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-400" />
          Conversion Pixel
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate and test tracking pixels for your offers
        </p>
      </div>

      {/* Pixel Generator */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Pixel Code Generator</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Offer selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              Offer
            </label>
            <select
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="" className="bg-slate-800">— Select offer —</option>
              {offersLoading && (
                <option disabled className="bg-slate-800">Loading…</option>
              )}
              {offers.map((o) => (
                <option key={o.id} value={o.id} className="bg-slate-800">
                  {o.name || o.title || `Offer #${o.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Event type selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-slate-800 capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image pixel */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Image Pixel (HTML)
            </span>
            <button
              onClick={copyImgPixel}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-slate-300 transition-colors"
            >
              {copied
                ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                : <><Copy className="w-3.5 h-3.5" /> Copy</>
              }
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-300 bg-black/30 border border-white/10 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre-wrap break-all">
            {imgPixel}
          </pre>
        </div>

        {/* JS pixel */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              JavaScript Pixel (auto-fire on page load)
            </span>
          </div>
          <pre className="text-xs font-mono text-sky-300 bg-black/30 border border-white/10 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre">
            {jsPixel}
          </pre>
        </div>
      </GlassCard>

      {/* Test Mode Panel */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Test Mode</h2>
          </div>
          {/* Toggle */}
          <button
            type="button"
            onClick={() => { setTestMode((p) => !p); setTestResult(null); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              testMode ? 'bg-amber-500' : 'bg-white/10'
            }`}
            aria-pressed={testMode}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                testMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {testMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                Test Click ID
              </label>
              <input
                type="text"
                value={testClickId}
                onChange={(e) => setTestClickId(e.target.value)}
                placeholder="e.g. test_click_abc123"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              onClick={fireTestPixel}
              disabled={!offerId || testLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Zap className={`w-4 h-4 ${testLoading ? 'animate-pulse' : ''}`} />
              {testLoading ? 'Firing…' : 'Fire Test Pixel'}
            </button>

            {!offerId && (
              <p className="text-xs text-slate-500">Select an offer above to enable test firing.</p>
            )}

            {/* Test result */}
            {testResult && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium mb-1">
                  {testResult.ok
                    ? <><CheckCircle className="w-4 h-4" /> Success</>
                    : <><span className="w-4 h-4 text-center leading-none">✕</span> Failed</>
                  }
                </div>
                {testResult.ok
                  ? <pre className="text-xs text-emerald-200/70 whitespace-pre-wrap break-all">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  : <p className="text-xs">{testResult.message}</p>
                }
              </div>
            )}
          </div>
        )}

        {!testMode && (
          <p className="text-sm text-slate-500">
            Enable test mode to fire a pixel manually and inspect the server response.
          </p>
        )}
      </GlassCard>

      {/* Recent Pixel Fires */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Recent Pixel Fires</h2>
          {offerId && (
            <span className="ml-auto text-xs text-slate-500">
              Offer #{offerId}
            </span>
          )}
        </div>

        {!offerId ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            Select an offer above to see recent pixel fires.
          </div>
        ) : firesLoading ? (
          <div className="text-center py-10 text-slate-500 text-sm">Loading…</div>
        ) : recentFires.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No pixel fires recorded for this offer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Click ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Offer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Event</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentFires.map((fire, idx) => (
                  <tr key={fire.id ?? idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-slate-400 text-xs whitespace-nowrap">
                      {formatTs(fire.created_at || fire.fired_at || fire.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                        {fire.click_id || fire.clickid || '—'}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {fire.offer_name || fire.offer_id || offerId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300 capitalize">
                        {fire.event || fire.event_type || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded capitalize font-medium ${
                          STATUS_BADGE[fire.status] || 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {fire.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
