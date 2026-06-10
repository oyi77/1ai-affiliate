<?php

declare(strict_types=1);

/**
 * /api/ai/invoke — cross-runtime tool bus endpoint.
 *
 * Receives a wire-format request from the Node side (or any other
 * caller) and dispatches to the named agent. Wire format is defined
 * in OneAIAffiliate\AI\Agents\CrossRuntimeToolBus.
 *
 * Auth: same JWT bearer used by the rest of the admin API.
 *
 * Mount: route this in api/v2/app.php or api/v3/index.php.
 *   $app->post('/api/ai/invoke', function ($req, $res) {
 *       (new AiInvokeController())->dispatch($req, $res);
 *   });
 */

namespace Api\V3\Controllers;

use OneAIAffiliate\AI\Agents\CrossRuntimeToolBus;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class AiInvokeController
{
    private CrossRuntimeToolBus $bus;

    public function __construct(?CrossRuntimeToolBus $bus = null)
    {
        $this->bus = $bus ?? new CrossRuntimeToolBus();
    }

    /**
     * Slim/PSR-7 style dispatch.
     */
    public function dispatch(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $raw = (string) $request->getBody();
        $payload = json_decode($raw, true);
        if (!is_array($payload)) {
            $payload = [];
        }

        $result = $this->bus->handle($payload);

        $status = ($result['status'] ?? 'failed') === 'success' ? 200 : 400;
        $body = json_encode($result, JSON_THROW_ON_ERROR);

        $response->getBody()->write($body);
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withHeader('X-Tool-Bus-Protocol', (string) CrossRuntimeToolBus::PROTOCOL_VERSION)
            ->withStatus($status);
    }

    /**
     * Plain-PHP dispatch helper (no framework).
     *
     * @return array{status: int, headers: array<string, string>, body: string}
     */
    public function dispatchRaw(string $jsonBody): array
    {
        $payload = json_decode($jsonBody, true);
        if (!is_array($payload)) {
            $payload = [];
        }
        $result = $this->bus->handle($payload);
        $status = ($result['status'] ?? 'failed') === 'success' ? 200 : 400;
        return [
            'status' => $status,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Tool-Bus-Protocol' => (string) CrossRuntimeToolBus::PROTOCOL_VERSION,
            ],
            'body' => (string) json_encode($result, JSON_THROW_ON_ERROR),
        ];
    }

    public function bus(): CrossRuntimeToolBus
    {
        return $this->bus;
    }
}
