<?php
/**
 * Offer Approval Service
 *
 * Handles Offer Manager (OM) approval workflow:
 * - Offer approval/rejection
 * - Change requests with notes
 * - Bulk approval
 * - Approval history tracking
 *
 * @package OneAIAffiliate\Offer
 * @version 2.0.0
 */

declare(strict_types=1);

namespace OneAIAffiliate\Offer;

use PDO;
use PDOException;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class OfferApprovalService
{
    private const REQUIRED_FIELDS_FOR_APPROVAL = [
        'name' => 'Offer name is required',
        'payout' => 'Payout amount is required',
        'payout_model' => 'Payout model is required',
        'network_id' => 'Network is required for tracking',
    ];

    private const PAYOUT_MODEL_REQUIRED_FIELDS = [
        'cpm' => ['payout_currency'],
        'cpc' => ['payout_currency'],
        'cpa' => ['payout_currency'],
        'cps' => ['payout_currency', 'revenue_share_pct'],
        'cpv' => ['payout_currency', 'view_duration'],
        'revshare' => ['revenue_share_pct'],
    ];

    private PDO $db;

    public function __construct(PDO $database)
    {
        $this->db = $database;
    }

    /**
     * Get pending offers for OM review
     *
     * @param int $omUserId OM user ID
     * @param array $filters Optional filters
     * @return array List of pending offers
     */
    public function getPendingOffers(int $omUserId, array $filters = []): array
    {
        try {
            $sql = "
                SELECT o.*,
                       u.user_name as advertiser_name,
                       u.user_email as advertiser_email,
                       n.name as network_name,
                       om.user_name as reviewed_by_name
                FROM 1ai_offers o
                LEFT JOIN 1ai_users u ON o.advertiser_id = u.user_id
                LEFT JOIN 1ai_networks n ON o.network_id = n.id
                LEFT JOIN 1ai_users om ON o.approved_by = om.user_id
                WHERE o.approval_status = 'pending'
            ";

            $params = [];

            if (!empty($filters['advertiser_id'])) {
                $sql .= " AND o.advertiser_id = ?";
                $params[] = $filters['advertiser_id'];
            }

            if (!empty($filters['network_id'])) {
                $sql .= " AND o.network_id = ?";
                $params[] = $filters['network_id'];
            }

            if (!empty($filters['payout_model'])) {
                $sql .= " AND o.payout_model = ?";
                $params[] = $filters['payout_model'];
            }

            $sql .= " ORDER BY o.created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException("Failed to get pending offers: " . $e->getMessage());
        }
    }

    /**
     * Approve offer
     *
     * @param int $offerId Offer ID
     * @param int $omUserId OM user ID
     * @param array $options Optional approval options
     * @return array Approval result
     * @throws InvalidArgumentException If offer cannot be approved
     */
    public function approveOffer(int $offerId, int $omUserId, array $options = []): array
    {
        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            $offer = $this->getOffer($offerId);

            if (!in_array($offer['approval_status'], ['pending', 'changes_requested'])) {
                throw new InvalidArgumentException(
                    "Cannot approve offer with status: {$offer['approval_status']}"
                );
            }

            $validation = $this->validateOfferForApproval($offer);
            if (!$validation['valid']) {
                throw new InvalidArgumentException(implode('; ', $validation['errors']));
            }

            $marginFloor = (float) ($options['margin_floor_pct'] ?? $offer['margin_floor_pct'] ?? 5.00);
            $marginCheck = $this->validateMarginSafety($offer, $marginFloor);

            $stmt = $this->db->prepare("
                UPDATE 1ai_offers
                SET approval_status = 'approved',
                    status = 'active',
                    approved_by = ?,
                    approved_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$omUserId, $offerId]);

            $this->logApproval($offerId, $omUserId, 'approved', null, $options['notes'] ?? null);
            $this->notifyAdvertiser($offer['advertiser_id'], $offerId, 'approved');

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'offer_id' => $offerId,
                'status' => 'approved',
                'margin_check' => $marginCheck,
                'message' => 'Offer approved successfully'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to approve offer: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Reject offer
     *
     * @param int $offerId Offer ID
     * @param int $omUserId OM user ID
     * @param string $reason Rejection reason (required)
     * @return array Rejection result
     * @throws InvalidArgumentException If reason is empty or offer cannot be rejected
     */
    public function rejectOffer(int $offerId, int $omUserId, string $reason): array
    {
        if (empty(trim($reason))) {
            throw new InvalidArgumentException("Rejection reason is required");
        }

        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            $offer = $this->getOffer($offerId);

            if (!in_array($offer['approval_status'], ['pending', 'changes_requested'])) {
                throw new InvalidArgumentException(
                    "Cannot reject offer with status: {$offer['approval_status']}"
                );
            }

            $stmt = $this->db->prepare("
                UPDATE 1ai_offers
                SET approval_status = 'rejected',
                    status = 'paused',
                    rejection_reason = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$reason, $offerId]);

            $this->logApproval($offerId, $omUserId, 'rejected', $reason);
            $this->notifyAdvertiser($offer['advertiser_id'], $offerId, 'rejected', $reason);

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'offer_id' => $offerId,
                'status' => 'rejected',
                'message' => 'Offer rejected'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to reject offer: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Request changes for offer
     *
     * @param int $offerId Offer ID
     * @param int $omUserId OM user ID
     * @param string $notes Required notes for advertiser
     * @return array Change request result
     * @throws InvalidArgumentException If notes are empty
     */
    public function requestChanges(int $offerId, int $omUserId, string $notes): array
    {
        if (empty(trim($notes))) {
            throw new InvalidArgumentException("Notes are required when requesting changes");
        }

        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            $offer = $this->getOffer($offerId);

            if (!in_array($offer['approval_status'], ['pending', 'changes_requested'])) {
                throw new InvalidArgumentException(
                    "Cannot request changes for offer with status: {$offer['approval_status']}"
                );
            }

            $stmt = $this->db->prepare("
                UPDATE 1ai_offers
                SET approval_status = 'changes_requested',
                    om_notes = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$notes, $offerId]);

            $this->logApproval($offerId, $omUserId, 'changes_requested', $notes);
            $this->notifyAdvertiser($offer['advertiser_id'], $offerId, 'changes_requested', $notes);

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'offer_id' => $offerId,
                'status' => 'changes_requested',
                'message' => 'Change request sent to advertiser'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to request changes: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Bulk approve offers
     *
     * @param array $offerIds Array of offer IDs
     * @param int $omUserId OM user ID
     * @return array Bulk approval result
     */
    public function bulkApprove(array $offerIds, int $omUserId): array
    {
        $results = [
            'approved' => [],
            'failed' => [],
            'total' => count($offerIds)
        ];

        foreach ($offerIds as $offerId) {
            try {
                $this->approveOffer((int) $offerId, $omUserId);
                $results['approved'][] = $offerId;
            } catch (Throwable $e) {
                $results['failed'][] = [
                    'offer_id' => $offerId,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Get approval history for offer
     *
     * @param int $offerId Offer ID
     * @return array Approval history
     */
    public function getApprovalHistory(int $offerId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT h.*, u.user_name as reviewed_by_name
                FROM 1ai_offer_approval_history h
                LEFT JOIN 1ai_users u ON h.reviewed_by = u.user_id
                WHERE h.offer_id = ?
                ORDER BY h.created_at DESC
            ");
            $stmt->execute([$offerId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException("Failed to get approval history: " . $e->getMessage());
        }
    }

    /**
     * Validate offer for approval
     *
     * @param array $offer Offer data
     * @return array Validation result
     */
    private function validateOfferForApproval(array $offer): array
    {
        $errors = [];

        foreach (self::REQUIRED_FIELDS_FOR_APPROVAL as $field => $message) {
            if (empty($offer[$field])) {
                $errors[] = $message;
            }
        }

        $payoutModel = $offer['payout_model'] ?? 'cpa';
        $requiredFields = self::PAYOUT_MODEL_REQUIRED_FIELDS[$payoutModel] ?? [];

        foreach ($requiredFields as $field) {
            if (!isset($offer[$field]) || $offer[$field] === '') {
                $errors[] = "{$field} is required for {$payoutModel} model";
            }
        }

        if (isset($offer['payout']) && $offer['payout'] < 0) {
            $errors[] = 'Payout amount cannot be negative';
        }

        if (isset($offer['margin_floor_pct']) && ($offer['margin_floor_pct'] < 0 || $offer['margin_floor_pct'] > 100)) {
            $errors[] = 'Margin floor must be between 0 and 100';
        }

        if (isset($offer['cap_daily']) && $offer['cap_daily'] < 0) {
            $errors[] = 'Daily cap cannot be negative';
        }

        if (isset($offer['cap_monthly']) && $offer['cap_monthly'] < 0) {
            $errors[] = 'Monthly cap cannot be negative';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Validate margin safety
     *
     * @param array $offer Offer data
     * @param float $marginFloorPct Minimum margin percentage
     * @return array Margin validation result
     */
    private function validateMarginSafety(array $offer, float $marginFloorPct): array
    {
        $revenue = (float) ($offer['network_payout'] ?? 0);
        $payout = (float) ($offer['payout'] ?? 0);

        if ($revenue <= 0) {
            return [
                'valid' => false,
                'margin_pct' => 0,
                'message' => 'Revenue must be greater than zero'
            ];
        }

        $marginPct = (($revenue - $payout) / $revenue) * 100;

        if ($marginPct < $marginFloorPct) {
            return [
                'valid' => false,
                'margin_pct' => round($marginPct, 2),
                'message' => "Margin is below safety floor"
            ];
        }

        return [
            'valid' => true,
            'margin_pct' => round($marginPct, 2),
            'message' => 'Margin is acceptable'
        ];
    }

    /**
     * Get offer by ID
     *
     * @param int $offerId Offer ID
     * @return array Offer data
     * @throws InvalidArgumentException If offer not found
     */
    private function getOffer(int $offerId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM 1ai_offers WHERE id = ?");
        $stmt->execute([$offerId]);
        $offer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$offer) {
            throw new InvalidArgumentException("Offer not found: {$offerId}");
        }

        return $offer;
    }

    /**
     * Log approval action
     *
     * @param int $offerId Offer ID
     * @param int $userId User ID
     * @param string $action Action taken
     * @param string|null $reason Optional reason
     * @param string|null $notes Optional notes
     */
    private function logApproval(int $offerId, int $userId, string $action, ?string $reason = null, ?string $notes = null): void
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO 1ai_offer_approval_history
                (offer_id, reviewed_by, action, reason, notes, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$offerId, $userId, $action, $reason, $notes]);
        } catch (PDOException $e) {
            error_log("Failed to log approval: " . $e->getMessage());
        }
    }

    /**
     * Notify advertiser of approval status change
     *
     * @param int $advertiserId Advertiser user ID
     * @param int $offerId Offer ID
     * @param string $status New status
     * @param string|null $message Optional message
     */
    private function notifyAdvertiser(int $advertiserId, int $offerId, string $status, ?string $message = null): void
    {
        error_log("Offer {$offerId} {$status} notification for advertiser {$advertiserId}" .
                  ($message ? ": {$message}" : ''));
    }
}