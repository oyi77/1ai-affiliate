# Postback System Runbook

## Overview

The Node server exposes public server-to-server postback endpoints for advertiser conversion callbacks and an outbound postback sender for offer-configured webhooks.

Public endpoints:

- `GET /api/postback`
- `POST /api/postback`

Admin endpoints:

- `POST /api/admin/offers/:offerId/postback`
- `GET /api/admin/offers/:offerId/postback`
- `GET /api/admin/postback-logs`

## Inbound postbacks

The public endpoint intentionally does not require JWT authentication. Security is provided by unique click IDs, a `(offer_id, click_id)` database unique key, optional HMAC signature verification, and IP-based rate limiting.

Supported inbound parameters may be sent as query parameters or JSON body fields:

- `click_id` required
- `payout`
- `transaction_id`
- `event`
- `status`
- `sig` for optional signature verification

Duplicate postbacks return `409 Conflict`.

## Signature verification

When an offer has `postback_auth_type = 'signature'`, inbound requests must include `sig`.

Signature format:

```text
HMAC-SHA256(click_id + payout + transaction_id, postback_auth_value)
```

Invalid signatures return `403 Forbidden`.

## Rate limiting

`/api/postback` is rate-limited in memory at 10 requests per second per IP. Excess requests return `429 Too Many Requests` with `retryAfter`.

For multi-instance deployments, replace or supplement this with a distributed limiter such as Redis.

## Offer configuration

Admins can configure per-offer outbound postbacks with:

- `postback_url`
- `postback_enabled`
- `postback_auth_type`
- `postback_auth_value`
- `postback_method`: `GET` or `POST`
- `postback_headers`: JSON object
- `postback_timeout`: integer from 1 to 60 seconds
- `postback_retries`: integer from 0 to 10

Invalid URLs, methods, timeouts, and retry values are rejected with `400`.

## Outbound macros

Outbound postback URLs support these macro tokens:

- `{click_id}`
- `{cid}`
- `{tid}`
- `{aff_click_id}`
- `{payout}`
- `{transaction_id}`
- `{txid}`
- `{event}`
- `{status}`

`GET` postbacks substitute macros directly in the URL.

`POST` postbacks send a JSON body with `click_id`, `payout`, `transaction_id`, `event`, and `status`.

Custom headers are parsed defensively: arrays and primitives are ignored, null values are dropped, and remaining values are stringified.

## Queue and retries

Inbound conversions create a postback log entry and enqueue it in `1ai_postback_queue`.

The queue processor:

- starts only when `server/app.js` is run directly,
- polls every 10 seconds,
- checks whether the offer is still postback-enabled before firing,
- marks disabled or missing offers as failed without wasting retries,
- treats non-2xx HTTP responses as retryable failures,
- retries failures with exponential backoff,
- respects per-offer `postback_retries`.

## Audit trail

`1ai_postback_logs` stores:

- offer and affiliate IDs,
- click ID,
- transaction ID,
- payout,
- conversion event,
- postback URL,
- postback body/custom parameters,
- HTTP status and response,
- retry count,
- next retry timestamp,
- error message,
- sent timestamp.

## Migrations

Apply these migrations in order:

1. `server/migrations/000-postback-schema-columns.sql`
2. `server/migrations/001-postback-dedup.sql`

The dedup migration removes existing duplicate `(offer_id, click_id)` rows while keeping the most recent before adding the unique key.

### Postback Queue State Machine Deployment Guidance

After deployment, the postback queue follows a strict state machine with three terminal and retry states:

**Queue Row States:**

- `queued`: Initial state when conversion is received. Processor selects and processes immediately.
- `retry`: Row is retryable and was moved here by exponential backoff logic after a failure. Processor continues retrying until `postback_retries` limit is exhausted.
- `failed` (terminal): Row exhausted all retries or encountered a non-recoverable error (e.g., offer disabled). Processor WILL NOT reprocess this row.

**Data Migration for Existing Rows:**

If you have legacy `failed` rows that should be retryable (e.g., due to temporary network issues), manually transition them:

```sql
-- Convert specific failed queue rows to retry state (example for a date range).
-- Review affected rows first; only convert rows that represent transient failures.
UPDATE 1ai_postback_queue
SET status = 'retry', scheduled_at = NOW()
WHERE status = 'failed'
  AND scheduled_at IS NOT NULL
  AND scheduled_at <= NOW();
```

Verify before applying to production. Terminal `failed` rows created more than 7 days ago are intentionally not transitioned to preserve audit trail.

**Queue Processor Selection Logic:**

The queue processor filters intentionally:

```sql
SELECT pql.id, pql.postback_log_id
FROM 1ai_postback_queue pql
WHERE pql.status IN ('queued', 'retry')
  AND (pql.scheduled_at <= NOW() OR scheduled_at IS NULL)
LIMIT 10;
```

Rows with `status = 'failed'` are excluded and will never be reprocessed unless manually transitioned to `retry`.

## Verification commands

```bash
cd server
npm test -- --no-coverage
npm test -- --coverage
npm audit
node --check controllers/postbackController.js
node --check services/postbackQueue.js
node --check middleware/rateLimit.js
node --check routes/postback.js
node --check app.js
```
