const express = require('express');
const router = express.Router();
const { routeTrafficByHash, generateSmartlink, listSmartlinks, recordConversion, getSmartlinkStats } = require('../controllers/smartlinkController');
const { authenticate } = require('../middleware/auth');

router.post('/generate', authenticate, generateSmartlink);
router.get('/list', authenticate, listSmartlinks);
router.post('/convert', authenticate, recordConversion);
router.get('/stats', authenticate, getSmartlinkStats);
router.get('/:hash', routeTrafficByHash);

module.exports = router;
