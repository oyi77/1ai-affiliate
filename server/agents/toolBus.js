/**
 * Cross-runtime tool bus.
 *
 * Lets a Node agent call into the PHP agent layer (and vice versa) over
 * HTTP, using a stable JSON protocol.
 *
 * Wire format (TOOL_BUS_PROTOCOL_VERSION = 1.0.0):
 *   Request:
 *     { protocol: "1.0.0", op: "invoke", agent: "fraud-detection",
 *       input: {...}, runId: "abc123" }
 *   Response (success):
 *     { protocol: "1.0.0", op: "result", runId, status: "success",
 *       structured: {...}, promptTokens, completionTokens, model,
 *       durationMs }
 *   Response (error):
 *     { protocol: "1.0.0", op: "result", runId, status: "failed",
 *       error: "...", durationMs }
 *
 * The PHP side exposes these at /api/ai/invoke (see api.php).
 *
 * Authentication: the same JWT used by the rest of the admin API.
 * The Node side sends Authorization: Bearer <jwt>.
 */
const { TOOL_BUS_PROTOCOL_VERSION } = require('./aiProvider');

/**
 * @param {{
 *   baseUrl: string,
 *   token: string,
 *   fetchImpl?: typeof fetch,
 *   timeoutMs?: number
 * }} opts
 */
function createToolBusClient({ baseUrl, token, fetchImpl, timeoutMs = 60_000 } = {}) {
  if (!baseUrl) throw new Error('createToolBusClient: baseUrl is required');
  if (!token) throw new Error('createToolBusClient: token is required');
  const _fetch = fetchImpl || globalThis.fetch;

  return {
    protocol: TOOL_BUS_PROTOCOL_VERSION,

    /**
     * @param {string} agent
     * @param {Record<string, any>} input
     * @param {string} [runId]
     */
    async invoke(agent, input, runId) {
      const url = `${baseUrl.replace(/\/+$/, '')}/api/ai/invoke`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await _fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tool-Bus-Protocol': TOOL_BUS_PROTOCOL_VERSION,
          },
          body: JSON.stringify({
            protocol: TOOL_BUS_PROTOCOL_VERSION,
            op: 'invoke',
            agent,
            input,
            runId: runId || `node-${Math.random().toString(16).slice(2, 12)}`,
          }),
          signal: controller.signal,
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          return {
            protocol: TOOL_BUS_PROTOCOL_VERSION,
            op: 'result',
            runId,
            status: 'failed',
            error: `HTTP ${resp.status}: ${text || '(no body)'}`,
            durationMs: 0,
          };
        }
        return await resp.json();
      } catch (err) {
        return {
          protocol: TOOL_BUS_PROTOCOL_VERSION,
          op: 'result',
          runId,
          status: 'failed',
          error: err.message || String(err),
          durationMs: 0,
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

module.exports = { createToolBusClient, TOOL_BUS_PROTOCOL_VERSION };
