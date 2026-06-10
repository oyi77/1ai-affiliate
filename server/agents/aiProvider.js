/**
 * Provider abstraction for the Node AI layer.
 *
 * Mirrors the PHP AIProviderInterface so cross-runtime tool calls
 * (Node agent -> PHP agent) can speak a common wire format. The
 * actual implementation is VoltAgentProvider (in providers/),
 * which wraps @voltagent/core under the hood.
 */

/**
 * @typedef {Object} AIProvider
 * @property {string} name
 * @property {(messages: AIMessage[], options?: AIChatOptions) => Promise<AIResponse>} chat
 */

/**
 * @typedef {Object} AIMessage
 * @property {'system'|'user'|'assistant'|'tool'} role
 * @property {string} content
 * @property {string} [name]  tool name, for role=tool
 * @property {Array<{name: string, arguments: Record<string, any>}>} [toolCalls]
 */

/**
 * @typedef {Object} AIChatOptions
 * @property {string} [model]
 * @property {Array<{name: string, description: string, parameters: any}>} [tools]
 * @property {boolean} [json]
 * @property {number} [maxTokens]
 * @property {number} [temperature]
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} content
 * @property {Array<{name: string, arguments: Record<string, any>}>} toolCalls
 * @property {string|null} error
 * @property {number} promptTokens
 * @property {number} completionTokens
 * @property {string} model
 * @property {Record<string, any>|null} structured
 */

/**
 * @param {Partial<AIProvider>} override
 * @returns {AIProvider}
 */
function createProvider(override = {}) {
  if (override && override.chat) {
    return {
      name: override.name || 'override',
      chat: override.chat,
    };
  }
  // Lazy-load the real provider so tests can stub it without pulling in the SDK
  const { createVoltAgentProvider } = require('./providers/voltAgentProvider');
  return createVoltAgentProvider(override.config || {});
}

module.exports = { createProvider };

/**
 * Wire format used for the cross-runtime tool bus (Node <-> PHP).
 * All fields are JSON-serializable.
 */
const TOOL_BUS_PROTOCOL_VERSION = '1.0.0';
module.exports.TOOL_BUS_PROTOCOL_VERSION = TOOL_BUS_PROTOCOL_VERSION;
