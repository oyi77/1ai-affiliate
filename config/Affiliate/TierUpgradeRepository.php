<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

/**
 * Persistence contract for tier upgrade evaluation.
 */
interface TierUpgradeRepository
{
    public function getConversionsLast30Days(int $affiliateId): int;

    public function getCurrentTier(int $affiliateId): string;

    public function updateTier(int $affiliateId, string $newTier): void;

    /** @return list<int> */
    public function getAllAffiliateIds(): array;
}
