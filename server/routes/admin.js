const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getUsers, getAffiliates, getEarnings, approveEarning, getStats,
  getCommissions, getPayments, getCampaigns, getSystemStatus, getClickServers
} = require('../controllers/adminController');

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', getUsers);
router.get('/affiliates', getAffiliates);
router.get('/earnings', getEarnings);
router.post('/earnings/:id/approve', approveEarning);
router.get('/stats', getStats);
router.get('/commissions', getCommissions);
router.get('/payments', getPayments);
router.get('/campaigns', getCampaigns);
router.get('/system', getSystemStatus);
router.get('/clickservers', getClickServers);

module.exports = router;
