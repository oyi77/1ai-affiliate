/**
 * Base class for all 1ai-Affiliate Node agents.
 *
 * Mirrors the PHP Agent base class:
 *   1. Build messages from system prompt + user input
 *   2. Call the provider
 *   3. If response contains tool calls, run them via the registry and
 *      feed results back as additional messages
 *   4. Repeat until the final answer or MAX_ITERATIONS
 *   5. Persist a run record via the repository
 *
 * Cost guardrails (token budget, max iterations, kill switch) are
 * enforced by AgentGuardrails — the agent will throw if the budget
 * runs out mid-execution.
 */

const { AgentGuardrails } = require('./agentGuardrails');
const { InMemoryRunRepository } = require('./runRepository');

const MAX_ITERATIONS = 8;

class Agent {
  /**
   * @param {{
   *   provider: {name: string, chat: Function},
   *   tools?: {definitions: () => Array, has: (n: string) => boolean, execute: (n: string, args: any) => any, hasAny: () => boolean},
   *   runRepository?: {start, finish, recent, findByRunId},
   *   guardrails?: AgentGuardrails
   * }} opts
   */
  constructor({ provider, tools, runRepository, guardrails } = {}) {
    if (!provider || !provider.chat) {
      throw new Error('Agent requires a provider with a chat() method');
    }
    this.provider = provider;
    this.tools = tools || { definitions: () => [], has: () => false, execute: () => null, hasAny: () => false };
    this.runRepository = runRepository || new InMemoryRunRepository();
    this.guardrails = guardrails || new AgentGuardrails();
  }

  name() { throw new Error('Agent.name() must be implemented by subclass'); }
  systemPrompt() { throw new Error('Agent.systemPrompt() must be implemented by subclass'); }
  inputToUserMessage(/** @type {Record<string, any>} */ input) { throw new Error('Agent.inputToUserMessage() must be implemented by subclass'); }

  /**
   * Subclasses may override to inject tools/json mode/etc.
   * @param {Record<string, any>} _input
   * @returns {Record<string, any>}
   */
  providerOptions(_input) {
    const opts = {};
    if (this.tools.hasAny()) {
      opts.tools = this.tools.definitions();
    }
    return opts;
  }

  /**
   * Subclasses may override to enforce JSON output, etc.
   * Default: return content as string.
   * @param {{content: string, structured: any}} _response
   * @returns {string|object|null}
   */
  parseFinalAnswer(_response) {
    return null;
  }

  /**
   * @param {Record<string, any>} input
   * @returns {Promise<{content: string, toolCalls: any[], error: string|null, promptTokens: number, completionTokens: number, model: string, structured: any}>}
   */
  async run(input) {
    const runId = Math.random().toString(16).slice(2, 18);
    const startedAt = Date.now();
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let lastError = null;
    let output = null;

    this.runRepository.start(this.name(), runId, input);

    try {
      const messages = [
        { role: 'system', content: this.systemPrompt() },
        { role: 'user', content: this.inputToUserMessage(input) },
      ];

      for (let iter = 0; iter < MAX_ITERATIONS; iter += 1) {
        this.guardrails.tick(this.name());

        const response = await this.provider.chat(messages, this.providerOptions(input));
        totalPromptTokens += response.promptTokens;
        totalCompletionTokens += response.completionTokens;
        this.guardrails.chargeTokens(this.name(), response.promptTokens, response.completionTokens);

        if (response.error) {
          lastError = response.error;
          return {
            content: '',
            toolCalls: [],
            error: response.error,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            model: response.model,
            structured: null,
          };
        }

        if (!response.toolCalls || response.toolCalls.length === 0) {
          // Final answer
          const parsed = this.parseFinalAnswer(response);
          const isObj = parsed !== null && typeof parsed === 'object';
          const persisted = isObj ? parsed : (typeof parsed === 'string' ? { text: parsed } : null);
          output = persisted;
          return {
            content: isObj ? JSON.stringify(parsed) : (typeof parsed === 'string' ? parsed : response.content),
            toolCalls: [],
            error: null,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            model: response.model,
            structured: isObj ? parsed : null,
          };
        }

        messages.push({ role: 'assistant', content: response.content, toolCalls: response.toolCalls });
        for (const tc of response.toolCalls) {
          const result = this.tools.execute(tc.name, tc.arguments || {});
          messages.push({
            role: 'tool',
            name: tc.name,
            content: typeof result === 'string' ? result : JSON.stringify(result),
          });
        }
      }

      lastError = `Agent exceeded MAX_ITERATIONS (${MAX_ITERATIONS}) without a final answer`;
      return {
        content: '', toolCalls: [], error: lastError,
        promptTokens: totalPromptTokens, completionTokens: totalCompletionTokens,
        model: '', structured: null,
      };
    } catch (err) {
      lastError = err.message;
      return {
        content: '', toolCalls: [], error: lastError,
        promptTokens: totalPromptTokens, completionTokens: totalCompletionTokens,
        model: '', structured: null,
      };
    } finally {
      this.runRepository.finish(
        runId,
        output,
        lastError,
        totalPromptTokens,
        totalCompletionTokens,
        Date.now() - startedAt,
        lastError === null ? 'success' : 'failed',
      );
    }
  }
}

module.exports = { Agent, MAX_ITERATIONS };
