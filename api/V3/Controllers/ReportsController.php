<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\ValidationException;
use OneAIAffiliate\Database\Connection;
use OneAIAffiliate\Report\InMemoryReportRepository;
use OneAIAffiliate\Report\MysqlReportRepository;
use OneAIAffiliate\Report\ReportQuery;
use OneAIAffiliate\Report\ReportRepositoryInterface;

class ReportsController
{

    private readonly \mysqli $db;
    private readonly int $userId;
    private readonly ReportRepositoryInterface $reportRepo;

    public function __construct(\mysqli $db, int $userId, ?ReportRepositoryInterface $reportRepo = null)
    {
        $this->db = $db;
        $this->userId = $userId;
        $this->reportRepo = $reportRepo ?? new MysqlReportRepository(new Connection($db));
    }

    private function makeQuery(array $params, ?int $timeFrom = null, ?int $timeTo = null): ReportQuery
    {
        $entityFilters = [];
        $allowedFilters = [
            'aff_campaign_id', 'aff_network_id', 'ppc_account_id',
            'ppc_network_id', 'landing_page_id', 'country_id',
        ];
        foreach ($allowedFilters as $key) {
            if (isset($params[$key]) && (int)$params[$key] > 0) {
                $entityFilters[$key] = (int)$params[$key];
            }
        }

        return new ReportQuery(
            userId: $this->userId,
            timeFrom: $timeFrom,
            timeTo: $timeTo,
            entityFilters: $entityFilters,
        );
    }

    public function summary(array $params): array
    {
        $timeFrom = isset($params['from']) ? (int)$params['from'] : null;
        $timeTo = isset($params['to']) ? (int)$params['to'] : null;
        $query = $this->makeQuery($params, $timeFrom, $timeTo);
        $row = $this->reportRepo->summary($query);

        return ['data' => $row];
    }

    public function breakdown(array $params): array
    {
        $breakdownType = $params['breakdown'] ?? 'campaign';
        $allowed = ['campaign', 'aff_network', 'ppc_account', 'ppc_network', 'landing_page', 'keyword', 'country', 'city', 'region', 'browser', 'platform', 'device', 'isp', 'text_ad'];
        if (!in_array($breakdownType, $allowed, true)) {
            throw new ValidationException('Invalid breakdown type', ['breakdown' => 'Allowed: ' . implode(', ', $allowed)]);
        }

        $timeFrom = isset($params['from']) ? (int)$params['from'] : null;
        $timeTo = isset($params['to']) ? (int)$params['to'] : null;
        $query = $this->makeQuery($params, $timeFrom, $timeTo);

        $sortBy = $params['sort'] ?? 'total_clicks';
        $sortDir = strtoupper($params['sort_dir'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $result = $this->reportRepo->breakdown($query, $breakdownType, $sortBy, $sortDir, (int)($params['limit'] ?? 50), (int)($params['offset'] ?? 0));

        return [
            'data' => $result,
            'breakdown' => $breakdownType,
            'available_breakdowns' => $allowed,
        ];
    }

    public function timeseries(array $params): array
    {
        $interval = $params['interval'] ?? 'day';
        $allowed = ['hour', 'day', 'week', 'month'];
        if (!in_array($interval, $allowed, true)) {
            throw new ValidationException('Invalid interval', ['interval' => 'Allowed: ' . implode(', ', $allowed)]);
        }

        $timeFrom = isset($params['from']) ? (int)$params['from'] : null;
        $timeTo = isset($params['to']) ? (int)$params['to'] : null;
        $query = $this->makeQuery($params, $timeFrom, $timeTo);

        $rows = $this->reportRepo->timeseries($query, $interval);

        return ['data' => $rows, 'interval' => $interval];
    }

    public function daypart(array $params): array
    {
        $timeFrom = isset($params['from']) ? (int)$params['from'] : null;
        $timeTo = isset($params['to']) ? (int)$params['to'] : null;
        $query = $this->makeQuery($params, $timeFrom, $timeTo);
        $timezone = $this->resolveUserTimezone();

        $rows = $this->reportRepo->daypart($query, $timezone);

        return ['data' => $rows];
    }

    public function weekpart(array $params): array
    {
        $timeFrom = isset($params['from']) ? (int)$params['from'] : null;
        $timeTo = isset($params['to']) ? (int)$params['to'] : null;
        $query = $this->makeQuery($params, $timeFrom, $timeTo);
        $timezone = $this->resolveUserTimezone();

        $rows = $this->reportRepo->weekpart($query, $timezone);

        return ['data' => $rows];
    }

    private function resolveUserTimezone(): string
    {
        $stmt = $this->db->prepare('SELECT user_timezone FROM users WHERE user_id = ? LIMIT 1');
        $stmt->bind_param('i', $this->userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $row['user_timezone'] ?? 'UTC';
    }
}
