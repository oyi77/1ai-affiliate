const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
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
} = require('../controllers/adminController');

router.use(authenticate);

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

module.exports = router;
