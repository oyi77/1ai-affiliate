<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

/**
 * In-memory OffersProvider for tests.
 */
final class InMemoryOffersProvider implements OffersProviderInterface
{
    /**
     * @param array<int, array<string, mixed>> $offers
     */
    public function __construct(private readonly array $offers = [])
    {
    }

    public function listOffers(?int $limit = 50, ?string $vertical = null): array
    {
        $rows = $this->offers;
        if ($vertical !== null) {
            $rows = array_values(array_filter($rows, static fn ($r) => strcasecmp((string) ($r['vertical'] ?? ''), $vertical) === 0));
        }
        return array_slice($rows, 0, $limit);
    }

    public function offerDetails(int $offerId): ?array
    {
        foreach ($this->offers as $r) {
            if ((int) ($r['id'] ?? 0) === $offerId) {
                return $r;
            }
        }
        return null;
    }

    public function offerPerformance(int $offerId, int $windowDays = 30): array
    {
        $detail = $this->offerDetails($offerId) ?? [];
        return [
            'offer_id' => $offerId,
            'name' => $detail['name'] ?? '',
            'clicks_30d' => (int) ($detail['clicks_30d'] ?? 0),
            'conversions_30d' => (int) ($detail['conversions_30d'] ?? 0),
            'cvr_pct' => (float) ($detail['cvr_pct'] ?? 0.0),
            'epc' => (float) ($detail['epc'] ?? 0.0),
        ];
    }
}
