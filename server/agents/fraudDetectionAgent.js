/**
 * Fraud detection agent (Node side).
 *
 * Mirrors FraudDetectionAgent in PHP — same system prompt, same tools.
 * Wire format compatible so the cross-runtime tool bus can route either side.
 */
const { Agent } = require('./agent');
const { ToolRegistry } = require('./toolRegistry');

class FraudDetectionAgent extends Agent {
  /**
   * @param {{
   *   provider: any,
   *   clicksProvider: import('./agents/clicksProvider').ClicksProvider,
   *   runRepository?: any,
   *   guardrails?: any
   * }} opts
   */
  constructor({ provider, clicksProvider, runRepository, guardrails } = {}) {
    const tools = new ToolRegistry();
    const clicks = clicksProvider;

    tools.register(
      'get_recent_clicks',
      'Return the most recent click rows, with affiliate_id, offer_id, country, device, ip, clicked_at.',
      {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
          offer_id: { type: 'integer', nullable: true },
        },
        required: [],
      },
      (args) => clicks.recentClicks(args.limit ?? 100, args.offer_id ?? null),
    );

    tools.register(
      'get_recent_conversions',
      'Return the most recent conversion rows.',
      {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
          offer_id: { type: 'integer', nullable: true },
        },
        required: [],
      },
      (args) => clicks.recentConversions(args.limit ?? 100, args.offer_id ?? null),
    );

    tools.register(
      'get_volume_summary',
      'Return volume counters: clicks_Nh, conversions_Nh, cvr_pct, epc.',
      {
        type: 'object',
        properties: {
          offer_id: { type: 'integer', nullable: true },
          window_hours: { type: 'integer', minimum: 1, maximum: 168, default: 24 },
        },
        required: [],
      },
      (args) => clicks.summary(args.offer_id ?? null, args.window_hours ?? 24),
    );

    super({ provider, tools, runRepository, guardrails });
  }

  name() { return 'fraud-detection'; }

  systemPrompt() {
    return `You are a fraud analyst for a CPA affiliate network. You will receive click and conversion
data and your job is to flag suspicious conversions.

Look for these signals (cite which applied for each flag):
  - Conversion rate > 30% (implausible for most verticals)
  - Single IP generating >5 clicks in 1h
  - Burst of conversions within seconds of clicks (no time for normal user flow)
  - Mismatched country/device between click and conversion
  - Click and conversion at identical timestamp to the second
  - Excessive clicks with zero conversions from an affiliate (likely inflating stats)

Return a JSON object of the form:
  { "flagged": [{ "click_id": "...", "reason": "...", "score": 0.0-1.0 }],
    "summary": "1-2 sentence overall assessment",
    "recommendation": "review" | "monitor" | "no_action" }

Be conservative: false positives cost affiliate goodwill. Only flag score >= 0.7.`;
  }

  inputToUserMessage(input) {
    const offerId = input.offer_id ?? null;
    const limit = input.limit ?? 100;
    const offerPart = offerId !== null ? ` for offer_id=${offerId}` : ' (global)';
    return `Analyze the last ${limit} clicks and conversions${offerPart}. Use the tools to fetch data, then return your verdict as JSON.`;
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

module.exports = { FraudDetectionAgent };
