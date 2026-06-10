<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

/**
 * Per-offer cap configuration loaded from 1ai_offers.
 */
final class OfferCaps
{
    public function __construct(
        public readonly int $offerId,
        public readonly ?int $capDaily,
        public readonly ?int $capMonthly,
    ) {
    }
}
