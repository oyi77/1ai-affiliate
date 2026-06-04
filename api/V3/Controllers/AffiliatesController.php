<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\DatabaseException;
use Api\V3\Exception\NotFoundException;
use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Affiliate\AffiliateAuth;
use OneAIAffiliate\Affiliate\AffiliateLinkService;
use OneAIAffiliate\Affiliate\MysqlAffiliateRepository;

class AffiliatesController
{
    public function __construct(
        private readonly \mysqli $db,
        private readonly int $userId,
    ) {
    }

    public function list(array $params): array
    {
        $limit = max(1, min(200, (int)($params['limit'] ?? 50)));
        $offset = max(0, (int)($params['offset'] ?? 0));

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);

        return $repo->list($this->userId, $params, $offset, $limit);
    }

    public function get(array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new ValidationException('Invalid affiliate ID');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);
        $affiliate = $repo->findById($id);

        if (!$affiliate) {
            throw new NotFoundException('Affiliate not found');
        }

        $earnings = $repo->getEarningsSummary($id);

        return [
            'id' => $affiliate->id,
            'user_id' => $affiliate->userId,
            'affiliate_code' => $affiliate->affiliateCode,
            'status' => $affiliate->status,
            'tier' => $affiliate->tier,
            'company_name' => $affiliate->companyName,
            'contact_email' => $affiliate->contactEmail,
            'minimum_payout' => $affiliate->minimumPayout,
            'earnings' => $earnings,
            'created_at' => $affiliate->createdAt,
        ];
    }

    public function create(array $params): array
    {
        if (empty($params['user_id'])) {
            throw new ValidationException('user_id is required');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);

        $id = $repo->create((int)$params['user_id'], $params);
        $affiliate = $repo->findById($id);

        return [
            'id' => $id,
            'affiliate_code' => $affiliate?->affiliateCode,
        ];
    }

    public function update(array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new ValidationException('Invalid affiliate ID');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);
        $repo->update($id, $params);

        return ['success' => true];
    }

    public function changeStatus(array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        $status = (string)($params['status'] ?? '');

        if ($id <= 0 || !in_array($status, ['active', 'paused', 'banned'], true)) {
            throw new ValidationException('Invalid affiliate ID or status');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);
        $repo->changeStatus($id, $status);

        return ['success' => true];
    }

    public function getLinks(array $params): array
    {
        $affiliateId = (int)($params['affiliate_id'] ?? 0);
        if ($affiliateId <= 0) {
            throw new ValidationException('affiliate_id is required');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $service = new AffiliateLinkService($conn);
        return ['links' => $service->getLinks($affiliateId)];
    }

    public function createLink(array $params): array
    {
        $affiliateId = (int)($params['affiliate_id'] ?? 0);
        $campaignId = (int)($params['campaign_id'] ?? 0);

        if ($affiliateId <= 0 || $campaignId <= 0) {
            throw new ValidationException('affiliate_id and campaign_id are required');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $service = new AffiliateLinkService($conn);
        return $service->createLink($affiliateId, $campaignId, $params['click_limit'] ?? null);
    }

    public function getEarnings(array $params): array
    {
        $affiliateId = (int)($params['affiliate_id'] ?? 0);
        if ($affiliateId <= 0) {
            throw new ValidationException('affiliate_id is required');
        }

        $conn = new \OneAIAffiliate\Database\Connection($this->db);
        $repo = new MysqlAffiliateRepository($conn);
        $summary = $repo->getEarningsSummary($affiliateId);
        $recent = $repo->getRecentEarnings($affiliateId, (int)($params['limit'] ?? 20));
        $payouts = $repo->getPayoutHistory($affiliateId, (int)($params['limit'] ?? 10));

        return [
            'summary' => $summary,
            'recent' => $recent,
            'payouts' => $payouts,
        ];
    }
}
