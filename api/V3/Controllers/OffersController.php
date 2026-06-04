<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\NotFoundException;
use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Offer\MysqlOfferRepository;

class OffersController
{
    public function __construct(
        private readonly \mysqli $db,
        private readonly int $userId,
    ) {
    }

    public function list(array $params): array
    {
        $limit = max(1, min(100, (int)($params['limit'] ?? 50)));
        $offset = max(0, (int)($params['offset'] ?? 0));

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        return $repo->list($this->userId, $params, $offset, $limit);
    }

    public function get(array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new ValidationException('Invalid offer ID');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $offer = $repo->findById($id);

        if (!$offer) {
            throw new NotFoundException('Offer not found');
        }

        $offer['campaigns'] = $repo->getCampaigns($id);
        $offer['affiliates'] = $repo->getAffiliates($id);

        return $offer;
    }

    public function create(array $params): array
    {
        if (empty($params['name']) || empty($params['network']) || empty($params['payout'])) {
            throw new ValidationException('name, network, and payout are required');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $id = $repo->create($this->userId, $params);

        return ['id' => $id];
    }

    public function update(array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new ValidationException('Invalid offer ID');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $repo->update($id, $params);

        return ['success' => true];
    }

    public function linkCampaign(array $params): array
    {
        $offerId = (int)($params['offer_id'] ?? 0);
        $campaignId = (int)($params['campaign_id'] ?? 0);

        if ($offerId <= 0 || $campaignId <= 0) {
            throw new ValidationException('offer_id and campaign_id are required');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $repo->linkCampaign($offerId, $campaignId);

        return ['success' => true];
    }

    public function grantAccess(array $params): array
    {
        $offerId = (int)($params['offer_id'] ?? 0);
        $affiliateId = (int)($params['affiliate_id'] ?? 0);

        if ($offerId <= 0 || $affiliateId <= 0) {
            throw new ValidationException('offer_id and affiliate_id are required');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $customPayout = isset($params['custom_payout']) ? (float)$params['custom_payout'] : null;
        $repo->grantAccess($offerId, $affiliateId, $customPayout);

        return ['success' => true];
    }

    public function revokeAccess(array $params): array
    {
        $offerId = (int)($params['offer_id'] ?? 0);
        $affiliateId = (int)($params['affiliate_id'] ?? 0);

        if ($offerId <= 0 || $affiliateId <= 0) {
            throw new ValidationException('offer_id and affiliate_id are required');
        }

        $repo = new MysqlOfferRepository(new \OneAIAffiliate\Database\Connection($this->db));
        $repo->revokeAccess($offerId, $affiliateId);

        return ['success' => true];
    }
}
