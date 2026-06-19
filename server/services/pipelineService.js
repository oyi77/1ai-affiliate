const pool = require('../db/mysql');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { mintSmartlink } = require('./smartlinkService');

const NICHES = ['hijab', 'sepatu', 'tas', 'atasan_pria', 'general'];
const TIKTOK_API = process.env.TIKTOK_API_URL || 'https://www.tikwm.com/api/';
const MAX_POSTS_PER_ACCOUNT_PER_DAY = 4;
const MIN_DELAY_MS = 45 * 60 * 1000;
const MAX_DELAY_MS = 120 * 60 * 1000;

// In-memory rate limit tracking: { accountId: [timestamp, ...] }
const rateLimitMap = new Map();

// Niche to 1ai_offers.id mapping for smartlink minting
// Update as offers are seeded with seed_jendralbot_offers.js
const NICHE_OFFER_MAP = {
  hijab: 1,
  sepatu: 2,
  tas: 3,
  atasan_pria: 4,
  general: 5,
};

/**
 * Pick a tracked smartlink for the given niche.
 * Mints a smartlink via mintSmartlink() so clicks are tracked.
 * Falls back to bare SHOPEE_LINKS_JSON link if smartlink minting fails.
 */
async function pickTrackedAffiliateLink(niche, affiliateId = 1) {
  const offerId = NICHE_OFFER_MAP[niche] || NICHE_OFFER_MAP.general;

  try {
    const result = await mintSmartlink({
      offerId,
      affiliateId,
      domainId: null,
      shortenerServiceId: null
    });
    console.log(`[PipelineService] Minted tracked smartlink ${result.slug} for niche ${niche} (offer ${offerId})`);
    return result.url;
  } catch (err) {
    console.error(`[PipelineService] Failed to mint smartlink for niche ${niche}:`, err.message);
    // Fallback to bare link from env
    return pickAffiliateLink(niche);
  }
}


/**
 * Fetch TikTok video info (no watermark) via tikwm.com API.
 * Returns video buffer + metadata (caption, hashtags, author, music).
 */
async function downloadTikTok(url) {
  const apiUrl = `${TIKTOK_API}?url=${encodeURIComponent(url)}`;
  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error(`TikTok API error: ${resp.status}`);
  const data = await resp.json();
  if (data.code !== 0) throw new Error(data.msg || 'TikTok download failed');

  const videoUrl = data.data?.play || data.data?.hdplay || data.data?.wmplay;
  if (!videoUrl) throw new Error('No video URL found');

  const videoResp = await fetch(videoUrl);
  if (!videoResp.ok) throw new Error(`Video download failed: ${videoResp.status}`);
  const buffer = Buffer.from(await videoResp.arrayBuffer());

  return {
    buffer,
    caption: data.data?.title || '',
    hashtags: extractHashtags(data.data?.title || ''),
    author: data.data?.author?.nickname || '',
    musicTitle: data.data?.music_info?.title || '',
  };
}

/**
 * Extract lowercase hashtags from text (strips leading #).
 */
function extractHashtags(text) {
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map(t => t.replace('#', '').toLowerCase()) : [];
}

/**
 * Modify video hash so Meta doesn't flag duplicate content.
 * Applies a volume tweak (0.99) which changes the file hash while
 * keeping the video visually identical.
 */
async function mutateVideoHash(inputBuffer) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pipeline-'));
  const inPath = path.join(tmpDir, 'input.mp4');
  const outPath = path.join(tmpDir, 'output.mp4');
  try {
    await fs.writeFile(inPath, inputBuffer);
    await execFileAsync('ffmpeg', [
      '-i', inPath,
      '-af', 'volume=0.99',
      '-c', 'copy',
      outPath,
      '-y',
    ], { timeout: 60000 });
    const outputBuffer = await fs.readFile(outPath);
    return outputBuffer;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Detect niche from keywords in caption + hashtags.
 * Falls back to 'general' if no match.
 */
function detectNiche(caption, hashtags) {
  const text = (caption + ' ' + hashtags.join(' ')).toLowerCase();
  const keywords = {
    hijab: ['hijab', 'kerudung', 'jilbab', 'pashmina', 'bergamo'],
    sepatu: ['sepatu', 'sneakers', 'sendal', 'footwear'],
    tas: ['tas', 'bag', 'backpack', 'ransel', 'slingbag'],
    atasan_pria: ['atasan', 'kemeja', 'kaos', 'baju pria', 'jaket pria', 'pria'],
  };
  for (const [niche, words] of Object.entries(keywords)) {
    if (words.some(w => text.includes(w))) return niche;
  }
  return 'general';
}

/**
 * Pick a random Shopee affiliate link for the given niche.
 * Links are loaded from SHOPEE_LINKS_JSON env var.
 * Falls back to 'general' links if niche-specific links not found.
 */
function pickAffiliateLink(niche) {
  let links;
  try {
    links = JSON.parse(process.env.SHOPEE_LINKS_JSON || '{}');
  } catch {
    links = {};
  }
  const nicheLinks = links[niche] || links['general'] || [];
  if (!nicheLinks.length) throw new Error(`No affiliate links for niche: ${niche}`);
  return nicheLinks[Math.floor(Math.random() * nicheLinks.length)];
}

/**
 * Rate limiter — checks if account has remaining post slots today.
 */
function checkRateLimit(accountId) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(accountId) || [];
  const today = timestamps.filter(ts => now - ts < 86400000);
  rateLimitMap.set(accountId, today);

  if (today.length >= MAX_POSTS_PER_ACCOUNT_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_POSTS_PER_ACCOUNT_PER_DAY - today.length };
}

