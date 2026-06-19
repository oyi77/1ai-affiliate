const express = require('express');
const router = express.Router();
const { login, getMe, forgotPassword, resetPassword, changePassword, getApiKey, regenerateApiKey, registerAffiliate } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { rateLimitAuth, rateLimitRegister } = require('../middleware/rateLimit');

router.post('/login', rateLimitAuth, login);
router.post('/register', rateLimitRegister, registerAffiliate);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', rateLimitAuth, forgotPassword);
router.post('/reset-password', rateLimitAuth, resetPassword);
router.put('/password', authenticate, changePassword);
router.get('/api-key', authenticate, getApiKey);
router.post('/api-key/regenerate', authenticate, regenerateApiKey);

module.exports = router;