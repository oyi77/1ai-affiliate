<?php

declare(strict_types=1);

namespace Tests\AI;

use Api\V3\Controllers\AiInvokeController;
use OneAIAffiliate\AI\Agents\CrossRuntimeToolBus;
use PHPUnit\Framework\TestCase;

final class AiInvokeControllerTest extends TestCase
{
    public function testDispatchRawReturnsProtocolHeader(): void
    {
        $controller = new AiInvokeController();
        $result = $controller->dispatchRaw(json_encode([
            'protocol' => CrossRuntimeToolBus::PROTOCOL_VERSION,
            'op' => 'invoke',
            'agent' => 'phantom',
            'input' => [],
            'runId' => 'r1',
        ], JSON_THROW_ON_ERROR));

        $this->assertSame(400, $result['status']);
        $this->assertArrayHasKey('X-Tool-Bus-Protocol', $result['headers']);
        $this->assertSame(CrossRuntimeToolBus::PROTOCOL_VERSION, $result['headers']['X-Tool-Bus-Protocol']);

        $body = json_decode($result['body'], true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('failed', $body['status']);
    }

    public function testDispatchRawHandlesMalformedJson(): void
    {
        $controller = new AiInvokeController();
        $result = $controller->dispatchRaw('not json at all');
        $this->assertSame(400, $result['status']);
    }
}
