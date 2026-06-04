<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Calculation;

/**
 * Describes an individual touch within a conversion journey.
 */
final readonly class ConversionTouchpoint
{
    public function __construct(
        public int $clickId,
        public int $clickTime
    ) {
    }
}
