import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import {
  Search, Eye, Copy, Download, Save, Upload, Trash2, Edit3, Plus,
  FileText, Grid3X3, X, Check, Globe, Star, ChevronDown, Pencil,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', color: 'bg-white/10 text-white' },
  { id: 'sweepstakes', label: 'Sweepstakes', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'vsl', label: 'VSL', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'ecommerce', label: 'E-Commerce', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'crypto', label: 'Crypto', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'dating', label: 'Dating', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'gaming', label: 'Gaming', color: 'bg-green-400/20 text-green-400' },
  { id: 'finance', label: 'Finance', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'leadgen', label: 'Lead Gen', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'custom', label: 'Custom', color: 'bg-slate-500/20 text-slate-400' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function getCategoryBadge(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP.custom;
}

/* ─── Field Renderer ─── */
function FieldInput({ field, value, onChange }) {
  const base = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors';
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(e.target.value)} className={base}>
        <option value="">Select...</option>
        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#6366f1'} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#6366f1" className={base + ' flex-1'} />
      </div>
    );
  }
  if (field.type === 'textarea') {
    return <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} placeholder={field.placeholder || field.label} className={base + ' resize-y'} />;
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
      value={value ?? ''}
      onChange={e => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder || field.label}
      className={base}
    />
  );
}

/* ─── Live Preview (iframe) ─── */
function LivePreview({ html }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white" style={{ minHeight: 400 }}>
      <iframe
        srcDoc={html}
        title="Template Preview"
        className="w-full h-full border-0"
        style={{ minHeight: 400 }}
        sandbox="allow-scripts"
      />
    </div>
  );
}

