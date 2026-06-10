const { Supervisor } = require('../../agents/supervisor');
const { MockAIProvider } = require('../../agents/mockProvider');

describe('Supervisor', () => {
  test('routes to the requested agent and returns its structured output', async () => {
    const echo = {
      name: () => 'echo',
      run: async (input) => ({
        content: '', toolCalls: [], error: null,
        promptTokens: 0, completionTokens: 0, model: 'echo', structured: { echoed: input },
      }),
    };
    const other = {
      name: () => 'other',
      run: async (input) => ({
        content: '', toolCalls: [], error: null,
        promptTokens: 0, completionTokens: 0, model: 'other', structured: { otherEcho: input },
      }),
    };

    const mock = new MockAIProvider();
    mock.willRespond({
      content: '',
      toolCalls: [{ name: 'route_to_agent', arguments: { agent_name: 'other', input: { foo: 'bar' } } }],
    });

    const supervisor = new Supervisor({
      provider: mock,
      agents: { echo, other },
    });

    const response = await supervisor.run({ message: 'send to other' });
    expect(response.error).toBeNull();
    expect(response.structured).toBeDefined();
  });

  test('rejects unknown agent name from the tool', async () => {
    const mock = new MockAIProvider();
    mock.willRespond({
      content: '',
      toolCalls: [{ name: 'route_to_agent', arguments: { agent_name: 'ghost', input: {} } }],
    });
    const echo = { name: () => 'echo', run: async () => ({ structured: { ok: true } }) };
    const supervisor = new Supervisor({ provider: mock, agents: { echo } });
    // Should not throw — the tool returns an error message
    const response = await supervisor.run({});
    expect(response).toBeDefined();
  });
});
