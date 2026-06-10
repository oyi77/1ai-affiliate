const pipelineWorker = require('../services/pipelineWorker');
const pipelineService = require('../services/pipelineService');

/**
 * POST /api/pipeline/run
 * Enqueue a TikTok → Shopee → Meta pipeline job.
 * body: { url, niche? }
 */
async function run(req, res) {
  try {
    const { url, niche } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const jobId = await pipelineWorker.enqueue(url, niche || 'auto');
    res.status(202).json({ jobId });
  } catch (err) {
    console.error('Pipeline run error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/pipeline/jobs/:id
 * Get job status. Checks in-memory first, then DB fallback.
 */
async function getJobStatus(req, res) {
  try {
    const status = pipelineWorker.getStatus(req.params.id);
    if (!status) {
      const job = await pipelineService.getJob(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      return res.json(job);
    }
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/pipeline/jobs
 * List recent pipeline jobs.
 * query: limit (default 20)
 */
async function listJobs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const jobs = await pipelineService.listJobs(limit);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/pipeline/accounts
 * List configured Facebook Pages and Instagram accounts (tokens redacted).
 */
async function getAccounts(req, res) {
  try {
    const accounts = pipelineService.getAccounts();
    const redacted = {
      fbPages: accounts.fbPages.map(p => ({ id: p.id, niche: p.niche })),
      igAccounts: accounts.igAccounts.map(a => ({ id: a.id, niche: a.niche })),
    };
    res.json(redacted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { run, getJobStatus, listJobs, getAccounts };
