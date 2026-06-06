// Page renderers for affiliate portal

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API error:', error);
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Error Loading Data</h3>
      <p>Failed to load content. Please try again later.</p>
    </div>`;
};

// =====================
// DASHBOARD PAGE
// =====================
async function renderDashboard() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Clicks</div>
        <div class="stat-value">0</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Conversions</div>
        <div class="stat-value">0</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Earnings (MTD)</div>
        <div class="stat-value">$0.00</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Pending Payout</div>
        <div class="stat-value">$0.00</div>
      </div>
    </div>
    
    <div class="card">
      <h3>Clicks Over 7 Days</h3>
      <canvas id="clicksChart" height="300"></canvas>
    </div>`;

  try {
    const stats = await api.get('/api/admin/stats');
    
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = String(stats.total_clicks || stats.clicks24h || '0');
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = String(stats.attributed_conversions || '0');
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = `$${(stats.revenueMtd || stats.revenue_mtd || 0).toFixed(2)}`;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = `$${(stats.pendingPayout || stats.pending_payout || 0).toFixed(2)}`;

    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('clicksChart')?.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Today'],
            datasets: [{ label: 'Clicks 24h', data: [stats.clicks24h || 0], borderColor: '#6366f1', tension: 0.3 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }
    }
  } catch (error) {
    handleApiError(error);
  }
}

