<?php

declare(strict_types=1);

namespace Tests\AI;

use OneAIAffiliate\AI\Agents\SmartlinkGenerationAgent;
use OneAIAffiliate\AI\Agents\InMemoryOffersProvider;
use OneAIAffiliate\AI\Agents\InMemoryClicksProvider;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\MockAIProvider;
use PHPUnit\Framework\TestCase;

final class SmartlinkGenerationAgentTest extends TestCase
{
    public function testAgentReturnsValidSmartlinkConfig(): void
    {
        $mock = new MockAIProvider([
            new AIResponse(content: json_encode([
                'rules' => [
                    ['match' => ['country' => 'ID', 'device' => 'mobile'], 'weights' => [
                        ['offer_id' => 1, 'weight' => 70],
                        ['offer_id' => 2, 'weight' => 30],
                    ]],
                ],
                'default_offer_id' => 1,
                'rationale' => 'Diversified by vertical for ID mobile traffic.',
            ])),
        ]);

        $agent = new SmartlinkGenerationAgent(
            provider: $mock,
            offers: new InMemoryOffersProvider([['id' => 1, 'name' => 'A', 'vertical' => 'Finance']]),
            clicks: new InMemoryClicksProvider(),
        );
        $response = $agent->run(['niche' => 'Finance', 'geos' => ['ID']]);

        $this->assertFalse($response->isError());
        $this->assertIsArray($response->structured);
        $this->assertSame(1, $response->structured['default_offer_id']);
        $this->assertCount(1, $response->structured['rules']);
        $this->assertCount(2, $response->structured['rules'][0]['weights']);
        $this->assertSame(100, array_sum(array_column($response->structured['rules'][0]['weights'], 'weight')));
    }
}
