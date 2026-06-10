<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

/**
 * In-memory CapRepository for tests.
 */
final class InMemoryCapRepository implements CapRepository
{
    /**
     * @param array<int, OfferCaps> $capsById offer_id => caps
     * @param array<int, int> $countsByOffer offer_id => count of conversions in window
     */
    public function __construct(
        private readonly array $capsById = [],
        private readonly array $countsByOffer = [],
    ) {
    }

    public function loadCaps(int $offerId): ?OfferCaps
    {
        return $this->capsById[$offerId] ?? null;
    }

    public function countConversionsSince(int $offerId, int $unixTimestamp): int
    {
        return $this->countsByOffer[$offerId] ?? 0;
    }
}
