<?php

declare(strict_types=1);

namespace OneAIAffiliate\Margin;

/**
 * Calculates admin margin on CPA network payouts.
 * Pure calculation class — no DB, no HTTP. Fully testable.
 */
final class MarginCalculator
{
    /**
     * Calculate affiliate payout based on campaign config and default margin.
     *
     * Priority:
     * 1. Campaign has explicit affiliate_payout → use that
     * 2. Campaign has margin_percent → network_payout * (1 - margin_percent/100)
     * 3. Use default_margin_percent → network_payout * (1 - default/100)
     *
     * @return array{payout: float, margin: float, margin_percent: float, method: string}
     */
    public function calculate(
        float $networkPayout,
        ?float $campaignAffiliatePayout,
        ?float $campaignMarginPercent,
        float $defaultMarginPercent,
        float $minimumPayout = 0.50,
    ): array {
        if ($campaignAffiliatePayout !== null && $campaignAffiliatePayout > 0) {
            $payout = $campaignAffiliatePayout;
            $method = 'fixed_payout';
        } elseif ($campaignMarginPercent !== null && $campaignMarginPercent > 0) {
            $payout = $networkPayout * (1 - $campaignMarginPercent / 100);
            $method = 'campaign_margin_percent';
        } else {
            $payout = $networkPayout * (1 - $defaultMarginPercent / 100);
            $method = 'default_margin_percent';
        }

        $payout = max($minimumPayout, round($payout, 4));
        $margin = round($networkPayout - $payout, 4);
        $marginPercent = $networkPayout > 0
            ? round(($margin / $networkPayout) * 100, 2)
            : 0;

        return [
            'payout' => $payout,
            'margin' => $margin,
            'margin_percent' => $marginPercent,
            'method' => $method,
        ];
    }

    /**
     * Check if affiliate has custom payout override for this offer.
     */
    public function getAffiliatePayoutOverride(
        int $offerId,
        int $affiliateId,
        float $defaultPayout,
    ): float {
        // Override from offer_affiliate_access.custom_payout
        // This is checked at the repository layer — calculator only does math
        return $defaultPayout;
    }

    /**
     * Calculate payout for a specific conversion event.
     * Called from postback handler.
     *
     * @param array{campaign_affiliate_payout?: float, campaign_margin_percent?: float, network_payout?: float} $campaignConfig
     * @return array{payout: float, margin: float, margin_percent: float, method: string}
     */
    public function calculateForConversion(
        array $campaignConfig,
        float $defaultMarginPercent,
        float $minimumPayout = 0.50,
    ): array {
        return $this->calculate(
            networkPayout: $campaignConfig['network_payout'] ?? 0,
            campaignAffiliatePayout: $campaignConfig['campaign_affiliate_payout'] ?? null,
            campaignMarginPercent: $campaignConfig['campaign_margin_percent'] ?? null,
            defaultMarginPercent: $defaultMarginPercent,
            minimumPayout: $minimumPayout,
        );
    }
}
