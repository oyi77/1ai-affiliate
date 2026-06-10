<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

/**
 * In-memory implementation for tests.
 */
final class InMemoryTierUpgradeRepository implements TierUpgradeRepository
{
    /** @var array<int, string> */
    private array $tiers;

    /** @var array<int, int> */
    private readonly array $conversions;

    /**
     * @param array<int, string> $tiers affiliate_id => tier name
     * @param array<int, int>    $conversions affiliate_id => conversions in last 30 days
     */
    public function __construct(
        array $tiers = [],
        array $conversions = [],
    ) {
        $this->tiers = $tiers;
        $this->conversions = $conversions;
    }

    public function getConversionsLast30Days(int $affiliateId): int
    {
        return $this->conversions[$affiliateId] ?? 0;
    }

    public function getCurrentTier(int $affiliateId): string
    {
        return $this->tiers[$affiliateId] ?? 'standard';
    }

    public function updateTier(int $affiliateId, string $newTier): void
    {
        $this->tiers[$affiliateId] = $newTier;
    }

    /** @return list<int> */
    public function getAllAffiliateIds(): array
    {
        $ids = array_unique(array_merge(
            array_keys($this->tiers),
            array_keys($this->conversions),
        ));
        sort($ids);
        return $ids;
    }

    /** @return array<int, string> */
    public function getTiers(): array
    {
        return $this->tiers;
    }
}
