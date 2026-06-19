import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

/**
 * Generic template picker — works for any entity type.
 * Renders a grid of template cards, then a dynamic form when one is selected.
 *
 * @param {string} entityType — 'traffic-sources' | 'advertisers' | 'offers' | etc.
 * @param {function} onSubmit — called with merged template + user values
 * @param {string} [title] — modal title
 */
export default function TemplatePicker({ entityType, onSubmit, title, children }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get(`/templates/${entityType}`).then(r => {
      setTemplates(r.data?.data || []);
    }).finally(() => setLoading(false));
  }, [entityType, open]);

  const selectTemplate = (tpl) => {
    setSelected(tpl);
    const defaults = {};
    for (const f of tpl.fields) {
      if (f.default !== undefined) defaults[f.key] = f.default;
    }
    setValues(defaults);
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ _template: selected?.id, ...values });
    setOpen(false);
    setSelected(null);
    setValues({});
  };

  const updateValue = (key, val) => setValues(v => ({ ...v, [key]: val }));

  const visibleFields = selected?.fields?.filter(f => f.type !== 'hidden') || [];

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)}>{children || (
        <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          + Create from Template
        </button>
      )}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setOpen(false); setSelected(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface-2 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">{title || `Create ${entityType.replace(/-/g, ' ')}`}</h3>

              {!selected ? (
                /* Template Grid */
                loading ? <div className="text-gray-400 text-sm">Loading templates...</div> : (
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map(tpl => (
                      <button
                        key={tpl.id}
                        onClick={() => selectTemplate(tpl)}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 text-left transition-all"
                      >
                        <span className="text-2xl">{tpl.icon}</span>
                        <div className="mt-2 font-medium text-white text-sm">{tpl.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{tpl.description}</div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Dynamic Form */
                <div className="space-y-3">
                  <button onClick={() => setSelected(null)} className="text-xs text-indigo-400 hover:text-indigo-300 mb-2">
                    ← Back to templates
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{selected.icon}</span>
                    <span className="font-medium text-white">{selected.name}</span>
                  </div>

                  {visibleFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-400 mb-1">
                        {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={values[field.key] || ''}
                          onChange={e => updateValue(field.key, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                        >
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                          value={values[field.key] ?? ''}
                          onChange={e => updateValue(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                          placeholder={field.placeholder || field.label}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                  >
                    Create
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
