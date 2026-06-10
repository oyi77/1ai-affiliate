const { createToolBusClient, TOOL_BUS_PROTOCOL_VERSION } = require('../../agents/toolBus');

describe('tool bus client', () => {
  test('serializes a wire-format request with auth and protocol header', async () => {
    let capturedUrl, capturedInit;
    const fetchImpl = async (url, init) => {
      capturedUrl = url;
      capturedInit = init;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          protocol: TOOL_BUS_PROTOCOL_VERSION,
          op: 'result',
          runId: 'r1',
          status: 'success',
          structured: { ok: true },
          promptTokens: 1,
          completionTokens: 1,
          model: 'mock',
          durationMs: 10,
        }),
      };
    };

    const client = createToolBusClient({
      baseUrl: 'https://api.example.com/',
      token: 'secret-token',
      fetchImpl,
    });

    const result = await client.invoke('fraud-detection', { limit: 10 }, 'r1');
    expect(result.status).toBe('success');
    expect(result.structured).toEqual({ ok: true });
    expect(capturedUrl).toBe('https://api.example.com/api/ai/invoke');
    expect(capturedInit.method).toBe('POST');
    expect(capturedInit.headers['Authorization']).toBe('Bearer secret-token');
    expect(capturedInit.headers['X-Tool-Bus-Protocol']).toBe(TOOL_BUS_PROTOCOL_VERSION);
    const body = JSON.parse(capturedInit.body);
    expect(body.protocol).toBe(TOOL_BUS_PROTOCOL_VERSION);
    expect(body.op).toBe('invoke');
    expect(body.agent).toBe('fraud-detection');
    expect(body.runId).toBe('r1');
  });

  test('returns a structured error envelope on HTTP failure', async () => {
    const fetchImpl = async () => ({
      ok: false, status: 502,
      text: async () => 'bad gateway',
      json: async () => ({}),
    });
    const client = createToolBusClient({ baseUrl: 'https://api.example.com', token: 't', fetchImpl });
    const result = await client.invoke('foo', { x: 1 });
    expect(result.status).toBe('failed');
    expect(result.error).toContain('502');
    expect(result.error).toContain('bad gateway');
  });

  test('returns a structured error envelope on network failure', async () => {
    const fetchImpl = async () => { throw new Error('ECONNREFUSED'); };
    const client = createToolBusClient({ baseUrl: 'https://api.example.com', token: 't', fetchImpl });
    const result = await client.invoke('foo', { x: 1 });
    expect(result.status).toBe('failed');
    expect(result.error).toContain('ECONNREFUSED');
  });

  test('rejects missing baseUrl or token', () => {
    expect(() => createToolBusClient({ token: 't' })).toThrow(/baseUrl/);
    expect(() => createToolBusClient({ baseUrl: 'http://x' })).toThrow(/token/);
  });
});
