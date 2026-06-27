import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, ExternalLink, Shield, Loader2 } from 'lucide-react';

// ── Facebook Icon (inline SVG) ──────────────────────────────────

function FacebookIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ── Ad Account ID Validation ────────────────────────────────────

function validateAdAccountId(value) {
  if (!value) return { valid: false, error: null };

  // Auto-format: if user typed only numbers, prepend act_
  let formatted = value.trim();
  if (/^\d+$/.test(formatted)) {
    formatted = `act_${formatted}`;
  }

  // Validate format
  if (!/^act_\d+$/.test(formatted)) {
    if (!formatted.startsWith('act_')) {
      return { valid: false, error: 'Must start with act_ (e.g., act_123456789)', formatted };
    }
    return { valid: false, error: 'Only numbers allowed after act_', formatted };
  }

  // Check length (Meta IDs are typically 10-16 digits)
  const digits = formatted.replace('act_', '');
  if (digits.length < 8 || digits.length > 20) {
    return { valid: false, error: 'ID should be 8-20 digits', formatted };
  }

  return { valid: true, error: null, formatted };
}

// ── Facebook OAuth Handler ──────────────────────────────────────

async function handleFacebookLogin(appId) {
  return new Promise((resolve, reject) => {
    // Check if FB SDK is loaded
    if (typeof window.FB === 'undefined') {
      // Load SDK dynamically
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = () => {
        window.fbAsyncInit = () => {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: false,
            version: 'v21.0',
          });
          performLogin(resolve, reject);
        };
      };
      script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(script);
    } else {
      performLogin(resolve, reject);
    }
  });
}

function performLogin(resolve, reject) {
  window.FB.login(
    (response) => {
      if (response.authResponse) {
        resolve({
          accessToken: response.authResponse.accessToken,
          userID: response.authResponse.userID,
          expiresIn: response.authResponse.expiresIn,
          grantedScopes: response.authResponse.grantedScopes,
        });
      } else {
        reject(new Error('Login cancelled or not authorized'));
      }
    },
    {
      scope: 'ads_read,read_insights,ads_management',
      return_scopes: true,
    }
  );
}

// ── Main Component ──────────────────────────────────────────────

export function MetaAdsConnectModal({ open, onOpenChange, onSuccess, metaAppId = '' }) {
  const [adAccountId, setAdAccountId] = useState('');
  const [validation, setValidation] = useState({ valid: false, error: null });
  const [oauthState, setOauthState] = useState('idle'); // idle | loading | connected | error
  const [oauthData, setOauthData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleIdChange = (value) => {
    setAdAccountId(value);
    const result = validateAdAccountId(value);
    setValidation(result);
    // Auto-format on change
    if (result.formatted && result.formatted !== value) {
      setAdAccountId(result.formatted);
      setValidation(validateAdAccountId(result.formatted));
    }
  };

  const handleConnect = useCallback(async () => {
    if (!metaAppId) {
      setOauthState('error');
      setErrorMessage('Meta App ID not configured. Contact your administrator.');
      return;
    }

    setOauthState('loading');
    setErrorMessage('');

    try {
      const result = await handleFacebookLogin(metaAppId);
      setOauthData(result);
      setOauthState('connected');

      // Call success callback with account data
      if (onSuccess) {
        onSuccess({
          adAccountId: validation.formatted || adAccountId,
          accessToken: result.accessToken,
          userID: result.userID,
          expiresIn: result.expiresIn,
        });
      }
    } catch (err) {
      setOauthState('error');
      setErrorMessage(err.message || 'Failed to connect Facebook account');
    }
  }, [metaAppId, adAccountId, validation, onSuccess]);

  const handleDisconnect = () => {
    setOauthData(null);
    setOauthState('idle');
    setErrorMessage('');
    if (window.FB) {
      window.FB.logout();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 flex items-center justify-center">
                <FacebookIcon size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Connect Meta Ads</h2>
                <p className="text-xs text-slate-400">Link your Facebook Ad account</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Ad Account ID */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Ad Account ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adAccountId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="act_123456789"
                  className={`w-full bg-[#0c1222] border rounded-xl px-4 py-3 text-white font-mono text-sm
                    focus:outline-none transition-colors ${
                      adAccountId && !validation.valid
                        ? 'border-red-500/50 focus:border-red-500'
                        : adAccountId && validation.valid
                          ? 'border-emerald-500/50 focus:border-emerald-500'
                          : 'border-[#1e293b] focus:border-[#1877F2]'
                    }`}
                />
                {adAccountId && validation.valid && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>
              {/* Helper / Error text */}
              <div className="mt-2 min-h-[20px]">
                {adAccountId && validation.error ? (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {validation.error}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Find in Meta Ads Manager → Account Settings. Must start with <code className="text-slate-400">act_</code>
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1e293b]" />
              <span className="text-xs text-slate-500">then</span>
              <div className="flex-1 h-px bg-[#1e293b]" />
            </div>

            {/* Connect with Facebook Button */}
            {oauthState !== 'connected' ? (
              <div className="space-y-3">
                <button
                  onClick={handleConnect}
                  disabled={oauthState === 'loading' || (!validation.valid && adAccountId)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-white transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: '#1877F2' }}
                >
                  {oauthState === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FacebookIcon size={20} />
                      Connect with Facebook
                    </>
                  )}
                </button>

                {/* Development Mode Warning */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-300">Development Mode Active</p>
                    <p className="text-[11px] text-amber-400/70 mt-0.5 leading-relaxed">
                      You must be invited as a Developer or Tester in the Meta App Dashboard to connect your account.
                      The app will request <code className="text-amber-300">ads_read</code> and <code className="text-amber-300">read_insights</code> permissions.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Connected State */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-300">Connected to Facebook</p>
                    <p className="text-xs text-emerald-400/70">User ID: {oauthData?.userID}</p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            <AnimatePresence>
              {oauthState === 'error' && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Connection Failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1e293b] flex items-center justify-between">
            <a
              href="https://developers.facebook.com/docs/instagram-api/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => onSuccess?.({ adAccountId: validation.formatted || adAccountId, accessToken: oauthData?.accessToken })}
                disabled={!validation.valid || oauthState !== 'connected'}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Connection
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
