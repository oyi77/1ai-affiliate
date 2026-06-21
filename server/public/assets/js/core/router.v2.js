/**
 * Router module — SPA navigation.
 * Depends on: Auth, DOM.
 */
const Router = (function() {
  let currentPage = 'overview';

  const pageTitles = {
    overview:'Overview', attribution:'Attribution', clicks:'Live Click Tracker',
    'traffic-sources':'Traffic Sources', 'deep-links':'Deep Links', 'landing-pages':'Landing Pages',
    'conversion-log':'Conversion Log', 'postback-builder':'Postback Builder',
    campaigns:'Campaigns', offers:'Offers', reports:'Reports',
    'laporan-iklan':'Laporan Iklan', 'analytic-harian':'Analytic Harian',
    'laporan-taglink':'Laporan Taglink', 'laporan-order':'Laporan Order',
    'laporan-pembayaran':'Laporan Pembayaran',
    smartlink:'Smartlink Generator', earnings:'My Earnings', affiliates:'Manage Affiliates',
    commissions:'Commissions Ledger', payments:'Payments',
    pipeline:'TikTok Pipeline', poster:'Telegram Poster',
    profile:'Profile & Settings', integrations:'API Integrations',
    networks:'Ad Networks', domains:'Custom Domains', shorteners:'URL Shorteners',
    admin:'Admin Users', 'ab-tests':'A/B Tests', automation:'Automation Rules',
    'day-parting':'Day Parting', webhooks:'Webhooks', 'saldo-budget':'Saldo & Budget',
    docs:'Documentation', help:'Help & Support', vipperks:'VIP Perks', users:'Users',
    'ai-banner':'AI Banner Generator', 'ai-carousel':'AI IG Carousel Generator',
    'ai-caption':'AI Social Captions', 'ai-brand-kit':'AI Brand Kit',
    'ai-ab-test':'AI A/B Test Ideas', 'ai-bg-remove':'AI BG Removal',
    'adv-integrations':'Advertiser APIs', clickservers:'Click Servers',
    system:'System Admin'
  };

  function showLogin() {
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }

  function showApp() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('me').textContent = Auth.user();
    
    const userRole = Auth.role();
    document.querySelectorAll('[data-roles]').forEach(el => {
      const allowedRoles = el.dataset.roles.split(',');
      if (!allowedRoles.includes(userRole)) el.style.display = 'none';
      else el.style.display = '';
    });

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
    if (Auth.isLoggedIn()) {
      showApp();
      initSidebarCollapse();
      checkOnboarding();
    } else {
      showLogin();
    }
  }

  // Sidebar section collapse/expand
  function initSidebarCollapse() {
    document.querySelectorAll('.nav-section-label').forEach(label => {
      label.style.cursor = 'pointer';
      label.style.userSelect = 'none';
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.justifyContent = 'space-between';

      // Add chevron icon
      const chevron = document.createElement('span');
      chevron.className = 'section-chevron';
      chevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      chevron.style.transition = 'transform 0.2s ease';
      label.appendChild(chevron);

      const section = label.parentElement;
      const sectionKey = 'nav_section_' + (label.textContent.trim().replace(/\s+/g, '_').toLowerCase());

      // Restore collapsed state from localStorage
      if (localStorage.getItem(sectionKey) === 'collapsed') {
        section.classList.add('collapsed');
        chevron.style.transform = 'rotate(-90deg)';
      }

      label.addEventListener('click', () => {
        const isCollapsed = section.classList.toggle('collapsed');
        chevron.style.transform = isCollapsed ? 'rotate(-90deg)' : '';
        localStorage.setItem(sectionKey, isCollapsed ? 'collapsed' : 'expanded');
      });
    });
  }

  // Onboarding flow
  function checkOnboarding() {
    if (localStorage.getItem('1ai_onboarded')) return;
    showOnboarding();
  }

  function showOnboarding() {
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;';

    const steps = [
      { title: 'Welcome to 1AI Affiliate Hub! 🚀', body: 'Your all-in-one CPA tracking and affiliate marketing platform. Let\'s get you started.', icon: '👋' },
      { title: 'Track Everything', body: 'Monitor clicks, conversions, and revenue in real-time. Use the <strong>Live Click Tracker</strong> for SSE-powered live updates.', icon: '📊' },
      { title: 'Smartlink Generator', body: 'Create tracked smartlinks with custom domains and URL shorteners. Every click is attributed automatically.', icon: '🔗' },
      { title: 'Multi-Touch Attribution', body: 'Understand the full customer journey with first-touch, last-touch, and assisted conversion models.', icon: '🎯' },
      { title: 'Indonesian Reports', body: 'Laporan Iklan, Analytic Harian, Laporan Order — all your reporting needs in one place.', icon: '📋' },
      { title: 'Automation & Webhooks', body: 'Set up automation rules, day-parting schedules, and webhook integrations to scale your operations.', icon: '⚙️' },
    ];

    let step = 0;

    function renderStep() {
      const s = steps[step];
      overlay.innerHTML = `
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:40px;max-width:480px;width:90%;text-align:center;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,var(--indigo),var(--purple),var(--pink));"></div>
          <div style="font-size:48px;margin-bottom:16px;">${s.icon}</div>
          <h2 style="font-size:22px;font-weight:700;margin-bottom:12px;color:var(--text);">${s.title}</h2>
          <p style="color:var(--text2);font-size:14px;line-height:1.6;margin-bottom:24px;">${s.body}</p>
          <div style="display:flex;justify-content:center;gap:8px;margin-bottom:24px;">
            ${steps.map((_, i) => `<div style="width:8px;height:8px;border-radius:50%;background:${i === step ? 'var(--indigo)' : 'var(--border)'};transition:background 0.2s;"></div>`).join('')}
          </div>
          <div style="display:flex;gap:12px;justify-content:center;">
            ${step > 0 ? '<button id="ob-prev" class="btn btn-outline btn-sm">Back</button>' : ''}
            ${step < steps.length - 1
              ? '<button id="ob-next" class="btn btn-primary btn-sm">Next</button>'
              : '<button id="ob-done" class="btn btn-primary btn-sm">Get Started!</button>'}
            <button id="ob-skip" class="btn btn-outline btn-sm" style="opacity:0.6">Skip</button>
          </div>
        </div>`;

      const prevBtn = document.getElementById('ob-prev');
      const nextBtn = document.getElementById('ob-next');
      const doneBtn = document.getElementById('ob-done');
      const skipBtn = document.getElementById('ob-skip');

      if (prevBtn) prevBtn.onclick = () => { step--; renderStep(); };
      if (nextBtn) nextBtn.onclick = () => { step++; renderStep(); };
      if (doneBtn) doneBtn.onclick = closeOnboarding;
      if (skipBtn) skipBtn.onclick = closeOnboarding;
    }

    function closeOnboarding() {
      localStorage.setItem('1ai_onboarded', 'true');
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => overlay.remove(), 300);
    }

    renderStep();
    document.body.appendChild(overlay);
  }


  return { init, showLogin, showApp, navigate, toggleSidebar, getCurrentPage: () => currentPage };
})();
