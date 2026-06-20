'use strict';

/**
 * Scheduled Export Service
 * Runs report queries on a schedule and emails CSV/JSON results.
 */

const C = require('../utils/constants');
const pool = require('../db/mysql');

/**
 * Execute all active scheduled exports.
 * Called by cron daily at 07:00 UTC.
 */
async function runScheduledExports() {
  const [exports] = await pool.query(
    `SELECT * FROM 1ai_scheduled_exports WHERE status = 'active'`
  );

  let executed = 0;
  const errors = [];

  for (const exp of exports) {
    try {
      // Check schedule
      if (!shouldRun(exp)) continue;

      const data = await fetchReportData(exp);
      if (!data.length) continue;

      // Format output
      let output;
      if (exp.format === 'json') {
        output = JSON.stringify(data, null, 2);
      } else {
        output = toCSV(data);
      }

      // Email if configured
      if (exp.email_to) {
        await sendExportEmail(exp.email_to, exp.name, output, exp.format);
      }

      const now = Math.floor(Date.now() / 1000);
      await pool.query('UPDATE 1ai_scheduled_exports SET last_run_at = ? WHERE id = ?', [now, exp.id]);
      executed++;
    } catch (err) {
      errors.push(`Export #${exp.id}: ${err.message}`);
    }
  }

  console.log(`[ScheduledExports] ${executed}/${exports.length} executed. Errors: ${errors.length}`);
  return { executed, errors };
}

function shouldRun(exp) {
  if (!exp.last_run_at) return true;
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - exp.last_run_at;
  if (exp.schedule === 'daily') return elapsed >= 82800; // 23h
  if (exp.schedule === 'weekly') return elapsed >= 590400; // ~6.8 days
  if (exp.schedule === 'monthly') return elapsed >= 2505600; // ~29 days
  return true;
}

async function fetchReportData(exp) {
  const filters = typeof exp.filters === 'string' ? JSON.parse(exp.filters) : (exp.filters || {});
  const dateTo = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const dateFrom = filters.date_from || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  switch (exp.report_type) {
    case 'clicks': {
      const [rows] = await pool.query('SELECT * FROM 1ai_click_log WHERE clicked_at >= UNIX_TIMESTAMP(?) AND clicked_at <= UNIX_TIMESTAMP(?) LIMIT ${C.LIMITS.EXPORT_ROW_LIMIT}', [dateFrom, dateTo + ' 23:59:59']);
      return rows;
    }
    case 'conversions': {
      const [rows] = await pool.query('SELECT * FROM 1ai_conversion_logs WHERE conv_time >= UNIX_TIMESTAMP(?) AND conv_time <= UNIX_TIMESTAMP(?) LIMIT ${C.LIMITS.EXPORT_ROW_LIMIT}', [dateFrom, dateTo + ' 23:59:59']);
      return rows;
    }
    case 'daily': {
      const [rows] = await pool.query('SELECT * FROM 1ai_meta_daily_stats WHERE report_date >= ? AND report_date <= ?', [dateFrom, dateTo]);
      return rows;
    }
    default:
      return [];
  }
}

function toCSV(data) {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const lines = [headers.join(',')];
  for (const row of data) {
    lines.push(headers.map(h => String(row[h] ?? '').replace(/"/g, '""')).map(v => `"${v}"`).join(','));
  }
  return lines.join('\n');
}

async function sendExportEmail(to, subject, body, format) {
  // ponytail: optional nodemailer — only sends if SMTP_HOST is configured
  if (!process.env.SMTP_HOST) {
    console.log(`[ScheduledExport] No SMTP configured. Would email ${to}: ${subject} (${format}, ${body.length} bytes)`);
    return;
  }
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@berkahkarya.org',
      to,
      subject: `📊 ${subject}`,
      text: `Scheduled report export attached.\n\nFormat: ${format}\nSize: ${body.length} bytes`,
      attachments: [{ filename: `report.${format}`, content: body, contentType: format === 'csv' ? 'text/csv' : 'application/json' }],
    });
    console.log(`[ScheduledExport] Sent ${subject} to ${to}`);
  } catch (err) {
    console.error(`[ScheduledExport] Email failed: ${err.message}`);
  }
}

module.exports = { runScheduledExports };
