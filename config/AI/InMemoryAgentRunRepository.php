<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * In-memory agent run repository for tests and local dev.
 */
final class InMemoryAgentRunRepository implements AgentRunRepositoryInterface
{
    /** @var array<string, AgentRun> */
    private array $runs = [];

    public function start(string $agentName, string $runId, array $input): void
    {
        $this->runs[$runId] = new AgentRun(
            agentName: $agentName,
            runId: $runId,
            input: $input,
            startedAt: date('c'),
        );
    }

    public function finish(string $runId, ?array $output, ?string $error, int $promptTokens, int $completionTokens, float $durationMs, string $status): void
    {
        $existing = $this->runs[$runId] ?? null;
        if ($existing === null) {
            return;
        }
        $this->runs[$runId] = new AgentRun(
            agentName: $existing->agentName,
            runId: $runId,
            input: $existing->input,
            output: $output,
            error: $error,
            promptTokens: $promptTokens,
            completionTokens: $completionTokens,
            durationMs: $durationMs,
            status: $status,
            startedAt: $existing->startedAt,
            finishedAt: date('c'),
        );
    }

    public function recent(int $limit = 50, ?string $agentName = null): array
    {
        $filtered = array_values(array_filter(
            $this->runs,
            static fn (AgentRun $r): bool => $agentName === null || $r->agentName === $agentName,
        ));
        usort($filtered, static fn (AgentRun $a, AgentRun $b) => strcmp($b->startedAt, $a->startedAt));
        return array_slice($filtered, 0, $limit);
    }

    public function findByRunId(string $runId): ?AgentRun
    {
        return $this->runs[$runId] ?? null;
    }
}
