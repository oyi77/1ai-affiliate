# 1ai-Affiliate — AI Tool Contracts (Cross-Runtime)

> **Stable contract.** This document is the wire format used between the
> PHP AI layer (`config/AI/`) and the Node AI layer (`server/agents/`).
> Any change to `TOOL_BUS_PROTOCOL_VERSION` must be made in three places
> simultaneously, and the test suites in both runtimes must be updated
> in lockstep.

## Versioning

Current version: `1.0.0`. Bump to `2.0.0` for any breaking change
(field rename, semantic change, error envelope change). Additive
fields under a stable version are fine.

## Wire format (HTTP)

### Request

```http
POST /api/ai/invoke
Authorization: Bearer <admin JWT>
Content-Type: application/json
X-Tool-Bus-Protocol: 1.0.0

{
  "protocol": "1.0.0",
  "op": "invoke",
  "agent": "fraud-detection",
  "input": { "limit": 100, "offer_id": 1 },
  "runId": "node-abc123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `protocol` | string | yes | Must equal `1.0.0` or server returns `failed` with "Unsupported protocol" |
| `op` | string | yes | Currently only `invoke` is supported |
| `agent` | string | yes | One of `fraud-detection`, `offer-optimization`, `smartlink-generation` |
| `input` | object | yes | Agent-specific; passed through unchanged |
| `runId` | string | no | Optional client-provided ID. Server returns this in the response so the caller can correlate. |

### Response (success)

```json
{
  "protocol": "1.0.0",
  "op": "result",
  "runId": "node-abc123",
  "status": "success",
  "structured": { "...": "..." },
  "content": "...",
  "promptTokens": 123,
  "completionTokens": 45,
  "model": "gpt-4o-mini",
  "durationMs": 1234.5
}
```

### Response (failure)

```json
{
  "protocol": "1.0.0",
  "op": "result",
  "runId": "node-abc123",
  "status": "failed",
  "error": "AI spend is frozen (kill switch enabled)",
  "durationMs": 0,
  "structured": null,
  "content": "",
  "promptTokens": 0,
  "completionTokens": 0,
  "model": ""
}
```

HTTP status codes:
- `200` — agent ran, succeeded
- `400` — request was malformed, agent unknown, protocol mismatch
- `503` — kill switch is engaged, agent refuses to run
- `500` — unexpected server error

## Agent input/output contracts

### `fraud-detection`
- **input**: `{ limit?: int = 100, offer_id?: int = null }`
- **structured output**:
  ```ts
  {
    flagged: Array<{ click_id: string, reason: string, score: number }>,
    summary: string,
    recommendation: "review" | "monitor" | "no_action"
  }
  ```
- **tools**: `get_recent_clicks`, `get_recent_conversions`, `get_volume_summary`

### `offer-optimization`
- **input**: `{ focus?: string = "all" }`
- **structured output**:
  ```ts
  {
    suggestions: Array<{
      offer_id: number,
      action: "raise_payout" | "lower_payout" | "add_geo" | "remove_geo"
              | "raise_cap" | "lower_cap" | "pause" | "promote",
      expected_uplift_pct: number,  // 0..100
      effort: "low" | "medium" | "high",
      confidence: number,           // 0.0-1.0
      reasoning: string
    }>,
    summary: string
  }
  ```
- **tools**: `list_offers`, `get_offer_performance`

### `smartlink-generation`
- **input**: `{ niche: string, geos?: string[] }`
- **structured output**:
  ```ts
  {
    rules: Array<{
      match: { country?: string, device?: string },
      weights: Array<{ offer_id: number, weight: number }>  // sum to 100
    }>,
    default_offer_id: number,
    rationale: string
  }
  ```
- **tools**: `list_offers`, `get_affiliate_recent_activity`

## Test patterns

Both runtimes ship with tests that exercise the protocol. Add a test
whenever you change the contract.

- **PHP**: `tests/AI/CrossRuntimeToolBusTest.php`
- **Node**: `server/tests/agents/toolBus.test.js`

If you add a new field, make it optional (`?:`) in PHP and
`structured: any` / `error: string | null` on the Node side so older
clients don't break.

## Versioning rules

1. **Additive fields** are fine under the same major version.
2. **Removing or renaming a field** requires a major version bump.
3. **Changing the meaning of an existing field** requires a major version
   bump.
4. **The protocol version is constant** in `OneAIAffiliate\AI\Agents\CrossRuntimeToolBus::PROTOCOL_VERSION`
   (PHP) and `TOOL_BUS_PROTOCOL_VERSION` (Node). Update both, bump to
   2.0.0, and the old clients will be rejected with "Unsupported protocol".
