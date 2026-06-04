<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

use OneAIAffiliate\Database\Connection;
use RuntimeException;

final class MysqlAffiliateRepository implements AffiliateRepositoryInterface
{
    public function __construct(private readonly Connection $conn)
    {
    }

    public function list(int $userId, array $filters, int $offset, int $limit): array
    {
        $where = [];
        $binds = [];
        $types = '';

        if (!empty($filters['status'])) {
            $where[] = 'a.status = ?';
            $binds[] = $filters['status'];
            $types .= 's';
        }
        if (!empty($filters['tier'])) {
            $where[] = 'a.tier = ?';
            $binds[] = $filters['tier'];
            $types .= 's';
        }
        if (!empty($filters['search'])) {
            $where[] = '(a.company_name LIKE ? OR a.contact_email LIKE ? OR u.user_email LIKE ?)';
            $search = '%' . $filters['search'] . '%';
            $binds[] = $search;
            $binds[] = $search;
            $binds[] = $search;
            $types .= 'sss';
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = $this->conn->prepareRead(
            "SELECT COUNT(*) AS total FROM affiliates a
             LEFT JOIN 202_users u ON a.user_id = u.user_id
             $whereClause"
        );
        if ($binds) {
            $this->conn->bind($countStmt, $types, $binds);
        }
        $total = (int) ($this->conn->fetchOne($countStmt)['total'] ?? 0);

        $sql = "SELECT a.*, u.user_email, u.user_name
            FROM affiliates a
            LEFT JOIN 202_users u ON a.user_id = u.user_id
            $whereClause
            ORDER BY a.created_at DESC LIMIT ? OFFSET ?";
        $binds[] = $limit;
        $types .= 'i';
        $binds[] = $offset;
        $types .= 'i';

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, $types, $binds);
        $rows = $this->conn->fetchAll($stmt);

        return ['rows' => $rows, 'total' => $total];
    }

    public function findById(int $id): ?Affiliate
    {
        $stmt = $this->conn->prepareRead(
            'SELECT * FROM affiliates WHERE id = ?'
        );
        $this->conn->bind($stmt, 'i', [$id]);
        $row = $this->conn->fetchOne($stmt);
        return $row ? Affiliate::fromRow($row) : null;
    }

    public function findByUserId(int $userId): ?Affiliate
    {
        $stmt = $this->conn->prepareRead(
            'SELECT * FROM affiliates WHERE user_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$userId]);
        $row = $this->conn->fetchOne($stmt);
        return $row ? Affiliate::fromRow($row) : null;
    }

    public function findByCode(string $code): ?Affiliate
    {
        $stmt = $this->conn->prepareRead(
            'SELECT * FROM affiliates WHERE affiliate_code = ?'
        );
        $this->conn->bind($stmt, 's', [$code]);
        $row = $this->conn->fetchOne($stmt);
        return $row ? Affiliate::fromRow($row) : null;
    }

    public function create(int $userId, array $data): int
    {
        $code = $data['affiliate_code'] ?? substr(bin2hex(random_bytes(8)), 0, 16);
        $now = time();

        $stmt = $this->conn->prepare(
            'INSERT INTO affiliates (user_id, affiliate_code, status, tier,
             company_name, contact_email, payment_method, payment_details,
             minimum_payout, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $status = $data['status'] ?? 'active';
        $tier = $data['tier'] ?? 'standard';
        $company = $data['company_name'] ?? null;
        $email = $data['contact_email'] ?? null;
        $method = $data['payment_method'] ?? null;
        $details = $data['payment_details'] ?? null;
        $minPayout = (float) ($data['minimum_payout'] ?? 50.00);

        $this->conn->bind($stmt, 'isssssssdii', [
            $userId, $code, $status, $tier,
            $company, $email, $method, $details,
            $minPayout, $now, $now,
        ]);

        return $this->conn->executeInsert($stmt);
    }

    public function update(int $id, array $data): void
    {
        $data['updated_at'] = time();
        $sets = [];
        $binds = [];
        $types = '';

        foreach (['company_name', 'contact_email', 'payment_method', 'payment_details', 'tier'] as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = ?";
                $binds[] = $data[$field];
                $types .= 's';
            }
        }
        foreach (['minimum_payout'] as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = ?";
                $binds[] = (float) $data[$field];
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
        $sql = 'UPDATE affiliates SET ' . implode(', ', $sets) . ' WHERE id = ?';
        $stmt = $this->conn->prepare($sql);
        $this->conn->bind($stmt, $types, $binds);
        $this->conn->executeChecked($stmt, 'Affiliate update failed');
    }

    public function changeStatus(int $id, string $status): void
    {
        $stmt = $this->conn->prepare(
            'UPDATE affiliates SET status = ?, updated_at = ? WHERE id = ?'
        );
        $this->conn->bind($stmt, 'sii', [$status, time(), $id]);
        $this->conn->executeChecked($stmt, 'Affiliate status change failed');
    }

    public function getEarningsSummary(int $affiliateId): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT
                COALESCE(SUM(CASE WHEN status = \'paid\' THEN payout_amount ELSE 0 END), 0) AS paid,
                COALESCE(SUM(CASE WHEN status = \'pending\' THEN payout_amount ELSE 0 END), 0) AS pending,
                COALESCE(SUM(CASE WHEN status IN (\'pending\',\'approved\') THEN payout_amount ELSE 0 END), 0) AS balance,
                COUNT(*) AS conversion_count
             FROM affiliate_earnings WHERE affiliate_id = ?'
        );
        $this->conn->bind($stmt, 'i', [$affiliateId]);
        $row = $this->conn->fetchOne($stmt);
        return [
            'balance' => (float) ($row['balance'] ?? 0),
            'pending' => (float) ($row['pending'] ?? 0),
            'paid' => (float) ($row['paid'] ?? 0),
            'conversion_count' => (int) ($row['conversion_count'] ?? 0),
        ];
    }

    public function getRecentEarnings(int $affiliateId, int $limit): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT ae.*, cl.transaction_id, cl.click_payout AS network_payout,
                    ac.aff_campaign_name
             FROM affiliate_earnings ae
             LEFT JOIN 202_conversion_logs cl ON ae.conversion_id = cl.conv_id
             LEFT JOIN 202_aff_campaigns ac ON cl.campaign_id = ac.aff_campaign_id
             WHERE ae.affiliate_id = ?
             ORDER BY ae.created_at DESC LIMIT ?'
        );
        $this->conn->bind($stmt, 'ii', [$affiliateId, $limit]);
        return $this->conn->fetchAll($stmt);
    }

    public function getPayoutHistory(int $affiliateId, int $limit): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT pi.*, pb.batch_ref, pb.completed_at AS batch_completed_at,
                    pb.payment_method AS batch_payment_method
             FROM payout_items pi
             JOIN payout_batches pb ON pi.batch_id = pb.id
             WHERE pi.affiliate_id = ?
             ORDER BY pb.completed_at DESC LIMIT ?'
        );
        $this->conn->bind($stmt, 'ii', [$affiliateId, $limit]);
        return $this->conn->fetchAll($stmt);
    }
}
