#!/usr/bin/env node
/**
 * One-time migration: import promo_queue rows from old PostgreSQL to MySQL.
 *
 * Usage:
 *   DB_HOST_OLD=localhost DB_NAME_OLD=1ai DB_USER_OLD=postgres DB_PASS_OLD= \
 *     node scripts/import_promo_queue.js [--dry-run]
 *
 * Reads from old PostgreSQL promo_queue table, inserts into MySQL 1ai_promo_queue.
 * Marks old PG rows as imported so they aren't double-migrated.
 */

const mysql = require('../db/mysql');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const oldPg = {
    host: process.env.DB_HOST_OLD || 'localhost',
    port: parseInt(process.env.DB_PORT_OLD || '5432'),
    database: process.env.DB_NAME_OLD || '1ai',
    user: process.env.DB_USER_OLD || 'postgres',
    password: process.env.DB_PASS_OLD || '',
  };

  let pg;
  try {
    const { Pool } = require('pg');
    pg = new Pool(oldPg);
    await pg.query('SELECT 1');
  } catch (e) {
    console.error('Cannot connect to old PostgreSQL:', e.message);
    console.error('Set DB_HOST_OLD, DB_NAME_OLD, DB_USER_OLD, DB_PASS_OLD env vars.');
    process.exit(1);
  }

  // Fetch pending rows from old PG
  const { rows } = await pg.query(
    "SELECT id, product_name, normal_price, promo_price, product_url, image_url, affiliate_link FROM promo_queue WHERE status = 'pending' ORDER BY id"
  );
  console.log(`Found ${rows.length} pending rows in old PostgreSQL promo_queue`);

  if (rows.length === 0) {
    console.log('Nothing to migrate.');
    await pg.end();
    process.exit(0);
  }

  // Show sample
  console.log('Sample:', JSON.stringify(rows.slice(0, 3).map(r => ({ name: r.product_name, prices: `${r.normal_price} → ${r.promo_price}` })), null, 2));

  if (dryRun) {
    console.log('[DRY RUN] Would insert', rows.length, 'rows into MySQL 1ai_promo_queue');
    await pg.end();
    process.exit(0);
  }

  // Insert into MySQL
  let inserted = 0;
  for (const row of rows) {
    try {
      const [res] = await mysql.query(
        `INSERT INTO 1ai_promo_queue (product_url, product_name, image_url, normal_price, promo_price, affiliate_link)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [row.product_url, row.product_name, row.image_url, row.normal_price, row.promo_price, row.affiliate_link]
      );
      // Mark old row as imported
      await pg.query("UPDATE promo_queue SET status = 'imported' WHERE id = $1", [row.id]);
      inserted++;
    } catch (e) {
      console.error(`Failed to import row ${row.id}:`, e.message);
    }
  }

  console.log(`Migrated ${inserted}/${rows.length} rows from PostgreSQL to MySQL`);
  await pg.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
