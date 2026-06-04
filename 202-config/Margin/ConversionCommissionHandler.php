<?php

declare(strict_types=1);

namespace OneAIAffiliate\Margin;

use OneAIAffiliate\Affiliate\AffiliateLinkService;
use OneAIAffiliate\Database\Connection;

/**
 * Hooks into the conversion postback pipeline to allocate affiliate earnings.
 * Called from static/pb.php after p202ApplyConversionUpdate.
 */
final class ConversionCommissionHandler
{
    public function __construct(
        private readonly Connection $conn,
        private readonly MarginCalculator $calculator,
        private readonly MarginConfig $marginConfig,
        private readonly AffiliateLinkService $linkService,
    ) {
    }

    /**
     * Process commission for a conversion. Called after conversion is recorded.
     *
     * @return array|null Commission record or null if no affiliate was involved
     */
    public function handle(int $conversionId, int $userId): ?array
    {
        // Find the conversion details
        $stmt = $this->conn->prepareRead(
            'SELECT cl.*, ac.affiliate_payout, ac.margin_percent, ac.network_payout
             FROM 202_conversion_logs cl
             LEFT JOIN 202_aff_campaigns ac ON cl.campaign_id = ac.aff_campaign_id
             WHERE cl.conv_id = ? AND cl.user_id = ?'
        );
        $this->conn->bind($stmt, 'ii', [$conversionId, $userId]);
        $conversion = $this->conn->fetchOne($stmt);

        if (!$conversion) {
            return null;
        }

        // Check if click came from an affiliate
        $clickId = (int) ($conversion['click_id'] ?? 0);
        $session = $this->linkService->findSessionByClickId($clickId);

        if (!$session) {
            // Organic click — no affiliate commission
            return null;
        }

        $affiliateId = (int) ($session['affiliate_id'] ?? $session['id'] ?? 0);
        if (!$affiliateId) {
            return null;
        }

        // Calculate payout
        $marginCfg = $this->marginConfig->get($userId);
        $payout = $this->calculator->calculateForConversion(
            campaignConfig: [
                'campaign_affiliate_payout' => isset($conversion['affiliate_payout']) ? (float) $conversion['affiliate_payout'] : null,
                'campaign_margin_percent' => isset($conversion['margin_percent']) ? (float) $conversion['margin_percent'] : null,
                'network_payout' => isset($conversion['network_payout']) ? (float) $conversion['network_payout'] : (float) ($conversion['click_payout'] ?? 0),
            ],
            defaultMarginPercent: $marginCfg['default_margin_percent'],
            minimumPayout: $marginCfg['minimum_payout'],
        );

        // Check for affiliate-specific payout override
        $customPayout = $this->getAffiliateCustomPayout(
            affiliateId: $affiliateId,
            campaignId: (int) ($conversion['campaign_id'] ?? 0),
        );
        if ($customPayout !== null) {
            $payout['payout'] = $customPayout;
            $payout['margin'] = round($payout['payout'] + $payout['margin'] - $customPayout, 4);
            $payout['method'] = 'affiliate_custom';
        }

        // Determine auto-approval
        $autoApprove = $payout['payout'] <= $marginCfg['auto_approve_threshold'];
        $status = $autoApprove ? 'approved' : 'pending';
        $now = time();

        // Record the earning
        $stmt = $this->conn->prepare(
            'INSERT INTO affiliate_earnings
             (affiliate_id, conversion_id, payout_amount, admin_amount, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $this->conn->bind($stmt, 'iiddsi', [
            $affiliateId,
            $conversionId,
            $payout['payout'],
            $payout['margin'],
            $status,
            $now,
        ]);
        $earningId = $this->conn->executeInsert($stmt);

        // Update conversion log with affiliate info
        $updateStmt = $this->conn->prepare(
            'UPDATE 202_conversion_logs
             SET affiliate_payout_snapshot = ?, margin_amount = ?, affiliate_id = ?, affiliate_status = ?
             WHERE conv_id = ?'
        );
        $this->conn->bind($updateStmt, 'ddisi', [
            $payout['payout'],
            $payout['margin'],
            $affiliateId,
            $status,
            $conversionId,
        ]);
        $this->conn->executeChecked($updateStmt, 'Conversion affiliate update failed');

        // Record ledger entry
        $balance = $this->getBalance($affiliateId);
        $this->recordLedgerEntry(
            affiliateId: $affiliateId,
            entryType: 'earning',
            amount: $payout['payout'],
            balanceBefore: $balance,
            balanceAfter: $balance + $payout['payout'],
            referenceType: 'conversion',
            referenceId: $conversionId,
        );

        return [
            'earning_id' => $earningId,
            'affiliate_id' => $affiliateId,
            'payout' => $payout['payout'],
            'margin' => $payout['margin'],
            'status' => $status,
            'auto_approved' => $autoApprove,
        ];
    }

    private function getBalance(int $affiliateId): float
    {
        $stmt = $this->conn->prepareRead(
            'SELECT COALESCE(SUM(CASE WHEN status IN (\'pending\',\'approved\') AND payout_amount > 0 THEN payout_amount
                  WHEN status = \'paid\' AND payout_amount > 0 THEN 0
                  ELSE 0 END), 0) AS balance
             FROM affiliate_earnings WHERE affiliate_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$affiliateId]);
        $row = $this->conn->fetchOne($stmt);
        return (float) ($row['balance'] ?? 0);
    }

    private function recordLedgerEntry(
        int $affiliateId,
        string $entryType,
        float $amount,
        float $balanceBefore,
        float $balanceAfter,
        string $referenceType,
        int $referenceId,
    ): void {
        $stmt = $this->conn->prepare(
            'INSERT INTO commission_entries
             (affiliate_id, entry_type, amount, balance_before, balance_after,
              reference_type, reference_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $this->conn->bind($stmt, 'isddsisi', [
            $affiliateId, $entryType, $amount,
            $balanceBefore, $balanceAfter,
            $referenceType, $referenceId, time(),
        ]);
        $this->conn->executeChecked($stmt, 'Ledger entry failed');
    }

    private function getAffiliateCustomPayout(int $affiliateId, int $campaignId): ?float
    {
        $stmt = $this->conn->prepareRead(
            'SELECT oaa.custom_payout
             FROM offer_affiliate_access oaa
             JOIN offer_campaigns oc ON oaa.offer_id = oc.offer_id
             WHERE oaa.affiliate_id = ? AND oc.campaign_id = ? AND oaa.status = \'approved\''
        );
        $this->conn->bind($stmt, 'ii', [$affiliateId, $campaignId]);
        $row = $this->conn->fetchOne($stmt);
        return $row ? (float) $row['custom_payout'] : null;
    }
}
