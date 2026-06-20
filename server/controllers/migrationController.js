const pool = require('../db/mysql');
const { importFromBeMob } = require('../services/migrationService');

async function importBeMob(req, res) {
  try {
    const result = await importFromBeMob(req.user.id, pool, req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('BeMob import error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = { importBeMob };
