# 1ai-Affiliate AI Agent Layer

> **Status:** Production-shaped framework + 3 specialized agents on each runtime, ready to be swapped onto any OpenAI-compatible API.

This document is the **operator's reference** for the AI features added to
1ai-Affiliate. It covers the architecture, the available agents, how to
configure providers, the cost guardrails, and the failure modes.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  1ai-Affiliate AI Layer                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PHP runtime (config/AI/)                Node runtime        │
│  ──────────────────────────              (server/agents/)   │
│                                                              │
│  AIProviderInterface         ↔           aiProvider.js       │
│  AIProviderFactory            ↔           providers/         │
│  ├─ OpenAIProvider            ↔           voltAgentProvider  │
│  └─ MockAIProvider            ↔           mockProvider        │
│                                                              │
│  Agent (base)                ↔           Agent (base)       │
│  ToolRegistry                ↔           ToolRegistry        │
│  AgentGuardrails             ↔           AgentGuardrails     │
│  AgentRun + Repository       ↔           runRepository       │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │ FraudDetectionAgent │    │ FraudDetectionAgent      │    │
│  │ OfferOptimizationA. │    │ PostbackTriageAgent      │    │
│  │ SmartlinkGenerationA│    │ ContentGenAgent          │    │
│  │                     │    │ Supervisor               │    │
│  └─────────────────────┘    └──────────────────────────┘    │
│           ▲                            ▲                   │
│           │  ┌──────────────────────┐  │                   │
│           └──┤  CrossRuntimeToolBus ├──┘                   │
│              │  (PHP dispatcher)    │                      │
│              │  TOOL_BUS_PROTOCOL   │                      │
│              │      = 1.0.0        │                      │
│              └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

Both runtimes share the same shape:
- An `Agent` base class that runs the standard system-prompt + tool-call
  loop, persists a `Run` record, and enforces the budget.
- A `ToolRegistry` for declaring typed tools (name + JSON-schema params +
  handler).
- An `AgentGuardrails` for per-agent spend caps, max-iterations, and a
  global kill switch.

A Node agent can call a PHP agent (or vice versa) over HTTP using
`CrossRuntimeToolBus` (PHP) and `toolBus.js` (Node). The wire format is
documented below.

## Available agents

| Agent name | Runtime | Purpose |
|---|---|---|
| `fraud-detection` | PHP + Node | RAG over recent clicks/conversions; returns a list of suspicious conversions with a 0..1 score and reasoning. |
| `offer-optimization` | PHP | Portfolio review; suggests concrete actions (raise/lower payout, cap, geo, pause, promote) with confidence + effort. |
| `smartlink-generation` | PHP | Designs a smartlink routing config (geo/device rules + weights + default offer). |
| `postback-triage` | Node | Diagnoses failed postbacks (4xx/5xx/timeout/dns/auth) and recommends retry/edit/escalate. |
| `content-generation` | Node | Replaces the 6 hard-coded Gemini controllers with a single agent that picks the right tool. |
| `supervisor` | Node | Routes a free-form request to one of the sub-agents. |

## HTTP endpoints

All endpoints require an admin JWT (same auth as the rest of the
admin API).

### `POST /api/ai/run`  — execute an agent
```json
{ "agent": "fraud-detection", "input": { "limit": 100, "offer_id": 1 } }
```
Returns:
```json
{
  "agent": "fraud-detection",
  "runId": "r-abc123",
  "status": "success",
  "structured": { "flagged": [...], "summary": "...", "recommendation": "review" },
  "content": "...same as structured, JSON-encoded...",
  "promptTokens": 123,
  "completionTokens": 45,
  "model": "gpt-4o-mini"
}
```

### `GET /api/ai/runs`  — recent run history
`?agent=fraud-detection&limit=50`

### `GET /api/ai/runs/:runId`  — single run

### `POST /api/ai/kill-switch`  — freeze/unfreeze AI spend
```json
{ "frozen": true }
```
While frozen, `/api/ai/run` returns 503.

### `GET /api/ai/spend`  — per-agent USD totals
```json
{ "spend": { "fraud-detection": 0.0042, "postback-triage": 0.0011 } }
```

## Cross-runtime tool bus (TOOL_BUS_PROTOCOL_VERSION 1.0.0)

The Node side calls into the PHP layer (and vice versa) using a stable
JSON envelope.

**Request**
```json
{
  "protocol": "1.0.0",
  "op": "invoke",
  "agent": "fraud-detection",
  "input": { "limit": 100 },
  "runId": "node-abc123"
}
```

**Response (success)**
```json
{
  "protocol": "1.0.0",
  "op": "result",
  "runId": "node-abc123",
  "status": "success",
  "structured": { "...": "..." },
  "content": "...",
  "promptTokens": 100,
  "completionTokens": 50,
  "model": "gpt-4o-mini",
  "durationMs": 1234.5
}
```

