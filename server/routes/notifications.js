const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read-all', markAllRead);
router.post('/:id/read', markAsRead);

module.exports = router;
