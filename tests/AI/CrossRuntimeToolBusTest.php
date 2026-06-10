<?php

declare(strict_types=1);

namespace Tests\AI;

use OneAIAffiliate\AI\Agents\CrossRuntimeToolBus;
use OneAIAffiliate\AI\AIResponse;
use OneAIAffiliate\AI\MockAIProvider;
use OneAIAffiliate\AI\AgentGuardrails;
use OneAIAffiliate\AI\InMemoryAgentRunRepository;
use PHPUnit\Framework\TestCase;

/**
 * Cross-runtime tool bus tests.
 *
 * Verifies the wire format and dispatch behavior. The Node side
 * (server/agents/toolBus.test.js) covers the client; this covers the server.
 */
final class CrossRuntimeToolBusTest extends TestCase
{
    public function testRejectsUnsupportedProtocol(): void
    {
        $bus = new CrossRuntimeToolBus();
        $result = $bus->handle(['protocol' => '99.0.0', 'op' => 'invoke', 'agent' => 'fraud-detection', 'input' => [], 'runId' => 'r1']);
        $this->assertSame('failed', $result['status']);
        $this->assertStringContainsString('protocol', $result['error']);
    }

    public function testRejectsUnknownAgent(): void
    {
        $bus = new CrossRuntimeToolBus();
        $result = $bus->handle(['protocol' => '1.0.0', 'op' => 'invoke', 'agent' => 'phantom', 'input' => [], 'runId' => 'r1']);
        $this->assertSame('failed', $result['status']);
        $this->assertStringContainsString('Unknown agent', $result['error']);
    }

    public function testRejectsUnknownOp(): void
    {
        $bus = new CrossRuntimeToolBus();
        $result = $bus->handle(['protocol' => '1.0.0', 'op' => 'teleport', 'agent' => 'fraud-detection', 'input' => [], 'runId' => 'r1']);
        $this->assertSame('failed', $result['status']);
        $this->assertStringContainsString('op', $result['error']);
    }

    public function testSuccessfulInvokeEnvelopesResponse(): void
    {
        $provider = new MockAIProvider();
        // We don't have a getRecentConversions tool here since the in-memory
        // provider has no rows. Script a direct success path: the agent
        // will request data, but the mock returns the JSON answer.
        $provider->willRespond(new AIResponse(
            content: json_encode(['flagged' => [], 'summary' => 'no fraud', 'recommendation' => 'no_action'], JSON_THROW_ON_ERROR),
        ));

        $bus = new CrossRuntimeToolBus(provider: $provider, runRepository: new InMemoryAgentRunRepository());
        $result = $bus->handle([
            'protocol' => CrossRuntimeToolBus::PROTOCOL_VERSION,
            'op' => 'invoke',
            'agent' => 'fraud-detection',
            'input' => ['limit' => 1],
            'runId' => 'r-1234',
        ]);

        $this->assertSame('success', $result['status']);
        $this->assertSame('r-1234', $result['runId']);
        $this->assertSame(CrossRuntimeToolBus::PROTOCOL_VERSION, $result['protocol']);
        $this->assertSame('result', $result['op']);
        $this->assertIsArray($result['structured']);
        $this->assertSame('no_action', $result['structured']['recommendation']);
    }

    public function testKillSwitchBlocksInvocations(): void
    {
        $bus = new CrossRuntimeToolBus();
        $bus->setFrozen(true);
        $this->assertTrue($bus->isFrozen());
        $result = $bus->handle([
            'protocol' => CrossRuntimeToolBus::PROTOCOL_VERSION,
            'op' => 'invoke',
            'agent' => 'fraud-detection',
            'input' => [],
            'runId' => 'r-frozen',
        ]);
        $this->assertSame('failed', $result['status']);
        $this->assertStringContainsString('frozen', $result['error']);

        $bus->setFrozen(false);
        $this->assertFalse($bus->isFrozen());
    }

    public function testListAvailableReportsThreeAgents(): void
    {
        $bus = new CrossRuntimeToolBus();
        $this->assertSame(
            ['fraud-detection', 'offer-optimization', 'smartlink-generation'],
            $bus->listAvailable(),
        );
    }
}
