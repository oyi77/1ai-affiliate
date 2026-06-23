'use strict';

/**
 * TrackPro Sync Service
 * Scrapes data from TrackPro (tracker.getflashsale.xyz) via browser automation
 * and imports Shopee commissions + Meta Ads spend into 1ai-affiliate.
 * 
 * TrackPro is a PHP web app without REST API — we use Puppeteer for scraping.
 */

const pool = require('../db/mysql');

/**
 * Login to TrackPro and scrape daily data
 * @param {object} credentials - { username, password }
 * @returns {Promise<object>} Scraped data
 */
async function scrapeTrackPro(credentials) {
  const { username, password } = credentials;
  if (!username || !password) throw new Error('TrackPro credentials required');

  // Dynamic import puppeteer (optional dependency)
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    throw new Error('puppeteer not installed. Run: npm install puppeteer');
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 1. Login
    await page.goto('https://tracker.getflashsale.xyz/tools/login', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate((u, p) => {
      document.getElementById('login-username').value = u;
      document.getElementById('login-password').value = p;
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Masuk'));
      if (btn) btn.click();
    }, username, password);

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));

    // Check if logged in
    const url = page.url();
    if (url.includes('login')) {
      throw new Error('TrackPro login failed — check credentials');
    }

    // 2. Navigate to Dashboard and scrape summary
    const dashboard = await page.evaluate(() => {
      const text = document.body.innerText;
      const extract = (pattern) => {
        const m = text.match(pattern);
        return m ? m[1].replace(/[.,]/g, '').trim() : '0';
      };
      return {
        balance: extract(/SISA SALDO[\s\S]*?([\d.,]+)/),
        netProfit: extract(/Net Profit[\s\S]*?([-?\d.,]+)/),
        grossRevenue: extract(/(?:Gross Revenue|Komisi Kotor)[\s\S]*?([\d.,]+)/),
        adSpend: extract(/(?:Biaya Iklan|Spend)[\s\S]*?([\d.,]+)/),
        totalOrders: extract(/(?:Total Order|Pesanan)[\s\S]*?([\d.,]+)/),
        roi: extract(/ROI[\s\S]*?([-?\d.]+%)/),
        roas: extract(/ROAS[\s\S]*?([\d.]+x)/),
      };
    });

    // 3. Navigate to Laporan Iklan and scrape daily data
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Laporan Iklan');
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const dailyReports = await page.evaluate(() => {
      const rows = [];
      document.querySelectorAll('table').forEach(t => {
        const headers = Array.from(t.querySelectorAll('th')).map(h => h.textContent.trim());
        if (headers.includes('Biaya Iklan') || headers.includes('SPEND ADS')) {
          Array.from(t.querySelectorAll('tbody tr')).forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
            if (cells.length >= 4) {
              const parseRp = (s) => {
                const m = s.match(/[\d.,]+/);
                return m ? parseFloat(m[0].replace(/[.,]/g, '')) : 0;
              };
              rows.push({
                file: cells[0] || '',
                spend: parseRp(cells[1]),
                commission: parseRp(cells[2]),
                clicks: parseInt(cells[3]) || 0,
                profit: cells[4] ? parseRp(cells[4]) : 0,
              });
            }
          });
        }
      });
      return rows;
    });

    // 4. Navigate to Laporan Pembayaran and scrape payouts
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Laporan Pembayaran');
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const payouts = await page.evaluate(() => {
      const rows = [];
      document.querySelectorAll('table').forEach(t => {
        const headers = Array.from(t.querySelectorAll('th')).map(h => h.textContent.trim());
        if (headers.includes('NOMINAL') || headers.includes('STATUS')) {
          Array.from(t.querySelectorAll('tbody tr')).forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
            if (cells.length >= 4) {
              const parseRp = (s) => {
                const m = s.match(/[\d.,]+/);
                return m ? parseFloat(m[0].replace(/[.,]/g, '')) : 0;
              };
              rows.push({
                date: cells[0] || '',
                reportId: cells[1] || '',
                account: cells[2] || '',
                amount: parseRp(cells[3]),
                status: (cells[4] || '').toLowerCase(),
              });
            }
          });
        }
      });
      return rows;
    });

    // 5. Navigate to Saldo & Budget for Meta account data
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Saldo & Budget');
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const metaAccounts = await page.evaluate(() => {
      const accounts = [];
      const text = document.body.innerText;
      // Parse Meta account cards
      const matches = text.matchAll(/SELOW ID (\d+)[\s\S]*?Rp ([\d.,]+)[\s\S]*?Sisa limit Meta/g);
      for (const m of matches) {
        accounts.push({
          actId: 'act_' + m[1],
          balance: parseFloat(m[2].replace(/[.,]/g, '')),
        });
      }
      return accounts;
    });

    return {
      dashboard,
      dailyReports,
      payouts,
      metaAccounts,
      scrapedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}

