import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, Route, Play, Pause, Trash2, Sliders } from 'lucide-react';

const GEO_OPTIONS = [
  'ID', 'MY', 'TH', 'VN', 'PH', 'SG', 'BN', 'MM', 'KH', 'LA',
  'US', 'GB', 'AU', 'JP', 'KR', 'CN', 'IN', 'BR', 'DE', 'FR',
];
const DEVICE_OPTIONS = ['mobile', 'desktop', 'tablet'];
const OS_OPTIONS = ['android', 'ios', 'windows', 'macos', 'linux'];
const BROWSER_OPTIONS = ['chrome', 'safari', 'firefox', 'edge', 'opera'];
const CONNECTION_OPTIONS = ['wifi', '4g', '3g', '2g'];
const ACTION_OPTIONS = [
  { value: 'redirect', label: 'Redirect' },
  { value: 'show_landing', label: 'Show Landing Page' },
  { value: 'block', label: 'Block' },
];

function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (val) => {
    onChange(
      selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 uppercase">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selected.includes(opt)
                ? 'bg-indigo-primary text-white border border-indigo-primary/50'
                : 'bg-black/20 text-slate-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TrafficRules() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    offer_id: '',
    action: 'redirect',
    target_url: '',
    landing_page_id: '',
    weight: 100,
    priority: 0,
    enabled: true,
    conditions: {
      geo: [],
      device: [],
      os: [],
      browser: [],
      carrier: [],
      connection_type: [],
    },
  });
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: async () => {
      const res = await api.get('/api/admin/traffic-rules');
      return res.data?.data ?? res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        offer_id: data.offer_id ? parseInt(data.offer_id) : undefined,
        landing_page_id: data.landing_page_id ? parseInt(data.landing_page_id) : undefined,
      };
      if (editRule) {
        return api.patch(`/api/admin/traffic-rules/${editRule.id}`, payload);
      }
      return api.post('/api/admin/traffic-rules', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['traffic-rules']);
      setCreateModalOpen(false);
      setEditRule(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/api/admin/traffic-rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['traffic-rules']),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => api.patch(`/api/admin/traffic-rules/${id}`, { enabled }),
    onSuccess: () => queryClient.invalidateQueries(['traffic-rules']),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      offer_id: '',
      action: 'redirect',
      target_url: '',
      landing_page_id: '',
      weight: 100,
      priority: 0,
      enabled: true,
      conditions: {
        geo: [],
        device: [],
        os: [],
        browser: [],
        carrier: [],
        connection_type: [],
      },
    });
  };

  const openEdit = (rule) => {
    setEditRule(rule);
    const cond = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions) : (rule.conditions || {});
    setFormData({
      name: rule.name || '',
      offer_id: rule.offer_id ? String(rule.offer_id) : '',
      action: rule.action || 'redirect',
      target_url: rule.target_url || '',
      landing_page_id: rule.landing_page_id ? String(rule.landing_page_id) : '',
      weight: rule.weight || 100,
      priority: rule.priority || 0,
      enabled: rule.enabled === 1 || rule.enabled === true,
      conditions: {
        geo: cond.geo || [],
        device: cond.device || [],
        os: cond.os || [],
        browser: cond.browser || [],
        carrier: cond.carrier || [],
        connection_type: cond.connection_type || [],
      },
    });
    setCreateModalOpen(true);
  };

  const updateCondition = (key, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: { ...prev.conditions, [key]: value },
    }));
  };

  const columns = [
    {
      header: 'Rule',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Route className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-semibold text-white">{row.original.name}</div>
            <div className="text-xs text-slate-500">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ getValue }) => {
        const val = getValue();
        const colors = {
          redirect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          show_landing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          block: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colors[val] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
            {val}
          </span>
        );
      },
    },
    {
      header: 'Conditions',
      accessorKey: 'conditions',
      cell: ({ row }) => {
        const cond = typeof row.original.conditions === 'string' ? JSON.parse(row.original.conditions) : (row.original.conditions || {});
        const tags = [];
        if (cond.geo?.length) tags.push(`Geo: ${cond.geo.slice(0, 3).join(', ')}${cond.geo.length > 3 ? '...' : ''}`);
        if (cond.device?.length) tags.push(`Device: ${cond.device.join(', ')}`);
        if (cond.os?.length) tags.push(`OS: ${cond.os.join(', ')}`);
        if (cond.browser?.length) tags.push(`Browser: ${cond.browser.join(', ')}`);
        if (cond.time_of_day) tags.push(`Time: ${cond.time_of_day.start}-${cond.time_of_day.end}`);
        return (
          <div className="flex flex-wrap gap-1">
            {tags.length === 0 ? (
              <span className="text-slate-500 text-xs">No conditions</span>
            ) : (
              tags.map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-300">{t}</span>
              ))
            )}
          </div>
        );
      },
    },
    {
      header: 'Weight',
      accessorKey: 'weight',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm text-slate-300">{getValue()}%</span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm text-indigo-light">{getValue()}</span>
      ),
    },
    {
      header: 'Enabled',
      accessorKey: 'enabled',
      cell: ({ row }) => {
        const isEnabled = row.original.enabled === 1 || row.original.enabled === true;
        return (
          <button
            onClick={() => toggleMutation.mutate({ id: row.original.id, enabled: !isEnabled })}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isEnabled
                ? 'bg-green-success/10 text-green-success border border-green-success/20 hover:bg-green-success/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20'
            }`}
          >
            {isEnabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {isEnabled ? 'On' : 'Off'}
          </button>
        );
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Edit"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteMutation.mutate(row.original.id)}
            className="p-1.5 rounded-lg bg-red-500/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Traffic Distribution Rules
          </h1>
          <p className="text-slate-400 mt-2">Route traffic by geo, device, OS, browser, and time conditions</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditRule(null); setCreateModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold shadow-lg shadow-indigo-primary/20 hover:bg-indigo-light hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Total Rules</div>
          <div className="text-3xl font-bold text-white">{rules?.length || 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Active Rules</div>
          <div className="text-3xl font-bold text-green-success">
            {rules?.filter(r => r.enabled === 1 || r.enabled === true).length || 0}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-slate-400 text-sm font-semibold mb-2">Redirect Rules</div>
          <div className="text-3xl font-bold text-cyan-400">
            {rules?.filter(r => r.action === 'redirect').length || 0}
          </div>
        </GlassCard>
      </div>

      <DataTable data={rules || []} columns={columns} isLoading={isLoading} />

      <Modal
        open={createModalOpen}
        onOpenChange={(open) => { if (!open) { setCreateModalOpen(false); setEditRule(null); } }}
        title={editRule ? 'Edit Traffic Rule' : 'Create Traffic Rule'}
        description="Define conditions to route traffic to specific destinations"
        size="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                placeholder="Indonesia Mobile Traffic"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Offer ID (optional)</label>
              <input
                type="number"
                value={formData.offer_id}
                onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                placeholder="123"
              />
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-light" />
              Conditions
            </h3>

            <MultiSelect
              label="Geo (Country)"
              options={GEO_OPTIONS}
              selected={formData.conditions.geo || []}
              onChange={(val) => updateCondition('geo', val)}
            />

            <MultiSelect
              label="Device"
              options={DEVICE_OPTIONS}
              selected={formData.conditions.device || []}
              onChange={(val) => updateCondition('device', val)}
            />

            <MultiSelect
              label="OS"
              options={OS_OPTIONS}
              selected={formData.conditions.os || []}
              onChange={(val) => updateCondition('os', val)}
            />

            <MultiSelect
              label="Browser"
              options={BROWSER_OPTIONS}
              selected={formData.conditions.browser || []}
              onChange={(val) => updateCondition('browser', val)}
            />

            <MultiSelect
              label="Connection Type"
              options={CONNECTION_OPTIONS}
              selected={formData.conditions.connection_type || []}
              onChange={(val) => updateCondition('connection_type', val)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Time Start</label>
                <input
                  type="time"
                  value={formData.conditions.time_of_day?.start || ''}
                  onChange={(e) => updateCondition('time_of_day', {
                    ...formData.conditions.time_of_day,
                    start: e.target.value,
                    end: formData.conditions.time_of_day?.end || '23:59',
                  })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Time End</label>
                <input
                  type="time"
                  value={formData.conditions.time_of_day?.end || ''}
                  onChange={(e) => updateCondition('time_of_day', {
                    ...formData.conditions.time_of_day,
                    start: formData.conditions.time_of_day?.start || '00:00',
                    end: e.target.value,
                  })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                />
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-bold text-white">Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Action Type</label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                >
                  {ACTION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {formData.action === 'redirect' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Target URL</label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                    placeholder="https://example.com"
                  />
                </div>
              )}
              {formData.action === 'show_landing' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Landing Page ID</label>
                  <input
                    type="number"
                    value={formData.landing_page_id}
                    onChange={(e) => setFormData({ ...formData, landing_page_id: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                    placeholder="1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Weight (1-100)</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                className="w-full accent-indigo-primary"
              />
              <div className="text-center text-sm text-white font-mono">{formData.weight}%</div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              />
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-indigo-primary"
                />
                <span className="text-sm text-white font-semibold">Enabled</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setCreateModalOpen(false); setEditRule(null); }}
              className="flex-1 px-4 py-2 bg-surface-3 text-slate-300 rounded-lg hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : (editRule ? 'Update Rule' : 'Create Rule')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