/**
 * Record a successful post to rate-limit tracking.
 */
function recordPost(accountId) {
  const timestamps = rateLimitMap.get(accountId) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(accountId, timestamps);
}

/**
 * Get random delay between MIN_DELAY_MS and MAX_DELAY_MS.
 */
function getRandomDelay() {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

/**
 * Post a video to a Facebook Page via Graph API v19.0.
 */
async function postToFacebook(pageId, pageToken, videoPath, caption) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/videos`;
  const videoBuffer = await fs.readFile(videoPath);
  const formData = new FormData();
  formData.append('source', new Blob([videoBuffer], { type: 'video/mp4' }), 'video.mp4');
  formData.append('description', caption);
  formData.append('access_token', pageToken);

  const resp = await fetch(url, { method: 'POST', body: formData });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`FB post failed: ${resp.status} ${JSON.stringify(err)}`);
  }
  return resp.json();
}

/**
 * Post a video to Instagram via resumable upload protocol.
 * Step 1: init media container, Step 2: upload, Step 3: publish.
 */
async function postToInstagram(igAccountId, accessToken, videoPath, caption) {
  const base = `https://graph.facebook.com/v19.0/${igAccountId}`;
  const videoBuffer = await fs.readFile(videoPath);
  const fileSize = videoBuffer.length;

  // Step 1: Init resumable upload session
  const initResp = await fetch(`${base}/media?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      upload_type: 'resumable',
      caption,
    }),
  });
  if (!initResp.ok) {
    const err = await initResp.json().catch(() => ({}));
    throw new Error(`IG media init failed: ${initResp.status} ${JSON.stringify(err)}`);
  }
  const { id: containerId } = await initResp.json();

  // Step 2: Upload video
  const uploadResp = await fetch(`${base}/media/${containerId}?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
    },
    body: videoBuffer,
  });
  if (!uploadResp.ok) {
    const err = await uploadResp.json().catch(() => ({}));
    throw new Error(`IG upload failed: ${uploadResp.status} ${JSON.stringify(err)}`);
  }

  // Step 3: Publish
  const publishResp = await fetch(`${base}/media_publish?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId }),
  });
  if (!publishResp.ok) {
    const err = await publishResp.json().catch(() => ({}));
    throw new Error(`IG publish failed: ${publishResp.status} ${JSON.stringify(err)}`);
  }
  return publishResp.json();
}

/**
 * Get configured Facebook Pages and Instagram accounts from env.
 */
function getAccounts() {
  let fbPages = [];
  let igAccounts = [];
  try {
    fbPages = JSON.parse(process.env.FB_PAGES_JSON || '[]');
  } catch { /* ignore parse errors */ }
  try {
    igAccounts = JSON.parse(process.env.IG_ACCOUNTS_JSON || '[]');
  } catch { /* ignore parse errors */ }
  return { fbPages, igAccounts };
}

/**
 * Save a new pipeline job record.
 */
async function saveJob({ url, niche, status, steps, result, error }) {
  const [res] = await pool.query(
    `INSERT INTO 1ai_pipeline_jobs (url, niche, status, steps, result, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
    [url, niche, status, JSON.stringify(steps), result ? JSON.stringify(result) : null, error || null]
  );
  return res.insertId;
}

/**
 * Update a pipeline job record by id.
 */
async function updateJob(id, updates) {
  const sets = [];
  const vals = [];
  for (const [k, v] of Object.entries(updates)) {
    sets.push(`${k} = ?`);
    vals.push(typeof v === 'object' ? JSON.stringify(v) : v);
  }
  vals.push(id);
  await pool.query(`UPDATE 1ai_pipeline_jobs SET ${sets.join(', ')} WHERE id = ?`, vals);
}

/**
 * List pipeline jobs ordered by newest first.
 */
async function listJobs(limit = 20) {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_pipeline_jobs ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return rows;
}

/**
 * Get a single pipeline job by id.
 */
async function getJob(id) {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_pipeline_jobs WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  NICHES,
  downloadTikTok,
  extractHashtags,
  mutateVideoHash,
  detectNiche,
  pickAffiliateLink,
  pickTrackedAffiliateLink,
  checkRateLimit,
  recordPost,
  getRandomDelay,
  postToFacebook,
  postToInstagram,
  getAccounts,
  saveJob,
  updateJob,
  listJobs,
  getJob,
};
