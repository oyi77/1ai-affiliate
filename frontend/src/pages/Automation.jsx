import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Zap, Plus, Play, Trash2, ToggleLeft, ToggleRight, Settings, Loader2 } from 'lucide-react';
import api from '../lib/api';

const RULE_TYPES = [
  { value: 'auto_pause', label: 'Auto Pause', desc: 'Pause campaigns with low performance', icon: '⏸️' },
  { value: 'auto_scale', label: 'Auto Scale', desc: 'Scale budget on high ROAS', icon: '📈' },
  { value: 'sleep_schedule', label: 'Sleep Schedule', desc: 'Pause/resume during off-hours', icon: '😴' },
  { value: 'balance_alert', label: 'Balance Alert', desc: 'Telegram alert on low balance', icon: '💰' },
  { value: 'performance_alert', label: 'Performance Alert', desc: 'Alert on metric thresholds', icon: '📊' },
];

const ACTIONS_MAP = {
  auto_pause: [{ value: 'pause_campaign', label: 'Pause Campaign' }],
  auto_scale: [{ value: 'increase_budget', label: 'Increase Budget' }],
  sleep_schedule: [{ value: 'pause_all', label: 'Pause All' }, { value: 'log', label: 'Log Only' }],
  balance_alert: [{ value: 'telegram_alert', label: 'Telegram Alert' }],
  performance_alert: [{ value: 'telegram_alert', label: 'Telegram Alert' }, { value: 'log', label: 'Log Only' }],
};

function defaultConfig(ruleType) {
  switch (ruleType) {
    case 'auto_pause': return { action: 'pause_campaign', target: 'meta', days: 3, order_threshold: 0 };
    case 'auto_scale': return { action: 'increase_budget', roas_threshold: 3.0, increase_pct: 20, max_budget: 500000, days: 3 };
    case 'sleep_schedule': return { action: 'pause_all', start_hour: 23, end_hour: 4, resume_after: true };
    case 'balance_alert': return { action: 'telegram_alert', threshold: 200000 };
    case 'performance_alert': return { action: 'telegram_alert', metric: 'roas', threshold: 1.0, condition: 'below', days: 1 };
    default: return {};
  }
}

function fmtRp(n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
}

