import { useState, useCallback } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import { Key, Plus, Trash2, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { ErrorState } from '../components/ErrorState';

const SCOPE_OPTIONS = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'admin', label: 'Admin' },
];

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '365d', label: '365 days' },
];

export function ApiKeys() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', scopes: ['read'], expiry: 'never' });
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: keys = [], isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data } = await api.get('/api/enterprise/api-keys');
      return Array.isArray(data) ? data : data?.keys || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/api/enterprise/api-keys', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      const fullKey = res.data?.key || res.data?.api_key || '';
      setNewKey(fullKey);
      setCreateOpen(false);
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/enterprise/api-keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const toggleScope = useCallback((scope) => {
    setForm((p) => ({
      ...p,
      scopes: p.scopes.includes(scope) ? p.scopes.filter((s) => s !== scope) : [...p.scopes, scope],
    }));
  }, []);

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setForm({ name: '', scopes: ['read'], expiry: 'never' });
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = typeof ts === 'number' ? new Date(ts > 1e12 ? ts : ts * 1000) : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isError && (!keys || (Array.isArray(keys) && !keys.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage API keys for programmatic access</p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create API Key
        </button>
      </div>

      {/* New key banner */}
      {newKey && (
        <GlassCard className="border-emerald-500/30 border">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium text-sm">API Key Created</span>
              </div>
              <p className="text-slate-400 text-xs mb-2">Copy this key now. It won't be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-white bg-white/5 border border-white/10 rounded px-3 py-2 flex-1 truncate">
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-slate-300 transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <button onClick={() => setNewKey(null)} className="text-slate-500 hover:text-white ml-4">
              &times;
            </button>
          </div>
        </GlassCard>
      )}

      {/* Keys table */}
      <GlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Key className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No API keys yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Key Prefix</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Scopes</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Last Used</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Expires</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-white font-medium">{key.name}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                        {key.key_prefix || key.prefix || '***'}...
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {(key.scopes || []).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(key.last_used)}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(key.expires)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => revokeMutation.mutate(key.id)}
                        disabled={revokeMutation.isPending}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Create modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Create API Key" description="Generate a new API key for programmatic access">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Key Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="My Integration Key"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Scopes</label>
            <div className="flex gap-2">
              {SCOPE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleScope(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.scopes.includes(s.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiration</label>
            <select
              value={form.expiry}
              onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name || form.scopes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Create Key
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
