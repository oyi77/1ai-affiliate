/**
 * Main entry point — wires all modules together.
 * Load this last after all dependencies.
 */
(() => {
  // Show the right view on startup
  if (Auth.isLoggedIn()) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('me').textContent = Auth.getUserName() || 'admin';
    Router.navigateTo('overview');
  } else {
    showLoginView();
  }

  // Wire login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-err');
    errEl.classList.add('hidden');
    try {
      await Auth.login(
        document.getElementById('login-user').value,
        document.getElementById('login-pass').value
      );
      showAppView();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });

  // Wire forgot password link
  document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('forgot-view').classList.remove('hidden');
  });
  document.getElementById('forgot-cancel').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('forgot-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
  });

  // Wire forgot password form
  document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('forgot-err');
    const msgEl = document.getElementById('forgot-msg');
    errEl.classList.add('hidden'); msgEl.classList.add('hidden');
    try {
      const data = await Auth.forgotPassword(
        document.getElementById('forgot-user').value,
        document.getElementById('forgot-email').value
      );
      if (data.key) {
        msgEl.textContent = 'Reset key generated. Switching to reset form...';
        msgEl.classList.remove('hidden');
        document.getElementById('reset-key').value = data.key;
        setTimeout(() => {
          document.getElementById('forgot-view').classList.add('hidden');
          document.getElementById('reset-view').classList.remove('hidden');
        }, 1500);
      } else {
        msgEl.textContent = data.message || 'If an account matches, a reset link has been sent.';
        msgEl.classList.remove('hidden');
      }
    } catch (err) {
      errEl.textContent = err.message; errEl.classList.remove('hidden');
    }
  });

  // Wire reset password form
  document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('reset-err');
    const msgEl = document.getElementById('reset-msg');
    errEl.classList.add('hidden'); msgEl.classList.add('hidden');
    const pw = document.getElementById('reset-pass').value;
    const pw2 = document.getElementById('reset-pass2').value;
    if (pw !== pw2) { errEl.textContent = 'Passwords do not match'; errEl.classList.remove('hidden'); return; }
    try {
      await Auth.resetPassword(document.getElementById('reset-key').value, pw);
      msgEl.textContent = 'Password reset! Redirecting...'; msgEl.classList.remove('hidden');
      setTimeout(() => {
        document.getElementById('reset-view').classList.add('hidden');
        document.getElementById('login-view').classList.remove('hidden');
      }, 1500);
    } catch (err) {
      errEl.textContent = err.message; errEl.classList.remove('hidden');
    }
  });

  // Logout
  document.getElementById('logout').addEventListener('click', () => {
    Auth.logout();
    showLoginView();
  });

  // Listen for 401 from API
  EventBus.on('auth:expired', () => showLoginView());

  // Mobile nav
  const sb = document.getElementById('sidebar');
  document.getElementById('menu-btn').addEventListener('click', () => {
    sb.classList.toggle('-translate-x-full');
    document.getElementById('scrim').classList.toggle('hidden');
  });
  document.getElementById('scrim').addEventListener('click', () => {
    sb.classList.add('-translate-x-full');
    document.getElementById('scrim').classList.add('hidden');
  });

  function showLoginView() {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('forgot-view').classList.add('hidden');
    document.getElementById('reset-view').classList.add('hidden');
    document.getElementById('app-view').classList.add('hidden');
  }

  function showAppView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('forgot-view').classList.add('hidden');
    document.getElementById('reset-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('me').textContent = Auth.getUserName() || '';
    Router.navigateTo('overview');
  }
})();