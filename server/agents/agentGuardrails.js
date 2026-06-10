/**
 * Cost & rate guardrails for AI agents.
 *
 * Mirrors the PHP AgentGuardrails:
 *   - per-agent USD spend cap (default $5.00)
 *   - per-run call cap (default 20)
 *   - kill switch via setFrozen()
 *
 * Costs are computed at flat per-token rates. To use accurate
 * per-model pricing, plug in a CostTable.
 */
class AgentGuardrails {
  constructor({
    spendCaps = {},
    maxCallsPerRun = 20,
    costPer1kPromptTokens = 0.00015,
    costPer1kCompletionTokens = 0.0006,
  } = {}) {
    this.spend = {};
    this.spendCaps = spendCaps;
    this.maxCallsPerRun = maxCallsPerRun;
    this.costPer1kPromptTokens = costPer1kPromptTokens;
    this.costPer1kCompletionTokens = costPer1kCompletionTokens;
    this.frozen = false;
    this.currentRunCalls = {};
  }

  setFrozen(frozen) { this.frozen = !!frozen; }
  isFrozen() { return this.frozen; }

  tick(agentName) {
    if (this.frozen) {
      const err = new Error('AI spend is frozen (kill switch enabled)');
      err.code = 'AGENT_BUDGET_EXCEEDED';
      throw err;
    }
    this.currentRunCalls[agentName] = (this.currentRunCalls[agentName] || 0) + 1;
    if (this.currentRunCalls[agentName] > this.maxCallsPerRun) {
      const err = new Error(`Agent ${agentName} exceeded max calls/run (${this.maxCallsPerRun})`);
      err.code = 'AGENT_BUDGET_EXCEEDED';
      throw err;
    }
  }

  chargeTokens(agentName, promptTokens, completionTokens) {
    const cost = (promptTokens / 1000) * this.costPer1kPromptTokens
      + (completionTokens / 1000) * this.costPer1kCompletionTokens;
    this.spend[agentName] = (this.spend[agentName] || 0) + cost;
    const cap = this.spendCaps[agentName] || 5.0;
    if (this.spend[agentName] > cap) {
      const err = new Error(`Agent ${agentName} exceeded spend cap: $${this.spend[agentName].toFixed(4)} > $${cap.toFixed(4)}`);
      err.code = 'AGENT_BUDGET_EXCEEDED';
      throw err;
    }
  }

  spendReport() { return { ...this.spend }; }
}

module.exports = { AgentGuardrails };
