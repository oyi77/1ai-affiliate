import { formatCurrency, formatIDR } from "../lib/currency";
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import {
  Webhook, Plus, Trash2, Send, Loader2, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, ExternalLink, Copy,
} from 'lucide-react';

export function Webhooks() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ url: '', events: ['conversion'], secret: '' });
  const [testResults, setTestResults] = useState({});
  const [createError, setCreateError] = useState(null);

  const { data, isLoading } = useSafeQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const r = await api.get('/api/admin/webhooks');
      return r.data?.data ?? r.data;
    },
  });

  const webhooks = data?.data || data || [];
  const availableEvents = data?.available_events || ['conversion', 'click', 'fraud', 'payout', 'cap_reached', '*'];

  const createMutation = useMutation({
    mutationFn: async (body) => api.post('/api/admin/webhooks', body),
    onSuccess: () => {
      queryClient.invalidateQueries(['webhooks']);
      setShowCreate(false);
      setCreateForm({ url: '', events: ['conversion'], secret: '' });
      setCreateError(null);
    },
    onError: (err) => {
      setCreateError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Failed to create webhook');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/api/admin/webhooks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['webhooks']),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => api.patch(`/api/admin/webhooks/${id}`, { enabled }),
    onSuccess: () => queryClient.invalidateQueries(['webhooks']),
  });

  const testMutation = useMutation({
    mutationFn: async (id) => api.post(`/api/admin/webhooks/${id}/test`),
    onSuccess: (res, id) => {
      setTestResults(prev => ({ ...prev, [id]: { success: true, message: 'Test delivered successfully' } }));
    },
    onError: (err, id) => {
      setTestResults(prev => ({ ...prev, [id]: { success: false, message: err.response?.data?.error || 'Test failed' } }));
    },
  });

  function toggleEvent(event) {
    setCreateForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  }

  function formatTimestamp(ts) {
    if (!ts) return 'Never';
    return new Date(ts * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Webhooks
          </h1>
          <p className="text-slate-400 mt-2">Manage outbound webhooks for real-time event notifications</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <GlassCard>
          <h3 className="text-lg font-bold text-white mb-4">Create New Webhook</h3>
          {createError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {createError}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Webhook URL</label>
              <input
                type="url"
                value={createForm.url}
                onChange={(e) => setCreateForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                placeholder="https://hooks.zapier.com/hooks/catch/123456/abcdef/"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Events</label>
              <div className="flex flex-wrap gap-2">
                {availableEvents.map(event => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      createForm.events.includes(event)
                        ? 'bg-indigo-primary text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Signing Secret (optional)</label>
              <input
                type="text"
                value={createForm.secret}
                onChange={(e) => setCreateForm(prev => ({ ...prev, secret: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                placeholder="whsec_..."
              />
              <p className="text-xs text-slate-500">Used to sign payloads with HMAC-SHA256 (X-Webhook-Signature header)</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.url || createForm.events.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Webhook
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="px-5 py-2.5 bg-white/5 text-slate-300 rounded-lg font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Webhook List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-light animate-spin" />
        </div>
      ) : webhooks.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Webhook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Webhooks</h3>
            <p className="text-slate-400 text-sm">Create a webhook to receive real-time event notifications via HTTP POST.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {webhooks.map(wh => (
            <GlassCard key={wh.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${wh.enabled ? 'bg-green-400' : 'bg-slate-600'}`} />
                    <code className="text-sm text-indigo-light font-mono truncate">{wh.url}</code>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(wh.events) ? wh.events : []).map(event => (
                      <span
                        key={event}
                        className="px-2 py-0.5 bg-indigo-primary/10 text-indigo-light text-xs font-bold rounded-full"
                      >
                        {event}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500">
                    Last triggered: {formatTimestamp(wh.last_triggered_at)}
                    {' · '}
                    Created: {formatTimestamp(wh.created_at)}
                  </div>

                  {/* Test result feedback */}
                  {testResults[wh.id] && (
                    <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-2 ${
                      testResults[wh.id].success
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {testResults[wh.id].success ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {testResults[wh.id].message}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate({ id: wh.id, enabled: !wh.enabled })}
                    className={`p-2 rounded-lg transition-colors ${
                      wh.enabled ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-500 hover:bg-white/5'
                    }`}
                    title={wh.enabled ? 'Disable' : 'Enable'}
                  >
                    {wh.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => testMutation.mutate(wh.id)}
                    disabled={testMutation.isPending}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Send test payload"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete webhook to ${wh.url}?`)) deleteMutation.mutate(wh.id);
                    }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Info card */}
      <GlassCard className="border border-white/5">
        <h3 className="text-sm font-bold text-white mb-3">Webhook Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { event: 'conversion', desc: 'Fired when a conversion/postback is received' },
            { event: 'click', desc: 'Fired on each tracked click' },
            { event: 'fraud', desc: 'Fired when fraud is detected' },
            { event: 'payout', desc: 'Fired when a payout is processed' },
            { event: 'cap_reached', desc: 'Fired when a campaign cap is hit' },
            { event: '*', desc: 'Wildcard — receives all events' },
          ].map(e => (
            <div key={e.event} className="p-3 bg-black/20 rounded-lg border border-white/5">
              <code className="text-indigo-light font-bold">{e.event}</code>
              <p className="text-slate-500 mt-1">{e.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Payloads are signed with HMAC-SHA256 when a secret is set. Verify via the <code className="text-indigo-light">X-Webhook-Signature</code> header.
        </p>
      </GlassCard>
    </div>
  );
}
