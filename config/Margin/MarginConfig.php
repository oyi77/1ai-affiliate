<?php

declare(strict_types=1);

namespace OneAIAffiliate\Margin;

use OneAIAffiliate\Database\Connection;

/**
 * Reads margin configuration from database.
 * SRP: config reading only.
 */
final class MarginConfig
{
    private ?array $cached = null;

    public function __construct(private readonly Connection $conn)
    {
    }

    /**
     * @return array{default_margin_percent: float, minimum_payout: float, auto_approve_threshold: float}
     */
    public function get(int $userId): array
    {
        if ($this->cached !== null) {
            return $this->cached;
        }

        $stmt = $this->conn->prepareRead(
            'SELECT default_margin_percent, minimum_payout, auto_approve_threshold
             FROM margin_config WHERE user_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$userId]);
        $row = $this->conn->fetchOne($stmt);

        $this->cached = $row ? [
            'default_margin_percent' => (float) $row['default_margin_percent'],
            'minimum_payout' => (float) $row['minimum_payout'],
            'auto_approve_threshold' => (float) $row['auto_approve_threshold'],
        ] : [
            'default_margin_percent' => 20.0,
            'minimum_payout' => 0.50,
            'auto_approve_threshold' => 100.0,
        ];

        return $this->cached;
    }

    public function upsert(int $userId, array $data): void
    {
        $checkStmt = $this->conn->prepareRead('SELECT id FROM margin_config WHERE user_id = ?');
        $this->conn->bind($checkStmt, 'i', [$userId]);
        $existing = $this->conn->fetchOne($checkStmt);

        $now = time();
        if ($existing) {
            $stmt = $this->conn->prepareWrite(
                'UPDATE margin_config SET default_margin_percent = ?, minimum_payout = ?,
                 auto_approve_threshold = ?, updated_at = ? WHERE user_id = ?'
            );
            $this->conn->bind($stmt, 'ddiii', [
                $data['default_margin_percent'] ?? 20.0,
                $data['minimum_payout'] ?? 0.50,
                $data['auto_approve_threshold'] ?? 100.0,
                $now, $userId,
            ]);
        } else {
            $stmt = $this->conn->prepareWrite(
                'INSERT INTO margin_config
                 (user_id, default_margin_percent, minimum_payout, auto_approve_threshold, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $this->conn->bind($stmt, 'iddiii', [
                $userId,
                $data['default_margin_percent'] ?? 20.0,
                $data['minimum_payout'] ?? 0.50,
                $data['auto_approve_threshold'] ?? 100.0,
                $now, $now,
            ]);
        }
        $this->conn->execute($stmt);
        $this->cached = null;
    }

    /**
     * Fetch payout config for a campaign including affiliate payout overrides.
     *
     * @return array{campaign_affiliate_payout: ?float, campaign_margin_percent: ?float, network_payout: float}
     */
    public function getCampaignPayoutConfig(int $campaignId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT affiliate_payout, margin_percent, network_payout
             FROM aff_campaigns WHERE aff_campaign_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$campaignId]);
        $row = $this->conn->fetchOne($stmt);

        return [
            'campaign_affiliate_payout' => isset($row['affiliate_payout']) ? (float) $row['affiliate_payout'] : null,
            'campaign_margin_percent' => isset($row['margin_percent']) ? (float) $row['margin_percent'] : null,
            'network_payout' => isset($row['network_payout']) ? (float) $row['network_payout'] : 0,
        ];
    }
}
