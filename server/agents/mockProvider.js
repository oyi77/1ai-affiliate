/**
 * Mock AI provider for tests and local dev.
 *
 * - If a `script` is provided, returns scripted responses in order (FIFO).
 * - Otherwise echoes the last user message back.
 *
 * Records every call so tests can assert on the prompts agents constructed.
 */
class MockAIProvider {
  /**
   * @param {Array<{content?: string, toolCalls?: any[], error?: string, promptTokens?: number, completionTokens?: number, model?: string}>} [script]
   */
  constructor(script = []) {
    this.scripted = script;
    this.calls = [];
    this.scriptIndex = 0;
    this.name = 'mock';
  }

  /**
   * @param {Array} messages
   * @param {Object} [options]
   */
  async chat(messages, options = {}) {
    this.calls.push({ messages, options });
    if (this.scriptIndex < this.scripted.length) {
      const resp = this.scripted[this.scriptIndex];
      this.scriptIndex += 1;
      return {
        content: resp.content || '',
        toolCalls: resp.toolCalls || [],
        error: resp.error || null,
        promptTokens: resp.promptTokens || 0,
        completionTokens: resp.completionTokens || 0,
        model: resp.model || 'mock',
        structured: resp.structured || null,
      };
    }
    // Default: echo
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return {
      content: options.json ? JSON.stringify({ echo: lastUser?.content || '' }) : `echo: ${lastUser?.content || ''}`,
      toolCalls: [],
      error: null,
      promptTokens: 0,
      completionTokens: 0,
      model: 'mock',
      structured: null,
    };
  }

  /**
   * Convenience: pre-script a single response.
   * @param {{content?: string, toolCalls?: any[]}} response
   */
  willRespond(response) {
    this.scripted.push(response);
  }
}

module.exports = { MockAIProvider };