// =====================
// SMARTLINKS PAGE
// =====================
async function renderSmartlinks() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Generate Smartlink</h3>
      <div class="form-group" style="margin-bottom: 16px">
        <label for="campaign-select">Campaign</label>
        <select id="campaign-select" class="form-control" style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px"></select>
      </div>
      <button id="generate-link" class="btn" style="background: var(--indigo); color: white; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; width: 100%">
        Generate Smartlink
      </button>
    </div>

    <div class="card">
      <h3>Your Smartlinks</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Token</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="smartlinks-list"></tbody>
      </table>
    </div>`;

  try {
    // Load campaigns
    const campaigns = await api.get('/api/admin/campaigns');
    const select = document.getElementById('campaign-select');
    campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign.id;
      option.textContent = campaign.name;
      select.appendChild(option);
    });

    // Generate button handler
    document.getElementById('generate-link').addEventListener('click', async () => {
      const campaignId = select.value;
      if (!campaignId) {
        alert('Please select a campaign');
        return;
      }

      try {
        const link = await api.post('/api/smartlink/generate', { campaignId });
        const url = `${window.location.origin}/go/${link.token}`;
        
        // Add to list
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${link.campaignName}</td>
          <td>${link.token}</td>
          <td>
            <button class="copy-link" data-url="${url}" style="background: none; border: none; color: var(--indigo); cursor: pointer">Copy</button>
          </td>
        `;
        document.getElementById('smartlinks-list').prepend(row);

        // Copy handler
        row.querySelector('.copy-link').addEventListener('click', async (e) => {
          await navigator.clipboard.writeText(e.target.dataset.url);
          toast.success('Copied to clipboard');
        });
      } catch (error) {
        console.error('Generation error:', error);
        toast.error('Failed to generate link');
      }
    });

    // Load existing smartlinks
    const links = await api.get('/api/smartlink/list');
    links.forEach(link => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${link.campaignName}</td>
        <td>${link.token}</td>
        <td>
          <button class="copy-link" data-url="${window.location.origin}/go/${link.token}" style="background: none; border: none; color: var(--indigo); cursor: pointer">Copy</button>
        </td>
      `;
      document.getElementById('smartlinks-list').appendChild(row);
    });

    // Add copy event listeners
    document.querySelectorAll('.copy-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        await navigator.clipboard.writeText(e.target.dataset.url);
        toast.success('Copied to clipboard');
      });
    });
  } catch (error) {
    handleApiError(error);
  }
}

// =====================
// OFFERS PAGE
// =====================
async function renderOffers() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Available Offers</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Payout</th>
            <th>Status</th>
            <th>Clicks</th>
            <th>Conversions</th>
          </tr>
        </thead>
        <tbody id="offers-list"></tbody>
      </table>
    </div>`;

  try {
    const offers = await api.get('/api/admin/offers');
    const tbody = document.getElementById('offers-list');

    offers.forEach(offer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${offer.name}</td>
        <td>$${offer.payout.toFixed(2)}</td>
        <td><span class="badge" style="background: ${offer.status === 'active' ? 'var(--green)' : 'var(--red)'}; color: white; padding: 4px 8px; border-radius: 4px">${offer.status}</span></td>
        <td>${offer.clicks}</td>
        <td>${offer.conversions}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    handleApiError(error);
  }
}

// =====================
// EARNINGS PAGE
// =====================
async function renderEarnings() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Earnings</div>
        <div class="stat-value">$0.00</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Pending</div>
        <div class="stat-value">$0.00</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Approved</div>
        <div class="stat-value">$0.00</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Paid</div>
        <div class="stat-value">$0.00</div>
      </div>
    </div>

    <div class="card">
      <h3>Earnings Details</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id="earnings-list"></tbody>
      </table>
    </div>`;

  try {
    const resp = await api.get('/api/admin/earnings');
    const items = resp.data || resp.items || [];
    const tbody = document.getElementById('earnings-list');

    const totals = { total: 0, pending: 0, approved: 0, paid: 0 };
    items.forEach(item => {
      const amt = parseFloat(item.payout_amount || item.amount || 0);
      const st = item.status || 'pending';
      totals.total += amt;
      if (st === 'pending') totals.pending += amt;
      else if (st === 'approved') totals.approved += amt;
      else if (st === 'paid') totals.paid += amt;
    });
    document.querySelector('.stat-value:nth-child(1)').textContent = `$${totals.total.toFixed(2)}`;
    document.querySelector('.stat-value:nth-child(2)').textContent = `$${totals.pending.toFixed(2)}`;
    document.querySelector('.stat-value:nth-child(3)').textContent = `$${totals.approved.toFixed(2)}`;
    document.querySelector('.stat-value:nth-child(4)').textContent = `$${totals.paid.toFixed(2)}`;

    items.forEach(item => {
      const row = document.createElement('tr');
      const amt = parseFloat(item.payout_amount || item.amount || 0);
      const st = item.status || 'pending';
      row.innerHTML = `
        <td>${item.affiliate_name || item.affiliate_code || `#${item.affiliate_id}`}</td>
        <td>$${amt.toFixed(2)}</td>
        <td><span class="badge" style="background: ${
          st === 'pending' ? 'var(--yellow)' :
          st === 'approved' ? 'var(--green)' :
          'var(--blue)'
        }; color: white; padding: 4px 8px; border-radius: 4px">
          ${st.charAt(0).toUpperCase() + st.slice(1)}
        </span></td>
        <td>${item.created_at ? new Date(item.created_at * 1000).toLocaleDateString() : '-'}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    handleApiError(error);
  }
}

