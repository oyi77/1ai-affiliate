/** Shared approve action */
window.Approve = {
  approveEarning: async function(id) {
    if (!confirm('Approve this earning?')) return;
    try {
      await API.post('/api/admin/earnings/'+id+'/approve');
      Router.navigate(Router.getCurrentPage());
    } catch(e) { alert(e.message); }
  }
};