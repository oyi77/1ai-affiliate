const express = require('express');
const router = express.Router();
const { listDeepLinks, createDeepLink, deleteDeepLink } = require('../controllers/deepLinkController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, listDeepLinks);
router.post('/', authenticate, createDeepLink);
router.delete('/:id', authenticate, deleteDeepLink);

module.exports = router;
