const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  validateCreateWebhook,
  validateUpdateWebhook,
} = require('../controllers/webhookController');

router.use(authenticate);

router.get('/', getWebhooks);
router.post('/', validateCreateWebhook, createWebhook);
router.patch('/:id', validateUpdateWebhook, updateWebhook);
router.delete('/:id', deleteWebhook);
router.post('/:id/test', testWebhook);

module.exports = router;
