import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export function ManualConversion() {
  const [form, setForm] = useState({
    click_id: '',
    payout: '',
    txid: '',
    status: 'approved',
    conversion_event: 'conversion',
  });
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/conversions/manual', data),
    onSuccess: (res) => setResult({ ok: true, data: res.data }),
    onError: (err) => setResult({ ok: false, error: err.response?.data?.error || err.message }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setResult(null);
    mutation.mutate({
      ...form,
      payout: parseFloat(form.payout) || 0,
    });
  }

  function field(key, label, props = {}) {
    return (
      <div className="space-y-1">
        <label className="block text-sm text-slate-400">{label}</label>
        <input
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Manual Conversion</h1>
        <p className="text-slate-400 mt-1">
          Force-record a conversion against an existing click. Use for offline sales, manual approvals,
          or when S2S postback is unavailable.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('click_id', 'Click ID *', { placeholder: 'e.g. abc123def456', required: true })}
          {field('payout', 'Payout ($) *', { type: 'number', step: '0.01', min: '0', placeholder: '0.00', required: true })}
          {field('txid', 'Transaction ID', { placeholder: 'Optional — auto-generated if blank' })}
          {field('conversion_event', 'Conversion Event', { placeholder: 'conversion' })}

          <div className="space-y-1">
            <label className="block text-sm text-slate-400">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-primary hover:bg-indigo-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {mutation.isPending ? 'Recording...' : 'Record Conversion'}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-lg border ${result.ok ? 'border-green-success/30 bg-green-success/10' : 'border-red-400/30 bg-red-400/10'}`}>
            <div className="flex items-start gap-2">
              {result.ok
                ? <CheckCircle className="w-5 h-5 text-green-success flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
              <div>
                {result.ok ? (
                  <>
                    <p className="text-green-success font-medium">Conversion recorded</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Conversion ID: <code className="text-white">{result.data.conversion_id}</code>
                      {' · '}
                      TxID: <code className="text-white">{result.data.txid}</code>
                    </p>
                  </>
                ) : (
                  <p className="text-red-400 font-medium">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
