class ClientRouter {
  constructor() {
    this.routes = {
      '#dashboard': 'dashboard',
      '#smartlinks': 'smartlinks',
      '#offers': 'offers',
      '#earnings': 'earnings',
      '#conversions': 'conversions',
      '#postback': 'postback',
      '#settings': 'settings'
    };

    // Initialize navigation
    this.initNavigation();
    this.handleInitialRoute();
  }

  initNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.getAttribute('href');
        history.pushState(null, '', hash);
        this.loadPage(hash);
      });
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.hash);
    });

    // Sign out handler
    document.getElementById('signout-button')?.addEventListener('click', () => {
      Auth.clear();
      window.location.reload();
    });
  }

  handleInitialRoute() {
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      this.loadPage(window.location.hash);
    }
  }

  async loadPage(hash) {
    const page = this.routes[hash] || 'dashboard';
    const contentEl = document.getElementById('content');

    // Update UI
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`.nav-item[href="${hash}"]`).classList.add('active');
    document.querySelector('.page-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);

    // Clear content
    contentEl.innerHTML = '';

    try {
      // Load page content
      await window[`render${page.charAt(0).toUpperCase() + page.slice(1)}`]();
    } catch (e) {
      console.error(`Page ${page} not found`, e);
      contentEl.innerHTML = `<div class="card">Page not found</div>`;
    }
  }

  // Public method for programmatic navigation
  navigateTo(hash) {
    history.pushState(null, '', hash);
    this.loadPage(hash);
  }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.router = new ClientRouter();
});