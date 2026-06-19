import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  CheckCircle2,
  Play,
  Trash2,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Link2,
  Globe,
  FileJson,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

const MACROS = [
  { key: '{click_id}', description: 'Unique click identifier' },
  { key: '{payout}', description: 'Conversion payout amount' },
  { key: '{subid}', description: 'Affiliate sub-ID' },
  { key: '{offer_id}', description: 'Offer identifier' },
  { key: '{affiliate_id}', description: 'Affiliate account ID' },
  { key: '{transaction_id}', description: 'Transaction identifier' },
];

const DEFAULT_PARAMS = [
  { key: 'click_id', value: '{click_id}', enabled: true },
  { key: 'payout', value: '{payout}', enabled: true },
  { key: 'subid', value: '{subid}', enabled: true },
  { key: 'offer_id', value: '{offer_id}', enabled: true },
  { key: 'affiliate_id', value: '{affiliate_id}', enabled: true },
  { key: 'transaction_id', value: '{transaction_id}', enabled: true },
];

function buildTestUrl(baseUrl, params) {
  try {
    const url = new URL(baseUrl);
    params
      .filter((p) => p.enabled && p.key && p.value)
      .forEach((p) => {
        const resolved = resolveMacros(p.value);
        url.searchParams.set(p.key, resolved);
      });
    return url.toString();
  } catch {
    let url = baseUrl;
    const qs = params
      .filter((p) => p.enabled && p.key && p.value)
      .map((p) => `${p.key}=${encodeURIComponent(resolveMacros(p.value))}`)
      .join('&');
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    return url;
  }
}

function resolveMacros(str) {
  return str
    .replace(/\{click_id\}/g, 'cl_test_' + Math.random().toString(36).slice(2, 9))
    .replace(/\{payout\}/g, '15.75')
    .replace(/\{subid\}/g, 'sub_abc123')
    .replace(/\{offer_id\}/g, '42')
    .replace(/\{affiliate_id\}/g, '101')
    .replace(/\{transaction_id\}/g, 'txn_' + Math.random().toString(36).slice(2, 11));
}

