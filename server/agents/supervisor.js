/**
 * Supervisor — routes a free-form request to the right specialized agent.
 *
 * The supervisor is a thin Agent subclass whose only tool is
 * 'route_to_agent'. It picks the most relevant sub-agent from a
 * registry, forwards the input, and returns the sub-agent's response.
 *
 * In production: fraud-detection, offer-optimization, smartlink-generation
 * on the PHP side; conversion-inspector, postback-triage, content-generation
 * on the Node side. The supervisor doesn't care which side handles the
 * request — it just calls the matching agent from its registry.
 */

const { Agent } = require('./agent');
const { ToolRegistry } = require('./toolRegistry');

class Supervisor extends Agent {
  /**
   * @param {{
   *   provider: any,
   *   agents: Record<string, {name: () => string, run: (input: any) => Promise<any>}>,
   *   runRepository?: any,
   *   guardrails?: any
   * }} opts
   */
  constructor({ provider, agents, runRepository, guardrails } = {}) {
    const tools = new ToolRegistry();
    const agentMap = agents;
    tools.register(
      'route_to_agent',
      'Route the current request to a specialized agent. Returns that agent\'s structured output.',
      {
        type: 'object',
        properties: {
          agent_name: {
            type: 'string',
            enum: Object.keys(agentMap),
          },
          input: { type: 'object' },
        },
        required: ['agent_name', 'input'],
      },
      async (args) => {
        const target = agentMap[args.agent_name];
        if (!target) {
          return { error: `Unknown agent: ${args.agent_name}` };
        }
        const result = await target.run(args.input);
        return result;
      },
    );
    super({ provider, tools, runRepository, guardrails });
    this.agents = agentMap;
  }

  name() { return 'supervisor'; }

  systemPrompt() {
    const agentList = Object.keys(this.agents).map((a) => `- ${a}`).join('\n');
    return `You are a request router for an affiliate network's AI agents. Given a user
request, call the route_to_agent tool with the right agent_name.

Available agents:
${agentList}

Pass the user's input through unchanged to the chosen agent. Return its output.`;
  }

  inputToUserMessage(input) {
    return input.message || JSON.stringify(input);
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

module.exports = { Supervisor };
