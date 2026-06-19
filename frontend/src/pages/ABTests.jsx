import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Plus, Trash2, Loader2, CheckCircle, BarChart3, ChevronRight, X, Trophy,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-400',
  draft: 'bg-slate-500/20 text-slate-400',
};

export function ABTests() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    campaign_id: '',
    name: '',
    variants: [
      { name: 'Control', weight: 50 },
      { name: 'Variant A', weight: 50 },
    ],
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [createError, setCreateError] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const res = await api.get('/api/enterprise/ab-tests');
      return res.data;
    },
  });

  const tests = data?.data || data || [];

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['ab-test-results', selectedTest],
    queryFn: async () => {
      const res = await api.get(`/api/enterprise/ab-tests/${selectedTest}/results`);
      return res.data;
    },
    enabled: !!selectedTest,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => api.post('/api/enterprise/ab-tests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      setShowCreate(false);
      setCreateForm({ campaign_id: '', name: '', variants: [{ name: 'Control', weight: 50 }, { name: 'Variant A', weight: 50 }] });
      setCreateError(null);
    },
    onError: (err) => {
      setCreateError(err.response?.data?.error || 'Failed to create A/B test');
    },
  });

  function addVariant() {
    setCreateForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: `Variant ${String.fromCharCode(65 + prev.variants.length)}`, weight: 0 }],
    }));
  }

  function removeVariant(index) {
    if (createForm.variants.length <= 2) return;
    setCreateForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  function updateVariant(index, field, value) {
    setCreateForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: field === 'weight' ? Number(value) || 0 : value } : v),
    }));
  }

  function formatTimestamp(ts) {
    if (!ts) return '—';
    return new Date(ts * 1000 || ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const results = resultsData?.variants || resultsData?.data || [];
  const maxRate = results.length > 0 ? Math.max(...results.map(r => r.conversion_rate || 0), 0.01) : 1;

  if (isLoading) return <div className="text-white p-8">Loading A/B tests...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            A/B Tests
          </h1>
          <p className="text-slate-400 mt-2">Create and monitor A/B test campaigns with variant performance</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all"
        >
          <Plus className="w-4 h-4" />
          New A/B Test
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4">Create A/B Test</h3>
              {createError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Campaign ID</label>
                    <input
                      type="text"
                      value={createForm.campaign_id}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, campaign_id: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                      placeholder="campaign_123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Test Name</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                      placeholder="Landing Page Headline Test"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase">Variants</label>
                    <button
                      onClick={addVariant}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>
                  {createForm.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => updateVariant(i, 'name', e.target.value)}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-primary text-sm"
                        placeholder="Variant name"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={v.weight}
                          onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                          min={0}
                          max={100}
                          className="w-20 bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-primary text-sm text-center"
                        />
                        <span className="text-slate-400 text-xs">%</span>
                      </div>
                      {createForm.variants.length > 2 && (
                        <button
                          onClick={() => removeVariant(i)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">
                    Total weight: {createForm.variants.reduce((s, v) => s + v.weight, 0)}%
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => createMutation.mutate(createForm)}
                    disabled={createMutation.isPending || !createForm.name || !createForm.campaign_id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FlaskConical className="w-4 h-4" />
                    )}
                    Create Test
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

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tests.length === 0 ? (
          <GlassCard className="lg:col-span-2">
            <div className="py-12 text-center text-slate-500">
              <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No A/B tests yet. Create one to start optimizing.
            </div>
          </GlassCard>
        ) : (
          tests.map((test) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer ${selectedTest === test.id ? 'ring-2 ring-indigo-primary rounded-xl' : ''}`}
              onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
            >
              <GlassCard>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold">{test.name || 'Untitled Test'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{test.campaign_id || '—'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[test.status] || STATUS_COLORS.draft}`}>
                    {test.status || 'draft'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{(test.variants || []).length} variants</span>
                  <span>Created {formatTimestamp(test.created_at)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-indigo-400 text-xs">
                  <BarChart3 className="w-3 h-3" />
                  {selectedTest === test.id ? 'Hide results' : 'View results'}
                  <ChevronRight className={`w-3 h-3 transition-transform ${selectedTest === test.id ? 'rotate-90' : ''}`} />
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Results Panel */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Results
                </h3>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resultsLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No results data yet.</div>
              ) : (
                <div className="space-y-6">
                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase">Variant</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Clicks</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Conversions</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Conv. Rate</th>
                          <th className="pb-3 text-xs font-bold text-slate-400 uppercase text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {results.map((r, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="py-3 text-sm text-white font-medium flex items-center gap-2">
                              {i === 0 && results.every((x) => (r.conversion_rate || 0) >= (x.conversion_rate || 0)) && (
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {r.name || r.variant_name || `Variant ${i}`}
                            </td>
                            <td className="py-3 text-sm text-slate-300 text-right">{(r.clicks || 0).toLocaleString()}</td>
                            <td className="py-3 text-sm text-slate-300 text-right">{(r.conversions || 0).toLocaleString()}</td>
                            <td className="py-3 text-sm text-right">
                              <span className={`font-bold ${(r.conversion_rate || 0) === maxRate ? 'text-green-400' : 'text-slate-300'}`}>
                                {(r.conversion_rate || 0).toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 text-sm text-slate-300 text-right font-mono">
                              ${(r.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* CSS Bar Chart */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Conversion Rate by Variant</h4>
                    <div className="space-y-3">
                      {results.map((r, i) => {
                        const rate = r.conversion_rate || 0;
                        const pct = maxRate > 0 ? (rate / maxRate) * 100 : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-300">{r.name || r.variant_name || `Variant ${i}`}</span>
                              <span className="text-slate-400 font-mono">{rate.toFixed(2)}%</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${i === 0 ? 'bg-indigo-primary' : i === 1 ? 'bg-cyan-500' : i === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
