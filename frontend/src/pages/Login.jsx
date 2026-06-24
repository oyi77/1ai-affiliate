import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { LogIn, Lock, Mail, ArrowLeft, Loader2, UserPlus, User, Zap, Target, Shield, BarChart3, Link2, Settings, X, ChevronRight } from 'lucide-react';

/* ─── Landing Page ─── */
function LandingPage({ onOpenLogin, onOpenRegister }) {
  return (
    <div className="min-h-screen bg-bg text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-bg/75 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/30">1A</div>
          <span className="font-bold text-lg">1AI Affiliate</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenLogin} className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all">Sign In</button>
          <button onClick={onOpenRegister} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-gradient-radial from-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            🚀 Next-Gen Tracking Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            Track. Optimize. <span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">Scale.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Unify your CPA tracking, affiliate networks, and ad campaigns into a single high-throughput engine. Sub-millisecond redirects, zero data loss.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={onOpenRegister} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
              Create Free Account
            </button>
            <button onClick={onOpenLogin} className="px-8 py-3.5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold rounded-xl transition-all">
              Request Demo
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-16 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/[0.06] bg-surface-1/50 overflow-hidden shadow-2xl shadow-black/60" style={{ transform: 'perspective(1000px) rotateX(3deg)' }}>
            <div className="flex items-center gap-2 px-5 py-3 bg-black/30 border-b border-white/[0.04]">
              <span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[11px] text-slate-500 ml-3 font-mono">dashboard.1ai.io/overview</span>
              <span className="ml-auto text-[11px] px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full font-semibold">● Engine Live</span>
            </div>
            <div className="grid grid-cols-4 gap-4 p-6 bg-surface-2/30">
              {[
                { label: 'Visits', value: '24,801', color: 'text-white' },
                { label: 'Conversions', value: '3,850', color: 'text-green-400' },
                { label: 'Spend', value: 'Rp 1.630.370', color: 'text-red-400' },
                { label: 'ROAS', value: '2.85x', color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl bg-black/20 border border-white/[0.04] text-left">
                  <div className="text-[11px] text-slate-500 mb-1">{s.label}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 bg-surface-2/30">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-24">
                <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                <path d="M0,15 Q15,8 30,12 T60,5 T90,8 T100,2" fill="none" stroke="url(#g)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Sub-ms Redirects', desc: 'Go-powered edge server with Redis caching. Every click tracked in under 1.5 milliseconds.' },
            { icon: Target, title: 'Attribution Engine', desc: 'First-touch, last-touch, and multi-touch models. Understand the full customer journey.' },
            { icon: Shield, title: 'Anti-Fraud Kit', desc: 'Real-time bot detection, IP blacklist range matching, and velocity checks.' },
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with ROAS, ROI, and profit tracking. Export to PDF and WhatsApp.' },
            { icon: Link2, title: 'Smartlinks & Domains', desc: 'Configure custom tracking domains with auto ACME SSL certificate provisioning.' },
            { icon: Settings, title: 'Auto Rules Engine', desc: 'Automated campaign management — auto-pause losers, scale winners, schedule sleep times.' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="p-6 rounded-2xl bg-surface-1/30 border border-white/[0.06] hover:border-indigo-500/30 hover:bg-surface-1/60 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {[
            { val: '<1.5ms', label: 'Redirect Latency' },
            { val: '100%', label: 'Uptime SLA' },
            { val: '50M+', label: 'Clicks/month' },
            { val: '99.9%', label: 'Data Accuracy' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">{s.val}</div>
              <div className="text-sm text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Ready to scale?</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Join thousands of affiliates running millions of clicks through 1AI Affiliate every day.</p>
        <button onClick={onOpenRegister} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 text-lg">
          Start Free Trial <ChevronRight className="w-5 h-5 inline ml-1" />
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.04] text-center text-sm text-slate-600">
        © 2026 1AI Affiliate. All rights reserved.
      </footer>
    </div>
  );
}

/* ─── Auth Modal ─── */
function AuthModal({ mode: initialMode, onClose, onLogin }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', confirmPassword: '', resetKey: '', role: 'affiliate' });
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/api/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.apiKey) localStorage.setItem('apiKey', data.apiKey);
      localStorage.setItem('user', data.user?.email || data.user?.id || '');
      onLogin();
    },
    onError: (err) => setError(err.response?.data?.error || 'Login failed'),
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const { data: res } = await api.post('/api/auth/register', data);
      return res;
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user?.email || data.user?.id || '');
        onLogin();
      } else {
        setMode('login');
        setError('');
      }
    },
    onError: (err) => setError(err.response?.data?.error || 'Registration failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') loginMutation.mutate({ email: form.email, password: form.password });
    else if (mode === 'register') registerMutation.mutate({ username: form.username, name: form.name, email: form.email, password: form.password, role: form.role });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        <GlassCard className="p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg mx-auto mb-3 shadow-lg shadow-indigo-500/30">1A</div>
            <h2 className="text-xl font-bold">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 rounded-lg bg-black/20 border border-white/[0.06] p-1">
            <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'login' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>Sign In</button>
            <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'register' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent">
                    <option value="affiliate">Affiliate (Publisher)</option>
                    <option value="advertiser">Advertiser (Brand)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent" placeholder="your_username" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent" placeholder="John Doe" required />
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{mode === 'login' ? 'Username or Email' : 'Email'}</label>
              <input type={mode === 'login' ? 'text' : 'email'} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} name="email" className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent" placeholder={mode === 'login' ? 'admin' : 'you@example.com'} required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent" placeholder="••••••••" required minLength={mode === 'register' ? 6 : 1} />
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent-light transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? <><LogIn className="w-5 h-5" /> Sign In</> : <><UserPlus className="w-5 h-5" /> Create Account</>}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Login Component ─── */
export function Login({ onLogin }) {
  const [modal, setModal] = useState(null); // null | 'login' | 'register'

  return (
    <>
      <LandingPage onOpenLogin={() => setModal('login')} onOpenRegister={() => setModal('register')} />
      <AnimatePresence>
        {modal && <AuthModal mode={modal} onClose={() => setModal(null)} onLogin={onLogin} />}
      </AnimatePresence>
    </>
  );
}