// =====================
// CONVERSIONS PAGE
// =====================
async function renderConversions() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Conversion Log</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Payout</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id="conversions-list"></tbody>
      </table>
    </div>`;

  try {
    const resp = await api.get('/api/admin/reports?type=conversions&range=30d');
    const rows = resp.rows || [];
    const tbody = document.getElementById('conversions-list');

    rows.forEach(row => {
      const r = document.createElement('tr');
      r.innerHTML = `
        <td>Campaign #${row.campaign_id || '-'}</td>
        <td>$${(row.payout || 0).toFixed(2)}</td>
        <td>${row.timestamp ? new Date(row.timestamp * 1000).toLocaleString() : '-'}</td>
      `;
      tbody.appendChild(r);
    });
  } catch (error) {
    handleApiError(error);
  }
}

// =====================
// POSTBACK PAGE
// =====================
async function renderPostback() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Postback Configuration</h3>
      <p>Configure your postback URL to receive conversion notifications. Your URL will be called with these macros:</p>
      <pre style="background: var(--panel2); padding: 12px; border-radius: 8px; margin: 12px 0">
        {click_id}, {payout}, {conversion_status}
      </pre>
      
      <div class="form-group" style="margin-bottom: 16px">
        <label for="postback-url">Postback URL</label>
        <input type="text" id="postback-url" class="form-control" placeholder="https://yourdomain.com/postback" style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      
      <button id="save-postback" class="btn" style="background: var(--indigo); color: white; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; width: 100%">
        Save Configuration
      </button>
    </div>`;

  try {
    const postback = await api.get('/api/settings/postback');
    document.getElementById('postback-url').value = postback.url || '';

    document.getElementById('save-postback').addEventListener('click', async () => {
      const url = document.getElementById('postback-url').value;
      try {
        await api.put('/api/settings/postback', { url });
        toast.success('Postback URL saved successfully');
      } catch (error) {
        toast.error('Failed to save postback URL');
      }
    });
  } catch (error) {
    if (error.message === '404') {
      console.log('Postback endpoint not implemented yet');
    } else {
      handleApiError(error);
    }
  }
}

// =====================
// SETTINGS PAGE
// =====================
async function renderSettings() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="card">
      <h3>Account Information</h3>
      <div class="form-group" style="margin-bottom: 16px">
        <label>Username</label>
        <input type="text" id="username" class="form-control" disabled style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      <div class="form-group" style="margin-bottom: 16px">
        <label>Email</label>
        <input type="text" id="email" class="form-control" disabled style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      <div class="form-group" style="margin-bottom: 16px">
        <label>Affiliate Code</label>
        <input type="text" id="affiliate-code" class="form-control" disabled style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
    </div>

    <div class="card">
      <h3>Change Password</h3>
      <div class="form-group" style="margin-bottom: 16px">
        <label for="current-password">Current Password</label>
        <input type="password" id="current-password" class="form-control" style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      <div class="form-group" style="margin-bottom: 16px">
        <label for="new-password">New Password</label>
        <input type="password" id="new-password" class="form-control" style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      <div class="form-group" style="margin-bottom: 16px">
        <label for="confirm-password">Confirm New Password</label>
        <input type="password" id="confirm-password" class="form-control" style="width: 100%; padding: 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 8px">
      </div>
      <button id="change-password" class="btn" style="background: var(--indigo); color: white; border: none; border-radius: 8px; padding: 12px; font-weight: 600; cursor: pointer; width: 100%">
        Change Password
      </button>
    </div>`;

  try {
    const data = await api.get('/api/auth/me');
    const u = data.user || {};
    const aff = data.affiliate || {};
    document.getElementById('username').value = u.user_name || '';
    document.getElementById('email').value = u.user_email || '';
    document.getElementById('affiliate-code').value = aff.affiliate_code || '';

    document.getElementById('change-password').addEventListener('click', async () => {
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      try {
        await api.put('/api/auth/password', {
          currentPassword,
          newPassword
        });
        toast.success('Password changed successfully');
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
      } catch (error) {
        toast.error('Failed to change password');
      }
    });
  } catch (error) {
    handleApiError(error);
  }
}

// Initialize toast notifications
function initToast() {
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.position = 'fixed';
  toastContainer.style.bottom = '20px';
  toastContainer.style.right = '20px';
  toastContainer.style.zIndex = '9999';
  document.body.appendChild(toastContainer);

  window.toast = {
    success: (message) => {
      showToast(message, 'background: var(--green); color: white');
    },
    error: (message) => {
      showToast(message, 'background: var(--red); color: white');
    }
  };

  function showToast(message, style) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.marginBottom = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.transform = 'translateX(120%)';
    toast.style = style;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Animate out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 4000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initToast();
});