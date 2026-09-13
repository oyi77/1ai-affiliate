import { useState, useEffect } from 'react';
import { useSafeQuery } from '../../hooks/useSafeQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { GlassCard } from '../ui/GlassCard';
import { Loader2, Save } from 'lucide-react';

export function PlatformSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSafeQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => { const r = await api.get('/api/settings/platform'); return r.data?.data || {}; },
  });
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/api/settings/platform', { settings: form }),
    onSuccess: () => queryClient.invalidateQueries(['platform-settings']),
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const input = (key, label, placeholder) => (
    <div key={key}>
      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{label}</label>
      <input type="text" value={form[key] || ''} onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-black/20 border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
    </div>
  );

  if (isLoading) return <GlassCard className="p-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></GlassCard>;

  return (
    <GlassCard className="p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Platform Configuration</h3>
        <p className="text-sm text-slate-400">Configure domains, branding, and platform behavior. Changes take effect immediately.</p>
      </div>

      <div className="space-y-6">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Domains</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {input('smartlink_domain', 'Smartlink Domain', 'go.yourdomain.com')}
          {input('smartlink_domain_alt', 'Smartlink Alt Domain', 'r.yourdomain.com')}
          {input('deeplink_domain', 'Deep Link Domain', 'dl.yourdomain.com')}
          {input('click_domain', 'Click Domain', 'click.yourdomain.com')}
          {input('landing_domain', 'Landing Page Domain', 'l.yourdomain.com')}
          {input('app_domain', 'App Domain', 'app.yourdomain.com')}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Branding</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {input('brand_name', 'Brand Name', '1AI Affiliate')}
          {input('support_email', 'Support Email', 'support@yourdomain.com')}
          {input('noreply_email', 'No-Reply Email', 'noreply@yourdomain.com')}
          {input('default_currency', 'Default Currency', 'IDR')}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">URLs</h4>
        <div className="grid grid-cols-1 gap-4">
          {input('default_fallback_url', 'Default Fallback URL', 'https://yourdomain.com')}
          {input('postback_url_template', 'Postback URL Template', 'https://{domain}/postback?aff_id={affiliate_id}')}
          {input('webhook_url_template', 'Webhook URL Template', 'https://{domain}/webhooks/incoming')}
          {input('status_page_url', 'Status Page URL', 'https://status.yourdomain.com')}
          {input('changelog_url', 'Changelog URL', 'https://changelog.yourdomain.com')}
          {input('community_url', 'Community URL', 'https://community.yourdomain.com')}
        </div>
      </div>

      <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50">
        {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Save Platform Settings
      </button>
    </GlassCard>
  );
}
