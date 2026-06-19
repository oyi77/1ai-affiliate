<?php

declare(strict_types=1);

namespace Api\V3\Controllers;

use Api\V3\Exception\NotFoundException;
use OneAIAffiliate\Database\Connection;

class ClicksController
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

        $where = ['c.user_id = ?'];
        $binds = [$this->userId];
        $types = 'i';

        if (!empty($params['time_from'])) {
            $where[] = 'c.click_time >= ?';
            $binds[] = (int)$params['time_from'];
            $types .= 'i';
        }
        if (!empty($params['time_to'])) {
            $where[] = 'c.click_time <= ?';
            $binds[] = (int)$params['time_to'];
            $types .= 'i';
        }

        foreach (['aff_campaign_id', 'ppc_account_id', 'landing_page_id'] as $filter) {
            if (!empty($params[$filter])) {
                $where[] = "c.$filter = ?";
                $binds[] = (int)$params[$filter];
                $types .= 'i';
            }
        }

        if (isset($params['click_lead'])) {
            $where[] = 'c.click_lead = ?';
            $binds[] = (int)$params['click_lead'];
            $types .= 'i';
        }
        if (isset($params['click_bot'])) {
            $where[] = 'c.click_bot = ?';
            $binds[] = (int)$params['click_bot'];
            $types .= 'i';
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        // Count total
        $countStmt = $this->conn->prepareRead("SELECT COUNT(*) as total FROM clicks c $whereClause");
        $this->conn->bind($countStmt, $types, $binds);
        $countRow = $this->conn->fetchOne($countStmt);
        $total = (int)($countRow['total'] ?? 0);

        // Fetch rows
        $sql = "SELECT
                c.click_id, c.aff_campaign_id, c.ppc_account_id, c.landing_page_id,
                c.click_cpc, c.click_payout, c.click_lead, c.click_filtered,
                c.click_bot, c.click_alp, c.click_time, c.rotator_id, c.rule_id,
                cr.click_id_public, cr.click_cloaking, cr.click_in, cr.click_out,
                ca.keyword_id, ca.country_id, ca.platform_id, ca.browser_id, ca.device_id,
                lc.country_name, lc.country_code,
                p.platform_name, b.browser_name
            FROM clicks c
            LEFT JOIN clicks_record cr ON c.click_id = cr.click_id
            LEFT JOIN clicks_advance ca ON c.click_id = ca.click_id
            LEFT JOIN locations_country lc ON ca.country_id = lc.country_id
            LEFT JOIN platforms p ON ca.platform_id = p.platform_id
            LEFT JOIN browsers b ON ca.browser_id = b.browser_id
            $whereClause
            ORDER BY c.click_time DESC
            LIMIT ? OFFSET ?";

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
        $sql = "SELECT
                c.click_id, c.aff_campaign_id, c.ppc_account_id, c.landing_page_id,
                c.click_cpc, c.click_payout, c.click_lead, c.click_filtered,
                c.click_bot, c.click_alp, c.click_time, c.rotator_id, c.rule_id, c.user_id,
                cr.click_id_public, cr.click_cloaking, cr.click_in, cr.click_out, cr.click_reviewed,
                ca.text_ad_id, ca.keyword_id, ca.ip_id, ca.country_id, ca.region_id,
                ca.city_id, ca.platform_id, ca.browser_id, ca.device_id, ca.isp_id,
                ct.c1_id, ct.c2_id, ct.c3_id, ct.c4_id,
                lc.country_name, lc.country_code,
                lr.region_name, lci.city_name, li.isp_name,
                p.platform_name, b.browser_name
            FROM clicks c
            LEFT JOIN clicks_record cr ON c.click_id = cr.click_id
            LEFT JOIN clicks_advance ca ON c.click_id = ca.click_id
            LEFT JOIN clicks_tracking ct ON c.click_id = ct.click_id
            LEFT JOIN locations_country lc ON ca.country_id = lc.country_id
            LEFT JOIN locations_region lr ON ca.region_id = lr.region_id
            LEFT JOIN locations_city lci ON ca.city_id = lci.city_id
            LEFT JOIN locations_isp li ON ca.isp_id = li.isp_id
            LEFT JOIN platforms p ON ca.platform_id = p.platform_id
            LEFT JOIN browsers b ON ca.browser_id = b.browser_id
            WHERE c.click_id = ? AND c.user_id = ?
            LIMIT 1";

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, 'ii', [$id, $this->userId]);
        $row = $this->conn->fetchOne($stmt);

        if (!$row) {
            throw new NotFoundException('Click not found');
        }

        return ['data' => $row];
    }
}
