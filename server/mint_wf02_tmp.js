require('dotenv').config({ path: '/home/openclaw/projects/1ai-affiliate/server/.env' });
const { mintSmartlink } = require('/home/openclaw/projects/1ai-affiliate/server/services/smartlinkService');
const pool = require('/home/openclaw/projects/1ai-affiliate/server/db/mysql');

(async () => {
  const kw = 'pegangan+hp+360+derajat+ring+grip';
  const campaign = 'wf02-20260806';
  const trackingUrl = `https://shopee.co.id/search?f_location=Indonesia&keyword=${kw}&sortBy=sales&utm_source=aff_wf02&utm_medium=affiliate&utm_campaign=${campaign}`;
  const name = 'Pegangan HP Fleksibel 360 Derajat - Grip Ring + Stand HP [Shopee Affiliate]';
  const con = await pool.getConnection();
  try {
    const [r] = await con.query(
      `INSERT INTO 1ai_offers (name, vertical, geo, type, payout, network_payout, payout_currency, status, approval_status, postback_enabled, postback_retries, postback_timeout, postback_method, postback_headers, payout_model, cap_enabled, tracking_url, created_at, updated_at)
       VALUES (?, 'Aksesoris HP / Gadget', 'ID', 'CPA', 2500, 2500, 'IDR', 'active', 'approved', 1, 3, 10, 'GET', '{}', 'CPA', 0, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [name, trackingUrl]
    );
    const offerId = r.insertId;
    console.log("CREATED offer_id:", offerId);

    const link = await mintSmartlink({ offerId, affiliateId: 13, domainId: null, shortenerServiceId: null });
    console.log("MINTED:", JSON.stringify(link));
  } catch(e){ console.error("ERR", e.message); }
  await pool.end();
})();
