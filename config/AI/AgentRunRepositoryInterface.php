<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Persists AgentRun records. Implementations: MySQLAgentRunRepository
 * (production), InMemoryAgentRunRepository (tests).
 *
 * Keeping this as an interface lets the AI layer run without a database
 * during development and tests.
 */
interface AgentRunRepositoryInterface
{
    /**
     * @param array<string, mixed> $input
     */
    public function start(string $agentName, string $runId, array $input): void;

    /**
     * @param array<string, mixed> $output
     */
    public function finish(string $runId, ?array $output, ?string $error, int $promptTokens, int $completionTokens, float $durationMs, string $status): void;

    /**
     * @return array<int, AgentRun>
     */
    public function recent(int $limit = 50, ?string $agentName = null): array;

    public function findByRunId(string $runId): ?AgentRun;
}
