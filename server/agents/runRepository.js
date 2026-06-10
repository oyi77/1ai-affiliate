/**
 * Run persistence for AI agents.
 *
 * In-memory by default; production swaps in a MySQL-backed impl.
 * Matches the PHP AgentRunRepositoryInterface shape so cross-runtime
 * tool calls can stream the same data.
 */

class InMemoryRunRepository {
  constructor() {
    /** @type {Record<string, {agentName: string, runId: string, input: any, output: any, error: string|null, promptTokens: number, completionTokens: number, durationMs: number, status: string, startedAt: string, finishedAt: string|null}>} */
    this.runs = {};
  }

  /**
   * @param {string} agentName
   * @param {string} runId
   * @param {Record<string, any>} input
   */
  start(agentName, runId, input) {
    this.runs[runId] = {
      agentName, runId, input,
      output: null, error: null,
      promptTokens: 0, completionTokens: 0, durationMs: 0,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
  }

  /**
   * @param {string} runId
   * @param {Record<string, any>|null} output
   * @param {string|null} error
   * @param {number} promptTokens
   * @param {number} completionTokens
   * @param {number} durationMs
   * @param {string} status
   */
  finish(runId, output, error, promptTokens, completionTokens, durationMs, status) {
    const existing = this.runs[runId];
    if (!existing) return;
    this.runs[runId] = {
      ...existing,
      output, error,
      promptTokens, completionTokens, durationMs, status,
      finishedAt: new Date().toISOString(),
    };
  }

  /**
   * @param {number} limit
   * @param {string|null} agentName
   */
  recent(limit = 50, agentName = null) {
    const filtered = Object.values(this.runs)
      .filter((r) => !agentName || r.agentName === agentName)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
    return filtered.slice(0, limit);
  }

  /**
   * @param {string} runId
   */
  findByRunId(runId) {
    return this.runs[runId] || null;
  }
}

module.exports = { InMemoryRunRepository };
