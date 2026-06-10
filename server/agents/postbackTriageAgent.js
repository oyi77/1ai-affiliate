/**
 * PostbackTriageAgent — diagnoses failed postbacks.
 *
 * Node side of the cross-runtime story: gets the failed-postback list
 * (via DB), inspects recent attempts + advertiser URL config, then
 * recommends: retry now, edit URL, escalate to advertiser, or close.
 */
const { Agent } = require('./agent');
const { ToolRegistry } = require('./toolRegistry');

class PostbackTriageAgent extends Agent {
  /**
   * @param {{
   *   provider: any,
   *   postbackRepository: import('./postbackRepository').PostbackRepository,
   *   runRepository?: any,
   *   guardrails?: any
   * }} opts
   */
  constructor({ provider, postbackRepository, runRepository, guardrails } = {}) {
    const tools = new ToolRegistry();
    const repo = postbackRepository;

    tools.register(
      'get_failed_postbacks',
      'Return the most recent failed postbacks (postback_log_id, offer_id, last_error, retry_count, http_status, last_attempt_at).',
      {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 50 },
          since_hours: { type: 'integer', minimum: 1, maximum: 168, default: 24 },
        },
        required: [],
      },
      (args) => repo.failedPostbacks(args.limit ?? 50, args.since_hours ?? 24),
    );

    tools.register(
      'get_postback_detail',
      'Return a single postback log row + its offer config (postback_url, postback_method, postback_auth, retry_count).',
      {
        type: 'object',
        properties: { postback_log_id: { type: 'integer' } },
        required: ['postback_log_id'],
      },
      (args) => repo.postbackDetail(args.postback_log_id),
    );

    super({ provider, tools, runRepository, guardrails });
  }

  name() { return 'postback-triage'; }

  systemPrompt() {
    return `You are an SRE for an affiliate network's postback system. You receive a list
of failed postbacks (an advertiser wasn't notified of a conversion).

For each failed postback, classify the root cause from these buckets:
  - 'transient_4xx'   : advertiser returned 4xx, suggests their endpoint config changed
  - 'transient_5xx'   : advertiser returned 5xx, retry should succeed
  - 'timeout'         : we couldn't reach them; advertiser may be down
  - 'dns'             : hostname unresolvable — typo in URL
  - 'auth'            : 401/403 — auth token or signature wrong
  - 'unknown'         : insufficient data, needs human review

Return JSON:
  { "verdicts": [
      { "postback_log_id": N, "cause": "<bucket>", "confidence": 0.0-1.0,
        "recommendation": "retry_now" | "edit_url" | "escalate" | "close",
        "reasoning": "1-2 sentences" }
    ],
    "summary": "1-2 sentence overview"
  }`;
  }

  inputToUserMessage(input) {
    const limit = input.limit ?? 50;
    const since = input.since_hours ?? 24;
    return `Triage the ${limit} most recent failed postbacks from the last ${since} hours. Use the tools to pull data, then return your verdicts as JSON.`;
  }

  providerOptions(_input) {
    return { ...super.providerOptions(_input), json: true };
  }

  parseFinalAnswer(response) {
    try {
      const decoded = JSON.parse(response.content);
      if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) return decoded;
    } catch (_) { /* fall through */ }
    return { raw: response.content };
  }
}

module.exports = { PostbackTriageAgent };
