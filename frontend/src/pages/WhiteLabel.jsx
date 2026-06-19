import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Palette, Globe, Image, Save, Loader2, CheckCircle, Eye, FileText, Type } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../lib/api';

export function WhiteLabel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    brand_name: '',
    logo_url: '',
    brand_color: '#6366f1',
    custom_domain: '',
    favicon_url: '',
    footer_html: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['white-label'],
    queryFn: async () => {
      const res = await api.get('/api/enterprise/white-label');
      return res.data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        brand_name: data.brand_name || '',
        logo_url: data.logo_url || '',
        brand_color: data.brand_color || '#6366f1',
        custom_domain: data.custom_domain || '',
        favicon_url: data.favicon_url || '',
        footer_html: data.footer_html || '',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (body) => api.put('/api/enterprise/white-label', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['white-label'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (isLoading) return <div className="text-white p-8">Loading white-label settings...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            White-Label Branding
          </h1>
          <p className="text-slate-400 mt-2">Customize your portal appearance with your own branding</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              Brand Identity
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" /> Brand Name
                </label>
                <input
                  type="text"
                  value={form.brand_name}
                  onChange={(e) => update('brand_name', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Logo URL
                </label>
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={(e) => update('logo_url', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                  placeholder="https://cdn.example.com/logo.svg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.brand_color}
                    onChange={(e) => update('brand_color', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.brand_color}
                    onChange={(e) => update('brand_color', e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Custom Domain
                </label>
                <input
                  type="text"
                  value={form.custom_domain}
                  onChange={(e) => update('custom_domain', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                  placeholder="portal.yourdomain.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Favicon URL
                </label>
                <input
                  type="url"
                  value={form.favicon_url}
                  onChange={(e) => update('favicon_url', e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
                  placeholder="https://cdn.example.com/favicon.ico"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Footer HTML
                </label>
                <textarea
                  value={form.footer_html}
                  onChange={(e) => update('footer_html', e.target.value)}
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm resize-y"
                  placeholder='<footer>&copy; 2026 Acme Corp. All rights reserved.</footer>'
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Branding
              </button>
              {saveSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-green-400 text-sm font-medium self-center"
                >
                  <CheckCircle className="w-4 h-4" /> Saved successfully
                </motion.span>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Live Preview
            </h3>
            <div className="rounded-lg overflow-hidden border border-white/10">
              {/* Mini header */}
              <div className="p-3 flex items-center gap-3" style={{ backgroundColor: form.brand_color || '#6366f1' }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-8 h-8 rounded object-contain bg-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {(form.brand_name || 'B').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white font-bold text-sm truncate">{form.brand_name || 'Your Brand'}</span>
              </div>

              {/* Mini content */}
              <div className="bg-slate-900 p-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
                <div className="h-20 w-full rounded bg-white/5 mt-3 flex items-center justify-center text-slate-500 text-xs">
                  Dashboard Content
                </div>
              </div>

              {/* Mini footer */}
              <div className="px-3 py-2 bg-slate-950 border-t border-white/5 text-[10px] text-slate-500">
                {form.footer_html ? (
                  <div dangerouslySetInnerHTML={{ __html: form.footer_html }} />
                ) : (
                  <span>Powered by Your Platform</span>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-3">Configuration Summary</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Brand', value: form.brand_name || '—' },
                { label: 'Domain', value: form.custom_domain || '—' },
                { label: 'Logo', value: form.logo_url ? 'Set' : '—' },
                { label: 'Favicon', value: form.favicon_url ? 'Set' : '—' },
                { label: 'Color', value: form.brand_color },
                { label: 'Footer', value: form.footer_html ? 'Custom' : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-300 font-mono truncate ml-2 max-w-[140px]">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
