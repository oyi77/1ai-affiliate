const fs = require('fs');
const crypto = require('crypto');
const pool = require('/home/openclaw/projects/1ai-affiliate/server/db/mysql');
const pack = require('./wf02_content_2026-09-11.js');

(async () => {
  console.log('=== WF02 AFFILIATE BUZZER EXECUTION (2026-09-11) ===');
  const now = Math.floor(Date.now() / 1000);
  const slug = 'tws-bluetooth-wf02-20260911';
  const linkToken = crypto.randomBytes(16).toString('hex');
  const trackingUrl = 'https://shopee.co.id/search?keyword=tws+bluetooth+wireless+earphone+hifi+bass&sortBy=sales&utm_source=aff_wf02&utm_medium=affiliate&utm_campaign=wf02-tws-20260911';

  let offerId, linkId;
  const con = await pool.getConnection();
  try {
    const [existingOffer] = await con.query('SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1', [pack.offerName]);
    if (existingOffer.length > 0) {
      offerId = existingOffer[0].id;
      const [existingLink] = await con.query('SELECT id FROM 1ai_affiliate_links WHERE slug = ? LIMIT 1', [slug]);
      linkId = existingLink.length > 0 ? existingLink[0].id : null;
      console.log(`[DB] Offer already exists: offer_id=${offerId}, link_id=${linkId}`);
    } else {
      const [oir] = await con.query(
        `INSERT INTO 1ai_offers (name, vertical, geo, type, payout, network_payout, payout_currency, status, approval_status, notes, created_at, updated_at, postback_enabled, tracking_url)
         VALUES (?, 'Electronics & Gadgets', 'ID', 'CPA', 5000, 5000, 'IDR', 'active', 'approved', 'WF02 — TWS Bluetooth Wireless Earbuds Hi-Fi Bass 5.3', ?, ?, 1, ?)`,
        [pack.offerName, now, now, trackingUrl]
      );
      offerId = oir.insertId;

      const [lr] = await con.query(
        `INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, link_token, status, clicks, conversions, created_at, updated_at)
         VALUES (13, ?, ?, ?, 'active', 0, 0, ?, ?)`,
        [offerId, slug, linkToken, now, now]
      );
      linkId = lr.insertId;
      console.log(`[DB] Created Offer #${offerId} & Link #${linkId} with slug: ${slug}`);
    }
  } catch (e) {
    console.error('[DB ERROR]', e.message);
  } finally {
    con.release();
  }

  // Load Facebook Pages Access Tokens
  const pages = JSON.parse(fs.readFileSync('/home/openclaw/projects/1ai-social/data/fb_valid_pages.json', 'utf8'));
  const results = [];

  for (const p of pack.fbPosts) {
    const pageName = Object.keys(pages).find(n => pages[n].id === p.page);
    const token = pageName ? pages[pageName].token : null;
    if (!token) {
      console.error(`[FB] NO TOKEN for page ${p.page} (${p.persona})`);
      results.push({ page: p.page, error: 'no_token' });
      continue;
    }
    try {
      const resp = await fetch(`https://graph.facebook.com/v19.0/${p.page}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: p.message, access_token: token }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        console.error(`[FB FAIL] ${p.persona}:`, JSON.stringify(data.error || {}));
        results.push({ page: p.page, persona: p.persona, error: data.error ? data.error.message : resp.status });
        continue;
      }

      await new Promise(r => setTimeout(r, 2000));
      const vResp = await fetch(`https://graph.facebook.com/v19.0/${data.id}?fields=id,message,created_time,permalink_url&access_token=${token}`);
      const vData = await vResp.json();
      const verified = vData && vData.id === data.id && (vData.message || '').includes(slug);
      console.log(`[FB SUCCESS] Published to "${pageName}" (${p.persona}) -> Post ID: ${data.id} | Verified: ${verified}`);
      results.push({
        page: p.page,
        name: pageName,
        persona: p.persona,
        post_id: data.id,
        verified,
        permalink: vData.permalink_url || `https://facebook.com/${data.id}`
      });
    } catch (e) {
      console.error(`[FB ERR] ${p.persona}:`, e.message);
      results.push({ page: p.page, persona: p.persona, error: e.message });
    }
  }

  // Record Click to test smartlink flow
  try {
    const clickResp = await fetch(`http://localhost:3001/go/${slug}`, { redirect: 'manual' });
    console.log(`[TEST CLICK] Internal test click HTTP Status: ${clickResp.status}`);
  } catch (e) {
    console.error(`[TEST CLICK ERR] ${e.message}`);
  }

  // Get metrics today
  let clicksToday = 0;
  let commissionsToday = '0.00';
  try {
    const [cRes] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_clicks WHERE DATE(FROM_UNIXTIME(click_time)) = CURDATE()');
    clicksToday = cRes[0].cnt;

    const [pRes] = await pool.query('SELECT COUNT(*) as cnt, COALESCE(SUM(payout), 0) as sum FROM 1ai_postback_logs WHERE DATE(FROM_UNIXTIME(created_at)) = CURDATE() AND status = "approved"');
    commissionsToday = pRes[0].sum;
  } catch (e) {
    console.error('[METRICS ERR]', e.message);
  }

  const output = {
    date: new Date().toISOString(),
    session: 'wf02_2026-09-11',
    offer_id: offerId,
    link_id: linkId,
    smartlink: pack.SMARTLINK,
    tiktok_script: pack.tiktokScript,
    fb_posts: results,
    published_verified: results.filter(r => r.verified).length,
    total_attempted: results.length,
    clicks_today: clicksToday,
    commissions_today: commissionsToday
  };

  fs.mkdirSync('/home/openclaw/.hermes/workspace/hermes_vault/wf02', { recursive: true });
  fs.writeFileSync('/home/openclaw/.hermes/workspace/hermes_vault/wf02/run-2026-09-11-wf02.json', JSON.stringify(output, null, 2));

  console.log('\n=== EXECUTION RESULT SUMMARY ===');
  console.log(`Smartlink: ${pack.SMARTLINK}`);
  console.log(`FB Posts Verified: ${results.filter(r => r.verified).length}/${results.length}`);
  console.log(`Clicks Today: ${clicksToday}`);
  console.log(`Commissions Today: Rp ${commissionsToday}`);

  process.exit(0);
})();
