const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getBalanceEntries,
  createBalanceEntry,
  getBalanceSummary,
  createBalanceEntrySchema,
  validate: validateMw,
} = require('../controllers/balanceController');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getBalanceEntries);
router.post('/', validateMw(createBalanceEntrySchema), createBalanceEntry);
router.get('/summary', getBalanceSummary);

module.exports = router;
