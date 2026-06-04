/**
 * Auth module — single responsibility: token & user state.
 */
const Auth = (function() {
  return {
    token: () => localStorage.getItem('1ai_token'),
    set: (t) => localStorage.setItem('1ai_token', t),
    clear: () => localStorage.removeItem('1ai_token'),
    user: () => localStorage.getItem('1ai_user') || '',
    setUser: (u) => localStorage.setItem('1ai_user', u),
    isLoggedIn: () => !!localStorage.getItem('1ai_token'),
  };
})();