/**
 * Auth module — token, apiKey & user state.
 */
const Auth = (function() {
  let _role = null;
  return {
    token: () => localStorage.getItem('1ai_token'),
    set: (t) => localStorage.setItem('1ai_token', t),
    apiKey: () => localStorage.getItem('1ai_api_key'),
    setApiKey: (k) => localStorage.setItem('1ai_api_key', k),
    clear: () => { localStorage.removeItem('1ai_token'); localStorage.removeItem('1ai_api_key'); localStorage.removeItem('1ai_user'); },
    user: () => localStorage.getItem('1ai_user') || '',
    setUser: (u) => localStorage.setItem('1ai_user', u),
    isLoggedIn: () => !!localStorage.getItem('1ai_token'),
    role: () => {
      if (_role) return _role;
      try { _role = JSON.parse(atob(localStorage.getItem('1ai_token').split('.')[1])).role; return _role; }
      catch(e) { return 'user'; }
    },
    isAffiliate: () => Auth.role() === 'affiliate',
    isAdmin: () => Auth.role() === 'admin',
    isAdvertiser: () => Auth.role() === 'advertiser',
    resetRole: () => { _role = null; },
  };
})();