import { useState, useEffect } from 'react';
import { useSafeQuery } from '../hooks/useSafeQuery';
import { useSettings } from '../hooks/useSettings';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import {
  User, Shield, Key, Bell, Save, Loader2, Copy, Eye, EyeOff,
  Send, DollarSign, MessageCircle, Palette,
} from 'lucide-react';
import { ErrorState } from '../components/ErrorState';

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

  const { data: profile } = useSafeQuery({
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
                <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-2">Two-Factor Authentication</h4>
                  <p className="text-xs text-slate-400 mb-4">Add an extra layer of security to your account</p>
                  <button
                    disabled
                    title="Two-factor authentication is coming soon"
                    className="px-4 py-2 bg-indigo-primary/10 border border-indigo-primary/20 text-indigo-light rounded-lg text-sm font-bold opacity-50 cursor-not-allowed"
                  >
                    Enable 2FA (coming soon)
                  </button>
                </div>

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
        </div>
      </div>
    </div>
  );
}

function TelegramSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bot_token: '', chat_id: '', daily_summary_enabled: false,
    balance_alert_enabled: false, balance_alert_threshold: 200000,
    performance_alert_enabled: false,
  });
  const [testResult, setTestResult] = useState(null);

  const { data: config, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['telegram-config'],
    queryFn: async () => { const r = await api.get('/api/settings/telegram'); return r.data?.data ?? r.data; },
  });

  useEffect(() => {
    if (config && config.bot_token !== undefined) {
      setForm({
        bot_token: config.bot_token || '',
        chat_id: config.chat_id || '',
        daily_summary_enabled: !!config.daily_summary_enabled,
        balance_alert_enabled: !!config.balance_alert_enabled,
        balance_alert_threshold: Number(config.balance_alert_threshold) || 200000,
        performance_alert_enabled: !!config.performance_alert_enabled,
      });
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/telegram', data),
    onSuccess: () => { queryClient.invalidateQueries(['telegram-config']); setTestResult(null); },
  });

  const testMutation = useMutation({
    mutationFn: () => api.post('/api/settings/telegram/test'),
    onSuccess: () => setTestResult({ success: true, message: 'Test message sent! Check your Telegram.' }),
    onError: (err) => setTestResult({ success: false, message: err.response?.data?.error || 'Failed to send test message' }),
  });

  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  if (isLoading) {
    return <GlassCard><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div></GlassCard>;
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-accent-light" />
        Telegram Integration
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Bot Token</label>
            <input
              type="text"
              value={form.bot_token}
              onChange={(e) => setForm({ ...form, bot_token: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
              placeholder="123456:ABC-DEF..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Chat ID</label>
            <input
              type="text"
              value={form.chat_id}
              onChange={(e) => setForm({ ...form, chat_id: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary font-mono text-sm"
              placeholder="-100123456789"
            />
          </div>
        </div>

        {/* Toggle switches */}
        {[
          { key: 'daily_summary_enabled', label: 'Daily Summary', desc: 'Receive a daily stats summary at midnight' },
          { key: 'balance_alert_enabled', label: 'Balance Alerts', desc: 'Get warned when balance drops below threshold' },
          { key: 'performance_alert_enabled', label: 'Performance Alerts', desc: 'Alerts on significant performance changes' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
            <div>
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${form[item.key] ? 'bg-indigo-primary' : 'bg-surface-3'}`}
            >
              <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform ${form[item.key] ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}

        {form.balance_alert_enabled && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Balance Alert Threshold (Rp)</label>
            <input
              type="number"
              value={form.balance_alert_threshold}
              onChange={(e) => setForm({ ...form, balance_alert_threshold: Number(e.target.value) })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save
          </button>
          <button
            onClick={() => { saveMutation.mutate(form, { onSuccess: () => testMutation.mutate() }); }}
            disabled={testMutation.isPending || saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-surface-3 text-slate-300 rounded-lg font-bold hover:bg-surface-hover transition-all disabled:opacity-50"
          >
            {testMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            Test Kirim Pesan
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-success/10 border border-green-success/20 text-green-success' : 'bg-red-error/10 border border-red-error/20 text-red-error'}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PayoutSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    min_amount: 50000, auto_approve: false, payment_method: 'bank_transfer',
    payment_schedule: 'monthly', enabled: true,
  });

  const { data: rules, isLoading, isError, error, refetch } = useSafeQuery({
    queryKey: ['payout-rules'],
    queryFn: async () => { const r = await api.get('/api/settings/payouts/rules'); return r.data?.data ?? r.data; },
  });

  useEffect(() => {
    if (rules && rules.min_amount !== undefined) {
      setForm({
        min_amount: Number(rules.min_amount) || 50000,
        auto_approve: !!rules.auto_approve,
        payment_method: rules.payment_method || 'bank_transfer',
        payment_schedule: rules.payment_schedule || 'monthly',
        enabled: !!rules.enabled,
      });
    }
  }, [rules]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post('/api/settings/payouts/rules', data),
    onSuccess: () => queryClient.invalidateQueries(['payout-rules']),
  });

  if (isLoading) {
    return <GlassCard><div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent-light" /></div></GlassCard>;
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-success" />
        Payout Rules
      </h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Minimum Payout Amount (Rp)</label>
            <input
              type="number"
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="ewallet">E-Wallet</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Payment Schedule</label>
            <select
              value={form.payment_schedule}
              onChange={(e) => setForm({ ...form, payment_schedule: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-primary"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {[
          { key: 'auto_approve', label: 'Auto-Approve', desc: 'Automatically approve and process payouts above threshold' },
          { key: 'enabled', label: 'Enabled', desc: 'Enable automatic payout processing' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg">
            <div>
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
              className={`relative inline-flex items-center cursor-pointer w-11 h-6 rounded-full transition-colors ${form[item.key] ? 'bg-indigo-primary' : 'bg-surface-3'}`}
            >
              <span className={`inline-block w-5 h-5 bg-white rounded-full transition-transform ${form[item.key] ? 'translate-x-[22px] ml-[2px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}

        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-primary text-white rounded-lg font-bold hover:bg-indigo-light transition-all disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Payout Rules
        </button>
      </div>
    </GlassCard>
  );
}

function WhiteLabelSettings() {
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
