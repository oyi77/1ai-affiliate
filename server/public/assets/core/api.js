/**
 * API Client — single responsibility: HTTP communication layer.
 * All fetch calls go through here. No UI logic.
 */
const API = (() => {
  const TOKEN_KEY = '1ai_token';

  function token() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  async function req(path, opts = {}) {
    const h = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const t = token();
    if (t) h['Authorization'] = `Bearer ${t}`;
    const r = await fetch(path, { ...opts, headers: h });
    if (r.status === 401) {
      clearToken();
      if (typeof EventBus !== 'undefined') EventBus.emit('auth:expired');
      throw new Error('Unauthorized');
    }
    return r;
  }

  async function get(path) {
    const r = await req(path);
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${r.status}`);
    }
    return r.json();
  }

  async function post(path, body = {}) {
    const r = await req(path, { method: 'POST', body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  }

  async function put(path, body = {}) {
    const r = await req(path, { method: 'PUT', body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  }

  async function del(path) {
    const r = await req(path, { method: 'DELETE' });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    return data;
  }

  return { token, setToken, clearToken, req, get, post, put, del };
})();