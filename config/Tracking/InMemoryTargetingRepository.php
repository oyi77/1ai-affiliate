<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracking;

/**
 * In-memory TargetingRepository for tests.
 */
final class InMemoryTargetingRepository implements TargetingRepository
{
    /**
     * @param array<int, TargetingRule> $rulesByOfferId
     */
    public function __construct(
        private readonly array $rulesByOfferId = [],
    ) {
    }

    public function loadRules(int $offerId): ?TargetingRule
    {
        return $this->rulesByOfferId[$offerId] ?? null;
    }
}
