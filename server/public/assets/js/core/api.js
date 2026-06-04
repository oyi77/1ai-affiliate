/**
 * API client — single responsibility: HTTP communication.
 * Depends on: auth module for token.
 */
const API = (function() {
  const BASE = '';

  async function req(path, opts = {}) {
    const h = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    const t = Auth.token();
    if (t) h['Authorization'] = `Bearer ${t}`;

    const r = await fetch(BASE + path, { ...opts, headers: h });

    if (r.status === 401) {
      Auth.clear();
      Router.showLogin();
      throw new Error('Unauthorized');
    }

    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new ApiError(r.status, body.error || `HTTP ${r.status}`, r);
    }

    return r;
  }

  function ApiError(status, message, response) {
    this.status = status;
    this.message = message;
    this.response = response;
  }
  ApiError.prototype = Object.create(Error.prototype);

  return {
    req,
    get: (path) => req(path).then(r => r.json()),
    post: (path, body) => req(path, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()),
    put: (path, body) => req(path, { method: 'PUT', body: JSON.stringify(body) }).then(r => r.json()),
    del: (path) => req(path, { method: 'DELETE' }).then(r => r.json()),
  };
})();