function ConfigFields({ ruleType, config, onChange }) {
  const update = (key, value) => onChange({ ...config, [key]: value });

  if (ruleType === 'auto_pause') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Field label="Target">
          <select value={config.target || 'meta'} onChange={e => update('target', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            <option value="meta">Meta Ads</option>
            <option value="all">All Sources</option>
          </select>
        </Field>
        <Field label="Days Without Orders">
          <input type="number" min="1" max="30" value={config.days || 3} onChange={e => update('days', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Order Threshold">
          <input type="number" min="0" value={config.order_threshold || 0} onChange={e => update('order_threshold', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Action">
          <select value={config.action || 'pause_campaign'} onChange={e => update('action', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            {(ACTIONS_MAP[ruleType] || []).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Field>
      </div>
    );
  }

  if (ruleType === 'auto_scale') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Field label="ROAS Threshold">
          <input type="number" step="0.1" min="0" value={config.roas_threshold || 3} onChange={e => update('roas_threshold', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Increase %">
          <input type="number" min="1" max="100" value={config.increase_pct || 20} onChange={e => update('increase_pct', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Max Budget (Rp)">
          <input type="number" min="0" value={config.max_budget || 500000} onChange={e => update('max_budget', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Evaluation Days">
          <input type="number" min="1" max="30" value={config.days || 3} onChange={e => update('days', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
      </div>
    );
  }

  if (ruleType === 'sleep_schedule') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Hour (0-23)">
          <input type="number" min="0" max="23" value={config.start_hour ?? 23} onChange={e => update('start_hour', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="End Hour (0-23)">
          <input type="number" min="0" max="23" value={config.end_hour ?? 4} onChange={e => update('end_hour', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Action">
          <select value={config.action || 'pause_all'} onChange={e => update('action', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            {(ACTIONS_MAP[ruleType] || []).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Field>
        <Field label="Resume After">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.resume_after !== false} onChange={e => update('resume_after', e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300 text-sm">Auto-resume after sleep window</span>
          </label>
        </Field>
      </div>
    );
  }

  if (ruleType === 'balance_alert') {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Field label="Balance Threshold (Rp)">
          <input type="number" min="0" value={config.threshold || 200000} onChange={e => update('threshold', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <p className="text-xs text-slate-500">Alert fires via Telegram when balance drops below this amount.</p>
      </div>
    );
  }

  if (ruleType === 'performance_alert') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Field label="Metric">
          <select value={config.metric || 'roas'} onChange={e => update('metric', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            <option value="roas">ROAS</option>
            <option value="spend">Spend</option>
          </select>
        </Field>
        <Field label="Condition">
          <select value={config.condition || 'below'} onChange={e => update('condition', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            <option value="below">Below Threshold</option>
            <option value="above">Above Threshold</option>
          </select>
        </Field>
        <Field label="Threshold">
          <input type="number" step="0.1" min="0" value={config.threshold || 1.0} onChange={e => update('threshold', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Evaluation Days">
          <input type="number" min="1" max="30" value={config.days || 1} onChange={e => update('days', Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary" />
        </Field>
        <Field label="Action">
          <select value={config.action || 'telegram_alert'} onChange={e => update('action', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary">
            {(ACTIONS_MAP[ruleType] || []).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Field>
      </div>
    );
  }

  return null;
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
      {children}
    </div>
  );
}

export function Automation() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [ruleType, setRuleType] = useState('');
  const [name, setName] = useState('');
  const [config, setConfig] = useState({});
  const [enabled, setEnabled] = useState(true);
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const res = await api.get('/api/admin/automation');
      return res.data?.data ?? res.data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) return api.patch(`/api/admin/automation/${data.id}`, data);
      return api.post('/api/admin/automation', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      closeModal();
    },
    onError: (err) => setFormError(err.response?.data?.error || 'Failed to save rule'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/admin/automation/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, rule_type, name: n, config: c, enabled: e }) =>
      api.patch(`/api/admin/automation/${id}`, { rule_type, name: n, config: c, enabled: !e }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-rules'] }),
  });

  const runMutation = useMutation({
    mutationFn: () => api.post('/api/admin/automation/run'),
  });

  function openCreate() {
    setEditRule(null);
    setRuleType('');
    setName('');
    setConfig({});
    setEnabled(true);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openEdit(rule) {
    setEditRule(rule);
    setRuleType(rule.rule_type);
    setName(rule.name);
    setConfig(typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config);
    setEnabled(!!rule.enabled);
    setFormError('');
    setCreateModalOpen(true);
  }

  function closeModal() {
    setCreateModalOpen(false);
    setEditRule(null);
    setFormError('');
  }

  function handleTypeSelect(type) {
    setRuleType(type);
    setConfig(defaultConfig(type));
    const typeInfo = RULE_TYPES.find(t => t.value === type);
    if (!name && typeInfo) setName(typeInfo.label + ' Rule');
  }

  function handleSave() {
    if (!ruleType || !name.trim()) {
      setFormError('Rule type and name are required');
      return;
    }
    saveMutation.mutate({
      id: editRule?.id,
      rule_type: ruleType,
      name: name.trim(),
      config,
      enabled,
    });
  }

  const columns = [
    {
      accessorKey: 'enabled',
      header: 'Status',
      cell: ({ row }) => {
        const r = row.original;
        return (
          <button
            onClick={() => toggleMutation.mutate(r)}
            className="transition-colors"
            title={r.enabled ? 'Click to disable' : 'Click to enable'}
          >
            {r.enabled ? (
              <ToggleRight className="w-7 h-7 text-green-success" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-500" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => <span className="font-semibold text-white">{getValue()}</span>,
    },
    {
      accessorKey: 'rule_type',
      header: 'Type',
      cell: ({ getValue }) => {
        const t = RULE_TYPES.find(x => x.value === getValue());
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-primary/10 text-indigo-light border border-indigo-primary/20">
            {t?.icon} {t?.label || getValue()}
          </span>
        );
      },
    },
    {
      accessorKey: 'config',
      header: 'Config',
      cell: ({ getValue }) => {
        const cfg = typeof getValue() === 'string' ? JSON.parse(getValue()) : getValue();
        const keys = Object.keys(cfg || {}).filter(k => k !== 'action').slice(0, 3);
        return (
          <span className="text-xs text-slate-400 font-mono">
            {keys.map(k => `${k}=${cfg[k]}`).join(', ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'last_triggered_at',
      header: 'Last Triggered',
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span className="text-slate-500 text-xs">Never</span>;
        return (
          <span className="text-slate-400 text-xs">
            {new Date(v * 1000).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row.original)} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Edit">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => { if (confirm('Delete this rule?')) deleteMutation.mutate(row.original.id); }} className="p-1.5 text-slate-400 hover:text-red-error transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const rulesList = Array.isArray(rules) ? rules : [];
  const enabledCount = rulesList.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Automation Rules
          </h1>
          <p className="text-slate-400 mt-2">
            {enabledCount} active rule{enabledCount !== 1 ? 's' : ''} · Voluum-style automation engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-3 border border-white/10 text-slate-300 hover:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
          >
            {runMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Now
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg text-sm font-bold hover:bg-indigo-light transition-all"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>
      </div>

      {runMutation.data && (
        <GlassCard>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-warning" />
            <div>
              <span className="text-sm font-bold text-white">
                Run complete: {runMutation.data.data?.triggered || 0} rule(s) triggered
              </span>
              {runMutation.data.data?.results?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {runMutation.data.data.results.map((r, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      {r.ruleName}: {r.error ? `Error — ${r.error}` : `${r.action} → ${JSON.stringify(r.result)}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      <DataTable data={rulesList} columns={columns} isLoading={isLoading} />

      <Modal
        open={createModalOpen}
        onOpenChange={closeModal}
        title={editRule ? 'Edit Rule' : 'Create Automation Rule'}
        description="Configure when the rule triggers and what action it takes."
        size="lg"
      >
        <div className="space-y-5 mt-4">
          {!editRule && !ruleType && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Select Rule Type</label>
              <div className="grid grid-cols-1 gap-2">
                {RULE_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => handleTypeSelect(t.value)}
                    className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-lg text-left hover:border-indigo-primary/40 transition-all"
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{t.label}</div>
                      <div className="text-xs text-slate-400">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(ruleType || editRule) && (
            <>
              <Field label="Rule Name">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-primary"
                  placeholder="My Automation Rule"
                />
              </Field>

              {ruleType && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase">
                      {RULE_TYPES.find(t => t.value === ruleType)?.icon}{' '}
                      {RULE_TYPES.find(t => t.value === ruleType)?.label} Configuration
                    </label>
                    {!editRule && (
                      <button onClick={() => { setRuleType(''); setConfig({}); }} className="text-xs text-indigo-light hover:underline">
                        Change type
                      </button>
                    )}
                  </div>
                  <ConfigFields ruleType={ruleType} config={config} onChange={setConfig} />
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-400 uppercase">Enabled</label>
                <button onClick={() => setEnabled(!enabled)}>
                  {enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-success" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500" />
                  )}
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">{formError}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeModal} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light disabled:opacity-50 transition-all"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
