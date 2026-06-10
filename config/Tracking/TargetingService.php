<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracking;

/**
 * Geo / device / ISP targeting for offers.
 *
 * The service is a pure predicate: given a click's attributes it returns
 * whether the offer should be served. No side-effects, no exceptions on
 * reject — the caller decides what to do (redirect to fallback, log, etc.).
 *
 * When no targeting rules exist for an offer the click passes through
 * unconditionally. This matches the common case where most offers are
 * worldwide / all-device.
 */
final class TargetingService
{
    public function __construct(
        private readonly TargetingRepository $repository,
    ) {
    }

    /**
     * Return true when the visitor satisfies the offer's targeting rules.
     *
     * @param string      $countryCode ISO-3166-1 alpha-2, upper-case.
     * @param string      $deviceType  e.g. 'mobile', 'desktop', 'tablet'.
     * @param string|null $isp         ISP name as detected; null when unknown.
     */
    public function matches(
        int $offerId,
        string $countryCode,
        string $deviceType,
        ?string $isp = null,
    ): bool {
        $rule = $this->repository->loadRules($offerId);
        if ($rule === null) {
            // No targeting configured → pass everything through.
            return true;
        }

        $isAllowlist = $rule->mode === TargetingRule::MODE_ALLOWLIST;

        // Collect match results only for dimensions that are actually
        // configured (non-empty).  Empty filter arrays are "don't care"
        // and never participate in the decision.
        $checks = [];

        if ($rule->countryCodes !== []) {
            $checks[] = in_array(strtoupper($countryCode), $rule->countryCodes, true);
        }
        if ($rule->deviceTypes !== []) {
            $checks[] = in_array(
                strtolower($deviceType),
                array_map('strtolower', $rule->deviceTypes),
                true,
            );
        }
        if ($rule->ispPatterns !== []) {
            $checks[] = $this->ispMatchesValue($isp, $rule->ispPatterns);
        }

        // No dimensions configured at all → pass through.
        if ($checks === []) {
            return true;
        }

        if ($isAllowlist) {
            // Every configured dimension must match.
            return !in_array(false, $checks, true);
        }

        // Blocklist: reject if any configured dimension matches.
        return !in_array(true, $checks, true);
    }

    /**
     * Case-insensitive substring match of ISP name against configured patterns.
     *
     * Returns true when $isp contains any of the patterns.
     * Returns false when $isp is null (unknown ISP) but patterns are configured.
     *
     * @param list<string> $patterns
     */
    private function ispMatchesValue(?string $isp, array $patterns): bool
    {
        if ($isp === null) {
            return false;
        }

        $lowerIsp = strtolower($isp);
        foreach ($patterns as $pattern) {
            if (str_contains($lowerIsp, strtolower($pattern))) {
                return true;
            }
        }
        return false;
    }
}
