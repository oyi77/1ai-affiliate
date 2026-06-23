/**
 * /api/ai — simple agent dispatcher. No class hierarchy, no Supervisor.
 *
 * POST /api/ai/run              { agent, input } -> { runId, status, content, ... }
 * GET  /api/ai/runs             ?agent=...&limit=50 -> recent run history
 * GET  /api/ai/runs/:runId      -> a single run record
 * GET  /api/ai/spend            -> current per-agent spend totals
 */
const express = require('express');
const router = express.Router();
const { MysqlClicksProvider } = require('../agents/mysqlClicksProvider');
const { MysqlPostbackRepository } = require('../agents/mysqlPostbackRepository');
const { MysqlRunRepository } = require('../agents/mysqlRunRepository');
const { createProvider, TOOL_BUS_PROTOCOL_VERSION } = require('../agents/aiProvider');
const { authenticate, requireAdmin } = require('../middleware/auth');

const runs = new MysqlRunRepository();
const clicks = new MysqlClicksProvider();
const postbacks = new MysqlPostbackRepository();

// Token budget: simple counter per agent
const spend = {};
function charge(agent, prompt, completion) {
  if (!spend[agent]) spend[agent] = { calls: 0, promptTokens: 0, completionTokens: 0 };
  spend[agent].calls++;
  spend[agent].promptTokens += prompt || 0;
  spend[agent].completionTokens += completion || 0;
}

// Agent definitions: name → { systemPrompt, buildMessages, tools }
const AGENTS = {
  'fraud-detection': {
    systemPrompt: `You are a fraud detection analyst for an affiliate network. Analyze click and conversion data for suspicious patterns: bot traffic, click flooding, conversion stuffing, proxy/VPN usage, unusual timing patterns. Return a JSON verdict: { risk_score: 0-1, flags: [...], recommendation: "allow"|"review"|"block" }.`,
    async buildMessages(input) {
      const limit = input.limit || 100;
      const offerId = input.offer_id || null;
      const clickSummary = await clicks.summary(offerId);
      const recentClicks = await clicks.recentClicks(limit, offerId);
      return [
        { role: 'user', content: `Analyze the last ${limit} clicks and conversions for offer ${offerId || 'all'}. Summary: ${JSON.stringify(clickSummary)}. Recent clicks: ${JSON.stringify(recentClicks.slice(0, 20))}.` }
      ];
    },
    tools: {},
  },
  'postback-triage': {
    systemPrompt: `You are a postback triage agent. Analyze failed postback deliveries, identify root causes (timeout, auth failure, malformed URL, rate limit), and recommend retry strategies. Return JSON: { failures: [...], root_causes: {...], recommendations: [...] }.`,
    async buildMessages(input) {
      const failed = await postbacks.failedPostbacks(input.limit || 50);
      return [
        { role: 'user', content: `Analyze these failed postbacks: ${JSON.stringify(failed.slice(0, 20))}.` }
      ];
    },
    tools: {},
  },
  'content-generation': {
    systemPrompt: `You are a content generation assistant for affiliate marketing. Generate ad copy, social media captions, email sequences, and landing page content. Return structured content with variants for A/B testing.`,
    async buildMessages(input) {
      return [
        { role: 'user', content: `Generate ${input.type || 'ad copy'} for: ${input.prompt || input.topic || 'affiliate offer'}. Target: ${input.audience || 'general'}. Tone: ${input.tone || 'professional'}.` }
      ];
    },
    tools: {},
  },
};

router.use(authenticate, requireAdmin);

router.post('/run', async (req, res) => {
  const { agent, input } = req.body || {};
  if (!agent || !AGENTS[agent]) {
    return res.status(400).json({ error: `Unknown agent: ${agent}. Available: ${Object.keys(AGENTS).join(', ')}` });
  }
  if (!input || typeof input !== 'object') {
    return res.status(400).json({ error: 'input (object) is required' });
  }

  const runId = Math.random().toString(16).slice(2, 18);
  const def = AGENTS[agent];
  const startedAt = Date.now();

  await runs.start(agent, runId, input);

  try {
    const provider = createProvider();
    const messages = [
      { role: 'system', content: def.systemPrompt },
      ...(await def.buildMessages(input)),
    ];

    const result = await provider.chat(messages, { json: true });

    charge(agent, result.promptTokens, result.completionTokens);

    if (result.error) {
      await runs.finish(runId, null, result.error, result.promptTokens, result.completionTokens, Date.now() - startedAt, 'failed');
      return res.json({ agent, runId, status: 'failed', error: result.error, content: '' });
    }

    await runs.finish(runId, { content: result.content }, null, result.promptTokens, result.completionTokens, Date.now() - startedAt, 'success');
    res.json({
      agent, runId, status: 'success',
      content: result.content,
      structured: result.structured,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      model: result.model,
    });
  } catch (err) {
    await runs.finish(runId, null, err.message, 0, 0, Date.now() - startedAt, 'failed');
    res.status(500).json({ agent, runId, status: 'failed', error: err.message });
  }
});

router.get('/runs', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const agent = req.query.agent || null;
  const data = await runs.recent(limit, agent);
  res.json({ runs: data });
});

router.get('/runs/:runId', async (req, res) => {
  const run = await runs.findByRunId(req.params.runId);
  if (!run) return res.status(404).json({ error: 'run not found' });
  res.json(run);
});

router.get('/spend', (_req, res) => {
  res.json({ spend });
});

module.exports = router;
module.exports.TOOL_BUS_PROTOCOL_VERSION = TOOL_BUS_PROTOCOL_VERSION;
