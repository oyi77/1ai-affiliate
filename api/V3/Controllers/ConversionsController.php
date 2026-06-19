<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\DatabaseException;
use Api\V3\Exception\NotFoundException;
use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Database\Connection;

class ConversionsController
{
    private readonly Connection $conn;

    public function __construct(\mysqli $db, private readonly int $userId)
    {
        $this->conn = new Connection($db);
    }

    public function list(array $params): array
    {
        $limit = max(1, min(500, (int)($params['limit'] ?? 50)));
        $offset = max(0, (int)($params['offset'] ?? 0));

        $where = ['cl.user_id = ?'];
        $binds = [$this->userId];
        $types = 'i';

        if (!empty($params['campaign_id'])) {
            $where[] = 'cl.campaign_id = ?';
            $binds[] = (int)$params['campaign_id'];
            $types .= 'i';
        }
        if (!empty($params['time_from'])) {
            $where[] = 'cl.conv_time >= ?';
            $binds[] = (int)$params['time_from'];
            $types .= 'i';
        }
        if (!empty($params['time_to'])) {
            $where[] = 'cl.conv_time <= ?';
            $binds[] = (int)$params['time_to'];
            $types .= 'i';
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where) . ' AND cl.deleted = 0';

        // Count total
        $countStmt = $this->conn->prepareRead("SELECT COUNT(*) as total FROM conversion_logs cl $whereClause");
        $this->conn->bind($countStmt, $types, $binds);
        $countRow = $this->conn->fetchOne($countStmt);
        $total = (int)($countRow['total'] ?? 0);

        // Fetch rows
        $sql = "SELECT cl.conv_id, cl.click_id, cl.transaction_id, cl.campaign_id,
                cl.click_payout, cl.user_id, cl.click_time, cl.conv_time, cl.deleted,
                ac.aff_campaign_name
            FROM conversion_logs cl
            LEFT JOIN aff_campaigns ac ON cl.campaign_id = ac.aff_campaign_id
            $whereClause
            ORDER BY cl.conv_time DESC LIMIT ? OFFSET ?";

        $binds[] = $limit;
        $types .= 'i';
        $binds[] = $offset;
        $types .= 'i';

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, $types, $binds);
        $rows = $this->conn->fetchAll($stmt);

        return [
            'data' => $rows,
            'pagination' => ['total' => $total, 'limit' => $limit, 'offset' => $offset],
        ];
    }

    public function get(int $id): array
    {
        $sql = "SELECT cl.conv_id, cl.click_id, cl.transaction_id, cl.campaign_id,
                cl.click_payout, cl.user_id, cl.click_time, cl.conv_time, cl.deleted,
                ac.aff_campaign_name
            FROM conversion_logs cl
            LEFT JOIN aff_campaigns ac ON cl.campaign_id = ac.aff_campaign_id
            WHERE cl.conv_id = ? AND cl.user_id = ? AND cl.deleted = 0 LIMIT 1";

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, 'ii', [$id, $this->userId]);
        $row = $this->conn->fetchOne($stmt);

        if (!$row) {
            throw new NotFoundException('Conversion not found');
        }
        return ['data' => $row];
    }

    public function create(array $payload): array
    {
        $clickId = (int)($payload['click_id'] ?? 0);
        if ($clickId <= 0) {
            throw new ValidationException('click_id is required', ['click_id' => 'Must be a positive integer']);
        }

        // Verify click exists and is owned by user
        $clickStmt = $this->conn->prepareRead(
            'SELECT click_id, aff_campaign_id, click_payout, click_time FROM clicks WHERE click_id = ? AND user_id = ? LIMIT 1'
        );
        $this->conn->bind($clickStmt, 'ii', [$clickId, $this->userId]);
        $click = $this->conn->fetchOne($clickStmt);

        if (!$click) {
            throw new NotFoundException('Click not found or not owned by user');
        }

        $payout = (float)($payload['payout'] ?? $click['click_payout'] ?? 0);
        $transactionId = (string)($payload['transaction_id'] ?? '');
        $convTime = (int)($payload['conv_time'] ?? time());
        $campaignId = (int)$click['aff_campaign_id'];
        $clickTime = (int)($click['click_time'] ?? 0);

        return $this->conn->transaction(function () use ($clickId, $transactionId, $campaignId, $payout, $clickTime, $convTime) {
            // Insert conversion
            $insertStmt = $this->conn->prepareWrite(
                'INSERT INTO conversion_logs (click_id, transaction_id, campaign_id, click_payout, user_id, click_time, conv_time, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
            );
            $this->conn->bind($insertStmt, 'isidiii', [$clickId, $transactionId, $campaignId, $payout, $this->userId, $clickTime, $convTime]);
            $convId = $this->conn->executeInsert($insertStmt);

            // Update click lead status
            $updateStmt = $this->conn->prepareWrite('UPDATE clicks SET click_lead = 1, click_payout = ? WHERE click_id = ? AND user_id = ?');
            $this->conn->bind($updateStmt, 'dii', [$payout, $clickId, $this->userId]);
            $this->conn->executeUpdate($updateStmt);

            return $this->get($convId);
        });
    }

    public function delete(int $id): void
    {
        $this->get($id);
        $stmt = $this->conn->prepareWrite('UPDATE conversion_logs SET deleted = 1 WHERE conv_id = ? AND user_id = ?');
        $this->conn->bind($stmt, 'ii', [$id, $this->userId]);
        $this->conn->executeUpdate($stmt);
    }
}