**Response (failure)**
```json
{
  "protocol": "1.0.0",
  "op": "result",
  "runId": "node-abc123",
  "status": "failed",
  "error": "AI spend is frozen (kill switch enabled)",
  "durationMs": 0
}
```

The HTTP header `X-Tool-Bus-Protocol: 1.0.0` must be present on every
request and response.

## Provider configuration

Set env variables to choose the provider (no code change required):

| Variable | Default | Notes |
|---|---|---|
| `AI_PROVIDER` | `openai` if `OPENAI_API_KEY` set, else `mock` | `openai` / `mock` |
| `OPENAI_API_KEY` | — | Required for live |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Compatible with Azure, Together, Groq, Ollama |
| `OPENAI_MODEL` | `gpt-4o-mini` | Per-request override on the API |
| `ANTHROPIC_API_KEY` | — | For Anthropic (PHP side, not wired by default) |

For tests, the `MockAIProvider` is used automatically — it scripts
responses and records every call, so tests can assert on what prompts
the agent constructed.

## Cost guardrails

Each agent run enforces:
- **Max iterations**: 8 (loop terminates if no final answer).
- **Per-run call cap**: 20 provider calls.
- **Per-agent spend cap**: $5.00 USD by default (configurable via
  `AgentGuardrails::spendCaps`).
- **Kill switch**: `POST /api/ai/kill-switch {"frozen": true}` halts
  all AI spend instantly.

If the budget is exceeded mid-run, the agent throws
`AgentBudgetExceededException` (PHP) or returns an error envelope
(Node). The run is persisted with `status: 'failed'`.

## Observability

Every run is persisted to `InMemoryAgentRunRepository` (production
swaps in a MySQL-backed implementation). Records include:

- `runId` — random hex ID
- `agentName` — e.g. `fraud-detection`
- `input` — what the caller asked
- `output` — structured payload (or null on error)
- `error` — error message (or null on success)
- `promptTokens` / `completionTokens` — for cost reconciliation
- `durationMs` — wall-clock
- `startedAt` / `finishedAt` — ISO 8601
- `status` — `success` / `failed` / `running`

View the last 50 runs:
```
curl -H "Authorization: Bearer $JWT" http://localhost:3001/api/ai/runs
```

## Testing

The agent framework is fully testable without any LLM — the
`MockAIProvider` scripts responses and records calls.

**PHP** (config/AI/):
- `vendor/bin/phpunit --filter AI` — 57 tests, agent framework +
  cross-runtime + controller

**Node** (server/agents/):
- `npx jest tests/agents` — 17 tests, loop/error/MAX_ITERATIONS/budget +
  supervisor + tool bus + routes

## Operational runbook

### Agent produced nonsense / hallucinated output
1. Look at the run record (`GET /api/ai/runs/:runId`) for the prompt
   tokens. If very high, the agent looped many times.
2. Check the kill switch isn't engaged.
3. If on a new model, switch to `gpt-4o-mini` (or `gpt-4o` for
   harder tasks) and re-run.

### Spending out of control
1. Engage the kill switch: `POST /api/ai/kill-switch {"frozen": true}`
2. `GET /api/ai/spend` — see which agent burned the budget
3. `POST /api/ai/kill-switch {"frozen": false}` to unfreeze after
   tuning the spend cap

### Node side can't reach PHP side
1. Check `AI_PROVIDER` and `OPENAI_API_KEY` in the PHP process
2. Verify the PHP `/api/ai/invoke` endpoint is mounted and returns
   200 on health checks
3. The Node `toolBus.js` client returns a structured error envelope
   on any HTTP failure — look at `result.error`

## Adding a new agent

1. **PHP side** (config/AI/Agents/MyNewAgent.php):
   ```php
   final class MyNewAgent extends Agent {
       public function name(): string { return 'my-new'; }
       protected function systemPrompt(): string { return '...'; }
       protected function inputToUserMessage(array $input): string { return '...'; }
       public function __construct(AIProviderInterface $provider, ...) {
           $tools = new ToolRegistry();
           $tools->register('my_tool', '...', [...], fn($args) => ...);
           parent::__construct($provider, $tools);
       }
   }
   ```
2. **Register** in `CrossRuntimeToolBus::has()` / `listAvailable()` /
   `build()`.
3. **Tests** (tests/AI/MyNewAgentTest.php): use `MockAIProvider` to
   script responses and assert on `response.structured`.

4. **Run** the test suite + PHPStan:
   ```
   vendor/bin/phpunit --filter MyNew
   vendor/bin/phpstan analyse
   ```

Done — no protocol changes needed; the cross-runtime tool bus already
knows how to dispatch the new agent.
