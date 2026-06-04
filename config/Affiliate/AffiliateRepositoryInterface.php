<?php

declare(strict_types=1);

namespace OneAIAffiliate\Affiliate;

interface AffiliateRepositoryInterface
{
    /** @return array{rows: list<array<string, mixed>>, total: int} */
    public function list(int $userId, array $filters, int $offset, int $limit): array;

    public function findById(int $id): ?Affiliate;

    public function findByUserId(int $userId): ?Affiliate;

    public function findByCode(string $code): ?Affiliate;

    /** @param array<string, mixed> $data */
    public function create(int $userId, array $data): int;

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): void;

    public function changeStatus(int $id, string $status): void;

    /** @return array{balance: float, pending: float, paid: float, conversion_count: int} */
    public function getEarningsSummary(int $affiliateId): array;

    /** @return list<array<string, mixed>> */
    public function getRecentEarnings(int $affiliateId, int $limit): array;

    /** @return list<array<string, mixed>> */
    public function getPayoutHistory(int $affiliateId, int $limit): array;
}
