import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileDown, Plus, Trash2, Loader2, Clock, Mail, FileSpreadsheet, FileJson, Calendar,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

const REPORT_TYPES = [
  { value: 'clicks', label: 'Click Report' },
  { value: 'conversions', label: 'Conversion Report' },
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'campaign', label: 'Campaign Summary' },
  { value: 'affiliate', label: 'Affiliate Performance' },
  { value: 'fraud', label: 'Fraud Report' },
  { value: 'ads', label: 'Ad Spend Report' },
];

const SCHEDULES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
  { value: 'json', label: 'JSON', icon: FileJson },
];

const SCHEDULE_COLORS = {
  daily: 'bg-green-500/20 text-green-400',
  weekly: 'bg-blue-500/20 text-blue-400',
  monthly: 'bg-purple-500/20 text-purple-400',
};

export function ScheduledExports() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    report_type: 'clicks',
    schedule: 'daily',
    format: 'csv',
    email: '',
  });
  const [createError, setCreateError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['scheduled-exports'],
    queryFn: async () => {
      const res = await api.get('/api/enterprise/scheduled-exports');
      return res.data;
    },
  });

  const exports = data?.data || data || [];

  const createMutation = useMutation({
    mutationFn: async (body) => api.post('/api/enterprise/scheduled-exports', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
      setShowCreate(false);
      setCreateForm({ name: '', report_type: 'clicks', schedule: 'daily', format: 'csv', email: '' });
      setCreateError(null);
    },
    onError: (err) => {
      setCreateError(err.response?.data?.error || 'Failed to create scheduled export');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/api/enterprise/scheduled-exports/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] }),
  });

  function formatTimestamp(ts) {
    if (!ts) return 'Never';
    return new Date(ts * 1000 || ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (isLoading) return <div className="text-white p-8">Loading scheduled exports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Scheduled Exports
          </h1>
          <p className="text-slate-400 mt-2">Automate report exports delivered to your inbox on a schedule</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all"
        >
          <Plus className="w-4 h-4" />
          New Export
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Create Scheduled Export</h3>
              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Export Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                    placeholder="Weekly Revenue Summary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Report Type</label>
                    <select
                      value={createForm.report_type}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, report_type: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary text-sm"
                    >
                      {REPORT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Schedule</label>
                    <select
                      value={createForm.schedule}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, schedule: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary text-sm"
                    >
                      {SCHEDULES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Format</label>
                    <div className="flex gap-2">
                      {FORMATS.map(f => (
                        <button
                          key={f.value}
                          onClick={() => setCreateForm(prev => ({ ...prev, format: f.value }))}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            createForm.format === f.value
                              ? 'bg-indigo-primary text-white'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <f.icon className="w-4 h-4" />
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Delivery Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                    placeholder="team@company.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => createMutation.mutate(createForm)}
                    disabled={createMutation.isPending || !createForm.name || !createForm.email}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    Schedule Export
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exports Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Name</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Report Type</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Schedule</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Format</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Email</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Last Run</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileDown className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No scheduled exports yet.
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 text-sm text-white font-medium">{exp.name || '—'}</td>
                    <td className="py-3 text-sm text-slate-300">
                      {REPORT_TYPES.find(t => t.value === exp.report_type)?.label || exp.report_type}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SCHEDULE_COLORS[exp.schedule] || ''}`}>
                        {exp.schedule || '—'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        {exp.format === 'json' ? (
                          <FileJson className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
                        )}
                        {(exp.format || 'csv').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {exp.email || '—'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(exp.last_run)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this scheduled export?')) {
                            deleteMutation.mutate(exp.id);
                          }
                        }}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete export"
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
