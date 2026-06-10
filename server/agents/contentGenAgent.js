/**
 * ContentGenAgent — replaces the 6 hard-coded Gemini controllers with a
 * single supervised agent. Routes the user request to the right sub-task
 * (banner / carousel / caption / brand kit / A/B test / bg-remove) and
 * returns structured content.
 *
 * Tool implementations are stubbed — production wires these to
 * the existing controllers/contentController.js.
 */
const { Agent } = require('./agent');
const { ToolRegistry } = require('./toolRegistry');

const TOOL_DEFS = {
  banner: {
    description: 'Generate banner ad concepts (headline, subtext, palette, layout).',
    parameters: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        audience: { type: 'string' },
        platform: { type: 'string' },
        style: { type: 'string', nullable: true },
        variations: { type: 'integer', minimum: 1, maximum: 5, default: 3 },
      },
      required: ['product', 'audience', 'platform'],
    },
  },
  carousel: {
    description: 'Generate Instagram carousel slides (hook -> value -> CTA).',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        slides: { type: 'integer', minimum: 3, maximum: 10, default: 5 },
        platform: { type: 'string' },
      },
      required: ['topic'],
    },
  },
  caption: {
    description: 'Generate a social caption + 3 alt hooks + hashtags.',
    parameters: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        platform: { type: 'string' },
        tone: { type: 'string' },
        length: { type: 'string', enum: ['short', 'medium', 'long'], nullable: true },
      },
      required: ['product', 'platform', 'tone'],
    },
  },
  brand_kit: {
    description: 'Generate a brand kit (palette, fonts, voice, logo concept, taglines).',
    parameters: {
      type: 'object',
      properties: {
        brand_name: { type: 'string' },
        industry: { type: 'string' },
        vibe: { type: 'string' },
      },
      required: ['brand_name', 'industry', 'vibe'],
    },
  },
  ab_test: {
    description: 'Generate A/B test variants for a landing page (3 variants w/ predicted CTR).',
    parameters: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        audience: { type: 'string' },
        hypothesis: { type: 'string', nullable: true },
      },
      required: ['product', 'audience'],
    },
  },
  bg_remove: {
    description: 'Generate an optimized prompt for client-side background removal.',
    parameters: {
      type: 'object',
      properties: {
        image_subject: { type: 'string' },
        background: { type: 'string' },
      },
      required: ['image_subject'],
    },
  },
};

class ContentGenAgent extends Agent {
  /**
   * @param {{
   *   provider: any,
   *   executors: Record<string, (args: any) => any>,
   *   runRepository?: any,
   *   guardrails?: any
   * }} opts
   */
  constructor({ provider, executors, runRepository, guardrails } = {}) {
    const tools = new ToolRegistry();
    for (const [name, def] of Object.entries(TOOL_DEFS)) {
      const exec = executors && executors[name];
      if (typeof exec !== 'function') {
        throw new Error(`ContentGenAgent: missing executor for tool '${name}'`);
      }
      tools.register(name, def.description, def.parameters, exec);
    }
    super({ provider, tools, runRepository, guardrails });
  }

  name() { return 'content-generation'; }

  systemPrompt() {
    return `You are an affiliate-marketing content director. Given a request, pick the
right content tool (banner, carousel, caption, brand_kit, ab_test, or
bg_remove) and call it with sensible defaults. Return the tool's structured
output as-is.`;
  }

  inputToUserMessage(input) {
    const intent = input.intent || 'banner';
    return `Generate ${intent} content. Use the matching tool.`;
  }

  providerOptions(_input) {
    return { ...super.providerOptions(_input), json: true };
  }

  parseFinalAnswer(response) {
    try {
      const decoded = JSON.parse(response.content);
      if (decoded && typeof decoded === 'object') return decoded;
    } catch (_) { /* fall through */ }
    return { raw: response.content };
  }
}

module.exports = { ContentGenAgent, TOOL_DEFS };
