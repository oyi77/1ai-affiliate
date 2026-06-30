import { useState, useMemo } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { ErrorState } from '../components/ErrorState';
import { Plus, Trash2, Edit2, Check, X, MapPin, Zap, RefreshCw } from 'lucide-react';

const GEO_OPTIONS = ['ID', 'MY', 'TH', 'VN', 'PH', 'SG', 'BR', 'TW', 'GLOBAL'];

const GEO_COLORS = {
  ID: 'bg-red-500/20 text-red-300 border-red-500/30',
  MY: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  TH: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  VN: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  PH: 'bg-green-500/20 text-green-300 border-green-500/30',
  SG: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  BR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  TW: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  GLOBAL: 'bg-white/10 text-white border-white/20',
};

export function OfferMappingPage() {
  const queryClient = useQueryClient();
  const [autoMapResults, setAutoMapResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({ category: '', offer_id: '', geo: 'ID', priority: 1 });
  const [applyAllBusy, setApplyAllBusy] = useState(false);

  // Fetch current mappings
  const { data: mappingsRaw, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['category-mapping'],
    queryFn: async () => {
      const res = await api.get('/api/smartlink/category-mapping');
      return res.data?.data || [];
    },
  }, []);

  // Fetch offers for dropdown
  const { data: offersRaw } = useSafeQuery({
    queryKey: ['offers-list'],
    queryFn: async () => {
      const res = await api.get('/api/offers');
      return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
    },
  }, []);

  const offers = offersRaw;

  // Build offerId→name map
  const offerNameMap = useMemo(() => {
    const map = {};
    for (const o of offers) {
      map[o.id] = o.name;
    }
    return map;
  }, [offers]);

  const mappings = useMemo(() =>
    (mappingsRaw || []).map(m => ({
      ...m,
      offer_name: offerNameMap[m.offer_id] || `Offer #${m.offer_id}`,
    })),
  [mappingsRaw, offerNameMap]);

  // Add mapping
  const addMutation = useMutation({
    mutationFn: (data) => api.post('/api/smartlink/category-mapping', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-mapping'] });
      setForm({ category: '', offer_id: '', geo: 'ID', priority: 1 });
    },
  });

  // Update mapping
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/smartlink/category-mapping/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-mapping'] });
      setEditingId(null);
      setEditForm({});
    },
  });

  // Delete mapping
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/smartlink/category-mapping/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-mapping'] }),
  });

  // Scan for suggestions
  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await api.get('/api/smartlink/auto-map');
      setAutoMapResults(res.data?.data || null);
    } catch {
      setAutoMapResults(null);
    } finally {
      setScanning(false);
    }
  };

  // Apply single suggestion
  const applySuggestion = async (suggestion) => {
    try {
      await api.post('/api/smartlink/auto-map/apply', {
        offer_id: suggestion.offer_id,
        category: suggestion.suggested_category,
        geo: suggestion.geo || 'ID',
        priority: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['category-mapping'] });
      // Remove from suggestions
      setAutoMapResults(prev => prev ? {
        ...prev,
        suggestions: prev.suggestions.filter(s => s.offer_id !== suggestion.offer_id || s.suggested_category !== suggestion.suggested_category),
        unmapped_offers: Math.max(0, (prev.unmapped_offers || 1) - 1),
      } : null);
    } catch { /* noop */ }
  };

  // Apply all suggestions
  const handleApplyAll = async () => {
    if (!autoMapResults?.suggestions?.length) return;
    setApplyAllBusy(true);
    try {
      for (const s of autoMapResults.suggestions) {
        await api.post('/api/smartlink/auto-map/apply', {
          offer_id: s.offer_id,
          category: s.suggested_category,
          geo: s.geo || 'ID',
          priority: 1,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['category-mapping'] });
      setAutoMapResults(prev => prev ? { ...prev, suggestions: [], unmapped_offers: 0 } : null);
    } catch { /* noop */ } finally {
      setApplyAllBusy(false);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.offer_id) return;
    addMutation.mutate({
      category: form.category,
      offer_id: Number(form.offer_id),
      geo: form.geo,
      priority: Number(form.priority) || 1,
    });
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({ category: row.category, geo: row.geo, priority: row.priority });
  };

  const saveEdit = (id) => {
    if (!editForm.category) return;
    updateMutation.mutate({
      id,
      data: {
        category: editForm.category,
        geo: editForm.geo,
        priority: Number(editForm.priority) || 1,
      },
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offer Mapping</h1>
          <p className="text-sm text-gray-400 mt-1">Map categories to offers for smartlink routing</p>
        </div>
      </div>

      {/* Current Mappings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" /> Current Mappings
          </h2>
          <span className="text-sm text-gray-400">{mappings.length} mapping{mappings.length !== 1 ? 's' : ''}</span>
        </div>

        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading mappings...</div>
        ) : mappings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No mappings yet. Add one below or scan for suggestions.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Offer ID</th>
                  <th className="py-2 px-3">Offer Name</th>
                  <th className="py-2 px-3">Geo</th>
                  <th className="py-2 px-3">Priority</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((row, idx) => {
                  const rowKey = row.id;
                  const isEditing = editingId === row.id;
                  return (
                    <tr key={rowKey} className="border-b border-white/5 hover:bg-white/5 transition">
                      {isEditing ? (
                        <>
                          <td className="py-2 px-3">
                            <input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                              className="bg-white/10 text-white rounded px-2 py-1 w-full text-sm border border-white/10" />
                          </td>
                          <td className="py-2 px-3 text-gray-300">{row.offer_id}</td>
                          <td className="py-2 px-3 text-gray-300">{row.offer_name}</td>
                          <td className="py-2 px-3">
                            <select value={editForm.geo} onChange={e => setEditForm(f => ({ ...f, geo: e.target.value }))}
                              className="bg-white/10 text-white rounded px-2 py-1 text-sm border border-white/10">
                              {GEO_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input type="number" min="1" value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                              className="bg-white/10 text-white rounded px-2 py-1 w-16 text-sm border border-white/10" />
                          </td>
                          <td className="py-2 px-3 text-right flex items-center justify-end gap-1">
                            <button onClick={() => saveEdit(row.id)} className="text-gray-400 hover:text-green-400 p-1" title="Save">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-white p-1" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-3 text-white font-medium">{row.category}</td>
                          <td className="py-2 px-3 text-gray-300">{row.offer_id}</td>
                          <td className="py-2 px-3 text-gray-300">{row.offer_name}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded border ${GEO_COLORS[row.geo] || GEO_COLORS.GLOBAL}`}>
                              {row.geo}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-300">{row.priority}</td>
                          <td className="py-2 px-3 text-right flex items-center justify-end gap-1">
                            <button onClick={() => startEdit({ ...row, category: row.category, offer_id: row.offer_id })}
                              className="text-gray-400 hover:text-blue-400 p-1" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteMutation.mutate(row.id)}
                              className="text-gray-400 hover:text-red-400 p-1" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Auto-Discover Section */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Auto-Discover
          </h2>
          <button onClick={handleScan} disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm transition">
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan for suggestions'}
          </button>
        </div>

        {autoMapResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Unmapped offers: <span className="text-white font-semibold">{autoMapResults.unmapped_offers}</span></span>
              <span className="text-gray-400">Total offers: <span className="text-white">{autoMapResults.total_offers}</span></span>
              <span className="text-gray-400">Existing mappings: <span className="text-white">{autoMapResults.existing_mappings}</span></span>
            </div>

            {autoMapResults.suggestions?.length > 0 && (
              <>
                <div className="flex justify-end">
                  <button onClick={handleApplyAll} disabled={applyAllBusy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm transition">
                    <Check className="w-4 h-4" />
                    {applyAllBusy ? 'Applying...' : `Apply All (${autoMapResults.suggestions.length})`}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-left">
                        <th className="py-2 px-3">Offer Name</th>
                        <th className="py-2 px-3">Vertical</th>
                        <th className="py-2 px-3">Suggested Category</th>
                        <th className="py-2 px-3">Match Score</th>
                        <th className="py-2 px-3">Keywords</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {autoMapResults.suggestions.map((s, i) => (
                        <tr key={`${s.offer_id}-${s.suggested_category}-${i}`} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-2 px-3 text-white">{s.offer_name}</td>
                          <td className="py-2 px-3 text-gray-300">{s.vertical || '—'}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs">
                              {s.suggested_category}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-yellow-400 font-semibold">{s.match_score}</span>
                          </td>
                          <td className="py-2 px-3 text-gray-400 text-xs">
                            {(s.keywords_matched || []).join(', ')}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button onClick={() => applySuggestion(s)}
                              className="px-3 py-1 bg-green-600/80 hover:bg-green-500 text-white rounded text-xs transition">
                              Apply
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {autoMapResults.suggestions?.length === 0 && (
              <p className="text-gray-500 text-sm">No new suggestions found. All offers may already be mapped.</p>
            )}
          </div>
        )}
      </GlassCard>

      {/* Manual Add Form */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-green-400" /> Add Mapping Manually
        </h2>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Category */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <input type="text" value={form.category} required
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="e.g. fashion, kesehatan"
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Offer ID dropdown */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Offer</label>
            <select value={form.offer_id} required
              onChange={e => setForm(f => ({ ...f, offer_id: e.target.value }))}
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-blue-500 focus:outline-none">
              <option value="">Select offer...</option>
              {offers.map(o => (
                <option key={o.id} value={o.id}>{o.name} (#{o.id})</option>
              ))}
            </select>
          </div>

          {/* Geo */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Geo</label>
            <select value={form.geo}
              onChange={e => setForm(f => ({ ...f, geo: e.target.value }))}
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-blue-500 focus:outline-none">
              {GEO_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <input type="number" min="1" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Submit */}
          <div>
            <button type="submit" disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm transition">
              <Plus className="w-4 h-4" />
              {addMutation.isPending ? 'Adding...' : 'Add Mapping'}
            </button>
          </div>
        </form>

        {addMutation.isError && (
          <p className="text-red-400 text-sm mt-3">Error: {addMutation.error?.response?.data?.error || addMutation.error?.message}</p>
        )}
        {addMutation.isSuccess && (
          <p className="text-green-400 text-sm mt-3">Mapping added successfully!</p>
        )}
      </GlassCard>
    </div>
  );
}
