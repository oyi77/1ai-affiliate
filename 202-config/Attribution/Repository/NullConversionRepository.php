<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Repository;

use OneAIAffiliate\Attribution\Calculation\ConversionBatch;

final class NullConversionRepository implements ConversionRepositoryInterface
{
    public function fetchForUser(int $userId, int $startTime, int $endTime, ?int $afterConversionId = null, int $limit = 5000): ConversionBatch
    {
        return new ConversionBatch($userId, $startTime, $endTime, []);
    }
}
