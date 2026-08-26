require('dotenv').config({ path: '/home/openclaw/projects/1ai-affiliate/server/.env' });
const crypto = require('crypto');
const pool = require('/home/openclaw/projects/1ai-affiliate/server/db/mysql');

(async () => {
  const slug = 'tasransel-wf02-0809-noon';
  const linkToken = crypto.randomBytes(16).toString('hex');
  const con = await pool.getConnection();
  try {
    const [lr] = await con.query(
      `INSERT INTO 1ai_affiliate_links (affiliate_id, offer_id, slug, link_token, status, clicks, conversions, created_at, updated_at)
       VALUES (13, 723, ?, ?, 'active', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
      [slug, linkToken]
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