/* ─── Template Card ─── */
function TemplateCard({ template, onSelect, onUse }) {
  const badge = getCategoryBadge(template.category);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="group cursor-pointer overflow-hidden hover:border-indigo-500/40 transition-all" onClick={() => onSelect(template)}>
        {/* Mini preview */}
        <div className="relative h-40 overflow-hidden bg-white/5">
          {template.html_content ? (
            <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%]">
              <iframe srcDoc={template.html_content} className="w-full h-full border-0" sandbox="allow-scripts" title="" tabIndex={-1} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <FileText className="w-10 h-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {template.ctr_score > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              <Star className="w-3 h-3" />
              {Number(template.ctr_score).toFixed(1)}% CTR
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{template.name}</h3>
            <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          {template.description && (
            <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
          )}
          <button
            onClick={e => { e.stopPropagation(); onUse(template); }}
            className="w-full mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            Use Template
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ─── Full-Screen Preview Modal ─── */
function PreviewModal({ template, open, onClose, onUse }) {
  if (!template) return null;
  const badge = getCategoryBadge(template.category);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">{template.name}</h2>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onUse(template)} className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                Use Template
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
          </div>
          {/* Preview */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-5xl mx-auto">
              <LivePreview html={template.html_content || '<div style="color:#999;text-align:center;padding:80px;">No preview available</div>'} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Customize Panel ─── */
function CustomizePanel({ template, onBack }) {
  const queryClient = useQueryClient();
  const fields = useMemo(() => {
    if (!template?.fields) return [];
    try { return typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields; } catch { return []; }
  }, [template]);

  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const defaults = {};
    for (const f of fields) {
      if (f.default !== undefined) defaults[f.key] = f.default;
      else if (f.type === 'color') defaults[f.key] = '#6366f1';
      else defaults[f.key] = '';
    }
    setValues(defaults);
  }, [fields]);

  const generatedHtml = useMemo(() => {
    let html = template.html_content || '';
    for (const [key, val] of Object.entries(values)) {
      html = html.replaceAll(`{{${key}}}`, String(val ?? ''));
    }
    return html;
  }, [template.html_content, values]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/templates/landing', {
        name: `${template.name} (Copy)`,
        category: template.category,
        description: template.description,
        html_content: generatedHtml,
        fields: template.fields,
        is_public: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-templates'] });
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">&larr; Back to gallery</button>
        <h2 className="text-lg font-semibold text-white">{template.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields */}
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Customize</h3>
          {fields.length === 0 ? (
            <p className="text-xs text-slate-400">This template has no configurable fields.</p>
          ) : (
            fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs text-slate-400 mb-1">
                  {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <FieldInput field={field} value={values[field.key]} onChange={val => setValues(v => ({ ...v, [field.key]: val }))} />
              </div>
            ))
          )}
          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={() => { setSaving(true); saveMutation.mutate(); }}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save to My Templates'}
            </button>
          </div>
        </GlassCard>

        {/* Live preview */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Live Preview</h3>
          <LivePreview html={generatedHtml} />
        </div>
      </div>
    </div>
  );
}

/* ─── Import Tab ─── */
function ImportTab() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('paste');
  const [html, setHtml] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('custom');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const importMutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/templates/landing/import', { name, category, html_content: html });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-templates'] });
      setHtml(''); setName(''); setCategory('custom'); setError('');
      setImporting(false);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Import failed');
      setImporting(false);
    },
  });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.html')) { setError('Only .html files allowed'); return; }
    const reader = new FileReader();
    reader.onload = () => { setHtml(reader.result); setError(''); };
    reader.readAsText(file);
  };

  const inputBase = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors';

  return (
    <GlassCard className="p-6 space-y-5 max-w-3xl">
      <h3 className="text-base font-semibold text-white">Import Template</h3>

      <div className="flex gap-3">
        <button onClick={() => setMode('paste')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'paste' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          Paste HTML
        </button>
        <button onClick={() => setMode('file')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === 'file' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
          Upload File
        </button>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Template Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Template" className={inputBase} />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputBase}>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {mode === 'paste' ? (
        <div>
          <label className="block text-xs text-slate-400 mb-1">HTML Content</label>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            rows={12}
            placeholder="<!DOCTYPE html>..."
            className={inputBase + ' font-mono text-xs resize-y'}
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Upload .html file</label>
          <input type="file" accept=".html" onChange={handleFile} className="text-sm text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:cursor-pointer" />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {html && (
        <div>
          <h4 className="text-xs text-slate-400 mb-2">Preview</h4>
          <LivePreview html={html} />
        </div>
      )}

      <button
        onClick={() => { setImporting(true); importMutation.mutate(); }}
        disabled={importing || !html || !name}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        <Upload className="w-4 h-4" /> {importing ? 'Importing...' : 'Import Template'}
      </button>
    </GlassCard>
  );
}

/* ─── My Templates Tab ─── */
function MyTemplatesTab({ onEdit }) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['my-templates'],
    queryFn: async () => {
      const res = await api.get('/api/templates/landing/mine');
      return res.data?.data || res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/templates/landing/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-templates'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/templates/landing/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-templates'] }),
  });

  if (isLoading) return <div className="text-slate-400 text-sm">Loading your templates...</div>;
  if (templates.length === 0) return (
    <GlassCard className="p-8 text-center">
      <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
      <p className="text-sm text-slate-400">No templates yet. Save a template or import one to get started.</p>
    </GlassCard>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(tpl => {
        const badge = getCategoryBadge(tpl.category);
        return (
          <GlassCard key={tpl.id} className="overflow-hidden">
            {/* Mini preview */}
            <div className="relative h-36 overflow-hidden bg-white/5">
              {tpl.html_content ? (
                <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%]">
                  <iframe srcDoc={tpl.html_content} className="w-full h-full border-0" sandbox="allow-scripts" title="" tabIndex={-1} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500"><FileText className="w-8 h-8" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white truncate">{tpl.name}</h3>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => onEdit(tpl)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"><Pencil className="w-3 h-3" /> Edit</button>
                <button onClick={() => duplicateMutation.mutate(tpl.id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"><Copy className="w-3 h-3" /> Duplicate</button>
                <button onClick={() => { if (confirm('Delete this template?')) deleteMutation.mutate(tpl.id); }} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export function LandingPageBuilder() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('gallery');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [customizeTemplate, setCustomizeTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);

  const tabs = [
    { id: 'gallery', label: 'Built-in Templates', icon: Grid3X3 },
    { id: 'mine', label: 'My Templates', icon: FileText },
    { id: 'import', label: 'Import', icon: Upload },
  ];

  // Fetch public templates
  const { data: allTemplates = [], isLoading } = useQuery({
    queryKey: ['landing-templates'],
    queryFn: async () => {
      const res = await api.get('/api/templates/landing');
      return res.data?.data || res.data || [];
    },
  });

  // Filter
  const filtered = useMemo(() => {
    return allTemplates.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTemplates, category, search]);

  // If customizing a template
  if (customizeTemplate) {
    return (
      <div className="space-y-6">
        <CustomizePanel template={customizeTemplate} onBack={() => setCustomizeTemplate(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Landing Page Builder</h1>
          <p className="text-sm text-slate-400 mt-1">Choose a template and customize it for your campaign</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'gallery' && (
          <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
            {/* Category filter + Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      category === cat.id ? 'bg-indigo-600 text-white' : `${cat.color} hover:opacity-80`
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="text-slate-400 text-sm">Loading templates...</div>
            ) : filtered.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No templates found. Try a different category or search term.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(tpl => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    onSelect={setPreviewTemplate}
                    onUse={setCustomizeTemplate}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'mine' && (
          <motion.div key="mine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <MyTemplatesTab onEdit={setEditTemplate} />
          </motion.div>
        )}

        {activeTab === 'import' && (
          <motion.div key="import" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <ImportTab />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <PreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(tpl) => { setPreviewTemplate(null); setCustomizeTemplate(tpl); }}
      />
    </div>
  );
}
