const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error, paginated } = require('../utils/apiResponse');
const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');
const pool = require('../db/mysql');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ── Zod schemas ──────────────────────────────────────────────

const createAdvertiserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  platform_type: z.enum(['shopee', 'tokopedia', 'lazada', 'custom']).optional(),
  commission_type: z.enum(['percentage', 'fixed']).optional(),
  default_commission_rate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const updateAdvertiserSchema = z.object({
  company_name: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  platform_type: z.enum(['shopee', 'tokopedia', 'lazada', 'custom']).optional(),
  commission_type: z.enum(['percentage', 'fixed']).optional(),
  default_commission_rate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  affiliate_program_url: z.string().url().optional().or(z.literal('')),
});

const createPayoutSchema = z.object({
  report_id: z.string().min(1),
  issued_date: z.string().min(1),
  amount: z.number().positive(),
  status: z.enum(['pending', 'paid', 'cancelled']).optional(),
  bank_account: z.string().optional(),
  note: z.string().optional(),
});

// ── Handlers ─────────────────────────────────────────────────

const getAdvertisers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  const search = req.query.search || '';

  let where = "WHERE u.user_role = 'advertiser'";
  const params = [];

  if (search) {
    where += ' AND (u.user_name LIKE ? OR u.user_email LIKE ? OR a.company_name LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM 1ai_users u JOIN 1ai_advertisers a ON a.user_id = u.user_id ${where}`,
    params
  );
  const total = countRows[0].total;

  const rows = await queryRows(
    `SELECT u.user_id, u.user_email, u.user_name, u.user_date_added, u.user_active,
            a.id AS advertiser_id, a.company_name, a.website, a.status,
            a.platform_type, a.commission_type, a.default_commission_rate, a.notes
     FROM 1ai_users u
     JOIN 1ai_advertisers a ON a.user_id = u.user_id
     ${where}
     ORDER BY u.user_date_added DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return paginated(res, rows, total, Math.floor(offset / limit) + 1, limit);
});

const createAdvertiser = asyncHandler(async (req, res) => {
  const data = req.validated;

  const existing = await queryOne(
    'SELECT user_id FROM 1ai_users WHERE user_email = ?',
    [data.email]
  );
  if (existing) return error(res, 'Email already registered', 409);

  const hash = await bcrypt.hash(data.password, 10);
  const appKey = crypto.randomBytes(16).toString('hex');

  const userId = await queryInsert(
    `INSERT INTO 1ai_users
       (user_name, user_email, user_pass, user_role, user_date_added, user_active,
        user_api_key, clickserver_api_key, customer_api_key)
     VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP(), 1, ?, ?, ?)`,
    [data.name || data.email.split('@')[0], data.email, hash, appKey, appKey, appKey]
  );

  await queryInsert(
    `INSERT INTO 1ai_advertisers
       (user_id, company_name, website, status, platform_type, commission_type,
        default_commission_rate, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [
      userId,
      data.company_name || null,
      data.website || null,
      data.status || 'active',
      data.platform_type || null,
      data.commission_type || 'percentage',
      data.default_commission_rate || null,
      data.notes || null,
    ]
  );

  return created(res, { success: true, user_id: userId, email: data.email, role: 'advertiser' });
});

const updateAdvertiser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated;

  const advertiser = await queryOne(
    'SELECT id, user_id FROM 1ai_advertisers WHERE id = ?',
    [id]
  );
  if (!advertiser) return error(res, 'Advertiser not found', 404);

  const fields = [
    'company_name', 'website', 'status', 'platform_type',
    'commission_type', 'default_commission_rate', 'notes', 'affiliate_program_url',
  ];

  const setClauses = [];
  const params = [];

  for (const field of fields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = COALESCE(?, ${field})`);
      params.push(data[field]);
    }
  }

  if (setClauses.length === 0) return error(res, 'No fields to update', 400);

  setClauses.push('updated_at = UNIX_TIMESTAMP()');
  params.push(id);

  await pool.query(
    `UPDATE 1ai_advertisers SET ${setClauses.join(', ')} WHERE id = ?`,
    params
  );

  const updated = await queryOne(
    `SELECT u.user_id, u.user_email, u.user_name,
            a.id AS advertiser_id, a.company_name, a.website, a.status,
            a.platform_type, a.commission_type, a.default_commission_rate,
            a.affiliate_program_url, a.notes
     FROM 1ai_advertisers a
     JOIN 1ai_users u ON u.user_id = a.user_id
     WHERE a.id = ?`,
    [id]
  );

  return success(res, { success: true, advertiser: updated });
});

const uploadAdvertiserReport = asyncHandler(async (req, res) => {
  return success(res, {
    success: true,
    message: 'Upload endpoint ready',
    file: req.file?.originalname || null,
  });
});

const getAdvertiserReports = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const offset = parseInt(req.query.offset) || 0;
  const dateFrom = req.query.date_from || null;
  const dateTo = req.query.date_to || null;

  let where = 'WHERE r.advertiser_id = ?';
  const params = [id];

  if (dateFrom) {
    where += ' AND r.report_date >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    where += ' AND r.report_date <= ?';
    params.push(dateTo);
  }

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM 1ai_shopee_reports r ${where}`,
    params
  );
  const total = countRows[0].total;

  const rows = await queryRows(
    `SELECT r.id, r.order_id, r.product_name, r.product_category,
            r.commission_gross, r.commission_net, r.order_amount,
            r.order_status, r.report_date, r.taglink, r.created_at
     FROM 1ai_shopee_reports r
     ${where}
     ORDER BY r.report_date DESC, r.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return paginated(res, rows, total, Math.floor(offset / limit) + 1, limit);
});

const getAdvertiserPayouts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const offset = parseInt(req.query.offset) || 0;

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM 1ai_shopee_payouts WHERE advertiser_id = ?',
    [id]
  );
  const total = countRows[0].total;

  const rows = await queryRows(
    `SELECT p.id, p.report_id, p.issued_date, p.paid_at, p.amount,
            p.status, p.bank_account, p.note, p.created_at
     FROM 1ai_shopee_payouts p
     WHERE p.advertiser_id = ?
     ORDER BY p.issued_date DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [id, limit, offset]
  );

  return paginated(res, rows, total, Math.floor(offset / limit) + 1, limit);
});

const createAdvertiserPayout = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated;

  const advertiser = await queryOne(
    'SELECT id FROM 1ai_advertisers WHERE id = ?',
    [id]
  );
  if (!advertiser) return error(res, 'Advertiser not found', 404);

  const payoutId = await queryInsert(
    `INSERT INTO 1ai_shopee_payouts
       (user_id, advertiser_id, report_id, issued_date, amount, status,
        bank_account, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
    [
      req.user.id,
      id,
      data.report_id,
      data.issued_date,
      data.amount,
      data.status || 'pending',
      data.bank_account || null,
      data.note || null,
    ]
  );

  return created(res, { success: true, id: payoutId });
});

// ── Exports ──────────────────────────────────────────────────

module.exports = {
  getAdvertisers,
  createAdvertiser,
  updateAdvertiser,
  uploadAdvertiserReport,
  getAdvertiserReports,
  getAdvertiserPayouts,
  createAdvertiserPayout,
  validateCreateAdvertiser: validate(createAdvertiserSchema),
  validateUpdateAdvertiser: validate(updateAdvertiserSchema),
  validateCreatePayout: validate(createPayoutSchema),
};
