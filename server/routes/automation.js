const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getRules, saveRule, deleteRule, runRules } = require('../controllers/automationController');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getRules);
router.post('/', saveRule);
router.patch('/:id', saveRule);
router.delete('/:id', deleteRule);
router.post('/run', runRules);

module.exports = router;
