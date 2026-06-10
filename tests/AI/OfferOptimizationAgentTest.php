<?php

declare(strict_types=1);

namespace Tests\AI;

use OneAIAffiliate\AI\Agents\OfferOptimizationAgent;
use OneAIAffiliate\AI\Agents\InMemoryOffersProvider;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\MockAIProvider;
use PHPUnit\Framework\TestCase;

final class OfferOptimizationAgentTest extends TestCase
{
    public function testAgentReturnsSuggestionsAsJson(): void
    {
        $offers = [
            ['id' => 1, 'name' => 'Offer A', 'vertical' => 'Finance', 'payout' => 5.0, 'cap_daily' => 100, 'status' => 'active'],
            ['id' => 2, 'name' => 'Offer B', 'vertical' => 'E-commerce', 'payout' => 2.5, 'cap_daily' => 50, 'status' => 'paused'],
        ];
        $mock = new MockAIProvider([
            new AIResponse(
                content: json_encode([
                    'suggestions' => [
                        ['offer_id' => 1, 'action' => 'raise_cap', 'expected_uplift_pct' => 12, 'effort' => 'low', 'confidence' => 0.8, 'reasoning' => 'CVR strong, cap binding.'],
                    ],
                    'summary' => 'Offer 1 is healthy; Offer 2 should remain paused.',
                ]),
            ),
        ]);

        $agent = new OfferOptimizationAgent(
            provider: $mock,
            offers: new InMemoryOffersProvider($offers),
        );

        $response = $agent->run(['focus' => 'Finance']);

        $this->assertIsArray($response->structured);
        $this->assertCount(1, $response->structured['suggestions']);
        $this->assertSame('raise_cap', $response->structured['suggestions'][0]['action']);
    }
}
