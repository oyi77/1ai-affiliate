<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

use InvalidArgumentException;
use RuntimeException;

/**
 * Per-offer conversion cap enforcement.
 *
 * Production affiliate networks cap each offer so a single bad campaign
 * can't drain the budget. Two cap shapes:
 *   - cap_daily  : max conversions per UTC day
 *   - cap_monthly: max conversions per UTC month
 *
 * When a postback arrives and either cap is at or above the configured
 * limit, the conversion is rejected with a clear reason. The check is
 * cheap: two SELECT COUNT(*) queries against an indexed column.
 *
 * For high-volume offers, this is the right level. For per-affiliate
 * caps (e.g. "alice can drive 50/day"), see PerAffiliateCapEnforcer.
 */
final class ConversionCapEnforcer
{
    public function __construct(
        private readonly CapRepository $repository,
    ) {
    }

    /**
     * @return CapCheckResult
     */
    public function check(int $offerId): CapCheckResult
    {
        $caps = $this->repository->loadCaps($offerId);
        if ($caps === null) {
            // No caps configured => always allow
            return new CapCheckResult(allowed: true, reason: 'no_caps_configured', capsHit: []);
        }

        $hit = [];

        if ($caps->capDaily !== null) {
            $todayCount = $this->repository->countConversionsSince($offerId, strtotime('today UTC'));
            if ($todayCount >= $caps->capDaily) {
                $hit[] = sprintf('daily(%d/%d)', $todayCount, $caps->capDaily);
            }
        }
        if ($caps->capMonthly !== null) {
            $monthStart = strtotime(date('Y-m-01 00:00:00') . ' UTC');
            $monthCount = $this->repository->countConversionsSince($offerId, $monthStart);
            if ($monthCount >= $caps->capMonthly) {
                $hit[] = sprintf('monthly(%d/%d)', $monthCount, $caps->capMonthly);
            }
        }

        if (!empty($hit)) {
            return new CapCheckResult(
                allowed: false,
                reason: 'cap_reached:' . implode(',', $hit),
                capsHit: $hit,
            );
        }
        return new CapCheckResult(allowed: true, reason: 'within_caps', capsHit: []);
    }

    /**
     * Convenience: throws when over cap, returns silently when under.
     */
    public function enforceOrThrow(int $offerId): void
    {
        $r = $this->check($offerId);
        if (!$r->allowed) {
            throw new RuntimeException("Offer {$offerId} rejected: {$r->reason}");
        }
    }
}
