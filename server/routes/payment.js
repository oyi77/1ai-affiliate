const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createTransaction, handleCallback } = require('../controllers/paymentController');

router.post('/create', authenticate, createTransaction);
router.post('/callback', handleCallback); // Called by Tripay, auth via signature

module.exports = router;
