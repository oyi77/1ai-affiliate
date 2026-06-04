<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Repository;

interface AuditRepositoryInterface
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function record(int $userId, ?int $modelId, string $action, array $metadata = []): void;
}
