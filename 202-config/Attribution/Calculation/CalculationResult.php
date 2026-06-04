<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Calculation;

use OneAIAffiliate\Attribution\Snapshot;
use OneAIAffiliate\Attribution\Touchpoint;

/**
 * Aggregated output for a strategy execution.
 */
final readonly class CalculationResult
{
    /**
     * @param array<int, Snapshot>   $snapshotsByHour   Snapshots indexed by UNIX hour bucket.
     * @param array<int, Touchpoint[]> $touchpointsByHour Touchpoints (without snapshot IDs) grouped by hour bucket.
     */
    public function __construct(
        public array $snapshotsByHour,
        public array $touchpointsByHour
    ) {
    }
}
