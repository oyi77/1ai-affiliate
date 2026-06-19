const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMyStats, getMyLinks, getMyEarnings } = require('../controllers/affiliateDashboardController');

router.use(authenticate);

router.get('/stats', getMyStats);
router.get('/links', getMyLinks);
router.get('/earnings', getMyEarnings);

module.exports = router;
