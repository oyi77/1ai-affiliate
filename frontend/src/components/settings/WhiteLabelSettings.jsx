import { useState, useEffect } from 'react';
import { useSafeQuery } from '../../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { GlassCard } from '../ui/GlassCard';
import { Loader2, Save, Palette } from 'lucide-react';

export function WhiteLabelSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    brand_name: '', logo_url: '', primary_color: '#6366f1',
    custom_domain: '', hide_branding: false,
  });

  const { data: config, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['white-label'],
    queryFn: async () => { const r = await api.get('/api/settings/white-label'); return r.data?.data ?? r.data; },
  });

  useEffect(() => {
    if (config && config.brand_name !== undefined) {
      setForm({
        brand_name: config.brand_name || '',
        logo_url: config.logo_url || '',
        primary_color: config.primary_color || '#6366f1',
        custom_domain: config.custom_domain || '',
        hide_branding: !!config.hide_branding,
      });
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/white-label', data),
    onSuccess: () => queryClient.invalidateQueries(['white-label']),
  });

  if (isLoading) {
    return <GlassCard><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div></GlassCard>;
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Palette className="w-5 h-5 text-accent-light" />
        White-Label Configuration
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Brand Name</label>
            <input
              type="text"
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="Your Brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Logo URL</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Custom Domain</label>
            <input
              type="text"
              value={form.custom_domain}
              onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
              placeholder="tracking.yourdomain.com"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
          <div>
            <div className="text-sm font-bold text-white">Hide Branding</div>
            <div className="text-xs text-slate-400">Remove &quot;Powered by 1AI Affiliate&quot; from all pages</div>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, hide_branding: !f.hide_branding }))}
            className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${form.hide_branding ? 'bg-indigo-primary' : 'bg-surface-3'}`}
          >
            <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform ${form.hide_branding ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save White-Label Config
        </button>
      </div>
    </GlassCard>
  );
}
