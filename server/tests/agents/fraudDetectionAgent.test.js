const { FraudDetectionAgent } = require('../../agents/fraudDetectionAgent');
const { MockAIProvider } = require('../../agents/mockProvider');
const { InMemoryClicksProvider } = require('../../agents/clicksProvider');
const { InMemoryRunRepository } = require('../../agents/runRepository');

describe('FraudDetectionAgent (Node)', () => {
  test('fetches data via tools then returns verdict', async () => {
    const clicks = [
      { click_id: 'c1', offer_id: 1, country: 'ID', device: 'mobile', ip: '1.2.3.4', clicked_at: Math.floor(Date.now() / 1000) - 60 },
      { click_id: 'c2', offer_id: 1, country: 'ID', device: 'mobile', ip: '1.2.3.5', clicked_at: Math.floor(Date.now() / 1000) - 30 },
    ];
    const conversions = [
      { click_id: 'c1', offer_id: 1, payout: 5.0, converted_at: Math.floor(Date.now() / 1000) - 30 },
    ];
    const mock = new MockAIProvider();
    mock.willRespond({ content: '', toolCalls: [{ name: 'get_recent_conversions', arguments: { limit: 50 } }] });
    mock.willRespond({
      content: JSON.stringify({
        flagged: [{ click_id: 'c1', reason: 'suspicious time-of-day', score: 0.85 }],
        summary: '1 conversion flagged',
        recommendation: 'review',
      }),
    });

    const repo = new InMemoryRunRepository();
    const agent = new FraudDetectionAgent({
      provider: mock,
      clicksProvider: new InMemoryClicksProvider({ clicks, conversions }),
      runRepository: repo,
    });
    const response = await agent.run({ limit: 50, offer_id: 1 });
    expect(response.error).toBeNull();
    expect(response.structured.flagged).toHaveLength(1);
    expect(response.structured.recommendation).toBe('review');
    expect(mock.calls).toHaveLength(2);
  });
});
