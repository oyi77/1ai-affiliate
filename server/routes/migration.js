const express = require('express');
const router = express.Router();
const { importBeMob } = require('../controllers/migrationController');
const { authenticate } = require('../middleware/auth');

router.post('/bemob', authenticate, importBeMob);

module.exports = router;
