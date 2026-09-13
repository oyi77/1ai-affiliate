import { useState, useEffect } from 'react';
import { useSafeQuery } from '../../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { GlassCard } from '../ui/GlassCard';
import { Loader2, Save, DollarSign } from 'lucide-react';

export function PayoutSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    min_amount: 50000, auto_approve: false, payment_method: 'bank_transfer',
    payment_schedule: 'monthly', enabled: true,
  });

  const { data: rules, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['payout-rules'],
    queryFn: async () => { const r = await api.get('/api/settings/payouts/rules'); return r.data?.data ?? r.data; },
  });

  useEffect(() => {
    if (rules && rules.min_amount !== undefined) {
      setForm({
        min_amount: Number(rules.min_amount) || 50000,
        auto_approve: !!rules.auto_approve,
        payment_method: rules.payment_method || 'bank_transfer',
        payment_schedule: rules.payment_schedule || 'monthly',
        enabled: !!rules.enabled,
      });
    }
  }, [rules]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/payouts/rules', data),
    onSuccess: () => queryClient.invalidateQueries(['payout-rules']),
  });

  if (isLoading) {
    return <GlassCard><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div></GlassCard>;
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-success" />
        Payout Rules
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Minimum Payout Amount (Rp)</label>
            <input
              type="number"
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="ewallet">E-Wallet</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Payment Schedule</label>
            <select
              value={form.payment_schedule}
              onChange={(e) => setForm({ ...form, payment_schedule: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {[
          { key: 'auto_approve', label: 'Auto-Approve', desc: 'Automatically approve and process payouts above threshold' },
          { key: 'enabled', label: 'Enabled', desc: 'Enable automatic payout processing' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
            <div>
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
              className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${form[item.key] ? 'bg-indigo-primary' : 'bg-surface-3'}`}
            >
              <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform ${form[item.key] ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}

        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Payout Rules
        </button>
      </div>
    </GlassCard>
  );
}
