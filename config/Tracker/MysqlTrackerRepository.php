<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracker;

use OneAIAffiliate\Database\Connection;

final class MysqlTrackerRepository implements TrackerRepositoryInterface
{
    public function __construct(private Connection $conn)
    {
    }

    public function findByPublicId(string $publicId): ?array
    {
        $sql = "SELECT trackers.user_id,
                       trackers.aff_campaign_id,
                       text_ad_id,
                       ppc_account_id,
                       click_cpc,
                       click_cpa,
                       click_cloaking,
                       aff_campaign_rotate,
                       aff_campaign_url,
                       aff_campaign_url_2,
                       aff_campaign_url_3,
                       aff_campaign_url_4,
                       aff_campaign_url_5,
                       aff_campaign_payout,
                       aff_campaign_cloaking,
                       cv2.ppc_variable_ids,
                       cv2.parameters,
                       user_timezone,
                       user_keyword_searched_or_bidded,
                       user_pref_referer_data,
                       user_pref_dynamic_bid,
                       maxmind_isp
                FROM trackers
                LEFT JOIN users_pref USING (user_id)
                LEFT JOIN users USING (user_id)
                LEFT JOIN aff_campaigns USING (aff_campaign_id)
                LEFT JOIN ppc_accounts USING (ppc_account_id)
                LEFT JOIN (SELECT ppc_network_id,
                                  GROUP_CONCAT(ppc_variable_id) AS ppc_variable_ids,
                                  GROUP_CONCAT(parameter) AS parameters
                           FROM ppc_network_variables
                           GROUP BY ppc_network_id) AS cv2 USING (ppc_network_id)
                WHERE tracker_id_public = ?";

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, 's', [$publicId]);

        return $this->conn->fetchOne($stmt);
    }

    public function findById(int $trackerId, int $userId): ?array
    {
        $sql = 'SELECT tracker_id, tracker_id_public
                FROM trackers
                WHERE tracker_id = ? AND user_id = ? LIMIT 1';

        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, 'ii', [$trackerId, $userId]);

        return $this->conn->fetchOne($stmt);
    }

    public function findTrackingDomain(int $userId): ?string
    {
        $sql = 'SELECT user_tracking_domain FROM users_pref WHERE user_id = ? LIMIT 1';
        $stmt = $this->conn->prepareRead($sql);
        $this->conn->bind($stmt, 'i', [$userId]);
        $row = $this->conn->fetchOne($stmt);

        if ($row === null || !isset($row['user_tracking_domain'])) {
            return null;
        }

        $domain = $row['user_tracking_domain'];
        if (!is_string($domain) || $domain === '') {
            return null;
        }

        return $domain;
    }
}
