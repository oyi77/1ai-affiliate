import { formatCurrency } from '../lib/currency';
import { useState } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import { FlaskConical, Plus, Trash2, Loader2, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { ErrorState } from '../components/ErrorState';

const STATUS_STYLES = {
  active: 'bg-emerald-500/20 text-emerald-400',
  paused: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-blue-500/20 text-blue-400',
  draft: 'bg-slate-500/20 text-slate-400',
};

function BarChart({ results }) {
  const maxConversions = Math.max(...results.map((r) => r.conversions || 0), 1);

  if (isError && (!tests || (Array.isArray(tests) && !tests.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-3">
      {results.map((r, i) => {
        const pct = maxConversions > 0 ? ((r.conversions || 0) / maxConversions) * 100 : 0;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{r.name || r.variant_name || `Variant ${i + 1}`}</span>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{(r.clicks || 0).toLocaleString()} clicks</span>
                <span>{(r.conversions || 0).toLocaleString()} conv</span>
                <span className="text-white font-medium">{(r.conversion_rate || 0).toFixed(2)}%</span>
                <span>{formatCurrency(r.revenue || 0)}</span>
              </div>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  backgroundColor: i === 0 ? '#6366f1' : i === 1 ? '#06b6d4' : i === 2 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ABTests() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    campaign_id: '',
    name: '',
    variants: [
      { name: 'Control', weight: 50 },
      { name: 'Variant A', weight: 50 },
    ],
  });

  const { data: tests = [], isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const { data } = await api.get('/api/enterprise/ab-tests');
      return Array.isArray(data) ? data : data?.tests || [];
    },
  });

  const { data: results, isLoading: resultsLoading } = useSafeQuery({
    queryKey: ['ab-test-results', expandedId],
    queryFn: async () => {
      const { data } = await api.get(`/api/enterprise/ab-tests/${expandedId}/results`);
      return data;
    },
    enabled: !!expandedId,
  });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/api/enterprise/ab-tests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      setCreateOpen(false);
      setForm({
        campaign_id: '',
        name: '',
        variants: [
          { name: 'Control', weight: 50 },
          { name: 'Variant A', weight: 50 },
        ],
      });
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Operation failed');
    },
  });

  const addVariant = () => {
    setForm((p) => ({
      ...p,
      variants: [...p.variants, { name: `Variant ${String.fromCharCode(65 + p.variants.length)}`, weight: 0 }],
    }));
  };

  const removeVariant = (idx) => {
    setForm((p) => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }));
  };

  const updateVariant = (idx, field, value) => {
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => (i === idx ? { ...v, [field]: field === 'weight' ? Number(value) || 0 : value } : v)),
    }));
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = typeof ts === 'number' ? new Date(ts > 1e12 ? ts : ts * 1000) : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const variantResults = results?.variants || results?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">A/B Tests</h1>
          <p className="text-slate-400 text-sm mt-1">Manage experiments and view conversion results</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New A/B Test
        </button>
      </div>

      {/* Test list */}
      <GlassCard>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No A/B tests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tests.map((test) => (
              <div key={test.id}>
                <button
                  onClick={() => toggleExpand(test.id)}
                  className="w-full flex items-center justify-between py-4 px-2 hover:bg-white/[0.02] rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedId === test.id ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">{test.name || 'Untitled Test'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Campaign: {test.campaign_id || '—'} &middot; {(test.variants || []).length} variants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDate(test.created_at)}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_STYLES[test.status] || STATUS_STYLES.draft}`}>
                      {test.status || 'draft'}
                    </span>
                  </div>
                </button>

                {/* Results panel */}
                {expandedId === test.id && (
                  <div className="px-2 pb-4">
                    <GlassCard className="ml-7">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-white">Results</h3>
                      </div>
                      {resultsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        </div>
                      ) : variantResults.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4">No results data yet</p>
                      ) : (
                        <BarChart results={variantResults} />
                      )}
                    </GlassCard>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Create modal */}
      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Create A/B Test" description="Set up a new experiment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Campaign ID</label>
            <input
              type="text"
              value={form.campaign_id}
              onChange={(e) => setForm((p) => ({ ...p, campaign_id: e.target.value }))}
              placeholder="campaign_123"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Test Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Landing Page Test"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Variants</label>
            <div className="space-y-2">
              {form.variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                    placeholder="Variant name"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    value={v.weight}
                    onChange={(e) => updateVariant(idx, 'weight', e.target.value)}
                    min={0}
                    max={100}
                    className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-xs text-slate-500 w-4">%</span>
                  {form.variants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Add variant
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name || !form.campaign_id}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              Create Test
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
