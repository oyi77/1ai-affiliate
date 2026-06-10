<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

/**
 * Immutable result of a cap check.
 */
final class CapCheckResult
{
    /**
     * @param array<int, string> $capsHit
     */
    public function __construct(
        public readonly bool $allowed,
        public readonly string $reason,
        public readonly array $capsHit = [],
    ) {
    }
}
