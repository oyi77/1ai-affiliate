<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

/**
 * Persistent log of every agent run — input, output, cost, status.
 *
 * Kept as a thin DTO here; the actual DB row is created by AgentRunner
 * via a repository injected at construction. We don't tie the agent
 * framework to MySQL directly so tests can use an in-memory recorder.
 */
final class AgentRun
{
    /**
     * @param array<string, mixed> $input
     * @param array<string, mixed>|null $output
     */
    public function __construct(
        public readonly string $agentName,
        public readonly string $runId,
        public readonly array $input,
        public readonly ?array $output = null,
        public readonly ?string $error = null,
        public readonly int $promptTokens = 0,
        public readonly int $completionTokens = 0,
        public readonly float $durationMs = 0.0,
        public readonly string $status = 'success',
        public readonly string $startedAt = '',
        public readonly ?string $finishedAt = null,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'agent' => $this->agentName,
            'run_id' => $this->runId,
            'input' => $this->input,
            'output' => $this->output,
            'error' => $this->error,
            'prompt_tokens' => $this->promptTokens,
            'completion_tokens' => $this->completionTokens,
            'duration_ms' => $this->durationMs,
            'status' => $this->status,
            'started_at' => $this->startedAt,
            'finished_at' => $this->finishedAt,
        ];
    }
}
