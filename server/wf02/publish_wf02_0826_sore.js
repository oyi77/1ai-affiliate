const fs = require('fs');
const pack = require('./wf02_content_2026-08-26-sore.js');

(async () => {
  const pages = JSON.parse(fs.readFileSync('/home/openclaw/projects/1ai-social/data/fb_valid_pages.json', 'utf8'));
  const results = [];
  for (const p of pack.fbPosts) {
    const pageName = Object.keys(pages).find(n => pages[n].id === p.page);
    const token = pageName ? pages[pageName].token : null;
    if (!token) { console.error('NO TOKEN for', p.page, p.persona); results.push({ page: p.page, error: 'no_token' }); continue; }
    try {
      const resp = await fetch(`https://graph.facebook.com/v19.0/${p.page}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: p.message, access_token: token }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        console.error('POST FAIL', p.persona, JSON.stringify(data.error || {}));
        results.push({ page: p.page, persona: p.persona, error: data.error ? data.error.message : resp.status });
        continue;
      }
      // verify via read-back
      await new Promise(r => setTimeout(r, 2000));
      const vResp = await fetch(`https://graph.facebook.com/v19.0/${data.id}?fields=id,message,created_time,permalink_url&access_token=${token}`);
      const vData = await vResp.json();
      const verified = vData && vData.id === data.id && (vData.message || '').includes('affiliate.berkahkarya.org/go/kursicamping-wf02-0826-sore');
      console.log(`PUBLISHED ${p.persona} (${pageName}) -> ${data.id} | verified=${verified}`);
      results.push({ page: p.page, name: pageName, persona: p.persona, post_id: data.id, verified, permalink: vData.permalink_url });
    } catch (e) {
      console.error('ERR', p.persona, e.message);
      results.push({ page: p.page, persona: p.persona, error: e.message });
    }
  }
  fs.writeFileSync('/home/openclaw/projects/1ai-affiliate/server/wf02/run_wf02_2026-08-26_sore.json',
    JSON.stringify({ run_at: new Date().toISOString(), smartlink: pack.SMARTLINK, offer: 737, link: 409, results }, null, 2));
  const ok = results.filter(r => r.verified).length;
  console.log(`SUMMARY: ${ok}/${results.length} published+verified`);
})();
