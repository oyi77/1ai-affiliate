const { asyncHandler } = require('../utils/asyncHandler');
const { success, created, error } = require('../utils/apiResponse');
const { queryRows, queryInsert } = require('../utils/queryHelpers');
const { validate, z } = require('../utils/validate');

const createAccountSchema = z.object({
  account_id: z.string().min(1),
  name: z.string().min(1),
});

const getShopeeAccounts = asyncHandler(async (req, res) => {
  const rows = await queryRows(
    `SELECT shopee_account_id, shopee_account_name
     FROM 1ai_shopee_reports
     WHERE user_id = ?
     GROUP BY shopee_account_id, shopee_account_name`,
    [req.user.id]
  );
  // Also include accounts stored in advertiser settings
  const advertiserRows = await queryRows(
    `SELECT JSON_EXTRACT(settings, '$.shopee_accounts') AS accounts
     FROM 1ai_advertisers
     WHERE user_id = ? AND settings IS NOT NULL`,
    [req.user.id]
  );

  const seen = new Set();
  const accounts = [];

  for (const r of rows) {
    if (r.shopee_account_id && !seen.has(r.shopee_account_id)) {
      seen.add(r.shopee_account_id);
      accounts.push({ account_id: r.shopee_account_id, name: r.shopee_account_name });
    }
  }

  for (const r of advertiserRows) {
    if (r.accounts) {
      let arr;
      try {
        arr = typeof r.accounts === 'string' ? JSON.parse(r.accounts) : r.accounts;
      } catch { continue; }
      if (Array.isArray(arr)) {
        for (const a of arr) {
          if (a.account_id && !seen.has(a.account_id)) {
            seen.add(a.account_id);
            accounts.push(a);
          }
        }
      }
    }
  }

  return success(res, accounts);
});

const createShopeeAccount = asyncHandler(async (req, res) => {
  const data = req.validated;

  // Check if this account_id already exists in reports
  const existing = await queryRows(
    `SELECT shopee_account_id FROM 1ai_shopee_reports
     WHERE shopee_account_id = ? AND user_id = ? LIMIT 1`,
    [data.account_id, req.user.id]
  );

  // Store in first advertiser's settings for this user, or just return success
  if (existing.length === 0) {
    // Find an advertiser for this user to store settings
    const advertiser = await queryRows(
      `SELECT id, settings FROM 1ai_advertisers WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (advertiser.length > 0) {
      let accounts = [];
      try {
        const raw = advertiser[0].settings;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && Array.isArray(parsed.shopee_accounts)) {
          accounts = parsed.shopee_accounts;
        }
      } catch { /* empty */ }

      if (!accounts.find(a => a.account_id === data.account_id)) {
        accounts.push({ account_id: data.account_id, name: data.name });
        const newSettings = JSON.stringify({ shopee_accounts: accounts });
        const pool = require('../db/mysql');
        await pool.query(
          'UPDATE 1ai_advertisers SET settings = ? WHERE id = ?',
          [newSettings, advertiser[0].id]
        );
      }
    }
  }

  return created(res, { success: true, account_id: data.account_id, name: data.name });
});

const validateCreateAccount = validate(createAccountSchema);

module.exports = { getShopeeAccounts, createShopeeAccount, validateCreateAccount };
