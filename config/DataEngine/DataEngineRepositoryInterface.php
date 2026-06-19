<?php

declare(strict_types=1);

namespace OneAIAffiliate\DataEngine;

use OneAIAffiliate\Report\ReportQuery;

interface DataEngineRepositoryInterface
{
    /**
     * @return array<string, mixed> Single row of aggregated metrics
     */
    public function summary(ReportQuery $query): array;

    /**
     * @return list<array<string, mixed>> Rows with id, name, and metric columns
     */
    public function breakdown(
        ReportQuery $query,
        string $breakdownType,
        string $sortBy,
        string $sortDir,
        int $limit,
        int $offset,
    ): array;

    /**
     * @return list<array<string, mixed>> Rows with period and metric columns
     */
    public function timeseries(ReportQuery $query, string $interval): array;

    /**
     * @return list<array<string, mixed>> 24 rows (one per hour), each with metrics
     */
    public function daypart(ReportQuery $query, string $timezone): array;

    /**
     * @return list<array<string, mixed>> 7 rows (one per day), each with metrics + day_name
     */
    public function weekpart(ReportQuery $query, string $timezone): array;

    /**
     * @return int Dirty hour value for a click
     */
    public function setDirtyHour(string $clickId): int;
}
