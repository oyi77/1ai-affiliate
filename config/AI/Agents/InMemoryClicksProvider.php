<?php

declare(strict_types=1);

namespace OneAIAffiliate\AI\Agents;

/**
 * In-memory ClicksProvider for tests.
 */
final class InMemoryClicksProvider implements ClicksProviderInterface
{
    /**
     * @param array<int, array<string, mixed>> $clicks
     * @param array<int, array<string, mixed>> $conversions
     */
    public function __construct(
        private readonly array $clicks = [],
        private readonly array $conversions = [],
    ) {
    }

    public function recentClicks(int $limit = 100, ?int $offerId = null): array
    {
        $rows = $this->clicks;
        if ($offerId !== null) {
            $rows = array_values(array_filter($rows, static fn ($r) => (int) ($r['offer_id'] ?? 0) === $offerId));
        }
        return array_slice($rows, 0, $limit);
    }

    public function recentConversions(int $limit = 100, ?int $offerId = null): array
    {
        $rows = $this->conversions;
        if ($offerId !== null) {
            $rows = array_values(array_filter($rows, static fn ($r) => (int) ($r['offer_id'] ?? 0) === $offerId));
        }
        return array_slice($rows, 0, $limit);
    }

    public function summary(?int $offerId = null, int $windowHours = 24): array
    {
        $clicks = $this->recentClicks(10000, $offerId);
        $conversions = $this->recentConversions(10000, $offerId);
        $cutoff = time() - $windowHours * 3600;
        $clicksW = array_filter($clicks, static fn ($r) => (int) ($r['clicked_at'] ?? 0) >= $cutoff);
        $convsW = array_filter($conversions, static fn ($r) => (int) ($r['converted_at'] ?? 0) >= $cutoff);
        $nClicks = count($clicksW);
        $nConvs = count($convsW);
        $cvr = $nClicks > 0 ? ($nConvs / $nClicks) * 100.0 : 0.0;
        return [
            "clicks_{$windowHours}h" => $nClicks,
            "conversions_{$windowHours}h" => $nConvs,
            'cvr_pct' => round($cvr, 2),
        ];
    }
}
