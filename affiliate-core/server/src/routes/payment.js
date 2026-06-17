const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

router.post('/transaction', authenticate, paymentController.createTransaction);
router.post('/callback', paymentController.handleCallback); // Webhook does not use our auth middleware

module.exports = router;
