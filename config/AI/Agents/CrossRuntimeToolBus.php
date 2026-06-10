<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

use OneAIAffiliate\AI\AIProviderFactory;
use OneAIAffiliate\AI\AIProviderInterface;
use OneAIAffiliate\AI\AgentGuardrails;
use OneAIAffiliate\AI\AgentRunRepositoryInterface;
use OneAIAffiliate\AI\InMemoryAgentRunRepository;
use OneAIAffiliate\AI\MockAIProvider;
use OneAIAffiliate\AI\ToolRegistry;
use OneAIAffiliate\AI\Agent;
use OneAIAffiliate\AI\AIResponse;
use RuntimeException;

/**
 * Cross-runtime tool bus: builds and dispatches to the named agent.
 *
 * Used by the /api/ai/invoke endpoint and any other cross-runtime caller.
 * The Node side (server/agents/toolBus.js) speaks the same wire format.
 *
 * Wire format (TOOL_BUS_PROTOCOL_VERSION = 1.0.0):
 *   Request:
 *     { protocol: "1.0.0", op: "invoke", agent: "fraud-detection",
 *       input: {...}, runId: "abc123" }
 *   Response (success):
 *     { protocol: "1.0.0", op: "result", runId, status: "success",
 *       structured: {...}, promptTokens, completionTokens, model,
 *       durationMs }
 *   Response (error):
 *     { protocol: "1.0.0", op: "result", runId, status: "failed",
 *       error: "...", durationMs }
 */
final class CrossRuntimeToolBus
{
    public const PROTOCOL_VERSION = '1.0.0';

    /** @var array<string, Agent> */
    private array $agents = [];

    private AIProviderInterface $provider;
    private AgentRunRepositoryInterface $runRepository;
    private AgentGuardrails $guardrails;

    public function __construct(?AIProviderInterface $provider = null, ?AgentRunRepositoryInterface $runRepository = null, ?AgentGuardrails $guardrails = null)
    {
        $this->provider = $provider ?? AIProviderFactory::create();
        $this->runRepository = $runRepository ?? new InMemoryAgentRunRepository();
        $this->guardrails = $guardrails ?? new AgentGuardrails();

        // Lazy registration — only construct agents on first call to keep
        // cold-start cost minimal in production where most pages never
        // touch AI.
    }

    /**
     * @return Agent
     */
    public function get(string $name): Agent
    {
        if (isset($this->agents[$name])) {
            return $this->agents[$name];
        }
        $agent = $this->build($name);
        $this->agents[$name] = $agent;
        return $agent;
    }

    public function has(string $name): bool
    {
        return in_array($name, ['fraud-detection', 'offer-optimization', 'smartlink-generation'], true);
    }

    /**
     * @return array<int, string>
     */
    public function listAvailable(): array
    {
        return ['fraud-detection', 'offer-optimization', 'smartlink-generation'];
    }

    /**
     * @param array<string, mixed> $request
     * @return array<string, mixed>
     */
    public function handle(array $request): array
    {
        $protocol = (string) ($request['protocol'] ?? '');
        if ($protocol !== self::PROTOCOL_VERSION) {
            return $this->error($request, "Unsupported protocol: {$protocol}", 0.0);
        }
        $op = (string) ($request['op'] ?? '');
        if ($op !== 'invoke') {
            return $this->error($request, "Unsupported op: {$op}", 0.0);
        }
        $agentName = (string) ($request['agent'] ?? '');
        $input = (array) ($request['input'] ?? []);
        $runId = (string) ($request['runId'] ?? '');

        if (!$this->has($agentName)) {
            return $this->error(['runId' => $runId], "Unknown agent: {$agentName}", 0.0);
        }

        if ($this->guardrails->isFrozen()) {
            return $this->error(['runId' => $runId], 'AI spend is frozen (kill switch enabled)', 0.0);
        }

        try {
            $agent = $this->get($agentName);
            $startedAt = microtime(true);
            $response = $agent->run($input);
            $durationMs = (microtime(true) - $startedAt) * 1000.0;
            return $this->success($runId, $response, $durationMs);
        } catch (\Throwable $e) {
            return $this->error(['runId' => $runId], $e->getMessage(), 0.0);
        }
    }

    public function isFrozen(): bool
    {
        return $this->guardrails->isFrozen();
    }

    public function setFrozen(bool $frozen): void
    {
        $this->guardrails->setFrozen($frozen);
    }

    public function spend(): array
    {
        return $this->guardrails->spendReport();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentRuns(int $limit = 50, ?string $agentName = null): array
    {
        return array_map(
            static fn ($r) => $r->toArray(),
            $this->runRepository->recent($limit, $agentName),
        );
    }

    public function findRun(string $runId): ?array
    {
        $r = $this->runRepository->findByRunId($runId);
        return $r?->toArray();
    }

    private function build(string $name): Agent
    {
        switch ($name) {
            case 'fraud-detection':
                return new FraudDetectionAgent(
                    provider: $this->provider,
                    clicks: new \OneAIAffiliate\AI\Agents\InMemoryClicksProvider(),
                    runRepository: $this->runRepository,
                    guardrails: $this->guardrails,
                );
            case 'offer-optimization':
                return new OfferOptimizationAgent(
                    provider: $this->provider,
                    offers: new \OneAIAffiliate\AI\Agents\InMemoryOffersProvider(),
                    runRepository: $this->runRepository,
                    guardrails: $this->guardrails,
                );
            case 'smartlink-generation':
                return new SmartlinkGenerationAgent(
                    provider: $this->provider,
                    offers: new \OneAIAffiliate\AI\Agents\InMemoryOffersProvider(),
                    clicks: new \OneAIAffiliate\AI\Agents\InMemoryClicksProvider(),
                    runRepository: $this->runRepository,
                    guardrails: $this->guardrails,
                );
            default:
                throw new RuntimeException("Cannot build unknown agent: {$name}");
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function success(string $runId, AIResponse $response, float $durationMs): array
    {
        return [
            'protocol' => self::PROTOCOL_VERSION,
            'op' => 'result',
            'runId' => $runId,
            'status' => $response->isError() ? 'failed' : 'success',
            'error' => $response->error,
            'structured' => $response->structured,
            'content' => $response->content,
            'promptTokens' => $response->promptTokens,
            'completionTokens' => $response->completionTokens,
            'model' => $response->model,
            'durationMs' => $durationMs,
        ];
    }

    /**
     * @param array<string, mixed> $request
     * @return array<string, mixed>
     */
    private function error(array $request, string $message, float $durationMs): array
    {
        return [
            'protocol' => self::PROTOCOL_VERSION,
            'op' => 'result',
            'runId' => (string) ($request['runId'] ?? ''),
            'status' => 'failed',
            'error' => $message,
            'durationMs' => $durationMs,
            'structured' => null,
            'content' => '',
            'promptTokens' => 0,
            'completionTokens' => 0,
            'model' => '',
        ];
    }
}
