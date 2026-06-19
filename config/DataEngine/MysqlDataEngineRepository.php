<?php

declare(strict_types=1);

namespace OneAIAffiliate\DataEngine;

use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\Report\MysqlReportRepository;
use OneAIAffiliate\Report\ReportQuery;
use OneAIAffiliate\Report\ReportRepositoryInterface;

final class MysqlDataEngineRepository implements DataEngineRepositoryInterface
{
    public function __construct(private readonly Connection $conn)
    {
    }

    public function summary(ReportQuery $query): array
    {
        return $this->reportRepo()->summary($query);
    }

    public function breakdown(
        ReportQuery $query,
        string $breakdownType,
        string $sortBy,
        string $sortDir,
        int $limit,
        int $offset,
    ): array {
        return $this->reportRepo()->breakdown($query, $breakdownType, $sortBy, $sortDir, $limit, $offset);
    }

    public function timeseries(ReportQuery $query, string $interval): array
    {
        return $this->reportRepo()->timeseries($query, $interval);
    }

    public function daypart(ReportQuery $query, string $timezone): array
    {
        return $this->reportRepo()->daypart($query, $timezone);
    }

    public function weekpart(ReportQuery $query, string $timezone): array
    {
        return $this->reportRepo()->weekpart($query, $timezone);
    }

    public function setDirtyHour(string $clickId): int
    {
        $stmt = $this->conn->prepareWrite(
            'UPDATE dataengine SET dirty_hour = 1 WHERE click_id = ?'
        );
        $this->conn->bind($stmt, 's', [$clickId]);
        $this->conn->executeUpdate($stmt);
        $stmt->close();

        $stmt = $this->conn->prepareRead(
            'SELECT HOUR(FROM_UNIXTIME(click_time)) as hour FROM dataengine WHERE click_id = ? LIMIT 1'
        );
        $this->conn->bind($stmt, 's', [$clickId]);
        $row = $this->conn->fetchOne($stmt);
        $stmt->close();

        return (int)($row['hour'] ?? 0);
    }

    private function reportRepo(): ReportRepositoryInterface
    {
        static $repo = null;
        if ($repo === null) {
            $repo = new MysqlReportRepository($this->conn);
        }
        return $repo;
    }
}
