<?php

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

use OneAIAffiliate\Database\Connection;

final class MysqlOfferRepository
{
    public function __construct(private readonly Connection $conn)
    {
    }

    /** @return array{rows: list<array<string, mixed>>, total: int} */
    public function list(int $userId, array $filters, int $offset, int $limit): array
    {
        $where = ['o.advertiser_id = ?'];
        $binds = [$userId];
        $types = 'i';

        if (!empty($filters['network'])) {
            $where[] = 'o.network = ?';
            $binds[] = $filters['network'];
            $types .= 's';
        }
        if (!empty($filters['vertical'])) {
            $where[] = 'o.vertical = ?';
            $binds[] = $filters['vertical'];
            $types .= 's';
        }
        if (!empty($filters['status'])) {
            $where[] = 'o.status = ?';
            $binds[] = $filters['status'];
            $types .= 's';
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $countStmt = $this->conn->prepareRead("SELECT COUNT(*) AS total FROM 1ai_offers o $whereClause");
        $this->conn->bind($countStmt, $types, $binds);
        $total = (int) ($this->conn->fetchOne($countStmt)['total'] ?? 0);

        $sql = "SELECT o.*, COUNT(DISTINCT oaa.affiliate_id) AS affiliate_count
            FROM 1ai_offers o
            LEFT JOIN 1ai_offer_affiliate_access oaa ON o.id = oaa.offer_id
            $whereClause
            GROUP BY o.id
            ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        $binds[] = $limit;
        $types .= 'i';
        $binds[] = $offset;
        $types .= 'i';

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, $types, $binds);
        return ['rows' => $this->conn->fetchAll($stmt), 'total' => $total];
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->conn->prepareRead('SELECT * FROM 1ai_offers WHERE id = ?');
        $this->conn->bind($stmt, 'i', [$id]);
        return $this->conn->fetchOne($stmt) ?: null;
    }

    public function create(int $userId, array $data): int
    {
        $now = time();
        $stmt = $this->conn->prepare(
            'INSERT INTO 1ai_offers (advertiser_id, name, network, network_offer_id, vertical, geo,
             type, payout, payout_currency, cap_daily, cap_monthly, traffic_allowed,
             status, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $this->conn->bind($stmt, 'issssssdiiisssii', [
            $userId,
            $data['name'],
            $data['network'],
            $data['network_offer_id'] ?? null,
            $data['vertical'] ?? null,
            $data['geo'] ?? null,
            $data['type'] ?? 'CPA',
            (float) ($data['payout'] ?? 0),
            $data['payout_currency'] ?? 'USD',
            $data['cap_daily'] ?? null,
            $data['cap_monthly'] ?? null,
            $data['traffic_allowed'] ?? null,
            $data['status'] ?? 'active',
            $data['notes'] ?? null,
            $now, $now,
        ]);
        return $this->conn->executeInsert($stmt);
    }

    public function update(int $id, array $data): void
    {
        $data['updated_at'] = time();
        $sets = [];
        $binds = [];
        $types = '';

        $strFields = ['name', 'network', 'network_offer_id', 'vertical', 'geo', 'type',
                       'payout_currency', 'status', 'notes', 'traffic_allowed'];
        $numFields = ['payout', 'cap_daily', 'cap_monthly'];

        foreach ($strFields as $f) {
            if (array_key_exists($f, $data)) {
                $sets[] = "$f = ?";
                $binds[] = $data[$f];
                $types .= 's';
            }
        }
        foreach ($numFields as $f) {
            if (array_key_exists($f, $data)) {
                $sets[] = "$f = ?";
                $binds[] = $data[$f];
                $types .= 'd';
            }
        }
        if (array_key_exists('updated_at', $data)) {
            $sets[] = 'updated_at = ?';
            $binds[] = $data['updated_at'];
            $types .= 'i';
        }

        if (!$sets) {
            return;
        }

        $binds[] = $id;
        $types .= 'i';
        $sql = 'UPDATE 1ai_offers SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $this->conn->prepare($sql);
        $this->conn->bind($stmt, $types, $binds);
        $this->conn->executeChecked($stmt, 'Offer update failed');
    }

    public function linkCampaign(int $offerId, int $campaignId): void
    {
        $stmt = $this->conn->prepare(
            'INSERT IGNORE INTO 1ai_offer_campaigns (offer_id, campaign_id, created_at) VALUES (?, ?, ?)'
        );
        $this->conn->bind($stmt, 'iii', [$offerId, $campaignId, time()]);
        $this->conn->executeChecked($stmt, 'Campaign link failed');
    }

    public function unlinkCampaign(int $offerId, int $campaignId): void
    {
        $stmt = $this->conn->prepare(
            'DELETE FROM 1ai_offer_campaigns WHERE offer_id = ? AND campaign_id = ?'
        );
        $this->conn->bind($stmt, 'ii', [$offerId, $campaignId]);
        $this->conn->executeChecked($stmt, 'Campaign unlink failed');
    }

    /** @return list<array<string, mixed>> */
    public function getCampaigns(int $offerId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT ac.* FROM 1ai_aff_campaigns ac
             JOIN 1ai_offer_campaigns oc ON ac.aff_campaign_id = oc.campaign_id
             WHERE oc.offer_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$offerId]);
        return $this->conn->fetchAll($stmt);
    }

    public function grantAccess(int $offerId, int $affiliateId, ?float $customPayout = null): void
    {
        $now = time();
        $stmt = $this->conn->prepare(
            'INSERT INTO 1ai_offer_affiliate_access (offer_id, affiliate_id, custom_payout, status, created_at, updated_at)
             VALUES (?, ?, ?, \'approved\', ?, ?)
             ON DUPLICATE KEY UPDATE custom_payout = VALUES(custom_payout), status = \'approved\', updated_at = VALUES(updated_at)'
        );
        $this->conn->bind($stmt, 'iidii', [$offerId, $affiliateId, $customPayout, $now, $now]);
        $this->conn->executeChecked($stmt, 'Access grant failed');
    }

    public function revokeAccess(int $offerId, int $affiliateId): void
    {
        $stmt = $this->conn->prepare(
            'UPDATE 1ai_offer_affiliate_access SET status = \'revoked\', updated_at = ? WHERE offer_id = ? AND affiliate_id = ?'
        );
        $this->conn->bind($stmt, 'iii', [time(), $offerId, $affiliateId]);
        $this->conn->executeChecked($stmt, 'Access revoke failed');
    }

    /** @return list<array<string, mixed>> */
    public function getAffiliates(int $offerId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT a.*, oaa.custom_payout, oaa.status AS access_status,
                    oaa.created_at AS access_granted_at
             FROM 1ai_offer_affiliate_access oaa
             JOIN 1ai_affiliates a ON oaa.affiliate_id = a.id
             WHERE oaa.offer_id = ? AND oaa.status = \'approved\''
        );
        $this->conn->bind($stmt, 'i', [$offerId]);
        return $this->conn->fetchAll($stmt);
    }

    /** @return list<array<string, mixed>> */
    public function getAvailableForAffiliate(int $affiliateId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT o.*, oaa.custom_payout
             FROM 1ai_offers o
             JOIN 1ai_offer_affiliate_access oaa ON o.id = oaa.offer_id
             WHERE oaa.affiliate_id = ? AND oaa.status = \'approved\' AND o.status = \'active\'
             ORDER BY o.name ASC'
        );
        $this->conn->bind($stmt, 'i', [$affiliateId]);
        return $this->conn->fetchAll($stmt);
    }
}
