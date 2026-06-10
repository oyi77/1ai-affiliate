<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI;

use RuntimeException;

/**
 * Cost & rate guardrails for AI agents.
 *
 * Enforces:
 *   - per-agent spend cap (USD) — when exceeded, Agent::run throws
 *   - per-run call cap — prevents infinite tool loops even if MAX_ITERATIONS
 *     is bypassed by a custom subclass
 *   - kill switch via setFrozen() — operators can halt AI spend instantly
 *
 * The cost is computed by charging a flat rate per token. To get accurate
 * per-model pricing, plug in a CostTable at construction.
 */
final class AgentGuardrails
{
    /** @var array<string, float> agent -> spend USD */
    private array $spend = [];

    /**
     * @param array<string, float> $spendCaps Per-agent USD cap. Default: 5.00
     * @param int $maxCallsPerRun Hard cap on provider calls per agent run
     * @param float $costPer1kPromptTokens USD (default: GPT-4o-mini rate)
     * @param float $costPer1kCompletionTokens USD
     */
    public function __construct(
        private readonly array $spendCaps = [],
        private readonly int $maxCallsPerRun = 20,
        private readonly float $costPer1kPromptTokens = 0.00015,
        private readonly float $costPer1kCompletionTokens = 0.0006,
    ) {
    }

    private bool $frozen = false;

    /** @var array<string, int> agent -> call count for current run */
    private array $currentRunCalls = [];

    public function setFrozen(bool $frozen): void
    {
        $this->frozen = $frozen;
    }

    public function isFrozen(): bool
    {
        return $this->frozen;
    }

    public function tick(string $agentName): void
    {
        if ($this->frozen) {
            throw new AgentBudgetExceededException("AI spend is frozen (kill switch enabled)");
        }
        $this->currentRunCalls[$agentName] = ($this->currentRunCalls[$agentName] ?? 0) + 1;
        if ($this->currentRunCalls[$agentName] > $this->maxCallsPerRun) {
            throw new AgentBudgetExceededException("Agent {$agentName} exceeded max calls/run ({$this->maxCallsPerRun})");
        }
    }

    public function chargeTokens(string $agentName, int $promptTokens, int $completionTokens): void
    {
        $cost = ($promptTokens / 1000.0) * $this->costPer1kPromptTokens
            + ($completionTokens / 1000.0) * $this->costPer1kCompletionTokens;
        $this->spend[$agentName] = ($this->spend[$agentName] ?? 0.0) + $cost;

        $cap = $this->spendCaps[$agentName] ?? 5.0;
        if ($this->spend[$agentName] > $cap) {
            throw new AgentBudgetExceededException(sprintf(
                "Agent %s exceeded spend cap: $%.4f > $%.4f",
                $agentName,
                $this->spend[$agentName],
                $cap,
            ));
        }
    }

    /**
     * @return array<string, float>
     */
    public function spendReport(): array
    {
        return $this->spend;
    }
}
