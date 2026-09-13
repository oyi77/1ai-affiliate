import { useState, useEffect } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useSettings } from '../hooks/useSettings';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import {
  User, Shield, Key, Bell, Save, Loader2, Copy, Eye, EyeOff,
  Send, DollarSign, Palette, Sliders,
} from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

import { TelegramSettings } from '../components/settings/TelegramSettings';
import { PayoutSettings } from '../components/settings/PayoutSettings';
import { WhiteLabelSettings } from '../components/settings/WhiteLabelSettings';
import { PlatformSettings } from '../components/settings/PlatformSettings';
import { TwoFactorSettings } from '../components/settings/TwoFactorSettings';
export function Settings() {
  const { settings: platformSettings } = useSettings();
  const appDomain = platformSettings.app_domain || 'affiliate.berkahkarya.org';
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    new_conversion: true,
    payout_processed: true,
    campaign_paused: true,
    fraud_alert: true,
    weekly_report: true,
  });
  const queryClient = useQueryClient();

  const { data: profile, isError, error, refetch } = useSafeQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/api/admin/vip');
      return response.data?.data ?? response.data;
    },
  });

  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    notification_email: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (profile) setFormData({
      company_name: profile.company_name || '',
      website: profile.website || '',
      notification_email: profile.notification_email || '',
      timezone: profile.timezone || 'UTC',
    });
  }, [profile]);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/change-password', data),
    onSuccess: () => { setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return api.put('/api/admin/vip', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });

  useEffect(() => {
    api.get('/api/settings/notifications').then(res => {
      const prefs = res.data?.data ?? res.data;
      if (prefs && typeof prefs === 'object') setNotifPrefs(prev => ({ ...prev, ...prefs }));
    }).catch(() => {});
  }, []);

  const notifSaveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/notifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'api', name: 'API Access', icon: Key },
    { id: 'whitelabel', name: 'White-Label', icon: Palette },
    { id: 'telegram', name: 'Telegram', icon: Send },
    { id: 'payouts', name: 'Payout Rules', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'platform', name: 'Platform', icon: Sliders },
  ];

  if (isError && (!profile || (Array.isArray(profile) && !profile.length))) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-primary/10 text-white border-l-2 border-indigo-primary'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-light' : ''}`} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="Your Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Notification Email</label>
                    <input
                      type="email"
                      value={formData.notification_email}
                      onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </form>
            </GlassCard>
          )}

          {activeTab === 'api' && (
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6">API Access</h3>
              <div className="space-y-6">
                <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">API Key</h4>
                      <p className="text-xs text-slate-400">Use this key for API integrations</p>
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-surface-3 rounded-md text-sm text-indigo-light font-mono">
                      {showApiKey ? (profile?.api_key || 'No API key generated yet') : '••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(profile?.api_key || '')}
                      className="p-3 bg-surface-3 rounded-md text-slate-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-2">Postback URL</h4>
                  <p className="text-xs text-slate-400 mb-3">Configure this URL in your affiliate network to receive conversion callbacks</p>
                  <code className="block p-3 bg-surface-3 rounded-md text-sm text-green-success font-mono break-all">
                    https://{appDomain}/postback?aff_id={'{affiliate_id}'}&payout={'{payout}'}&status={'{status}'}
                  </code>
                </div>

                <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-2">Webhook Endpoint</h4>
                  <p className="text-xs text-slate-400 mb-3">Real-time event notifications</p>
                  <code className="block p-3 bg-surface-3 rounded-md text-sm text-blue font-mono break-all">
                    https://{appDomain}/webhooks/incoming
                  </code>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
              <div className="space-y-6">
                <TwoFactorSettings />


                <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-2">Change Password</h4>
                  <div className="space-y-4 mt-4">
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="Current password"
                    />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="New password"
                    />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (passwordForm.newPassword !== passwordForm.confirmPassword) return;
                        changePasswordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
                      }}
                      className="px-4 py-2 bg-surface-3 text-slate-300 rounded-lg text-sm font-bold hover:bg-surface-hover transition-all"
                    >
                      {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'whitelabel' && <WhiteLabelSettings />}
          {activeTab === 'telegram' && <TelegramSettings />}
          {activeTab === 'payouts' && <PayoutSettings />}

          {activeTab === 'notifications' && (
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'new_conversion', label: 'New Conversion', desc: 'Get notified when a conversion is recorded' },
                  { key: 'payout_processed', label: 'Payout Processed', desc: 'Alert when a payout is sent' },
                  { key: 'campaign_paused', label: 'Campaign Paused', desc: 'Notify when a campaign hits cap or is paused' },
                  { key: 'fraud_alert', label: 'Fraud Alert', desc: 'Alert on suspicious activity detection' },
                  { key: 'weekly_report', label: 'Weekly Report', desc: 'Receive a weekly performance summary' },
                ].map(notif => (
                  <div key={notif.key} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
                    <div>
                      <div className="text-sm font-bold text-white">{notif.label}</div>
                      <div className="text-xs text-slate-400">{notif.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifPrefs[notif.key]}
                        onChange={() => setNotifPrefs(prev => ({ ...prev, [notif.key]: !prev[notif.key] }))}
                      />
                      <div className="w-11 h-6 bg-surface-3 peer-checked:bg-indigo-primary rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
              <button
                onClick={() => notifSaveMutation.mutate(notifPrefs)}
                disabled={notifSaveMutation.isPending}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
              >
                {notifSaveMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Preferences
              </button>
            </GlassCard>
          )}
          {activeTab === 'platform' && <PlatformSettings />}

        </div>
      </div>
    </div>
  );
}

