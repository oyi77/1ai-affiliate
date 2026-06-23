/**
 * VoltAgent-backed provider for the Node AI layer.
 *
 * Wraps @voltagent/core so the rest of the agent framework can speak a
 * provider-neutral interface. Same shape as the PHP side's
 * AIProviderInterface — that's what enables the cross-runtime tool bus.
 */
const { generateText } = require('ai');
const { anthropic } = require('@ai-sdk/anthropic');
const { google } = require('@ai-sdk/google');
const { openai } = require('@ai-sdk/openai');
const { generateText } = require('ai');

/**
 * Build the Vercel AI SDK model handle for the configured provider.
 *
 * @param {string} providerName
 * @param {string} model
 */
function buildModel(providerName, model) {
  switch (providerName) {
    case 'openai':
      return openai(model);
    case 'anthropic':
      return anthropic(model);
    case 'google':
    case 'gemini':
      return google(model);
    default:
      throw new Error(`Unknown AI provider: ${providerName}`);
  }
}

/**
 * Translate a tool-call message in our wire format to one the SDK understands,
 * execute the tool, and return the tool-result message in wire format.
 *
 * @param {Array<{name: string, description: string, parameters: any, handler: Function}>} toolDefs
 * @param {{name: string, arguments: any}} toolCall
 */
function runToolCall(toolDefs, toolCall) {
  const def = toolDefs.find((t) => t.name === toolCall.name);
  if (!def) {
    return { role: 'tool', name: toolCall.name, content: JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }) };
  }
  try {
    const result = def.handler(toolCall.arguments || {});
    return {
      role: 'tool',
      name: toolCall.name,
      content: typeof result === 'string' ? result : JSON.stringify(result),
    };
  } catch (err) {
    return {
      role: 'tool',
      name: toolCall.name,
      content: JSON.stringify({ error: `Tool ${toolCall.name} failed: ${err.message}` }),
    };
  }
}

/**
 * @param {Record<string, any>} config
 * @returns {{name: string, chat: (messages: any[], options?: any) => Promise<any>}}
 */
function createVoltAgentProvider(config = {}) {
  const providerName = (config.provider || process.env.AI_PROVIDER || 'openai').toLowerCase();
  const modelName = config.model
    || (providerName === 'anthropic' ? 'claude-3-5-sonnet-20241022'
      : providerName === 'google' ? 'gemini-1.5-pro'
        : 'gpt-4o-mini');

  const model = buildModel(providerName, modelName);

  return {
    name: providerName,
    async chat(messages, options = {}) {
      try {
        // Convert tool definitions to Vercel AI SDK format directly
        const sdkTools = {};
        for (const t of (options.tools || [])) {
          sdkTools[t.name] = {
            description: t.description,
            parameters: t.parameters,
            execute: async (args) => args,
          };
        }

        const result = await generateText({
          model,
          messages,
          tools: Object.keys(sdkTools).length ? sdkTools : undefined,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        });


        const toolCalls = (result.toolCalls || []).map((tc) => ({
          name: tc.toolName || tc.name,
          arguments: tc.args || tc.input || {},
        }));

        return {
          content: result.text || '',
          toolCalls,
          error: null,
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          model: result.response?.modelId || modelName,
          structured: null,
        };
      } catch (err) {
        return {
          content: '',
          toolCalls: [],
          error: err.message || String(err),
          promptTokens: 0,
          completionTokens: 0,
          model: modelName,
          structured: null,
        };
      }
    },
  };
}

module.exports = { createVoltAgentProvider, buildModel, runToolCall };
