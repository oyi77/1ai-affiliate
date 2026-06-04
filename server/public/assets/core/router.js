/**
 * Router — maps page names to render functions, handles navigation.
 * Single responsibility: page routing & sidebar state.
 * Depends on: UI, EventBus
 */
const Router = (() => {
  const pages = {};

  function register(name, renderFn) {
    pages[name] = renderFn;
  }

  async function load(pageName) {
    const target = document.getElementById('page');
    target.innerHTML = UI.skeleton();
    try {
      const fn = pages[pageName];
      if (fn) { await fn(target); } else { throw new Error(`Unknown page: ${pageName}`); }
    } catch (err) {
      target.innerHTML = `<div class="panel rounded-xl p-6 text-sm text-red-400">${err.message}</div>`;
    }
  }

  function setActiveNav(pageName) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const el = document.querySelector(`[data-page="${pageName}"]`);
    if (el) el.classList.add('active');
  }

  function navigateTo(pageName) {
    setActiveNav(pageName);
    if (window.innerWidth < 1024) {
      document.getElementById('sidebar')?.classList.add('-translate-x-full');
      document.getElementById('scrim')?.classList.add('hidden');
    }
    load(pageName);
  }

  // Wire up sidebar navigation
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  return { register, navigateTo, load, setActiveNav };
})();