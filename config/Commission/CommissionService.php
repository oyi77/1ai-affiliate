<?php

declare(strict_types=1);

namespace OneAIAffiliate\Commission;

use OneAIAffiliate\Database\Connection;

/**
 * Approves pending affiliate earnings and creates payout batches.
 * SRP: business logic for commission lifecycle.
 */
final class CommissionService
{
    public function __construct(private readonly Connection $conn)
    {
    }

    /**
     * Batch approve pending earnings.
     * @return int Number of earnings approved
     */
    public function approvePending(int $approvedBy, ?int $affiliateId = null, ?float $maxAmount = null): int
    {
        $where = ['status = \'pending\''];
        $binds = [];
        $types = '';

        if ($affiliateId !== null) {
            $where[] = 'affiliate_id = ?';
            $binds[] = $affiliateId;
            $types .= 'i';
        }
        if ($maxAmount !== null) {
            $where[] = 'payout_amount <= ?';
            $binds[] = $maxAmount;
            $types .= 'd';
        }

        $now = time();
        $binds[] = $approvedBy;
        $types .= 'i';
        $binds[] = $now;
        $types .= 'i';

        $whereClause = implode(' AND ', $where);
        $sql = "UPDATE affiliate_earnings
                SET status = 'approved', approved_by = ?, approved_at = ?
                WHERE $whereClause";

        $stmt = $this->conn->prepareWrite($sql);
        $this->conn->bind($stmt, $types, $binds);
        $this->conn->executeUpdate($stmt);

        return $stmt->affected_rows;
    }

    /**
     * Reject a specific earning.
     */
    public function reject(int $earningId, string $reason): void
    {
        $earningStmt = $this->conn->prepareRead(
            'SELECT * FROM affiliate_earnings WHERE id = ?'
        );
        $this->conn->bind($earningStmt, 'i', [$earningId]);
        $earning = $this->conn->fetchOne($earningStmt);

        if (!$earning) {
            return;
        }

        $stmt = $this->conn->prepareWrite(
            'UPDATE affiliate_earnings SET status = \'rejected\' WHERE id = ?'
        );
        $this->conn->bind($stmt, 'i', [$earningId]);
        $this->conn->executeUpdate($stmt);

        // Record clawback in ledger
        $affiliateId = (int) $earning['affiliate_id'];
        $amount = (float) $earning['payout_amount'];
        $balance = $this->getBalance($affiliateId);

        $ledgerStmt = $this->conn->prepareWrite(
            'INSERT INTO commission_entries
             (affiliate_id, entry_type, amount, balance_before, balance_after,
              reference_type, reference_id, note, created_at)
             VALUES (?, \'clawback\', ?, ?, ?, \'earning\', ?, ?, ?)'
        );
        $this->conn->bind($ledgerStmt, 'iddsisi', [
            $affiliateId, -$amount, $balance + $amount, $balance,
            $earningId, $reason, time(),
        ]);
        $this->conn->executeInsert($ledgerStmt);
    }

    private function getBalance(int $affiliateId): float
    {
        $stmt = $this->conn->prepareRead(
            'SELECT balance_after FROM commission_entries
             WHERE affiliate_id = ? ORDER BY id DESC LIMIT 1'
        );
        $this->conn->bind($stmt, 'i', [$affiliateId]);
        $row = $this->conn->fetchOne($stmt);
        return (float) ($row['balance_after'] ?? 0);
    }
}
