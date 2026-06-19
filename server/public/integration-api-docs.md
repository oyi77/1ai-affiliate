# 1ai-Affiliate Integration API

## Overview

The integration system uses a **plugin architecture**. Each ad platform is a module in `server/integrations/platforms/` that exports `{ meta, testConnection, fetchStats }`. The registry auto-discovers all modules. Adding a new platform = dropping a file. No other changes needed.

## Endpoints

### List Available Integrations

```
GET /api/admin/traffic-sources/integrations
Authorization: Bearer <token>
```

Returns all registered integrations with their auth field definitions. Use this to dynamically render the connection form in the UI.

**Response:**
```json
{
  "data": [
    {
      "id": "meta",
      "name": "Meta Ads",
      "icon": "📘",
      "description": "Facebook & Instagram campaign stats",
      "auth_fields": [
        { "key": "access_token", "label": "Access Token", "type": "password", "required": true },
        { "key": "act_id", "label": "Ad Account ID (act_XXX)", "type": "text", "required": true }
      ],
      "cost_models": ["CPC", "CPM", "CPA"]
    }
  ]
}
```

### Connect an Integration

```
POST /api/admin/traffic-sources/:id/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform_type": "meta",
  "access_token": "EAA...",
  "act_id": "act_123456789"
}
```

The `platform_type` must match a registered integration ID. The body must include all `required` auth fields from the integration's `auth_fields` definition. The server tests the connection before storing credentials.

**Response:**
```json
{
  "success": true,
  "platform": "meta",
  "account": "My Ad Account"
}
```

**Errors:**
- `400` — Missing required field, or connection test failed
- `404` — Traffic source not found

### Sync Stats

```
POST /api/admin/traffic-sources/:id/sync?date_from=2026-06-01&date_to=2026-06-19
Authorization: Bearer <token>
```

Fetches campaign stats from the connected platform and upserts into `1ai_meta_daily_stats`. Date range defaults to last 7 days.

**Response:**
```json
{
  "success": true,
  "platform": "meta",
  "synced": 42,
  "errors": []
}
```

### List Traffic Sources

```
GET /api/admin/traffic-sources
Authorization: Bearer <token>
```

### Create Traffic Source

```
POST /api/admin/traffic-sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Meta Ads",
  "platform_type": "meta",
  "cost_model": "CPC",
  "currency": "IDR"
}
```

### Get Daily Stats

```
GET /api/admin/traffic-sources/:id/daily-stats
Authorization: Bearer <token>
```

## Adding a New Integration

1. Copy `server/integrations/platforms/_template.js` → `yourplatform.js`
2. Fill in:
   - `meta` — id, name, icon, description, auth_fields, cost_models
   - `testConnection(config)` — verify credentials, return `{ ok, account?, error? }`
   - `fetchStats(pool, trafficSourceId, config, dateFrom, dateTo)` — call API, upsert rows, return `{ synced, errors }`
3. Done. Registry auto-discovers it on next server start.

No route changes, no controller changes, no cron changes.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend: Integration Marketplace UI       │
│  GET /integrations → dynamic form render    │
├─────────────────────────────────────────────┤
│  API: Generic endpoints                     │
│  POST /connect  → registry.testConnection   │
│  POST /sync     → registry.sync             │
│  GET /integrations → registry.listAll        │
├─────────────────────────────────────────────┤
│  Registry: Auto-discovers platform modules  │
│  server/integrations/registry.js            │
├─────────────────────────────────────────────┤
│  Platforms: One file per ad network         │
│  platforms/meta.js, google.js, tiktok.js    │
├─────────────────────────────────────────────┤
│  DB: 1ai_meta_daily_stats (shared table)    │
│  platform column: 'meta'|'google'|'tiktok'  │
└─────────────────────────────────────────────┘
```

## Auto-Sync

A cron job runs daily at 06:00 UTC, iterates all connected traffic sources, and syncs yesterday's stats. No manual intervention needed. Uses the same registry → platform dispatch.
