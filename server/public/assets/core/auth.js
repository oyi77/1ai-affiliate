/**
 * Auth Module — login, logout, forgot/reset password.
 * Single responsibility: authentication state management.
 * Depends on: API, EventBus
 */
const Auth = (() => {
  const USER_KEY = '1ai_user';

  function getUserName() { return localStorage.getItem(USER_KEY); }

  async function login(username, password) {
    const data = await API.post('/api/auth/login', { email: username, password });
    API.setToken(data.token);
    const name = data.user?.email || username;
    localStorage.setItem(USER_KEY, name);
    EventBus.emit('auth:login', { user: name });
    return data;
  }

  function logout() {
    API.clearToken();
    localStorage.removeItem(USER_KEY);
    EventBus.emit('auth:logout');
  }

  async function changePassword(currentPassword, newPassword) {
    return API.put('/api/auth/password', { currentPassword, newPassword });
  }

  async function forgotPassword(username, email) {
    return API.post('/api/auth/forgot-password', { username, email });
  }

  async function resetPassword(key, password) {
    return API.post('/api/auth/reset-password', { key, password });
  }

  function isLoggedIn() { return !!API.token(); }

  return { login, logout, changePassword, forgotPassword, resetPassword, isLoggedIn, getUserName };
})();