const express = require('express');
const router = express.Router();
const { receivePostback } = require('../controllers/postbackController');
const { rateLimitPostback } = require('../middleware/rateLimit');

// Public postback endpoint — NO AUTH required (security via click_id uniqueness + optional signature)
router.get('/postback', rateLimitPostback, receivePostback);
router.post('/postback', rateLimitPostback, receivePostback);

module.exports = router;
