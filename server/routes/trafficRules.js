const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getRules, createRule, updateRule, deleteRule } = require('../controllers/trafficRuleController');

router.use(authenticate);

router.get('/', getRules);
router.post('/', createRule);
router.patch('/:id', updateRule);
router.delete('/:id', deleteRule);

module.exports = router;
