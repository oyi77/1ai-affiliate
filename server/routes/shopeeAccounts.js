const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getShopeeAccounts,
  createShopeeAccount,
  validateCreateAccount,
} = require('../controllers/shopeeAccountController');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getShopeeAccounts);
router.post('/', validateCreateAccount, createShopeeAccount);

module.exports = router;
