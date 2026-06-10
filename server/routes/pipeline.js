const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { run, getJobStatus, listJobs, getAccounts } = require('../controllers/pipelineController');

router.post('/run', authenticate, run);
router.get('/jobs/:id', authenticate, getJobStatus);
router.get('/jobs', authenticate, listJobs);
router.get('/accounts', authenticate, requireAdmin, getAccounts);

module.exports = router;
