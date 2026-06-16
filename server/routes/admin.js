const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const { rateLimitWrite, rateLimitRead } = require('../middleware/rateLimit');
const {
  getUsers,
  createUser,
  getAffiliates,
  getEarnings,
  approveEarning,
  getStats,
  getCommissions,
  getPayments,
  getCampaigns,
  getReport,
  exportReportCsv,
  getSystemStatus,
  getClickServers,
  addClickServer,
  getVipProfile,
  saveVipProfile,
  getOffers,
  createOffer,
  linkOfferToCampaign,
  getMargin,
  setMargin,
  getNetworks,
  createNetwork,
  setOfferPostback,
  getOfferPostback,
  getPostbackLogs,
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  getShortenerServices,
  saveShortenerService,
  deleteShortenerService,
  testShortenerService,
} = require('../controllers/adminController');

router.use(authenticate);
// Role-based access control: some endpoints are open to all roles (with data filtering),
// others are restricted to specific roles.


router.get('/users', requireAdmin, getUsers);
router.post('/users', requireAdmin, createUser);
router.get('/affiliates', requireAdmin, getAffiliates);
router.get('/earnings', requireRole('admin', 'affiliate', 'advertiser'), getEarnings); // Role-filtered inside controller
router.post('/earnings/:id/approve', requireAdmin, approveEarning);
router.get('/stats', getStats); // Open to all roles, data filtered inside
router.get('/commissions', requireAdmin, getCommissions);
router.get('/payments', requireAdmin, getPayments);
router.get('/campaigns', requireRole('admin', 'advertiser'), getCampaigns); // Role-filtered inside controller
router.get('/reports', requireAdmin, getReport);
router.get('/reports.csv', requireAdmin, exportReportCsv);
router.get('/system', requireAdmin, getSystemStatus);
router.get('/clickservers', requireAdmin, getClickServers);
router.post('/clickservers', requireAdmin, addClickServer);
router.get('/offers', requireRole('admin', 'affiliate', 'advertiser'), getOffers); // Role-filtered inside controller
router.post('/offers', requireRole('admin', 'advertiser'), createOffer); // Restricted per Phase A
router.post('/offer-campaign', requireAdmin, linkOfferToCampaign); // Link offer to campaign
router.get('/margin/:userId', requireAdmin, getMargin); // Get margin for a user
router.get('/margin', getMargin); // Get own margin (any role)
router.post('/margin', requireAdmin, setMargin); // Set margin for a user
router.get('/networks', requireAdmin, getNetworks);
router.post('/networks', requireAdmin, createNetwork);
router.get('/vip', getVipProfile);
router.put('/vip', saveVipProfile);
router.post('/offers/:offerId/postback', requireAdmin, setOfferPostback);
router.get('/offers/:offerId/postback', requireAdmin, getOfferPostback);
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

module.exports = router;
