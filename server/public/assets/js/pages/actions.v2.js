/** Shared dashboard-native actions and feedback helpers */
window.AppUI = window.AppUI || (function() {
  function ensureStyles() {
    if (document.getElementById('appui-styles')) return;
    const style = document.createElement('style');
    style.id = 'appui-styles';
    style.textContent = `
      .appui-toast-wrap{position:fixed;right:20px;bottom:20px;z-index:1000;display:flex;flex-direction:column;gap:8px;max-width:360px}
      .appui-toast{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--indigo);border-radius:8px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:13px;color:var(--text)}
      .appui-toast.ok{border-left-color:var(--green)} .appui-toast.err{border-left-color:var(--red)}
      .appui-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:900;display:flex;align-items:center;justify-content:center;padding:20px}
      .appui-modal{width:min(420px,100%);background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
      .appui-modal h3{font-size:15px;margin-bottom:8px}.appui-modal p{font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px}.appui-modal-actions{display:flex;justify-content:flex-end;gap:8px}
    `;
    document.head.appendChild(style);
  }

  function toast(message, type = 'ok') {
    ensureStyles();
    let wrap = document.getElementById('appui-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'appui-toast-wrap';
      wrap.className = 'appui-toast-wrap';
      document.body.appendChild(wrap);
    }
    const node = document.createElement('div');
    node.className = `appui-toast ${type}`;
    node.textContent = message;
    wrap.appendChild(node);
    setTimeout(() => node.remove(), 4200);
  }

  function confirm({ title = 'Confirm action', message = 'Proceed?', confirmText = 'Confirm', danger = false } = {}) {
    ensureStyles();
    return new Promise(resolve => {
      const backdrop = document.createElement('div');
      backdrop.className = 'appui-modal-backdrop';
      backdrop.innerHTML = `<div class="appui-modal" role="dialog" aria-modal="true">
        <h3></h3><p></p>
        <div class="appui-modal-actions">
          <button class="btn btn-outline btn-sm" data-action="cancel">Cancel</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm" data-action="confirm"></button>
        </div>
      </div>`;
      backdrop.querySelector('h3').textContent = title;
      backdrop.querySelector('p').textContent = message;
      backdrop.querySelector('[data-action="confirm"]').textContent = confirmText;
      function done(value) { backdrop.remove(); resolve(value); }
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop || e.target.dataset.action === 'cancel') done(false);
        if (e.target.dataset.action === 'confirm') done(true);
      });
      document.body.appendChild(backdrop);
    });
  }

  return { toast, confirm };
})();

window.Approve = {
  approveEarning: async function(id) {
    const ok = await AppUI.confirm({
      title: 'Approve earning',
      message: 'This will mark the earning as approved and include it in payout totals.',
      confirmText: 'Approve'
    });
    if (!ok) return;
    try {
      await API.post('/api/admin/earnings/' + id + '/approve');
      AppUI.toast('Earning approved');
      Router.navigate(Router.getCurrentPage());
    } catch(e) { AppUI.toast(e.message, 'err'); }
  }
};
