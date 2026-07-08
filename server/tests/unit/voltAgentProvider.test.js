'use strict';

// Mock all AI SDK dependencies before any require
jest.mock('ai', () => ({ generateText: jest.fn() }));
jest.mock('@ai-sdk/anthropic', () => ({ anthropic: jest.fn((m) => `anthropic:${m}`) }));
jest.mock('@ai-sdk/google', () => ({ google: jest.fn((m) => `google:${m}`) }));
jest.mock('@ai-sdk/openai', () => ({ openai: jest.fn((m) => `openai:${m}`) }));

const { generateText } = require('ai');
const { createVoltAgentProvider, buildModel, runToolCall } = require('../../agents/providers/voltAgentProvider');

describe('buildModel', () => {
  test('returns openai handle', () => {
    const m = buildModel('openai', 'gpt-4o');
    expect(m).toBe('openai:gpt-4o');
  });
  test('returns anthropic handle', () => {
    expect(buildModel('anthropic', 'claude-3-5-sonnet-20241022')).toBe('anthropic:claude-3-5-sonnet-20241022');
  });
  test('returns google handle', () => {
    expect(buildModel('google', 'gemini-1.5-pro')).toBe('google:gemini-1.5-pro');
  });
  test('returns google handle for "gemini" alias', () => {
    expect(buildModel('gemini', 'gemini-2.0-flash')).toBe('google:gemini-2.0-flash');
  });
  test('throws on unknown provider', () => {
    expect(() => buildModel('unknown', 'x')).toThrow('Unknown AI provider: unknown');
  });
});

describe('runToolCall', () => {
  const tools = [
    { name: 'greet', description: 'greet', parameters: {}, handler: (args) => `Hello ${args.name}` },
    { name: 'boom', description: 'throws', parameters: {}, handler: () => { throw new Error('kaboom'); } },
  ];

  test('returns tool result for known tool', () => {
    const r = runToolCall(tools, { name: 'greet', arguments: { name: 'World' } });
    expect(r.role).toBe('tool');
    expect(r.name).toBe('greet');
    expect(r.content).toBe('Hello World');
  });

  test('returns error content for unknown tool', () => {
    const r = runToolCall(tools, { name: 'missing', arguments: {} });
    const parsed = JSON.parse(r.content);
    expect(parsed.error).toMatch(/Unknown tool/);
  });

  test('returns error content when handler throws', () => {
    const r = runToolCall(tools, { name: 'boom', arguments: {} });
    const parsed = JSON.parse(r.content);
    expect(parsed.error).toMatch(/kaboom/);
  });

  test('JSON-stringifies non-string results', () => {
    const objectTools = [{ name: 'obj', description: '', parameters: {}, handler: () => ({ x: 1 }) }];
    const r = runToolCall(objectTools, { name: 'obj', arguments: {} });
    expect(JSON.parse(r.content)).toEqual({ x: 1 });
  });

  test('handles missing arguments gracefully', () => {
    const r = runToolCall(tools, { name: 'greet' }); // no arguments field
    expect(r.content).toBe('Hello undefined');
  });
});

describe('createVoltAgentProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  test('chat returns content and token counts on success', async () => {
    generateText.mockResolvedValueOnce({
      text: 'Hello!',
      toolCalls: [],
      usage: { promptTokens: 10, completionTokens: 5 },
      response: { modelId: 'gpt-4o-mini' },
    });
    const provider = createVoltAgentProvider({ provider: 'openai', model: 'gpt-4o-mini' });
    const result = await provider.chat([{ role: 'user', content: 'hi' }]);
    expect(result.content).toBe('Hello!');
    expect(result.promptTokens).toBe(10);
    expect(result.completionTokens).toBe(5);
    expect(result.error).toBeNull();
    expect(result.toolCalls).toEqual([]);
  });

  test('chat maps toolCalls from SDK format', async () => {
    generateText.mockResolvedValueOnce({
      text: '',
      toolCalls: [{ toolName: 'greet', args: { name: 'Bob' } }],
      usage: {},
      response: {},
    });
    const provider = createVoltAgentProvider({ provider: 'openai', model: 'gpt-4o-mini' });
    const result = await provider.chat([]);
    expect(result.toolCalls).toEqual([{ name: 'greet', arguments: { name: 'Bob' } }]);
  });

  test('chat returns error on generateText rejection', async () => {
    generateText.mockRejectedValueOnce(new Error('rate limited'));
    const provider = createVoltAgentProvider({ provider: 'openai', model: 'gpt-4o-mini' });
    const result = await provider.chat([]);
    expect(result.error).toBe('rate limited');
    expect(result.content).toBe('');
  });

  test('provider defaults to openai when env not set', async () => {
    delete process.env.AI_PROVIDER;
    generateText.mockResolvedValueOnce({ text: 'ok', toolCalls: [], usage: {}, response: {} });
    const provider = createVoltAgentProvider({});
    expect(provider.name).toBe('openai');
  });

  test('provider uses AI_PROVIDER env var', async () => {
    process.env.AI_PROVIDER = 'anthropic';
    const provider = createVoltAgentProvider({});
    expect(provider.name).toBe('anthropic');
    delete process.env.AI_PROVIDER;
  });

  test('chat passes tools to generateText when provided', async () => {
    generateText.mockResolvedValueOnce({ text: 'ok', toolCalls: [], usage: {}, response: {} });
    const provider = createVoltAgentProvider({ provider: 'openai', model: 'gpt-4o-mini' });
    const toolDef = { name: 'search', description: 'search', parameters: { type: 'object', properties: {} }, handler: () => {} };
    await provider.chat([], { tools: [toolDef] });
    const sdkArgs = generateText.mock.calls[0][0];
    expect(sdkArgs.tools).toHaveProperty('search');
  });

  test('chat passes undefined tools when none given', async () => {
    generateText.mockResolvedValueOnce({ text: 'ok', toolCalls: [], usage: {}, response: {} });
    const provider = createVoltAgentProvider({ provider: 'openai', model: 'gpt-4o-mini' });
    await provider.chat([]);
    const sdkArgs = generateText.mock.calls[0][0];
    expect(sdkArgs.tools).toBeUndefined();
  });
});
