const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getTaglinks,
  createTaglink,
  updateTaglink,
  deleteTaglink,
  createTaglinkSchema,
  updateTaglinkSchema,
  validate: validateMw,
} = require('../controllers/taglinkController');

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getTaglinks);
router.post('/', validateMw(createTaglinkSchema), createTaglink);
router.patch('/:id', validateMw(updateTaglinkSchema), updateTaglink);
router.delete('/:id', deleteTaglink);

module.exports = router;
