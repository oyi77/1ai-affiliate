import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Plus, Trash2, Copy, Loader2, CheckCircle, XCircle, Eye, EyeOff, Shield,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

const SCOPES = ['read', 'write', 'admin'];
const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '365d', label: '365 Days' },
];

export function ApiKeys() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', scopes: [], expiry: 'never' });
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [createError, setCreateError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get('/api/enterprise/api-keys');
      return res.data;
    },
  });

  const keys = data?.data || data || [];

  const createMutation = useMutation({
    mutationFn: async (body) => api.post('/api/enterprise/api-keys', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      const key = res.data?.key || res.data?.api_key || res.data;
      setCreatedKey(key);
      setCreateForm({ name: '', scopes: [], expiry: 'never' });
      setCreateError(null);
    },
    onError: (err) => {
      setCreateError(err.response?.data?.error || 'Failed to create API key');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id) => api.delete(`/api/enterprise/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  function toggleScope(scope) {
    setCreateForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function formatTimestamp(ts) {
    if (!ts) return '—';
    return new Date(ts * 1000 || ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (isLoading) return <div className="text-white p-8">Loading API keys...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            API Keys
          </h1>
          <p className="text-slate-400 mt-2">Create and manage API keys for programmatic access</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setCreatedKey(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      {/* Newly created key alert */}
      <AnimatePresence>
        {createdKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 font-bold text-sm">API Key Created Successfully</p>
                  <p className="text-amber-400 text-xs mt-1">
                    Copy this key now — it will not be shown again.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-xs font-mono text-white break-all">
                      {typeof createdKey === 'string' ? createdKey : createdKey.key || JSON.stringify(createdKey)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(typeof createdKey === 'string' ? createdKey : createdKey.key || '')}
                      className="p-2 rounded-lg bg-indigo-primary/20 text-indigo-400 hover:bg-indigo-primary/30 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedKey && (
                    <span className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Copied to clipboard
                    </span>
                  )}
                </div>
                <button onClick={() => setCreatedKey(null)} className="text-slate-500 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      {showCreate && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Create New API Key</h3>
          {createError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {createError}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Key Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                placeholder="Production API Key"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map(scope => (
                  <button
                    key={scope}
                    onClick={() => toggleScope(scope)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      createForm.scopes.includes(scope)
                        ? 'bg-indigo-primary text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {scope}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Expiration</label>
              <select
                value={createForm.expiry}
                onChange={(e) => setCreateForm(prev => ({ ...prev, expiry: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary text-sm"
              >
                {EXPIRY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.name || createForm.scopes.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Key
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="px-4 py-2.5 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Keys Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Key Prefix</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Scopes</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Last Used</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Expires</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No API keys yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <motion.tr
                    key={k.id || k.key_prefix}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 text-sm text-white font-medium">{k.name || '—'}</td>
                    <td className="py-3">
                      <code className="text-xs font-mono text-slate-300 bg-black/30 px-2 py-1 rounded">
                        {k.key_prefix || '***'}...
                      </code>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {(k.scopes || []).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-primary/20 text-indigo-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-slate-400">{formatTimestamp(k.last_used)}</td>
                    <td className="py-3 text-sm text-slate-400">{k.expires ? formatTimestamp(k.expires) : 'Never'}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Revoke this API key? This cannot be undone.')) {
                            revokeMutation.mutate(k.id);
                          }
                        }}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
