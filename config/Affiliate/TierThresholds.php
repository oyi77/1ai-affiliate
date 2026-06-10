<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

/**
 * Immutable value object mapping tier names to minimum 30-day conversion thresholds.
 *
 * Thresholds MUST be sorted ascending by value for resolveTier() to work correctly.
 */
final class TierThresholds
{
    /** @var array<string, int> tier name => min conversions */
    private readonly array $thresholds;

    /**
     * @param array<string, int> $thresholds tier name => min conversions in 30 days
     */
    public function __construct(?array $thresholds = null)
    {
        $this->thresholds = $thresholds ?? [
            'standard' => 0,
            'premium'  => 50,
            'vip'      => 200,
        ];
    }

    /**
     * Resolve the highest tier the given conversion count qualifies for.
     */
    public function resolveTier(int $conversions): string
    {
        $resolved = 'standard';
        foreach ($this->thresholds as $tier => $minConversions) {
            if ($conversions >= $minConversions) {
                $resolved = $tier;
            }
        }
        return $resolved;
    }

    /** @return array<string, int> */
    public function all(): array
    {
        return $this->thresholds;
    }
}
