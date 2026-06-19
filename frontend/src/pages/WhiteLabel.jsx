import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Palette, Globe, ImageIcon, Save, Loader2, CheckCircle2, Eye } from 'lucide-react';

const defaultConfig = {
  brand_name: '',
  logo_url: '',
  brand_color: '#6366f1',
  custom_domain: '',
  favicon_url: '',
  footer_html: '',
};

export function WhiteLabel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['white-label'],
    queryFn: async () => {
      const { data } = await api.get('/api/enterprise/white-label');
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm({ ...defaultConfig, ...data });
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body) => api.put('/api/enterprise/white-label', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['white-label'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">White-Label Branding</h1>
          <p className="text-slate-400 text-sm mt-1">Customize your portal appearance</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Brand Settings</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Brand Name</label>
                    <input
                      type="text"
                      value={form.brand_name}
                      onChange={handleChange('brand_name')}
                      placeholder="Your Brand"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Logo URL</label>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <input
                        type="url"
                        value={form.logo_url}
                        onChange={handleChange('logo_url')}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={form.brand_color}
                        onChange={handleChange('brand_color')}
                        className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={form.brand_color}
                        onChange={handleChange('brand_color')}
                        placeholder="#6366f1"
                        className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-white/10"
                        style={{ backgroundColor: form.brand_color }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Custom Domain</label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={form.custom_domain}
                        onChange={handleChange('custom_domain')}
                        placeholder="portal.yourbrand.com"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Favicon URL</label>
                    <input
                      type="url"
                      value={form.favicon_url}
                      onChange={handleChange('favicon_url')}
                      placeholder="https://example.com/favicon.ico"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Footer HTML</label>
                    <textarea
                      value={form.footer_html}
                      onChange={handleChange('footer_html')}
                      placeholder="<p>&copy; 2026 Your Brand. All rights reserved.</p>"
                      rows={4}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </GlassCard>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Preview</h2>
            </div>

            <div
              className="rounded-lg overflow-hidden border border-white/10"
              style={{ '--brand': form.brand_color || '#6366f1' }}
            >
              {/* Mini header */}
              <div className="p-3 flex items-center gap-2" style={{ backgroundColor: form.brand_color }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="" className="w-6 h-6 rounded object-contain" />
                ) : (
                  <div className="w-6 h-6 rounded bg-white/20" />
                )}
                <span className="text-white text-sm font-semibold truncate">
                  {form.brand_name || 'Your Brand'}
                </span>
              </div>

              {/* Mini body */}
              <div className="bg-slate-900 p-4 space-y-2">
                <div className="h-2 bg-white/10 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
                <div className="h-16 bg-white/5 rounded mt-3" />
              </div>

              {/* Footer preview */}
              <div className="bg-slate-950 px-3 py-2 text-xs text-slate-500 border-t border-white/5">
                {form.footer_html ? (
                  <div className="whitespace-pre-wrap">{form.footer_html.replace(/<[^>]*>/g, '')}</div>
                ) : (
                  <span>Footer preview</span>
                )}
              </div>
            </div>

            {/* Config summary */}
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Domain</span>
                <span className="text-slate-300 font-mono">{form.custom_domain || '—'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Favicon</span>
                <span className="text-slate-300">{form.favicon_url ? '✓' : '—'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Logo</span>
                <span className="text-slate-300">{form.logo_url ? '✓' : '—'}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
