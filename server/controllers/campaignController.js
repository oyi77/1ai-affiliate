const { asyncHandler } = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');

const createCampaignSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['active', 'paused', 'archived']).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().optional(),
  vertical: z.string().optional(),
  geo: z.string().optional(),
  type: z.string().optional(),
  payout: z.number().optional(),
  network_payout: z.number().optional(),
  payout_currency: z.string().optional(),
  cap_daily: z.number().optional(),
  cap_monthly: z.number().optional(),
  traffic_allowed: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  network_id: z.number().optional(),
  network_offer_id: z.string().optional(),
});

const linkOfferCampaignSchema = z.object({
  offer_id: z.number().int().positive(),
  aff_campaign_id: z.number().int().positive(),
});

const getCampaigns = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  let sql, params;

  if (role === 'admin' || role === 'manager') {
    sql = `SELECT c.aff_campaign_id AS id, c.aff_campaign_name AS name, c.aff_campaign_payout AS payout,
            c.aff_campaign_payout AS payout_amount, c.aff_campaign_payout_type AS payout_type,
            c.aff_campaign_status AS status, IF(c.aff_campaign_status IN ('active','1',1), 1, 0) AS active,
            COUNT(ck.click_id) AS clicks,
            COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs WHERE aff_campaign_id = c.aff_campaign_id), 0) AS conversions,
            COALESCE((SELECT SUM(click_payout) FROM 1ai_clicks WHERE aff_campaign_id = c.aff_campaign_id), 0) AS revenue
     FROM 1ai_aff_campaigns c
     LEFT JOIN 1ai_clicks ck ON c.aff_campaign_id = ck.aff_campaign_id
     GROUP BY c.aff_campaign_id
     ORDER BY c.aff_campaign_id DESC LIMIT ?`;
    params = [limit];
  } else if (role === 'advertiser') {
    sql = `SELECT c.aff_campaign_id AS id, c.aff_campaign_name AS name, c.aff_campaign_payout AS payout,
            c.aff_campaign_payout AS payout_amount, c.aff_campaign_payout_type AS payout_type,
            c.aff_campaign_status AS status, IF(c.aff_campaign_status IN ('active','1',1), 1, 0) AS active,
            COUNT(ck.click_id) AS clicks,
            COALESCE((SELECT COUNT(*) FROM 1ai_conversion_logs WHERE aff_campaign_id = c.aff_campaign_id), 0) AS conversions,
            COALESCE((SELECT SUM(click_payout) FROM 1ai_clicks WHERE aff_campaign_id = c.aff_campaign_id), 0) AS revenue
     FROM 1ai_aff_campaigns c
     LEFT JOIN 1ai_clicks ck ON c.aff_campaign_id = ck.aff_campaign_id
     JOIN 1ai_offer_campaigns oc ON c.aff_campaign_id = oc.aff_campaign_id
     JOIN 1ai_offers o ON oc.offer_id = o.id
     WHERE o.advertiser_id = ?
     GROUP BY c.aff_campaign_id
     ORDER BY c.aff_campaign_id DESC LIMIT ?`;
    params = [req.user.id, limit];
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

const createCampaign = asyncHandler(async (req, res) => {
  const data = req.validated;
  const result = await pool.query(
    'INSERT INTO 1ai_aff_campaigns (aff_campaign_name, aff_campaign_status) VALUES (?, ?)',
    [data.name.trim(), data.status || 'active']
  );
  const id = result[0].insertId;
  return success(res, { success: true, id, name: data.name.trim(), status: data.status || 'active' });
});

const updateCampaign = asyncHandler(async (req, res) => {
  const campaignId = parseInt(req.params.id);
  if (!campaignId) return error(res, 'Invalid campaign id', 400);

  const existing = await queryOne('SELECT aff_campaign_id AS id FROM 1ai_aff_campaigns WHERE aff_campaign_id = ?', [campaignId]);
  if (!existing) return error(res, 'Campaign not found', 404);

  const data = req.validated;
  const name = data.name || null;
  const status = data.status || null;

  const setClauses = [];
  const params = [];
  if (name) { setClauses.push('aff_campaign_name = ?'); params.push(name); }
  if (status) { setClauses.push('aff_campaign_status = ?'); params.push(status); }

  if (setClauses.length === 0) return error(res, 'No fields to update', 400);

  params.push(campaignId);
  await pool.query(
    `UPDATE 1ai_aff_campaigns SET ${setClauses.join(', ')} WHERE aff_campaign_id = ?`,
    params
  );

  const updated = await queryOne('SELECT * FROM 1ai_aff_campaigns WHERE aff_campaign_id = ?', [campaignId]);
  return success(res, { data: updated });
});

const linkOfferToCampaign = asyncHandler(async (req, res) => {
  const data = req.validated;
  await pool.query(
    'INSERT IGNORE INTO 1ai_offer_campaigns (offer_id, aff_campaign_id) VALUES (?, ?)',
    [data.offer_id, data.aff_campaign_id]
  );
  return success(res, { success: true });
});

const setOfferRotationSchema = z.object({
  offer_id: z.number().int().positive(),
  weight: z.number().int().min(0).optional(),
  rotation_type: z.enum(['weighted', 'sequential', 'random']).optional(),
  status: z.enum(['active', 'paused']).optional(),
});

const setOfferRotation = asyncHandler(async (req, res) => {
  const campaignId = parseInt(req.params.id);
  if (!campaignId) return error(res, 'Invalid campaign id', 400);
  const data = req.validated;
  await pool.query(
    `INSERT INTO 1ai_offer_campaigns (offer_id, aff_campaign_id, weight, rotation_type, status)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE weight = VALUES(weight), rotation_type = VALUES(rotation_type), status = VALUES(status)`,
    [data.offer_id, campaignId, data.weight ?? 100, data.rotation_type ?? 'weighted', data.status ?? 'active']
  );
  return success(res, { success: true });
});

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaign,
  linkOfferToCampaign,
  setOfferRotation,
  createCampaignSchema,
  updateCampaignSchema,
  linkOfferCampaignSchema,
  setOfferRotationSchema,
};
