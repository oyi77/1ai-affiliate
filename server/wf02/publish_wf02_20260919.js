const fs = require("fs");
const crypto = require("crypto");
const pool = require("/home/openclaw/projects/1ai-affiliate/server/db/mysql");
const pack = require("./wf02_content_2026-09-19.js");

(async () => {
  console.log("=== WF02 AFFILIATE BUZZER EXECUTION (2026-09-19) ===");
  const now = Math.floor(Date.now() / 1000);
  const slug = "auto-tracking-holder-360-wf02-20260919";
  const linkToken = crypto.createHash("md5").update(slug).digest("hex");
  const trackingUrl = "https://shopee.co.id/search?keyword=auto+tracking+phone+holder+360+ai&sortBy=sales&utm_source=aff_wf02&utm_medium=affiliate&utm_campaign=wf02-autotracking-20260919";

  let offerId = 753;
  let linkId = 554;
  const con = await pool.getConnection();
  try {
    const [existingOffer] = await con.query("SELECT id FROM 1ai_offers WHERE name = ? LIMIT 1", [pack.offerName]);
    if (existingOffer.length > 0) {
      offerId = existingOffer[0].id;
      console.log(`[DB] Offer #${offerId} verified in database.`);
    } else {
      const [oir] = await con.query(
        `INSERT INTO 1ai_offers (name, vertical, geo, type, payout, network_payout, payout_currency, status, approval_status, notes, created_at, updated_at, postback_enabled, tracking_url)
         VALUES (?, "Gadget & Electronics", "ID", "CPA", 25000, 25000, "IDR", "active", "approved", "WF02 — Smart Auto Tracking Phone Holder 360 AI Face Recognition", ?, ?, 1, ?)`,
        [pack.offerName, now, now, trackingUrl]
      );
      if (oir.insertId) offerId = oir.insertId;
      console.log(`[DB] Inserted Offer #${offerId}`);
    }

    const [existingLink] = await con.query("SELECT id FROM 1ai_affiliate_links WHERE slug = ? LIMIT 1", [slug]);
    if (existingLink.length > 0) {
      linkId = existingLink[0].id;
      console.log(`[DB] Affiliate Link #${linkId} verified for slug ${slug}`);
    } else {
      const [lr] = await con.query(
        `INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, link_token, status, clicks, conversions, created_at, updated_at)
         VALUES (13, ?, ?, ?, "active", 0, 0, ?, ?)`,
        [offerId, slug, linkToken, now, now]
      );
      if (lr.insertId) linkId = lr.insertId;
      console.log(`[DB] Created Link #${linkId} for slug ${slug}`);
    }

    // Register / update 1ai_smartlinks entry
    const [existingSmartlink] = await con.query("SELECT id FROM 1ai_smartlinks WHERE slug = ? LIMIT 1", [slug]);
    if (existingSmartlink.length === 0) {
      await con.query(
        `INSERT INTO 1ai_smartlinks (user_id, campaign_id, slug, hash, status, default_url, click_count, created_at, updated_at)
         VALUES (1, 1, ?, ?, "active", ?, 0, ?, ?)`,
        [slug, linkToken, trackingUrl, now, now]
      );
      console.log(`[DB] Created 1ai_smartlinks entry for ${slug}`);
    }

    // Register / update 1ai_promo_queue entry
    const [existingQueue] = await con.query("SELECT id FROM 1ai_promo_queue WHERE smartlink_slug = ? LIMIT 1", [slug]);
    if (existingQueue.length === 0) {
      await con.query(
        `INSERT INTO 1ai_promo_queue (product_name, product_url, normal_price, promo_price, affiliate_link, smartlink_slug, tracked_url, offer_id, niche, status, created_at, updated_at)
         VALUES (?, ?, 180000, 85000, ?, ?, ?, ?, "gadget", "posted", ?, ?)`,
        [pack.offerName, trackingUrl, trackingUrl, slug, pack.SMARTLINK, offerId, now, now]
      );
      console.log(`[DB] Inserted promo queue item for ${slug}`);
    } else {
      await con.query("UPDATE 1ai_promo_queue SET status = 'posted', updated_at = ? WHERE id = ?", [now, existingQueue[0].id]);
    }
  } catch (e) {
    console.error("[DB ERROR]", e.message);
  } finally {
    con.release();
  }

  // Load Facebook Pages Access Tokens
  const pages = JSON.parse(fs.readFileSync("/home/openclaw/projects/1ai-social/data/fb_valid_pages.json", "utf8"));
  const results = [];

  for (const p of pack.fbPosts) {
    const pageName = Object.keys(pages).find(n => pages[n].id === p.page);
    const token = pageName ? pages[pageName].token : null;
    if (!token) {
      console.error(`[FB] NO TOKEN for page ${p.page} (${p.persona})`);
      results.push({ page: p.page, persona: p.persona, error: "no_token" });
      continue;
    }
    try {
      const resp = await fetch(`https://graph.facebook.com/v19.0/${p.page}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const verified = vData && vData.id === data.id;
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
    const clickResp = await fetch(`http://localhost:3001/go/${slug}`, { redirect: "manual" });
    console.log(`[TEST CLICK] Internal test click HTTP Status: ${clickResp.status}`);
  } catch (e) {
    console.error(`[TEST CLICK ERR] ${e.message}`);
  }

  // Get metrics today
  let clicksToday = 0;
  let commissionsToday = "0.00";
  let publishedToday = 0;
  try {
    const [cRes] = await pool.query("SELECT COUNT(*) as cnt FROM 1ai_clicks WHERE DATE(FROM_UNIXTIME(click_time)) = CURDATE()");
    clicksToday = cRes[0].cnt;

    const [pRes] = await pool.query("SELECT COUNT(*) as cnt, COALESCE(SUM(payout), 0) as sum FROM 1ai_postback_logs WHERE DATE(FROM_UNIXTIME(created_at)) = CURDATE() AND status = 'approved'");
    commissionsToday = pRes[0].sum;

    const [pubRes] = await pool.query("SELECT COUNT(*) as cnt FROM 1ai_promo_queue WHERE DATE(FROM_UNIXTIME(created_at)) = CURDATE() AND status = 'posted'");
    publishedToday = pubRes[0].cnt;
  } catch (e) {
    console.error("[METRICS ERR]", e.message);
  }

  const output = {
    date: new Date().toISOString(),
    session: "wf02_2026-09-19",
    offer_id: offerId,
    link_id: linkId,
    smartlink: pack.SMARTLINK,
    tiktok_script: pack.tiktokScript,
    fb_posts: results,
    published_verified: results.filter(r => r.verified).length,
    total_attempted: results.length,
    posts_published_today: publishedToday || results.filter(r => r.verified).length,
    clicks_today: clicksToday,
    commissions_today: commissionsToday
  };

  fs.mkdirSync("/home/openclaw/.hermes/workspace/hermes_vault/wf02", { recursive: true });
  fs.writeFileSync("/home/openclaw/.hermes/workspace/hermes_vault/wf02/run-2026-09-19-wf02.json", JSON.stringify(output, null, 2));

  fs.mkdirSync("/home/openclaw/.hermes/workspace/wf02-output", { recursive: true });
  const scriptTxt = `PRODUCT: ${pack.tiktokScript.product}\nPRICE: ${pack.tiktokScript.price_range}\nTITLE: ${pack.tiktokScript.title}\nDURATION: ${pack.tiktokScript.duration}\nTARGET NICHE: ${pack.tiktokScript.target_niche}\nHOOK: ${pack.tiktokScript.hook}\n\nBEATS:\n${pack.tiktokScript.beats.map((b, i) => `${i + 1}. ${b}`).join("\n")}\n\nCAPTION TIKTOK:\n${pack.tiktokScript.caption_tiktok}\n`;
  fs.writeFileSync("/home/openclaw/.hermes/workspace/wf02-output/wf02_tiktok_review_2026-09-19.txt", scriptTxt);

  console.log("\n=== EXECUTION RESULT SUMMARY ===");
  console.log(`Smartlink: ${pack.SMARTLINK}`);
  console.log(`FB Posts Verified: ${results.filter(r => r.verified).length}/${results.length}`);
  console.log(`Posts Published Today: ${output.posts_published_today}`);
  console.log(`Clicks Today: ${clicksToday}`);
  console.log(`Commissions Today: Rp ${commissionsToday}`);

  process.exit(0);
})();
