const pool = require('./db/mysql');
async function run() {
  try {
    const [clicks] = await pool.query('SELECT COUNT(*) as c FROM 1ai_clicks WHERE DATE(FROM_UNIXTIME(created_at)) = CURDATE()');
    console.log("Clicks today:", clicks[0].c);

    const [conversions] = await pool.query('SELECT COUNT(*) as c, SUM(payout) as com FROM 1ai_postback_logs WHERE DATE(FROM_UNIXTIME(created_at)) = CURDATE() AND status = \'approved\'');
    console.log("Commissions today:", conversions[0].com || 0);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
