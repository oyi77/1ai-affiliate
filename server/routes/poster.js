const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  trigger,
  listQueue,
  addToQueue,
  removeFromQueue,
  testMessage,
} = require('../controllers/posterController');

router.post('/trigger', authenticate, trigger);
router.get('/queue', authenticate, listQueue);
router.post('/queue', authenticate, requireAdmin, addToQueue);
router.delete('/queue/:id', authenticate, requireAdmin, removeFromQueue);
router.post('/test', authenticate, requireAdmin, testMessage);

module.exports = router;