/**
 * Import scraped TrackPro data into 1ai-affiliate database
 * @param {object} data - Scraped data from scrapeTrackPro
 * @returns {Promise<object>} Import summary
 */
async function importTrackProData(data) {
  const { dailyReports = [], payouts = [], metaAccounts = [] } = data;
  const results = { dailySpend: 0, payouts: 0, metaAccounts: 0, errors: [] };

  // 1. Import daily spend/commission
  for (const report of dailyReports) {
    try {
      // Parse date from "Laporan 22 Jun" format
      const dateMatch = report.file.match(/(\d+)\s+(\w+)/);
      let dateStr = null;
      if (dateMatch) {
        const months = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
        const day = dateMatch[1].padStart(2, '0');
        const month = months[dateMatch[2]] || '01';
        dateStr = `2026-${month}-${day}`;
      }
      if (!dateStr) continue;

      // Upsert daily spend
      await pool.query(
        `INSERT INTO 1ai_daily_spend (date, campaign_name, spend, clicks, created_at)
         VALUES (?, 'TrackPro Import', ?, ?, UNIX_TIMESTAMP())
         ON DUPLICATE KEY UPDATE spend = VALUES(spend), clicks = VALUES(clicks)`,
        [dateStr, report.spend, report.clicks]
      );

      // Upsert earnings
      if (report.commission > 0) {
        await pool.query(
          `INSERT INTO 1ai_affiliate_earnings (affiliate_id, payout_amount, status, payout_model, created_at)
           VALUES (1, ?, 'approved', 'CPA', UNIX_TIMESTAMP(?))`,
          [report.commission, dateStr]
        );
      }
      results.dailySpend++;
    } catch (e) {
      results.errors.push(`Daily report ${report.file}: ${e.message}`);
    }
  }

  // 2. Import payouts
  for (const payout of payouts) {
    try {
      if (!payout.amount || payout.amount <= 0) continue;
      await pool.query(
        `INSERT IGNORE INTO 1ai_shopee_payouts (report_id, shopee_account, amount, status, created_at)
         VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [payout.reportId || null, payout.account || 'TrackPro', payout.amount, payout.status === 'paid' ? 'paid' : 'pending']
      );
      results.payouts++;
    } catch (e) {
      results.errors.push(`Payout ${payout.reportId}: ${e.message}`);
    }
  }

  // 3. Import Meta account balances
  for (const acc of metaAccounts) {
    try {
      await pool.query(
        `INSERT INTO 1ai_meta_accounts (user_id, act_id, account_name, balance, status, created_at)
         VALUES (1, ?, ?, ?, 'active', UNIX_TIMESTAMP())
         ON DUPLICATE KEY UPDATE balance = VALUES(balance)`,
        [acc.actId, 'TrackPro ' + acc.actId, acc.balance]
      );
      results.metaAccounts++;
    } catch (e) {
      results.errors.push(`Meta account ${acc.actId}: ${e.message}`);
    }
  }

  return results;
}

/**
 * Get TrackPro sync status from DB
 */
async function getSyncStatus() {
  const [spend] = await pool.query('SELECT COUNT(*) as cnt, COALESCE(SUM(spend),0) as total FROM 1ai_daily_spend');
  const [payouts] = await pool.query('SELECT COUNT(*) as cnt, COALESCE(SUM(amount),0) as total FROM 1ai_shopee_payouts');
  const [meta] = await pool.query('SELECT COUNT(*) as cnt FROM 1ai_meta_accounts');
  return {
    dailySpend: { rows: spend[0].cnt, total: Number(spend[0].total) },
    payouts: { rows: payouts[0].cnt, total: Number(payouts[0].total) },
    metaAccounts: { rows: meta[0].cnt },
  };
}

module.exports = { scrapeTrackPro, importTrackProData, getSyncStatus };
