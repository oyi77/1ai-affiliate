# 1ai-Affiliate Deploy Runbook

> Production deployment guide with migration order and rollback procedures.

## Prerequisites

- MySQL 8.0+ with UTF-8mb4
- PHP 8.3+ with extensions: `mysqli`, `json`, `mbstring`, `curl`, `geoip2`
- Node.js 22+ (for the companion admin server)
- Composer 2.x
- npm 10+

## Migration Order

Migrations MUST run in this exact order. Each is idempotent (uses `IF NOT EXISTS`).

```bash
# 1. Core tracking tables
mysql -u root -p $DB_NAME < scripts/001_affiliate_tables.sql

# 2. Margin/commission engine
mysql -u root -p $DB_NAME < scripts/002_margin_engine.sql

# 3. Offer management
mysql -u root -p $DB_NAME < scripts/003_offers.sql

# 4. Commission ledger
mysql -u root -p $DB_NAME < scripts/004_commission_ledger.sql

# 5. Payment processing
mysql -u root -p $DB_NAME < scripts/005_payment_table.sql

# 6. Schema alignment (1ai_ prefixed tables for API layer)
mysql -u root -p $DB_NAME < scripts/006_schema_alignment.sql

# 8. Postback system (retry queue, audit trail)
mysql -u root -p $DB_NAME < scripts/008_postback_system.sql

# 9. Postback state machine migration (failed → retry)
mysql -u root -p $DB_NAME < scripts/009_postback_failed_to_retry.sql

# 10. S2S postback IP allowlist column
mysql -u root -p $DB_NAME < scripts/010_postback_ip_allowlist.sql

# Attribution models (separate migration runner)
php config/migrations/run_attribution_migration_standalone.php
```

**Note:** `007_dev_seed.sql` is dev-only test data. Do NOT run in production.

## Deployment Steps

### 1. Pre-deploy checks
```bash
# Run full test suite
./test.sh all

# PHPStan static analysis
vendor/bin/phpstan analyse --memory-limit=1G

# Verify migration files are idempotent
grep -r "IF NOT EXISTS" scripts/*.sql | wc -l  # should be > 0
```

### 2. Database migrations
```bash
# Run migrations in order (see above)
php scripts/run_migrations.php
```

### 3. PHP backend
```bash
composer install --no-dev --optimize-autoloader
# PSR-4 autoload compatibility symlinks (if vendor/ is stale)
ln -sf config 1ai-config 2>/dev/null || true
ln -sf interfaces 1ai-interfaces 2>/dev/null || true
ln -sf tracking_support tracking1ai 2>/dev/null || true
```

### 4. Node.js admin server
```bash
cd server
npm ci --legacy-peer-deps
# Set environment variables
cp .env.example .env  # edit with production values
# Start with PM2 or systemd
pm2 start app.js --name 1ai-admin
```

### 5. Post-deploy verification
```bash
# Healthcheck
curl http://localhost:3001/health
# Expected: { "status": "ok", "components": { "database": { "status": "ok" }, ... } }

# SSE stats stream (admin auth required)
curl -N -H "Authorization: Bearer $JWT" http://localhost:3001/api/admin/stats/stream

# AI agent endpoint (admin auth required)
curl -X POST -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" \
  -d '{"agent":"fraud-detection","input":{"limit":10}}' \
  http://localhost:3001/api/ai/run
```

## Rollback

1. Revert the Node.js deployment: `pm2 restart 1ai-admin` with previous version
2. Revert PHP files: `git checkout HEAD~1 -- config/ api/ tracking_support/`
3. Database: migrations are additive-only (`IF NOT EXISTS`), so no rollback needed for schema. Data migrations (009) should be tested before deploy.

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `DB_HOST` | `localhost` | Yes | MySQL host |
| `DB_NAME` | `prosper202_test` | Yes | Database name |
| `DB_USER` | `root` | Yes | MySQL user |
| `DB_PASS` | `` | Yes | MySQL password |
| `JWT_SECRET` | — | Yes | JWT signing secret |
| `AI_PROVIDER` | `mock` | No | `openai` / `mock` |
| `OPENAI_API_KEY` | — | No | For AI agents |
| `OPENAI_MODEL` | `gpt-4o-mini` | No | Default LLM model |
| `PORT` | `3001` | No | Admin server port |

## Security Checklist

- [ ] `JWT_SECRET` is a random 256-bit value, not committed to repo
- [ ] Database user has minimal privileges (no `GRANT ALL`)
- [ ] HTTPS enforced on all public endpoints
- [ ] Rate limiting enabled on auth endpoints (5/min/IP)
- [ ] Postback IP allowlist configured per offer
- [ ] CORS origin restricted to known domains
