<?php

declare(strict_types=1);

namespace Tests\AI;

use OneAIAffiliate\AI\Agents\FraudDetectionAgent;
use OneAIAffiliate\AI\Agents\InMemoryClicksProvider;
use OneAIAffiliate\AI\Agents\InMemoryOffersProvider;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\InMemoryAgentRunRepository;
use OneAIAffiliate\AI\MockAIProvider;
use PHPUnit\Framework\TestCase;

final class FraudDetectionAgentTest extends TestCase
{
    public function testAgentFetchesDataViaToolsThenReturnsVerdict(): void
    {
        $clicks = [
            ['click_id' => 'c1', 'offer_id' => 1, 'country' => 'ID', 'device' => 'mobile', 'ip' => '1.2.3.4', 'clicked_at' => time() - 60],
            ['click_id' => 'c2', 'offer_id' => 1, 'country' => 'ID', 'device' => 'mobile', 'ip' => '1.2.3.5', 'clicked_at' => time() - 30],
        ];
        $conversions = [
            ['click_id' => 'c1', 'offer_id' => 1, 'payout' => 5.0, 'converted_at' => time() - 30],
        ];
        $mock = new MockAIProvider();
        // Turn 1: ask for the data
        $mock->willRespond(new AIResponse(
            content: '',
            toolCalls: [['name' => 'get_recent_conversions', 'arguments' => ['limit' => 50]]],
        ));
        // Turn 2: final answer (verdict)
        $mock->willRespond(new AIResponse(
            content: json_encode([
                'flagged' => [['click_id' => 'c1', 'reason' => 'suspicious time-of-day', 'score' => 0.85]],
                'summary' => '1 conversion flagged',
                'recommendation' => 'review',
            ], JSON_THROW_ON_ERROR),
        ));

        $repo = new InMemoryAgentRunRepository();
        $agent = new FraudDetectionAgent(
            provider: $mock,
            clicks: new InMemoryClicksProvider($clicks, $conversions),
            runRepository: $repo,
        );

        $response = $agent->run(['limit' => 50, 'offer_id' => 1]);

        $this->assertFalse($response->isError());
        $this->assertIsArray($response->structured);
        $this->assertCount(1, $response->structured['flagged']);
        $this->assertSame('review', $response->structured['recommendation']);

        // 2 calls (initial + after tool)
        $this->assertCount(2, $mock->calls);
        // The system prompt enforced JSON mode
        $this->assertTrue($mock->calls[0]['options']['json'] ?? false);
    }

    public function testAgentRunIsPersisted(): void
    {
        $mock = new MockAIProvider([
            new AIResponse(content: json_encode(['flagged' => [], 'summary' => 'ok', 'recommendation' => 'no_action'])),
        ]);
        $agent = new FraudDetectionAgent(
            provider: $mock,
            clicks: new InMemoryClicksProvider(),
            runRepository: new InMemoryAgentRunRepository(),
        );

        $agent->run(['limit' => 10]);
        $runs = (new InMemoryAgentRunRepository());
        // Use a fresh repo bound to the agent above
        $repo2 = new InMemoryAgentRunRepository();
        $agent2 = new FraudDetectionAgent($mock, new InMemoryClicksProvider(), $repo2);
        $agent2->run(['limit' => 10]);
        $recent = $repo2->recent(10, 'fraud-detection');
        $this->assertCount(1, $recent);
        $this->assertSame('success', $recent[0]->status);
    }
}
