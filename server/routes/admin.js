const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { rateLimitAdmin } = require('../middleware/rateLimit');
const {
  getUsers,
  createUser,
  getStats,
  getCommissions,
  getPayments,
  getReport,
  exportReportCsv,
  getSystemStatus,
  getClickServers,
  addClickServer,
  getVipProfile,
  saveVipProfile,
  getMargin,
  setMargin,
  getNetworks,
  createNetwork,
  getPostbackLogs,
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  getShortenerServices,
  saveShortenerService,
  deleteShortenerService,
  testShortenerService,
  createManualConversion,
  testConversionPixel,
} = require('../controllers/adminController');

router.use(authenticate);
router.use(rateLimitAdmin);

// Users
router.get('/users', requireAdmin, getUsers);
router.post('/users', requireAdmin, createUser);

// Stats (open to all roles, data filtered inside)
router.get('/stats', getStats);

// Commissions & Payments
router.get('/commissions', requireAdmin, getCommissions);
router.get('/payments', requireAdmin, getPayments);

// Reports (legacy)
router.get('/reports', requireAdmin, getReport);
router.get('/reports.csv', requireAdmin, exportReportCsv);

// System
router.get('/system', requireAdmin, getSystemStatus);
router.get('/clickservers', requireAdmin, getClickServers);
router.post('/clickservers', requireAdmin, addClickServer);

// Margin
router.get('/margin/:userId', requireAdmin, getMargin);
router.get('/margin', getMargin);
router.post('/margin', requireAdmin, setMargin);

// Networks
router.get('/networks', requireAdmin, getNetworks);
router.post('/networks', requireAdmin, createNetwork);

// VIP
router.get('/vip', getVipProfile);
router.put('/vip', saveVipProfile);

// Postback logs
router.get('/postback-logs', requireAdmin, getPostbackLogs);

// Domain Management
router.get('/domains', requireAdmin, getDomains);
router.post('/domains', requireAdmin, createDomain);
router.put('/domains/:id', requireAdmin, updateDomain);
router.delete('/domains/:id', requireAdmin, deleteDomain);

// URL Shortener Services
router.get('/shorteners', requireAdmin, getShortenerServices);
router.post('/shorteners', requireAdmin, saveShortenerService);
router.put('/shorteners/:id', requireAdmin, saveShortenerService);
router.delete('/shorteners/:id', requireAdmin, deleteShortenerService);
router.post('/shorteners/:id/test', requireAdmin, testShortenerService);

// Manual conversion entry
router.post('/conversions/manual', requireAdmin, createManualConversion);
router.get('/pixel/test', requireAdmin, testConversionPixel);

// Fraud Dashboard
router.get('/fraud/dashboard', requireAdmin, async (req, res) => {
  const pool = require('../db/mysql');
  try {
    const [totalClicks] = await pool.query('SELECT COUNT(*) AS cnt FROM 1ai_fraud_click_velocity WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)');
    const [blockedClicks] = await pool.query('SELECT COUNT(*) AS cnt FROM 1ai_fraud_click_velocity WHERE blocked = 1 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)');
    const [topReasons] = await pool.query('SELECT reason, COUNT(*) AS cnt FROM 1ai_fraud_click_velocity WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) AND reason IS NOT NULL GROUP BY reason ORDER BY cnt DESC LIMIT 10');
    const [topIPs] = await pool.query('SELECT ip_address, COUNT(*) AS cnt FROM 1ai_fraud_click_velocity WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY ip_address ORDER BY cnt DESC LIMIT 10');
    const [blacklistCount] = await pool.query('SELECT COUNT(*) AS cnt FROM 1ai_fraud_blacklist');
    res.json({
      total_clicks_24h: totalClicks[0]?.cnt || 0,
      blocked_clicks_24h: blockedClicks[0]?.cnt || 0,
      top_fraud_reasons: topReasons,
      top_fraud_ips: topIPs,
      blacklist_size: blacklistCount[0]?.cnt || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
