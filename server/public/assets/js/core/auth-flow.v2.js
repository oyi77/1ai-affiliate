/** Auth flow — login, forgot password, reset password */
function doLogin() {
  const err = document.getElementById('login-err');
  err.style.display = 'none';
  fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: document.getElementById('login-user').value, password: document.getElementById('login-pass').value })
  }).then(r => r.json()).then(d => {
    if (d.token) {
      Auth.set(d.token);
      if (d.apiKey) Auth.setApiKey(d.apiKey);
      Auth.setUser(d.user.email || d.user.id);
      Auth.resetRole();
      Router.showApp();
    } else { err.textContent = d.error || 'Login failed'; err.style.display = 'block'; }
  }).catch(e => { err.textContent = 'Network error'; err.style.display = 'block'; });
}

function doLogout() { Auth.clear(); location.reload(); }

function showForgotPassword() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'block';
  document.getElementById('reset-form').style.display = 'none';
}
function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('reset-form').style.display = 'none';
}
function showResetForm(key) {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('reset-form').style.display = 'block';
  if (key) document.getElementById('reset-key').value = key;
}

async function doForgotPassword() {
  const msg = document.getElementById('forgot-msg');
  msg.style.display = 'none';
  try {
    const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: document.getElementById('forgot-user').value, email: document.getElementById('forgot-email').value })
    });
    const d = await r.json();
    if (d.key) { showResetForm(d.key); }
    else { msg.textContent = d.message || d.error || 'If an account matches, check your email.'; msg.style.display = 'block'; msg.style.color = r.ok ? 'var(--green)' : 'var(--red)'; }
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'block'; }
}

async function doResetPassword() {
  const msg = document.getElementById('reset-msg');
  const success = document.getElementById('reset-success');
  msg.style.display = 'none'; success.style.display = 'none';

  const newPass = document.getElementById('reset-pass').value;
  const confirm = document.getElementById('reset-confirm');
  if (confirm && newPass !== confirm.value) {
    msg.textContent = 'Passwords do not match';
    msg.style.display = 'block';
    return;
  }

  try {
    const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: document.getElementById('reset-key').value, password: newPass })
    });
    const d = await r.json();
    if (!r.ok) { msg.textContent = d.error; msg.style.display = 'block'; return; }
    success.textContent = d.message; success.style.display = 'block';
    setTimeout(() => showLoginForm(), 2000);
  } catch(e) { msg.textContent = 'Network error'; msg.style.display = 'block'; }
}