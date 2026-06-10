<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

/**
 * Tool contract for fetching click/conversion data.
 * Implementations: ClicksRepository (production), InMemoryClicksProvider (tests).
 */
interface ClicksProviderInterface
{
    /**
     * @return array<int|string, mixed>
     */
    public function recentClicks(int $limit = 100, ?int $offerId = null): array;

    /**
     * @return array<int|string, mixed>
     */
    public function recentConversions(int $limit = 100, ?int $offerId = null): array;

    /**
     * @return array<string, int>
     */
    public function summary(?int $offerId = null, int $windowHours = 24): array;
}
