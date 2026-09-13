import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Loader2 } from 'lucide-react';

export function TwoFactorSettings() {
  const [status, setStatus] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/2fa/status').then(r => setStatus(r.data)).catch(() => {});
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await api.post('/api/2fa/setup');
      setSetup(r.data);
    } catch (e) { setError(e.response?.data?.error || 'Setup failed'); }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/2fa/verify', { code });
      setStatus({ enabled: true });
      setSetup(null);
      setCode('');
    } catch (e) { setError(e.response?.data?.error || 'Verification failed'); }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/2fa/disable', { code });
      setStatus({ enabled: false });
      setCode('');
    } catch (e) { setError(e.response?.data?.error || 'Disable failed'); }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
      <h4 className="text-sm font-bold text-white mb-2">Two-Factor Authentication</h4>
      <p className="text-xs text-slate-400 mb-4">Add an extra layer of security with TOTP authenticator app</p>

      {status?.enabled && !setup && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <span>✅</span> 2FA is enabled
          </div>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter 6-digit code"
              className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm w-40" maxLength={6} />
            <button onClick={handleDisable} disabled={loading || code.length !== 6}
              className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-bold disabled:opacity-50">
              Disable 2FA
            </button>
          </div>
        </div>
      )}

      {!status?.enabled && !setup && (
        <button onClick={handleSetup} disabled={loading}
          className="px-4 py-2 bg-indigo-primary hover:bg-indigo-light text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Enable 2FA'}
        </button>
      )}

      {setup && (
        <div className="space-y-4">
          <div className="text-center">
            <img src={setup.qr_url} alt="QR Code" className="mx-auto rounded-lg border border-white/10" />
            <p className="text-xs text-slate-400 mt-2">Scan with Google Authenticator or similar app</p>
          </div>
          <div className="p-3 bg-black/30 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Manual entry key:</p>
            <code className="text-sm text-indigo-400 font-mono break-all">{setup.secret}</code>
          </div>
          <div className="p-3 bg-black/30 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Backup codes (save these!):</p>
            <div className="grid grid-cols-4 gap-1">
              {setup.backup_codes?.map(c => <code key={c} className="text-xs text-yellow-400 font-mono">{c}</code>)}
            </div>
          </div>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter 6-digit code from app"
              className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" maxLength={6} />
            <button onClick={handleVerify} disabled={loading || code.length !== 6}
              className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-bold disabled:opacity-50">
              Verify & Enable
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
