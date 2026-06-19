const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProfile, updateProfile, generateApiKey, removeApiKey,
  getIntegrations, updateIntegration, getPostback, updatePostback,
  getWhiteLabel, saveWhiteLabel,
} = require('../controllers/settingsController');
router.use(authenticate);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// API Key
router.post('/api-key', generateApiKey);
router.delete('/api-key', removeApiKey);

// Integrations
router.get('/integrations', getIntegrations);
router.put('/integrations', updateIntegration);

// Postback Configuration
router.get('/postback', getPostback);
router.put('/postback', updatePostback);

// White-label config
router.get('/white-label', getWhiteLabel);
router.post('/white-label', saveWhiteLabel);

module.exports = router;