import { useState, useEffect } from 'react';
import { useSafeQuery } from '../../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { GlassCard } from '../ui/GlassCard';
import { Loader2, Save, Send, MessageCircle } from 'lucide-react';

export function TelegramSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bot_token: '', chat_id: '', daily_summary_enabled: false,
    balance_alert_enabled: false, balance_alert_threshold: 200000,
    performance_alert_enabled: false,
  });
  const [testResult, setTestResult] = useState(null);

  const { data: config, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['telegram-config'],
    queryFn: async () => { const r = await api.get('/api/settings/telegram'); return r.data?.data ?? r.data; },
  });

  useEffect(() => {
    if (config && config.bot_token !== undefined) {
      setForm({
        bot_token: config.bot_token || '',
        chat_id: config.chat_id || '',
        daily_summary_enabled: !!config.daily_summary_enabled,
        balance_alert_enabled: !!config.balance_alert_enabled,
        balance_alert_threshold: Number(config.balance_alert_threshold) || 200000,
        performance_alert_enabled: !!config.performance_alert_enabled,
      });
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/telegram', data),
    onSuccess: () => { queryClient.invalidateQueries(['telegram-config']); setTestResult(null); },
  });

  const testMutation = useMutation({
    mutationFn: () => api.post('/api/settings/telegram/test'),
    onSuccess: () => setTestResult({ success: true, message: 'Test message sent! Check your Telegram.' }),
    onError: (err) => setTestResult({ success: false, message: err.response?.data?.error || 'Failed to send test message' }),
  });

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  if (isLoading) {
    return <GlassCard><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div></GlassCard>;
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-accent-light" />
        Telegram Integration
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Bot Token</label>
            <input
              type="text"
              value={form.bot_token}
              onChange={(e) => setForm({ ...form, bot_token: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Chat ID</label>
            <input
              type="text"
              value={form.chat_id}
              onChange={(e) => setForm({ ...form, chat_id: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
              placeholder="-100123456789"
            />
          </div>
        </div>

        {/* Toggle switches */}
        {[
          { key: 'daily_summary_enabled', label: 'Daily Summary', desc: 'Receive a daily stats summary at midnight' },
          { key: 'balance_alert_enabled', label: 'Balance Alerts', desc: 'Get warned when balance drops below threshold' },
          { key: 'performance_alert_enabled', label: 'Performance Alerts', desc: 'Alerts on significant performance changes' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
            <div>
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${form[item.key] ? 'bg-indigo-primary' : 'bg-surface-3'}`}
            >
              <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform ${form[item.key] ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}

        {form.balance_alert_enabled && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Balance Alert Threshold (Rp)</label>
            <input
              type="number"
              value={form.balance_alert_threshold}
              onChange={(e) => setForm({ ...form, balance_alert_threshold: Number(e.target.value) })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save
          </button>
          <button
            onClick={() => { saveMutation.mutate(form, { onSuccess: () => testMutation.mutate() }); }}
            disabled={testMutation.isPending || saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all disabled:opacity-50"
          >
            {testMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            Test Kirim Pesan
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-success/10 border border-green-success/20 text-green-success' : 'bg-red-error/10 border border-red-error/20 text-red-error'}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
