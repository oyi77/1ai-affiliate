<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracking;

/**
 * Per-offer targeting configuration.
 *
 * In allowlist mode, a visitor must match every non-empty filter to be served.
 * In blocklist mode, a visitor is rejected when any non-empty filter matches.
 * Empty filter arrays are treated as "don't care" in either mode.
 */
final class TargetingRule
{
    public const MODE_ALLOWLIST = 'allowlist';
    public const MODE_BLOCKLIST = 'blocklist';

    /**
     * @param list<string> $countryCodes  ISO-3166-1 alpha-2 codes, upper-case.
     * @param list<string> $deviceTypes   e.g. ['mobile', 'desktop', 'tablet'].
     * @param list<string> $ispPatterns   Substring patterns matched case-insensitively.
     * @param string       $mode          One of MODE_ALLOWLIST or MODE_BLOCKLIST.
     */
    public function __construct(
        public readonly array $countryCodes,
        public readonly array $deviceTypes,
        public readonly array $ispPatterns,
        public readonly string $mode = self::MODE_ALLOWLIST,
    ) {
    }
}
