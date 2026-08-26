require('dotenv').config({ path: '/home/openclaw/projects/1ai-affiliate/server/.env' });
const crypto = require('crypto');
const pool = require('/home/openclaw/projects/1ai-affiliate/server/db/mysql');

(async () => {
  const now = Math.floor(Date.now()/1000);
  const slug = 'kacamata-photochromic-wf02-0809aft';
  const linkToken = crypto.randomBytes(16).toString('hex');
  const trackingUrl = 'https://shopee.co.id/search?f_location=Indonesia&keyword=kacamata+photochromic+anti+radiasi&sortBy=sales&utm_source=aff_wf02&utm_medium=affiliate&utm_campaign=wf02-20260809-aft';
  const con = await pool.getConnection();
  try {
    const [oir] = await con.query(
      `INSERT INTO 1ai_offers (name, vertical, geo, type, payout, network_payout, payout_currency, status, approval_status, notes, created_at, updated_at, postback_enabled, tracking_url)
       VALUES (?, 'Eyewear / Kacamata', 'ID', 'CPA', 2500, 2500, 'IDR', 'active', 'approved', 'WF02 afternoon — #kacamata 19.44B views / 3.44M creators; photochromic viral', ?, ?, 1, ?)`,
      ['Kacamata Photochromic Anti Radiasi - Berubah Warna Kena Sinar Matahari [Shopee Affiliate]', now, now, trackingUrl]
    );
    const offerId = oir.insertId;
    console.log('CREATED offer id:', offerId);

    const [lr] = await con.query(
      `INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, link_token, status, clicks, conversions, created_at, updated_at)
       VALUES (13, ?, ?, ?, 'active', 0, 0, ?, ?)`,
      [offerId, slug, linkToken, now, now]
    );
    console.log('CREATED link id:', lr.insertId, 'slug:', slug);
    console.log('URL: https://affiliate.berkahkarya.org/go/' + slug);
  } catch(e) {
    console.error('ERR', e.message);
    process.exit(1);
  } finally {
    con.release();
    await pool.end();
  }
})();
