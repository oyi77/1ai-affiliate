<?php

declare(strict_types=1);

if (!function_exists('p1aiResolveAdvertiserId')) {
    /**
     * @return int|null
     */
    function p1aiResolveAdvertiserId(mysqli $db, int $campaignId)
    {
        if ($campaignId <= 0) {
            return null;
        }

        $stmt = $db->prepare('SELECT aff_network_id FROM aff_campaigns WHERE aff_campaign_id = ? LIMIT 1');
        if ($stmt === false) {
            return null;
        }

        // @phpstan-ignore-next-line static endpoint uses raw mysqli; no Connection instance available
        $stmt->bind_param('i', $campaignId);
        // @phpstan-ignore-next-line static endpoint uses raw mysqli; no Connection instance available
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if ($result) {
            $result->free();
        }
        $stmt->close();

        if (!is_array($row)) {
            return null;
        }

        $advertiserId = (int) ($row['aff_network_id'] ?? 0);

        return $advertiserId > 0 ? $advertiserId : null;
    }
}

if (!function_exists('p1aiRespondJsonError')) {
    function p1aiRespondJsonError(int $code, string $message): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['error' => true, 'code' => $code, 'msg' => $message]);
        die();
    }
}

const P1AI_POSTBACK_USER_AGENT = 'Mozilla/5.0 Postback1ai-Bot v1.8';

if (!function_exists('p1aiApplyConversionUpdate')) {
    function p1aiApplyConversionUpdate(
        mysqli $db,
        string $clickId,
        string $clickCpa,
        bool $usePixelPayout = false,
        string $clickPayout = '',
        ?string $affCampaignId = null
    ): void {
        $conn = new \OneAIAffiliate\Database\Connection($db);
        $escapedCpa = $conn->escape($clickCpa);
        $sqlSet = $escapedCpa !== ''
            ? "click_cpc='" . $escapedCpa . "', click_lead='1', click_filtered='0'"
            : "click_lead='1', click_filtered='0'";

        $where = "click_id='" . $conn->escape($clickId) . "'";
        if ($affCampaignId !== null) {
            $where .= " AND aff_campaign_id='" . $conn->escape($affCampaignId) . "'";
        }

        $escapedPayout = $conn->escape($clickPayout);

        $updateClicksSql = "\n\t\tUPDATE\n\t\t\tclicks\n\t\tSET\n\t\t\t" . $sqlSet;
        if ($usePixelPayout) {
            $updateClicksSql .= "\n\t\t\t, click_payout='" . $escapedPayout . "'";
        }
        $updateClicksSql .= "\n\t\tWHERE\n\t\t\t" . $where;
        if (!$conn->query($updateClicksSql)) {
            try {
                error_log('p1aiApplyConversionUpdate: failed to update clicks: ' . $conn->writeConnection()->error);
            } catch (\Error $e) {
                error_log('p1aiApplyConversionUpdate: failed to update clicks (error inaccessible)');
            }
        }

        $updateSpySql = "\n\t\tUPDATE\n\t\t\tclicks_spy\n\t\tSET\n\t\t\t" . $sqlSet;
        if ($usePixelPayout) {
            $updateSpySql .= "\n\t\t\t, click_payout='" . $escapedPayout . "'";
        }
        $updateSpySql .= "\n\t\tWHERE\n\t\t\t" . $where;
        if (!$conn->query($updateSpySql)) {
            try {
                error_log('p1aiApplyConversionUpdate: failed to update clicks_spy: ' . $conn->writeConnection()->error);
            } catch (\Error $e) {
                error_log('p1aiApplyConversionUpdate: failed to update clicks_spy (error inaccessible)');
            }
        }

        $de = new DataEngine();
        $de->setDirtyHour($clickId);
    }
}
