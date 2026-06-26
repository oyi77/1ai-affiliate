import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Check } from 'lucide-react';

/**
 * Reusable template selector modal — BeMob-style grid with search & category filter.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {(v:boolean)=>void} props.onOpenChange
 * @param {Array} props.templates — array of { id, name, icon, category, description, ... }
 * @param {Object} props.categoryMap — { [id]: { label, color } }
 * @param {(tpl:Object)=>void} props.onSelect
 * @param {string} props.title
 */
export function TemplateSelector({ open, onOpenChange, templates, categoryMap, onSelect, title = 'Choose Template' }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = [...new Set(templates.map(t => t.category))];
    return ['all', ...cats];
  }, [templates]);

  const filtered = useMemo(() => {
    let list = templates;
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, activeCategory, search]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface-1 border border-white/[0.08] rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} templates available</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="px-6 py-2.5 border-b border-white/[0.06] flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => {
              const meta = cat === 'all' ? { label: 'All', color: 'bg-white/[0.06] text-slate-300' } : (categoryMap[cat] || { label: cat, color: 'bg-white/[0.06] text-slate-300' });
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No templates found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map(tpl => {
                  const catMeta = categoryMap[tpl.category];
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => { onSelect(tpl); onOpenChange(false); }}
                      className="group flex flex-col items-start gap-2 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-2xl">{tpl.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{tpl.name}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
                      {catMeta && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${catMeta.color}`}>
                          {catMeta.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
