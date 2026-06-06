const express = require('express');
const router = express.Router();
const { login, getMe, forgotPassword, resetPassword, changePassword, getApiKey, regenerateApiKey } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/password', authenticate, changePassword);
router.get('/api-key', authenticate, getApiKey);
router.post('/api-key/regenerate', authenticate, regenerateApiKey);

module.exports = router;