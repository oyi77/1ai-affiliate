import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { LogIn, Lock, Mail, ArrowLeft, Loader2, UserPlus, User } from 'lucide-react';

export function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register | forgot | reset
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '', confirmPassword: '', resetKey: '' });
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/api/auth/login', credentials);
      return response.data?.data ?? response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (onLogin) onLogin(data);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/auth/register', data);
      return response.data?.data ?? response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (onLogin) onLogin(data);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Registration failed');
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/api/auth/forgot-password', data);
    },
    onSuccess: () => {
      setMode('reset');
      setError('');
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to send reset email');
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/reset-password', data),
    onSuccess: () => { setMode('login'); setError(''); },
    onError: (err) => setError(err.response?.data?.error || 'Reset failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      loginMutation.mutate({ email: form.email, password: form.password });
    } else if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      registerMutation.mutate({ name: form.name, email: form.email, password: form.password });
    } else if (mode === 'forgot') {
      forgotMutation.mutate({ username: form.username, email: form.email });
    } else if (mode === 'reset') {
      resetMutation.mutate({ username: form.username, key: form.resetKey, newPassword: form.password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending || forgotMutation.isPending || resetMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-md bg-accent flex items-center justify-center font-bold text-white text-xl mx-auto mb-4">
            1A
          </div>
          <h1 className="text-2xl font-semibold text-white">Affiliate Hub</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' && 'Sign in to your dashboard'}
            {mode === 'register' && 'Create your affiliate account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Check your email for reset key'}
          </p>
        </div>

        <GlassCard className="p-8">
          {/* Login / Register tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex mb-6 rounded-lg bg-black/20 border border-white/[0.06] p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === 'login' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === 'register' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Username or Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      name="email"
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-accent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-primary"
                    placeholder="admin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-primary"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </>
            )}

            {mode === 'reset' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-success/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-success" />
                </div>
                <p className="text-slate-300 mb-4">A password reset key has been sent to your email.</p>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Reset Key</label>
                  <input
                    type="text"
                    value={form.resetKey}
                    onChange={(e) => setForm({ ...form, resetKey: e.target.value })}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-primary"
                    placeholder="Paste your reset key"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-error/10 border border-red-error/20 rounded-lg text-red-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent text-white rounded-md font-semibold text-sm hover:bg-accent-light transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && <><LogIn className="w-5 h-5" /> Sign In</>}
                  {mode === 'register' && <><UserPlus className="w-5 h-5" /> Create Account</>}
                  {mode === 'forgot' && 'Send Reset Key'}
                  {mode === 'reset' && 'Verify & Reset'}
                </>
              )}
            </button>

            <div className="text-center">
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-sm text-slate-500 hover:text-accent-light transition-colors"
                >
                  Forgot your password?
                </button>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-sm text-slate-500 hover:text-accent-light transition-colors flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              )}
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
