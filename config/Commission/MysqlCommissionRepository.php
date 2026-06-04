<?php

declare(strict_types=1);

namespace OneAIAffiliate\Commission;

use OneAIAffiliate\Database\Connection;

final class MysqlCommissionRepository
{
    public function __construct(private readonly Connection $conn)
    {
    }

    /**
     * @return array{rows: list<array<string, mixed>>, total: int}
     */
    public function listEntries(array $filters, int $offset, int $limit): array
    {
        $where = [];
        $binds = [];
        $types = '';

        if (!empty($filters['affiliate_id'])) {
            $where[] = 'ce.affiliate_id = ?';
            $binds[] = (int) $filters['affiliate_id'];
            $types .= 'i';
        }
        if (!empty($filters['entry_type'])) {
            $where[] = 'ce.entry_type = ?';
            $binds[] = $filters['entry_type'];
            $types .= 's';
        }
        if (!empty($filters['time_from'])) {
            $where[] = 'ce.created_at >= ?';
            $binds[] = (int) $filters['time_from'];
            $types .= 'i';
        }
        if (!empty($filters['time_to'])) {
            $where[] = 'ce.created_at <= ?';
            $binds[] = (int) $filters['time_to'];
            $types .= 'i';
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $countStmt = $this->conn->prepareRead(
            "SELECT COUNT(*) AS total FROM commission_entries ce $whereClause"
        );
        if ($binds) {
            $this->conn->bind($countStmt, $types, $binds);
        }
        $total = (int) ($this->conn->fetchOne($countStmt)['total'] ?? 0);

        $sql = "SELECT ce.*, a.affiliate_code, a.company_name,
                       u.user_name, u.user_email
                FROM commission_entries ce
                LEFT JOIN affiliates a ON ce.affiliate_id = a.id
                LEFT JOIN users u ON a.user_id = u.user_id
                $whereClause
                ORDER BY ce.created_at DESC LIMIT ? OFFSET ?";
        $binds[] = $limit;
        $types .= 'i';
        $binds[] = $offset;
        $types .= 'i';

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, $types, $binds);
        return ['rows' => $this->conn->fetchAll($stmt), 'total' => $total];
    }

    /** @return array{total_earned: float, total_paid: float, balance: float} */
    public function getAggregateBalances(): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT affiliate_id, balance_after
             FROM commission_entries ce1
             WHERE ce1.id = (SELECT MAX(ce2.id) FROM commission_entries ce2 WHERE ce2.affiliate_id = ce1.affiliate_id)'
        );
        $rows = $this->conn->fetchAll($stmt);
        $totalBalance = 0.0;
        foreach ($rows as $row) {
            $totalBalance += (float) ($row['balance_after'] ?? 0);
        }
        return [
            'total_earned' => 0,
            'total_paid' => 0,
            'balance' => $totalBalance,
        ];
    }

    // ─── Payout Batch Operations ───

    public function createBatch(string $batchRef, array $affiliateIds, string $paymentMethod = null): int
    {
        $count = count($affiliateIds);
        $now = time();

        $totalStmt = $this->conn->prepareRead(
            'SELECT SUM(balance_after) AS total FROM commission_entries ce1
             WHERE ce1.id IN (
                 SELECT MAX(ce2.id) FROM commission_entries ce2
                 WHERE ce2.affiliate_id IN (' . implode(',', array_fill(0, $count, '?')) . ')
                 GROUP BY ce2.affiliate_id
             )'
        );
        $types = str_repeat('i', $count);
        $this->conn->bind($totalStmt, $types, $affiliateIds);
        $row = $this->conn->fetchOne($totalStmt);
        $totalAmount = (float) ($row['total'] ?? 0);

        $stmt = $this->conn->prepare(
            'INSERT INTO payout_batches
             (batch_ref, status, total_amount, affiliate_count, payment_method, created_at)
             VALUES (?, \'draft\', ?, ?, ?, ?)'
        );
        $this->conn->bind($stmt, 'sdisi', [$batchRef, $totalAmount, $count, $paymentMethod, $now]);
        $batchId = $this->conn->executeInsert($stmt);

        foreach ($affiliateIds as $affiliateId) {
            $balanceStmt = $this->conn->prepareRead(
                'SELECT balance_after FROM commission_entries
                 WHERE affiliate_id = ? ORDER BY id DESC LIMIT 1'
            );
            $this->conn->bind($balanceStmt, 'i', [$affiliateId]);
            $balanceRow = $this->conn->fetchOne($balanceStmt);
            $amount = (float) ($balanceRow['balance_after'] ?? 0);

            $itemStmt = $this->conn->prepare(
                'INSERT INTO payout_items (batch_id, affiliate_id, amount, earnings_count, status, created_at)
                 VALUES (?, ?, ?, 0, \'pending\', ?)'
            );
            $this->conn->bind($itemStmt, 'iidi', [$batchId, $affiliateId, $amount, $now]);
            $this->conn->executeChecked($itemStmt, 'Payout item insert failed');
        }

        return $batchId;
    }

    /** @return list<array<string, mixed>> */
    public function listBatches(int $limit = 20): array
    {
        $stmt = $this->conn->prepareRead(
            'SELECT * FROM payout_batches ORDER BY created_at DESC LIMIT ?'
        );
        $this->conn->bind($stmt, 'i', [$limit]);
        return $this->conn->fetchAll($stmt);
    }

    public function getBatchWithItems(string $batchRef): ?array
    {
        $batchStmt = $this->conn->prepareRead(
            'SELECT * FROM payout_batches WHERE batch_ref = ?'
        );
        $this->conn->bind($batchStmt, 's', [$batchRef]);
        $batch = $this->conn->fetchOne($batchStmt);
        if (!$batch) {
            return null;
        }

        $itemsStmt = $this->conn->prepareRead(
            'SELECT pi.*, a.affiliate_code, a.company_name
             FROM payout_items pi
             JOIN affiliates a ON pi.affiliate_id = a.id
             WHERE pi.batch_id = ?'
        );
        $this->conn->bind($itemsStmt, 'i', [(int) $batch['id']]);
        $batch['items'] = $this->conn->fetchAll($itemsStmt);

        return $batch;
    }
}
