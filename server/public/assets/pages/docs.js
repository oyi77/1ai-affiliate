/**
 * Docs Page — markdown documentation viewer
 * Depends on: API, UI, Fmt, Router
 */
Router.register('docs', async (target) => {
  let docs = [];
  try { const data = await API.get('/api/docs'); docs = data.docs || []; } catch {}

  target.innerHTML = `
    ${UI.pageHeader('Documentation', 'Guides & references')}
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${docs.map(d => UI.card(`
          <div class="font-medium text-sm">${Fmt.slugToTitle(d.slug)}</div>
          <div class="text-xs muted mt-1">${d.slug}</div>
        `, `PageActions.loadDoc('${d.slug}')`)).join('')}
      </div>
      <div id="doc-content" class="hidden panel rounded-2xl p-5">
        <div id="doc-title" class="font-bold text-lg mb-3"></div>
        <div id="doc-body" class="prose prose-invert max-w-none text-sm leading-relaxed"></div>
        <button onclick="document.getElementById('doc-content').classList.add('hidden')" class="mt-3 text-xs muted hover:text-white">Close</button>
      </div>
    </div>
  `;
});

PageActions.loadDoc = async (slug) => {
  try {
    const data = await API.get('/api/docs/' + slug);
    document.getElementById('doc-title').textContent = Fmt.slugToTitle(data.slug);
    document.getElementById('doc-body').innerHTML = data.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="panel px-1 rounded text-indigo-300">$1</code>')
      .replace(/\n/g, '<br>');
    document.getElementById('doc-content').classList.remove('hidden');
  } catch (err) { alert('Failed to load doc: ' + err.message); }
};