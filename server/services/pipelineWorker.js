const pipelineService = require('./pipelineService');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// In-memory job status store: { jobId: { id, url, niche, status, steps, result, error, createdAt } }
const jobs = new Map();

/**
 * Enqueue a pipeline job. Saves to DB, starts async processing.
 * Returns the jobId immediately.
 */
async function enqueue(url, niche = null) {
  const jobId = await pipelineService.saveJob({
    url,
    niche: niche || 'auto',
    status: 'queued',
    steps: [],
    result: null,
    error: null,
  });

  const job = {
    id: jobId,
    url,
    niche: niche || 'auto',
    status: 'queued',
    steps: [],
    result: null,
    error: null,
    createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  // Run async — don't await
  processJob(jobId).catch(e =>
    console.error('[PipelineWorker] Job error:', e)
  );

  return jobId;
}

/**
 * Process a single pipeline job through all stages:
 * download → mutate → detect niche → post FB → post IG.
 */
async function processJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    // 1. Download TikTok
    job.status = 'downloading';
    await pipelineService.updateJob(jobId, { status: 'downloading' });

    const video = await pipelineService.downloadTikTok(job.url);
    job.steps.push({ step: 'download', status: 'ok', caption: video.caption });

    // 2. Mutate video hash
    job.status = 'processing';
    await pipelineService.updateJob(jobId, { status: 'processing' });

    const mutated = await pipelineService.mutateVideoHash(video.buffer);
    job.steps.push({ step: 'mutate', status: 'ok' });

    // 3. Detect niche + pick TRACKED affiliate link
    const detectedNiche =
      job.niche === 'auto'
        ? pipelineService.detectNiche(video.caption, video.hashtags)
        : job.niche;

    const affiliateLink = await pipelineService.pickTrackedAffiliateLink(detectedNiche);
    job.steps.push({
      step: 'niche',
      status: 'ok',
      niche: detectedNiche,
      affiliateLink,
    });

    // Build caption with affiliate link
    const caption = `${video.caption}\n\n${affiliateLink}`;

    // Write mutated video to temp file
    const tmpPath = path.join(os.tmpdir(), `pipeline-${jobId}.mp4`);
    await fs.writeFile(tmpPath, mutated);

    const { fbPages, igAccounts } = pipelineService.getAccounts();
    const results = { facebook: [], instagram: [] };

    // 4. Post to Facebook Pages
    job.status = 'posting_fb';
    await pipelineService.updateJob(jobId, { status: 'posting_fb' });

    for (const page of fbPages) {
      const check = pipelineService.checkRateLimit(page.id);
      if (!check.allowed) {
        results.facebook.push({ id: page.id, niche: page.niche, status: 'rate_limited' });
        continue;
      }

      try {
        await pipelineService.postToFacebook(page.id, page.token, tmpPath, caption);
        pipelineService.recordPost(page.id);
        results.facebook.push({ id: page.id, niche: page.niche, status: 'ok' });
      } catch (e) {
        results.facebook.push({ id: page.id, niche: page.niche, status: 'error', error: e.message });
      }

      // Anti-spam delay between posts
      await new Promise(r => setTimeout(r, 5000));
    }

    // 5. Post to Instagram
    job.status = 'posting_ig';
    await pipelineService.updateJob(jobId, { status: 'posting_ig' });

    for (const acct of igAccounts) {
      const check = pipelineService.checkRateLimit(acct.id);
      if (!check.allowed) {
        results.instagram.push({ id: acct.id, niche: acct.niche, status: 'rate_limited' });
        continue;
      }

      try {
        await pipelineService.postToInstagram(acct.id, acct.token, tmpPath, caption);
        pipelineService.recordPost(acct.id);
        results.instagram.push({ id: acct.id, niche: acct.niche, status: 'ok' });
      } catch (e) {
        results.instagram.push({ id: acct.id, niche: acct.niche, status: 'error', error: e.message });
      }

      await new Promise(r => setTimeout(r, 5000));
    }

    // Cleanup temp file
    await fs.unlink(tmpPath).catch(() => {});

    // Mark complete
    job.status = 'completed';
    job.result = {
      facebook: results.facebook,
      instagram: results.instagram,
      niche: detectedNiche,
      affiliateLink,
    };

    await pipelineService.updateJob(jobId, {
      status: 'completed',
      steps: job.steps,
      result: job.result,
    });
  } catch (e) {
    job.status = 'failed';
    job.error = e.message;
    await pipelineService.updateJob(jobId, {
      status: 'failed',
      error: e.message,
      steps: job.steps,
    }).catch(() => {});
  }
}

/**
 * Get in-memory status for a job. Falls back to null if not found
 * (caller can try DB fallback).
 */
function getStatus(jobId) {
  const job = jobs.get(jobId);
  if (!job) return null;
  return {
    id: job.id,
    url: job.url,
    niche: job.niche,
    status: job.status,
    steps: job.steps,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt,
  };
}

/**
 * Log startup message (worker is manual-trigger only).
 */
function start() {
  console.log('[PipelineWorker] Started — manual trigger via API');
}

module.exports = { enqueue, getStatus, start };