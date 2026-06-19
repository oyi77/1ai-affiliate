const { asyncHandler } = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');
const { parsePostbackHeaders, validatePostbackUrl, normalizeInteger, isIntegerInRange } = require('./postbackController');

const createOfferSchema = z.object({
  name: z.string().min(1),
  payout_amount: z.number().optional(),
  network_payout: z.number().optional(),
  network_id: z.number().optional(),
  advertiser_id: z.number().optional(),
});

const updateOfferSchema = z.object({
  name: z.string().optional(),
  payout: z.number().optional(),
  network_payout: z.number().optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
  vertical: z.string().optional(),
  geo: z.string().optional(),
  notes: z.string().optional(),
  affiliate_url: z.string().url().optional().or(z.literal('')),
});

/**
 * GET / — List offers with role-based filtering.
 * Admin/manager sees all with network join; advertiser sees own; affiliate sees assigned.
 */
const getOffers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const role = req.user.role;

  let sql = `SELECT o.id, o.name, o.payout AS payout_amount, o.status, 
                    IF(o.status IN ('active'), 1, 0) AS active,
                    COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs cl JOIN 1ai_offer_campaigns oc ON cl.aff_campaign_id = oc.aff_campaign_id WHERE oc.offer_id = o.id), 0) AS conversions,
                    COALESCE((SELECT COUNT(*) FROM 1ai_clicks ck JOIN 1ai_offer_campaigns oc ON ck.aff_campaign_id = oc.aff_campaign_id WHERE oc.offer_id = o.id), 0) AS clicks,
                    COALESCE((SELECT SUM(ae.payout_amount) FROM 1ai_affiliate_earnings ae JOIN 1ai_conversion_logs cl2 ON ae.conversion_id = cl2.conversion_id JOIN 1ai_offer_campaigns oc2 ON cl2.aff_campaign_id = oc2.aff_campaign_id WHERE oc2.offer_id = o.id), 0) AS revenue`;
  let params = [];

  if (role === 'admin' || role === 'manager') {
    sql += `, o.network_payout, o.advertiser_id, o.network_id, n.name AS network_name FROM 1ai_offers o LEFT JOIN 1ai_networks n ON o.network_id = n.id ORDER BY o.id DESC LIMIT ?`;
    params.push(limit);
  } else if (role === 'advertiser' || role === 'manager') {
    sql += `, o.network_payout FROM 1ai_offers o WHERE o.advertiser_id = ? ORDER BY o.id DESC LIMIT ?`;
    params.push(req.user.id, limit);
  } else {
    sql += ` FROM 1ai_offers o
             JOIN 1ai_offer_affiliate_access acc ON o.id = acc.offer_id
             JOIN 1ai_affiliates a ON acc.affiliate_id = a.id
             WHERE a.user_id = ? AND o.status = 'active'
             ORDER BY o.id DESC LIMIT ?`;
    params.push(req.user.id, limit);
  }

  const [rows] = await pool.query(sql, params);

  const enriched = rows.map(row => {
    const clicks = Number(row.clicks) || 0;
    const conversions = Number(row.conversions) || 0;
    const rev = Number(row.revenue) || 0;
    return {
      ...row,
      epc: clicks > 0 ? +(rev / clicks).toFixed(4) : 0,
      cr: clicks > 0 ? +((conversions / clicks) * 100).toFixed(2) : 0,
    };
  });

  return success(res, { data: enriched });
});

/**
 * POST / — Create a new offer.
 * Admin can explicitly set advertiser_id; advertisers always self-assign.
 */
const createOffer = asyncHandler(async (req, res) => {
  const role = req.user.role;
  if (role === 'affiliate') {
    return error(res, 'Unauthorized', 403);
  }

  const { name, payout_amount, network_payout, network_id } = req.validated;
  let adv_id = req.validated.advertiser_id || null;

  if (role === 'advertiser' || role === 'manager') {
    adv_id = req.user.id;
  }

  const offerId = await queryInsert(
    `INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, network_id, created_at, status)
     VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), 'active')`,
    [name, payout_amount || 0, network_payout || payout_amount || 0, adv_id, network_id || null]
  );

  return success(res, { success: true, offer_id: offerId });
});

/**
 * PATCH /:id — Update offer fields using COALESCE pattern.
 * Only provided fields are updated; omitted fields remain unchanged.
 */
const updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated;

  const existing = await queryOne('SELECT id FROM 1ai_offers WHERE id = ?', [id]);
  if (!existing) {
    return error(res, 'Offer not found', 404);
  }

  await pool.query(
    `UPDATE 1ai_offers SET
       name = COALESCE(?, name),
       payout = COALESCE(?, payout),
       network_payout = COALESCE(?, network_payout),
       status = COALESCE(?, status),
       vertical = COALESCE(?, vertical),
       geo = COALESCE(?, geo),
       notes = COALESCE(?, notes),
       affiliate_url = COALESCE(?, affiliate_url)
     WHERE id = ?`,
    [data.name ?? null, data.payout ?? null, data.network_payout ?? null,
     data.status ?? null, data.vertical ?? null, data.geo ?? null,
     data.notes ?? null, data.affiliate_url ?? null, id]
  );

  return success(res, { success: true, offer_id: Number(id) });
});

/**
 * POST /:id/postback — Set postback configuration for an offer.
 * Validates URL, method, timeout, and retries before persisting.
 */
const setOfferPostback = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const { postback_url, postback_enabled, postback_auth_type, postback_auth_value, postback_method, postback_headers, postback_timeout, postback_retries } = req.body;

  if (postback_url && !validatePostbackUrl(postback_url)) {
    return error(res, 'Invalid postback URL format. Must be a valid HTTP or HTTPS URL.', 400);
  }

  if (postback_method && !['GET', 'POST'].includes(postback_method.toUpperCase())) {
    return error(res, 'postback_method must be GET or POST', 400);
  }

  if (postback_timeout !== undefined && !isIntegerInRange(postback_timeout, 1, 60)) {
    return error(res, 'postback_timeout must be an integer between 1 and 60', 400);
  }

  if (postback_retries !== undefined && !isIntegerInRange(postback_retries, 0, 10)) {
    return error(res, 'postback_retries must be an integer between 0 and 10', 400);
  }

  const headersToStore = postback_headers ? JSON.stringify(parsePostbackHeaders(postback_headers)) : null;

  await pool.query(
    `UPDATE 1ai_offers SET postback_url = ?, postback_enabled = ?, postback_auth_type = ?, postback_auth_value = ?, postback_method = ?, postback_headers = ?, postback_timeout = ?, postback_retries = ? WHERE id = ?`,
    [postback_url || null, postback_enabled !== false, postback_auth_type || null, postback_auth_value || null, postback_method?.toUpperCase() || 'GET', headersToStore || '{}', normalizeInteger(postback_timeout, 10, 1, 60), normalizeInteger(postback_retries, 3, 0, 10), offerId]
  );

  return success(res, { success: true, offer_id: Number(offerId) });
});

/**
 * GET /:id/postback — Get postback configuration for an offer.
 */
const getOfferPostback = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await queryOne(
    'SELECT postback_url, postback_enabled, postback_auth_type, postback_auth_value, postback_timeout, postback_method, postback_headers, postback_retries FROM 1ai_offers WHERE id = ?',
    [offerId]
  );

  if (!offer) {
    return error(res, 'Offer not found', 404);
  }

  return success(res, offer);
});

/**
 * GET /:offerId/landing-pages — List landing pages for an offer.
 */
const getOfferLandingPages = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const rows = await queryRows(
    'SELECT id, offer_id, url, name, weight, geo_targeting, device_targeting, is_default, created_at, updated_at FROM 1ai_offer_landing_pages WHERE offer_id = ? ORDER BY weight DESC, id ASC',
    [offerId]
  );
  return success(res, { data: rows });
});

/**
 * POST /:offerId/landing-pages — Add a landing page to an offer.
 */
const addOfferLandingPage = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const { url, name, weight, geo_targeting, device_targeting, is_default } = req.body;

  if (!url) return error(res, 'url is required', 400);

  const offer = await queryOne('SELECT id FROM 1ai_offers WHERE id = ?', [offerId]);
  if (!offer) return error(res, 'Offer not found', 404);

  const id = await queryInsert(
    `INSERT INTO 1ai_offer_landing_pages (offer_id, url, name, weight, geo_targeting, device_targeting, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [offerId, url, name || null, weight || 100, geo_targeting || null, device_targeting || null, is_default ? 1 : 0]
  );

  return success(res, { success: true, id });
});

module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  setOfferPostback,
  getOfferPostback,
  getOfferLandingPages,
  addOfferLandingPage,
  createOfferSchema,
  updateOfferSchema,
};
