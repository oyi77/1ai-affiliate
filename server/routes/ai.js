/**
 * /api/ai — admin-facing endpoints to run AI agents.
 *
 * POST /api/ai/run              { agent, input } -> { runId, status, structured, ... }
 * GET  /api/ai/runs             ?agent=...&limit=50 -> recent run history
 * GET  /api/ai/runs/:runId      -> a single run record
 * POST /api/ai/kill-switch      { frozen: true } -> freeze all AI spend (admin only)
 * GET  /api/ai/spend            -> current per-agent spend totals
 *
 * Auth: same JWT as the rest of the admin API (requireAdmin).
 */
const express = require('express');
const router = express.Router();
const { Supervisor } = require('../agents/supervisor');
const { FraudDetectionAgent } = require('../agents/fraudDetectionAgent');
const { PostbackTriageAgent } = require('../agents/postbackTriageAgent');
const { ContentGenAgent, TOOL_DEFS } = require('../agents/contentGenAgent');
const { InMemoryClicksProvider } = require('../agents/clicksProvider');
const { InMemoryPostbackRepository } = require('../agents/postbackRepository');
const { InMemoryRunRepository } = require('../agents/runRepository');
const { AgentGuardrails } = require('../agents/agentGuardrails');
const { MockAIProvider } = require('../agents/mockProvider');
const { createProvider } = require('../agents/aiProvider');
const { TOOL_BUS_PROTOCOL_VERSION } = require('../agents/aiProvider');
const { authenticate, requireAdmin } = require('../middleware/auth');

const runRepository = new InMemoryRunRepository();
const guardrails = new AgentGuardrails();

function getProvider() {
  try {
    return createProvider();
  } catch (err) {
    console.warn('[ai] live provider unavailable, falling back to mock:', err.message);
    return new MockAIProvider();
  }
}

function getContentExecutors() {
  return Object.fromEntries(
    Object.keys(TOOL_DEFS).map((name) => [
      name,
      async (args) => ({
        tool: name,
        args,
        generated_at: new Date().toISOString(),
        structured: true,
      }),
    ]),
  );
}

function buildSupervisor() {
  return new Supervisor({
    provider: getProvider(),
    agents: {
      'fraud-detection': new FraudDetectionAgent({
        provider: getProvider(),
        clicksProvider: new InMemoryClicksProvider(),
        runRepository,
        guardrails,
      }),
      'postback-triage': new PostbackTriageAgent({
        provider: getProvider(),
        postbackRepository: new InMemoryPostbackRepository(),
        runRepository,
        guardrails,
      }),
      'content-generation': new ContentGenAgent({
        provider: getProvider(),
        executors: getContentExecutors(),
        runRepository,
        guardrails,
      }),
    },
    runRepository,
    guardrails,
  });
}

router.use(authenticate, requireAdmin);

router.post('/run', async (req, res) => {
  try {
    const { agent, input } = req.body || {};
    if (!agent || typeof agent !== 'string') {
      return res.status(400).json({ error: 'agent (string) is required' });
    }
    if (!input || typeof input !== 'object') {
      return res.status(400).json({ error: 'input (object) is required' });
    }
    if (guardrails.isFrozen()) {
      return res.status(503).json({ error: 'AI spend is frozen (kill switch enabled)' });
    }
    const supervisor = buildSupervisor();
    const sub = supervisor.agents[agent];
    if (!sub) {
      return res.status(404).json({ error: `unknown agent: ${agent}` });
    }
    const result = await sub.run(input);
    res.json({
      agent,
      runId: result.runId,
      status: result.error ? 'failed' : 'success',
      structured: result.structured,
      content: result.content,
      error: result.error,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      model: result.model,
    });
  } catch (err) {
    console.error('[ai] run error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/runs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const agent = req.query.agent || null;
  res.json({ runs: runRepository.recent(limit, agent) });
});

router.get('/runs/:runId', (req, res) => {
  const run = runRepository.findByRunId(req.params.runId);
  if (!run) return res.status(404).json({ error: 'run not found' });
  res.json(run);
});

router.post('/kill-switch', (req, res) => {
  const { frozen } = req.body || {};
  guardrails.setFrozen(!!frozen);
  res.json({ frozen: guardrails.isFrozen() });
});

router.get('/spend', (_req, res) => {
  res.json({ spend: guardrails.spendReport() });
});

module.exports = router;
module.exports.TOOL_BUS_PROTOCOL_VERSION = TOOL_BUS_PROTOCOL_VERSION;