export function PostbackBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://track.example.com/postback');
  const [method, setMethod] = useState('GET');
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [headers, setHeaders] = useState([]);
  const [jsonBody, setJsonBody] = useState(
    '{\n  "click_id": "{click_id}",\n  "payout": "{payout}",\n  "offer_id": "{offer_id}"\n}'
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [macroInsertTarget, setMacroInsertTarget] = useState(null);

  const previewRef = useRef(null);

  const previewUrl = (() => {
    try {
      const url = new URL(baseUrl);
      params
        .filter((p) => p.enabled && p.key && p.value)
        .forEach((p) => url.searchParams.set(p.key, p.value));
      return url.toString();
    } catch {
      let url = baseUrl;
      const qs = params
        .filter((p) => p.enabled && p.key && p.value)
        .map((p) => `${p.key}=${encodeURIComponent(p.value)}`)
        .join('&');
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
      return url;
    }
  })();

  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testPostback = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const testUrl = buildTestUrl(baseUrl, params);
      const headerObj = {};
      headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => (headerObj[h.key] = resolveMacros(h.value)));

      const res = await api.post('/api/postback/test', {
        url: testUrl,
        method,
        headers: headerObj,
        body: method === 'POST' ? resolveMacros(jsonBody) : undefined,
      });
      setTestResult({
        ok: res.data?.success ?? true,
        status: res.status,
        data: res.data,
      });
    } catch (err) {
      setTestResult({
        ok: false,
        status: err.response?.status ?? 0,
        data: err.response?.data ?? { error: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  const addParam = () =>
    setParams([...params, { key: '', value: '', enabled: true }]);
  const removeParam = (idx) => setParams(params.filter((_, i) => i !== idx));
  const updateParam = (idx, field, val) =>
    setParams(params.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));

  const addHeader = () =>
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  const removeHeader = (idx) => setHeaders(headers.filter((_, i) => i !== idx));
  const updateHeader = (idx, field, val) =>
    setHeaders(headers.map((h, i) => (i === idx ? { ...h, [field]: val } : h)));

  const insertMacro = (macro) => {
    if (macroInsertTarget === 'body') {
      setJsonBody(jsonBody + macro);
    }
    setMacroInsertTarget(null);
  };

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
            Postback URL Builder
          </h1>
          <p className="text-slate-400 mt-2">Build, test, and debug server-to-server postback URLs</p>
        </div>
        <button
          onClick={testPostback}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/25 hover:bg-indigo-600 disabled:opacity-50 transition-all"
        >
          <Zap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
          {testing ? 'Testing...' : 'Test Postback'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Endpoint &amp; Method
            </h3>
            <div className="flex gap-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-bold text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <input
                type="text"
                className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="https://example.com/postback"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-400" />
                Parameters
              </h3>
              <button
                onClick={addParam}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {params.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => updateParam(i, 'enabled', e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <input
                    type="text"
                    className="w-36 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="key"
                    value={p.key}
                    onChange={(e) => updateParam(i, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="value"
                    value={p.value}
                    onChange={(e) => updateParam(i, 'value', e.target.value)}
                  />
                  <button
                    onClick={() => removeParam(i)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {params.length === 0 && (
                <p className="text-slate-500 text-sm py-3 text-center">No parameters added</p>
              )}
            </div>
          </GlassCard>

          {method === 'POST' && (
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-indigo-400" />
                  JSON Body
                </h3>
                <button
                  onClick={() => setMacroInsertTarget(macroInsertTarget === 'body' ? null : 'body')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    macroInsertTarget === 'body'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Insert Macro
                </button>
              </div>
              {macroInsertTarget === 'body' && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {MACROS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => insertMacro(m.key)}
                      className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-mono hover:bg-indigo-500/20 transition-colors"
                    >
                      {m.key}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono text-sm resize-y focus:border-indigo-500 focus:outline-none"
                value={jsonBody}
                onChange={(e) => setJsonBody(e.target.value)}
              />
            </GlassCard>
          )}

          <GlassCard>
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                Custom Headers
                {headers.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-normal">
                    {headers.filter((h) => h.enabled).length}
                  </span>
                )}
              </h3>
              {showHeaders ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {showHeaders && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={addHeader}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Header
                  </button>
                </div>
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                      className="accent-indigo-500"
                    />
                    <input
                      type="text"
                      className="w-40 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Header name"
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Header value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    />
                    <button
                      onClick={() => removeHeader(i)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {headers.length === 0 && (
                  <p className="text-slate-500 text-sm py-3 text-center">No custom headers</p>
                )}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Preview + Response */}
        <div className="space-y-6">
          <GlassCard className="border-indigo-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Preview</h3>
            <div className="mb-3">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                  method === 'GET'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {method}
              </span>
            </div>
            <div
              ref={previewRef}
              className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4 break-all"
            >
              <span className="font-mono text-sm text-indigo-300 leading-relaxed">
                {previewUrl.split(/(\{[^}]+\})/).map((part, i) =>
                  part.startsWith('{') ? (
                    <span key={i} className="text-amber-400 bg-amber-500/10 px-0.5 rounded">
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </span>
            </div>
            <button
              onClick={copyUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-600 transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </GlassCard>

          {testResult && (
            <GlassCard
              className={
                testResult.ok
                  ? 'border-green-500/30'
                  : 'border-red-500/30'
              }
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-indigo-400" />
                  Response
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    testResult.ok
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {testResult.status || 'Error'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span className={testResult.ok ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {testResult.ok ? 'Test postback sent successfully!' : 'Test postback failed'}
                </span>
              </div>
              <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-slate-300 font-mono overflow-auto max-h-48">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </GlassCard>
          )}

          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4">Macros</h3>
            <div className="space-y-1.5">
              {MACROS.map((m) => (
                <div
                  key={m.key}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => navigator.clipboard.writeText(m.key)}
                >
                  <div>
                    <span className="font-mono text-sm text-indigo-400 group-hover:text-indigo-300">
                      {m.key}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
