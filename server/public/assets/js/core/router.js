/**
 * Router module — SPA navigation.
 * Depends on: Auth, DOM.
 */
const Router = (function() {
  let currentPage = 'overview';

  const pageTitles = {
    overview:'Overview', attribution:'Attribution', clicks:'Click Tracker',
    campaigns:'Campaigns', offers:'Offers', reports:'Reports',
    affiliates:'Affiliates', earnings:'Earnings', commissions:'Commissions',
    payments:'Payments', profile:'Profile & Settings', integrations:'API Integrations',
    admin:'System Admin', clickservers:'Click Servers', docs:'Documentation',
    help:'Help & Support', vipperks:'VIP Perks', users:'Users',
  };

  function showLogin() {
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }

  function showApp() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('me').textContent = Auth.user();
    navigate('overview');
  }

  function navigate(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n =>
      n.classList.toggle('active', n.dataset.page === page)
    );
    document.getElementById('page-title').textContent = pageTitles[page] || page;

    const el = document.getElementById('page-content');
    el.innerHTML = DOM.skeleton();

    const renderer = window.PageRenderers && window.PageRenderers[page];
    if (renderer) {
      renderer(el).catch(e => {
        el.innerHTML = `<div class="card"><p>Failed to load page: ${e.message}</p></div>`;
      });
    } else {
      el.innerHTML = `<div class="card"><h3>Page renderer unavailable</h3><p style="color:var(--text2);font-size:13px">The dashboard could not load this section. Refresh the page and try again.</p></div>`;
    }

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('scrim').classList.remove('open');
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('scrim').classList.toggle('open');
  }

  function init() {
    if (Auth.isLoggedIn()) showApp();
    else showLogin();
  }

  return { init, showLogin, showApp, navigate, toggleSidebar, getCurrentPage: () => currentPage };
})();
