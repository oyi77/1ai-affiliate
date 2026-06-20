import { useState, useEffect } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import {
  Plus, Eye, Pencil, Trash2, Copy, Globe, Lock, X, Save, FileText,
} from 'lucide-react';

const CATEGORIES = [
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

const emptyForm = {
  name: '',
  category: 'custom',
  description: '',
  html_content: '',
  fields: [],
  is_public: true,
};

function CategoryBadge({ category }) {
  const badge = CATEGORY_MAP[category] || CATEGORY_MAP.custom;
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>;
}

/* ─── Template Editor Modal ─── */
function TemplateEditorModal({ open, onOpenChange, template, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [fieldDefs, setFieldDefs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name || '',
        category: template.category || 'custom',
        description: template.description || '',
        html_content: template.html_content || '',
        is_public: template.is_public ?? true,
      });
      try {
        const f = template.fields;
        setFieldDefs(Array.isArray(f) ? f : typeof f === 'string' ? JSON.parse(f) : []);
      } catch { setFieldDefs([]); }
    } else {
      setForm(emptyForm);
      setFieldDefs([]);
    }
  }, [template, open]);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addField = () => {
    setFieldDefs(fd => [...fd, { key: '', label: '', type: 'text', default: '', placeholder: '', required: false }]);
  };
  const updateField = (idx, key, val) => {
    setFieldDefs(fd => fd.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  };
  const removeField = (idx) => {
    setFieldDefs(fd => fd.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...form, fields: fieldDefs });
    setSaving(false);
  };

  const inputBase = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors';

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={template ? 'Edit Template' : 'Create Template'} size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Template name" className={inputBase} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Category</label>
            <select value={form.category} onChange={e => updateForm('category', e.target.value)} className={inputBase}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Description</label>
          <input type="text" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Short description" className={inputBase} />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_public} onChange={e => updateForm('is_public', e.target.checked)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-sm text-slate-300 flex items-center gap-1">
              {form.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {form.is_public ? 'Public' : 'Private'}
            </span>
          </label>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">HTML Content</label>
          <textarea
            value={form.html_content}
            onChange={e => updateForm('html_content', e.target.value)}
            rows={12}
            placeholder="<!DOCTYPE html>..."
            className={inputBase + ' font-mono text-xs resize-y'}
          />
        </div>

        {/* Fields Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400">Configurable Fields</label>
            <button onClick={addField} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <Plus className="w-3 h-3" /> Add Field
            </button>
          </div>
          {fieldDefs.length === 0 ? (
            <p className="text-xs text-slate-500">No fields defined. Users won't be able to customize this template.</p>
          ) : (
            <div className="space-y-2">
              {fieldDefs.map((field, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input type="text" value={field.key} onChange={e => updateField(idx, 'key', e.target.value)} placeholder="key" className={inputBase + ' text-xs'} />
                    <input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} placeholder="Label" className={inputBase + ' text-xs'} />
                    <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className={inputBase + ' text-xs'}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="color">Color</option>
                      <option value="select">Select</option>
                      <option value="textarea">Textarea</option>
                      <option value="password">Password</option>
                      <option value="hidden">Hidden</option>
                    </select>
                    <input type="text" value={field.default || ''} onChange={e => updateField(idx, 'default', e.target.value)} placeholder="Default" className={inputBase + ' text-xs'} />
                  </div>
                  <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-300 transition-colors mt-1"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Preview Modal ─── */
function TemplatePreviewModal({ template, open, onOpenChange }) {
  if (!template) return null;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={template.name} size="xl">
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white" style={{ minHeight: 400 }}>
        <iframe
          srcDoc={template.html_content || '<div style="color:#999;text-align:center;padding:80px;">No content</div>'}
          title="Preview"
          className="w-full h-full border-0"
          style={{ minHeight: 400 }}
          sandbox="allow-scripts"
        />
      </div>
    </Modal>
  );
}

/* ─── Main ─── */
export function TemplateManager() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data: templates = [], isLoading } = useSafeQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      const res = await api.get('/api/templates/landing');
      return res.data?.data || res.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editTemplate?.id) {
        return api.put(`/api/templates/landing/${editTemplate.id}`, data);
      }
      return api.post('/api/templates/landing', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setEditorOpen(false);
      setEditTemplate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/templates/landing/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-templates'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/api/templates/landing/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-templates'] }),
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="text-white font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
      accessorKey: 'owner_id',
      header: 'Owner',
      cell: ({ row }) => <span className="text-slate-400 text-xs">{row.original.owner_id ? `User #${row.original.owner_id}` : 'System'}</span>,
    },
    {
      accessorKey: 'is_public',
      header: 'Status',
      cell: ({ row }) => row.original.is_public
        ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><Globe className="w-3 h-3" /> Public</span>
        : <span className="flex items-center gap-1 text-slate-400 text-xs"><Lock className="w-3 h-3" /> Private</span>,
    },
    {
      accessorKey: 'ctr_score',
      header: 'CTR Score',
      cell: ({ row }) => {
        const score = Number(row.original.ctr_score || 0);
        return score > 0 ? <span className="text-yellow-400 text-xs">{score.toFixed(1)}%</span> : <span className="text-slate-500 text-xs">—</span>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        const d = row.original.created_at;
        return d ? <span className="text-slate-400 text-xs">{new Date(d).toLocaleDateString()}</span> : <span className="text-slate-500 text-xs">—</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setPreviewTemplate(row.original)} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setEditTemplate(row.original); setEditorOpen(true); }} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => duplicateMutation.mutate(row.original.id)} className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { if (confirm('Archive this template?')) deleteMutation.mutate(row.original.id); }}
            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Template Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Manage all landing page templates</p>
        </div>
        <button
          onClick={() => { setEditTemplate(null); setEditorOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4">
          <DataTable data={templates} columns={columns} isLoading={isLoading} emptyMessage="No templates found" />
        </div>
      </GlassCard>

      {/* Editor Modal */}
      <TemplateEditorModal
        open={editorOpen}
        onOpenChange={(v) => { if (!v) setEditTemplate(null); setEditorOpen(v); }}
        template={editTemplate}
        onSave={(data) => saveMutation.mutateAsync(data)}
      />

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
      />
    </div>
  );
}
