/**
 * Tests for the Node AI agent framework.
 *
 * Mirrors tests/AI/AgentTest.php on the PHP side: exercises the standard
 * agent loop, error handling, max iterations, and budget guardrails
 * without any LLM — the MockAIProvider scripts responses.
 */
const { Agent } = require('../../agents/agent');
const { MockAIProvider } = require('../../agents/mockProvider');
const { ToolRegistry } = require('../../agents/toolRegistry');
const { AgentGuardrails } = require('../../agents/agentGuardrails');
const { InMemoryRunRepository } = require('../../agents/runRepository');

class TestAgent extends Agent {
  name() { return 'test-agent'; }
  systemPrompt() { return 'You are a test agent.'; }
  inputToUserMessage() { return 'go'; }
}

describe('Agent base class', () => {
  test('returns final answer after a tool call and persists the run', async () => {
    const tools = new ToolRegistry();
    tools.register(
      'ping',
      'returns pong',
      { type: 'object', properties: {}, required: [] },
      () => 'pong',
    );

    const mock = new MockAIProvider();
    mock.willRespond({
      content: '',
      toolCalls: [{ name: 'ping', arguments: {} }],
    });
    mock.willRespond({
      content: 'finished',
      promptTokens: 10,
      completionTokens: 5,
    });

    const repo = new InMemoryRunRepository();
    const agent = new TestAgent({ provider: mock, tools, runRepository: repo });

    const response = await agent.run({ foo: 'bar' });
    expect(response.error).toBeNull();
    expect(response.content).toBe('finished');
    expect(response.promptTokens + response.completionTokens).toBe(15);
    expect(mock.calls).toHaveLength(2);

    const lastCall = mock.calls[1];
    const toolMessage = lastCall.messages[lastCall.messages.length - 1];
    expect(toolMessage.role).toBe('tool');
    expect(toolMessage.name).toBe('ping');
    expect(toolMessage.content).toBe('pong');

    const runs = repo.recent(10, 'test-agent');
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe('success');
    expect(runs[0].finishedAt).not.toBeNull();
  });

  test('surfaces provider errors as run failures', async () => {
    const mock = new MockAIProvider([{ error: 'rate limit exceeded' }]);
    const agent = new TestAgent({ provider: mock });
    const response = await agent.run({});
    expect(response.error).toContain('rate limit');
  });

  test('exits the loop at MAX_ITERATIONS', async () => {
    const tools = new ToolRegistry();
    tools.register('loop', 'always ok', { type: 'object' }, () => 'ok');
    // Provider that always returns a tool call
    const provider = {
      name: 'stub',
      async chat() {
        return {
          content: '',
          toolCalls: [{ name: 'loop', arguments: {} }],
          error: null,
          promptTokens: 0,
          completionTokens: 0,
          model: 'stub',
          structured: null,
        };
      },
    };
    const agent = new TestAgent({ provider, tools });
    const response = await agent.run({});
    expect(response.error).toContain('MAX_ITERATIONS');
  });

  test('throws when the budget is exceeded', async () => {
    const tools = new ToolRegistry();
    tools.register('noop', 'noop', { type: 'object' }, () => 'ok');
    const provider = {
      name: 'stub',
      async chat() {
        return { content: 'done', toolCalls: [], error: null, promptTokens: 1000, completionTokens: 1000, model: 'stub', structured: null };
      },
    };
    const guardrails = new AgentGuardrails({ spendCaps: { 'test-agent': 0.0001 } });
    const agent = new TestAgent({ provider, tools, guardrails });
    const response = await agent.run({});
    expect(response.error).toContain('spend cap');
  });
});
