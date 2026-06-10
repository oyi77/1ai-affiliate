<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

/**
 * Evaluates affiliate tier based on 30-day conversion count.
 * Upgrades only — never downgrades.
 */
final class TierUpgradeService
{
    private readonly TierThresholds $thresholds;

    public function __construct(
        private readonly TierUpgradeRepository $repo,
        ?TierThresholds $thresholds = null,
    ) {
        $this->thresholds = $thresholds ?? new TierThresholds();
    }

    /**
     * @return array{current_tier: string, new_tier: string, conversions_30d: int, upgraded: bool}
     */
    public function evaluate(int $affiliateId): array
    {
        $currentTier = $this->repo->getCurrentTier($affiliateId);
        $conversions = $this->repo->getConversionsLast30Days($affiliateId);
        $eligibleTier = $this->thresholds->resolveTier($conversions);

        $tierOrder = array_keys($this->thresholds->all());
        $currentIndex = array_search($currentTier, $tierOrder, true);
        $eligibleIndex = array_search($eligibleTier, $tierOrder, true);

        $upgraded = false;
        $newTier = $currentTier;

        if ($eligibleIndex !== false && $currentIndex !== false && $eligibleIndex > $currentIndex) {
            $newTier = $eligibleTier;
            $this->repo->updateTier($affiliateId, $newTier);
            $upgraded = true;
        }

        return [
            'current_tier'    => $currentTier,
            'new_tier'        => $newTier,
            'conversions_30d' => $conversions,
            'upgraded'        => $upgraded,
        ];
    }

    /** @return list<array{affiliate_id: int, current_tier: string, new_tier: string, conversions_30d: int, upgraded: bool}> */
    public function runBatch(): array
    {
        $results = [];
        foreach ($this->repo->getAllAffiliateIds() as $affiliateId) {
            $result = $this->evaluate($affiliateId);
            $results[] = ['affiliate_id' => $affiliateId] + $result;
        }
        return $results;
    }
}
