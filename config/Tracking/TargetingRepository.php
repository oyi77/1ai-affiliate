<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracking;

/**
 * Persistence for targeting rules.
 *
 * Production: MysqlTargetingRepository (queries 1ai_offers targeting columns).
 * Tests: InMemoryTargetingRepository.
 */
interface TargetingRepository
{
    public function loadRules(int $offerId): ?TargetingRule;
}
