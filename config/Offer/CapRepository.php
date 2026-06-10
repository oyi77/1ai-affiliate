<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

use mysqli;

/**
 * Persistence for cap configuration and per-window conversion counts.
 *
 * Production: MysqlCapRepository (queries 1ai_offers + 1ai_conversion_logs).
 * Tests: InMemoryCapRepository.
 */
interface CapRepository
{
    public function loadCaps(int $offerId): ?OfferCaps;

    public function countConversionsSince(int $offerId, int $unixTimestamp): int;
}
