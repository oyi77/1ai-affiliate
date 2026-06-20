import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import { CalendarClock, Plus, Trash2, Loader2, FileDown, Mail, Clock } from 'lucide-react';
import api from '../lib/api';
import { ErrorState } from '../components/ErrorState';

const REPORT_TYPES = [
  { value: 'clicks', label: 'Clicks' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'campaign', label: 'Campaign Summary' },
  { value: 'affiliate', label: 'Affiliate Performance' },
];

const SCHEDULES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export function ScheduledExports() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    report_type: 'clicks',
    schedule: 'daily',
    format: 'csv',
    email: '',
  });

  const { data: exports = [], isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['scheduled-exports'],
    queryFn: async () => {
      const { data } = await api.get('/api/enterprise/scheduled-exports');
      return Array.isArray(data) ? data : data?.exports || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/api/enterprise/scheduled-exports', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
      setCreateOpen(false);
      setForm({ name: '', report_type: 'clicks', schedule: 'daily', format: 'csv', email: '' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/enterprise/scheduled-exports/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] }),
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = typeof ts === 'number' ? new Date(ts > 1e12 ? ts : ts * 1000) : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getReportLabel = (val) => REPORT_TYPES.find((r) => r.value === val)?.label || val;
  const getScheduleLabel = (val) => SCHEDULES.find((s) => s.value === val)?.label || val;

  if (isError && (!exports || (Array.isArray(exports) && !exports.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scheduled Exports</h1>
          <p className="text-slate-400 text-sm mt-1">Automate report delivery to your email</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Export
        </button>
      </div>

      {/* Exports table */}
      <GlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : exports.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No scheduled exports configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Report Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Schedule</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Format</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Last Run</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-white font-medium">{exp.name}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                        {getReportLabel(exp.report_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {getScheduleLabel(exp.schedule)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-1.5 py-0.5 text-xs rounded bg-white/5 text-slate-400 uppercase">
                        {exp.format}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Mail className="w-3 h-3" />
                        {exp.email || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{formatDate(exp.last_run)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(exp.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
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
      <Modal open={createOpen} onOpenChange={setCreateOpen} title="New Scheduled Export" description="Set up automatic report delivery">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Export Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Weekly Revenue Report"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Report Type</label>
              <select
                value={form.report_type}
                onChange={(e) => setForm((p) => ({ ...p, report_type: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-slate-800">{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Schedule</label>
              <select
                value={form.schedule}
                onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {SCHEDULES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-slate-800">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, format: f.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.format === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="team@company.com"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name || !form.email}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
              Create Export
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
