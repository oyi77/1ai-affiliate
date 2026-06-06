const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { requireRole, requireAffiliate, requireAdvertiser } = require('../middleware/roleMiddleware');
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
router.post('/offers', createOffer); // Open to all, but requires admin/advertiser logic inside
router.post('/offer-campaign', requireAdmin, linkOfferToCampaign); // Link offer to campaign
router.get('/margin/:userId', requireAdmin, getMargin); // Get margin for a user
router.get('/margin', getMargin); // Get own margin (any role)
router.post('/margin', requireAdmin, setMargin); // Set margin for a user
router.get('/networks', requireAdmin, getNetworks);
router.post('/networks', requireAdmin, createNetwork);
router.get('/vip', getVipProfile);
router.put('/vip', saveVipProfile);

module.exports = router;
