<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

/**
 * Tool contract for offer history.
 * Implementations: OffersRepository (production), InMemoryOffersProvider (tests).
 */
interface OffersProviderInterface
{
    /**
     * @return array<int|string, mixed>
     */
    public function listOffers(?int $limit = 50, ?string $vertical = null): array;

    /**
     * @return array<string, mixed>|null
     */
    public function offerDetails(int $offerId): ?array;

    /**
     * @return array<string, mixed>
     */
    public function offerPerformance(int $offerId, int $windowDays = 30): array;
}
