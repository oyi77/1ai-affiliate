const express = require('express');
const router = express.Router();
const { routeTraffic, generateSmartlink, listSmartlinks } = require('../controllers/smartlinkController');
const { authenticate } = require('../middleware/auth');

// Public tracking link
router.get('/route', routeTraffic);

// Authenticated endpoints
router.post('/generate', authenticate, generateSmartlink);
router.get('/list', authenticate, listSmartlinks);

module.exports = router;
