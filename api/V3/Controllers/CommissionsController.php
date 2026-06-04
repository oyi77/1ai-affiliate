<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Commission\CommissionService;
use OneAIAffiliate\Commission\MysqlCommissionRepository;
use OneAIAffiliate\Database\Connection;

class CommissionsController
{
    public function __construct(
        private readonly \mysqli $db,
        private readonly int $userId,
    ) {
    }

    public function listEntries(array $params): array
    {
        $limit = max(1, min(500, (int)($params['limit'] ?? 50)));
        $offset = max(0, (int)($params['offset'] ?? 0));

        $conn = new Connection($this->db);
        $repo = new MysqlCommissionRepository($conn);
        return $repo->listEntries($params, $offset, $limit);
    }

    public function approve(array $params): array
    {
        $conn = new Connection($this->db);
        $service = new CommissionService($conn);

        $count = $service->approvePending(
            approvedBy: $this->userId,
            affiliateId: isset($params['affiliate_id']) ? (int)$params['affiliate_id'] : null,
            maxAmount: isset($params['max_amount']) ? (float)$params['max_amount'] : null,
        );

        return ['approved' => $count];
    }

    public function reject(array $params): array
    {
        $earningId = (int)($params['earning_id'] ?? 0);
        $reason = (string)($params['reason'] ?? 'Rejected by admin');

        if ($earningId <= 0) {
            throw new ValidationException('earning_id is required');
        }

        $conn = new Connection($this->db);
        $service = new CommissionService($conn);
        $service->reject($earningId, $reason);

        return ['success' => true];
    }

    public function createBatch(array $params): array
    {
        $affiliateIds = $params['affiliate_ids'] ?? [];

        if (!is_array($affiliateIds) || empty($affiliateIds)) {
            throw new ValidationException('affiliate_ids must be a non-empty array');
        }

        $batchRef = bin2hex(random_bytes(16));
        $conn = new Connection($this->db);
        $repo = new MysqlCommissionRepository($conn);
        $batchId = $repo->createBatch(
            $batchRef,
            array_map('intval', $affiliateIds),
            $params['payment_method'] ?? null,
        );

        $batch = $repo->getBatchWithItems($batchRef);

        return [
            'batch_id' => $batchId,
            'batch_ref' => $batchRef,
            'total_amount' => $batch['total_amount'] ?? 0,
            'affiliate_count' => $batch['affiliate_count'] ?? 0,
        ];
    }

    public function listBatches(array $params): array
    {
        $conn = new Connection($this->db);
        $repo = new MysqlCommissionRepository($conn);
        return ['batches' => $repo->listBatches((int)($params['limit'] ?? 20))];
    }

    public function getBatch(array $params): array
    {
        $batchRef = (string)($params['batch_ref'] ?? '');
        if ($batchRef === '') {
            throw new ValidationException('batch_ref is required');
        }

        $conn = new Connection($this->db);
        $repo = new MysqlCommissionRepository($conn);
        $batch = $repo->getBatchWithItems($batchRef);

        if (!$batch) {
            return ['error' => 'Batch not found'];
        }

        return $batch;
    }
}
