<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

use OneAIAffiliate\Database\Connection;

/**
 * Generates and validates affiliate tracking links.
 * SRP: link format + token generation only.
 */
final class AffiliateLinkService
{
    private const TOKEN_BYTES = 16;

    public function __construct(private readonly Connection $conn)
    {
    }

    public function generateToken(): string
    {
        return bin2hex(random_bytes(self::TOKEN_BYTES));
    }

    public function createLink(int $affiliateId, int $campaignId, ?int $clickLimit = null): array
    {
        $token = $this->generateToken();
        $now = time();

        $stmt = $this->conn->prepare(
            'INSERT INTO 1ai_affiliate_links
             (affiliate_id, campaign_id, link_token, status, click_limit, created_at, updated_at)
             VALUES (?, ?, ?, \'active\', ?, ?, ?)'
        );
        $this->conn->bind($stmt, 'iisiii', [$affiliateId, $campaignId, $token, $clickLimit, $now, $now]);
        $id = $this->conn->executeInsert($stmt);

        return [
            'id' => $id,
            'token' => $token,
            'url' => $this->buildUrl($token),
        ];
    }

    public function buildUrl(string $token): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        return "$scheme://$host/go/" . $token;
    }

    public function getLinks(int $affiliateId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT al.*, ac.aff_campaign_name, ac.affiliate_payout,
                    ac.aff_campaign_url
             FROM 1ai_affiliate_links al
             JOIN 1ai_aff_campaigns ac ON al.campaign_id = ac.aff_campaign_id
             WHERE al.affiliate_id = ? AND al.status = \'active\'
             ORDER BY al.created_at DESC'
        );
        $this->conn->bind($stmt, 'i', [$affiliateId]);
        return $this->conn->fetchAll($stmt);
    }

    public function revokeLink(int $linkId): void
    {
        $stmt = $this->conn->prepare(
            'UPDATE 1ai_affiliate_links SET status = \'revoked\', updated_at = ? WHERE id = ?'
        );
        $this->conn->bind($stmt, 'ii', [time(), $linkId]);
        $this->conn->executeChecked($stmt, 'Link revoke failed');
    }

    public function findByToken(string $token): ?array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT al.*, a.id AS aff_id, a.status AS aff_status,
                    ac.affiliate_payout, ac.aff_campaign_id
             FROM 1ai_affiliate_links al
             JOIN 1ai_affiliates a ON al.affiliate_id = a.id
             JOIN 1ai_aff_campaigns ac ON al.campaign_id = ac.aff_campaign_id
             WHERE al.link_token = ? AND al.status = \'active\' AND a.status = \'active\''
        );
        $this->conn->bind($stmt, 's', [$token]);
        return $this->conn->fetchOne($stmt) ?: null;
    }

    public function recordClick(string $token, int $clickId): void
    {
        $link = $this->findByToken($token);
        if (!$link) {
            return;
        }

        $stmt = $this->conn->prepare(
            'INSERT INTO 1ai_affiliate_sessions (link_token, click_id, affiliate_payout, tracked_at)
             VALUES (?, ?, ?, ?)'
        );
        $payout = isset($link['affiliate_payout']) ? (float) $link['affiliate_payout'] : null;
        $this->conn->bind($stmt, 'sidi', [$token, $clickId, $payout, time()]);
        $this->conn->executeChecked($stmt, 'Click recording failed');
    }

    public function findSessionByClickId(int $clickId): ?array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT * FROM 1ai_affiliate_sessions WHERE click_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$clickId]);
        return $this->conn->fetchOne($stmt) ?: null;
    }
}
