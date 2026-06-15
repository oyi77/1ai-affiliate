<?php
/**
 * Account Manager (AM) Offer Assignment Service
 *
 * Manages offer assignments to affiliates/publishers:
 * - Specific assignments (AM to affiliate)
 * - Global assignments (all affiliates)
 * - Margin overrides
 * - Cap overrides
 * - Temporary assignments with expiration
 * - Margin safety validation
 *
 * @package OneAIAffiliate\Assignment
 * @version 2.0.0
 */

declare(strict_types=1);

namespace OneAIAffiliate\Assignment;

use PDO;
use PDOException;
use InvalidArgumentException;
use RuntimeException;
use OneAIAffiliate\RBAC\RBACService;

class AMOfferAssignmentService
{
    private PDO $db;
    private RBACService $rbac;

    public function __construct(PDO $database, RBACService $rbacService)
    {
        $this->db = $database;
        $this->rbac = $rbacService;
    }

    /**
     * Assign offer to specific affiliate
     *
     * @param int $amUserId AM user ID
     * @param int $offerId Offer ID
     * @param int $affiliateId Affiliate ID
     * @param array $options Assignment options
     * @return array Assignment result
     */
    public function assignToAffiliate(int $amUserId, int $offerId, int $affiliateId, array $options = []): array
    {
        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            if (!$this->rbac->isAffiliateAssignedToAM($amUserId, $affiliateId)) {
                throw new InvalidArgumentException('AM is not assigned to this affiliate');
            }

            $offer = $this->getOffer($offerId);
            if ($offer['approval_status'] !== 'approved' || $offer['status'] !== 'active') {
                throw new InvalidArgumentException('Offer must be approved and active to assign');
            }

            if (!$this->isAffiliateActive($affiliateId)) {
                throw new InvalidArgumentException('Affiliate is not active');
            }

            $marginOverride = $options['affiliate_margin_pct'] ?? null;
            if ($marginOverride !== null) {
                $this->validateMarginOverride($offer, $marginOverride);
            }

            $protectedPayout = $this->calculateAssignmentPayout($offer, $marginOverride);

            $stmt = $this->db->prepare("
                INSERT INTO 1ai_offer_assignments
                (offer_id, affiliate_id, am_user_id, assignment_type, is_active,
                 affiliate_margin_pct, affiliate_payout, cap_daily_override, cap_monthly_override,
                 expires_at, assigned_by, notes, created_at, updated_at)
                VALUES (?, ?, ?, 'specific', 1, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    am_user_id = VALUES(am_user_id),
                    assignment_type = VALUES(assignment_type),
                    is_active = VALUES(is_active),
                    affiliate_margin_pct = VALUES(affiliate_margin_pct),
                    affiliate_payout = VALUES(affiliate_payout),
                    cap_daily_override = VALUES(cap_daily_override),
                    cap_monthly_override = VALUES(cap_monthly_override),
                    expires_at = VALUES(expires_at),
                    notes = VALUES(notes),
                    updated_at = NOW()
            ");

            $stmt->execute([
                $offerId,
                $affiliateId,
                $amUserId,
                $marginOverride,
                $protectedPayout['max_payout'],
                $options['cap_daily_override'] ?? null,
                $options['cap_monthly_override'] ?? null,
                $options['expires_at'] ?? null,
                $amUserId,
                $options['notes'] ?? null,
            ]);

            $assignmentId = (int) $this->db->lastInsertId();
            if ($assignmentId === 0) {
                $stmt = $this->db->prepare("
                    SELECT id FROM 1ai_offer_assignments
                    WHERE offer_id = ? AND affiliate_id = ? AND assignment_type = 'specific'
                ");
                $stmt->execute([$offerId, $affiliateId]);
                $assignmentId = (int) $stmt->fetchColumn();
            }

            $this->logAssignment($assignmentId, $amUserId, 'assigned', $options['notes'] ?? null);

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'assignment_id' => $assignmentId,
                'offer_id' => $offerId,
                'affiliate_id' => $affiliateId,
                'assignment_type' => 'specific',
                'affiliate_payout' => $protectedPayout['max_payout'],
                'margin_pct' => $protectedPayout['margin_pct'],
                'message' => 'Offer assigned to affiliate'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to assign offer: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Assign offer globally (visible to all active affiliates)
     *
     * @param int $amUserId AM user ID
     * @param int $offerId Offer ID
     * @param array $options Assignment options
     * @return array Assignment result
     */
    public function assignGlobally(int $amUserId, int $offerId, array $options = []): array
    {
        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            $offer = $this->getOffer($offerId);
            if ($offer['approval_status'] !== 'approved' || $offer['status'] !== 'active') {
                throw new InvalidArgumentException('Offer must be approved and active to assign');
            }

            $marginOverride = $options['affiliate_margin_pct'] ?? null;
            if ($marginOverride !== null) {
                $this->validateMarginOverride($offer, $marginOverride);
            }

            $protectedPayout = $this->calculateAssignmentPayout($offer, $marginOverride);

            // Use affiliate_id = 0 to represent global assignment.
            // If the schema enforces FK on 1ai_affiliates(id), caller should set up a system affiliate 0
            // or adjust the schema. We keep 0 for semantic correctness.
            $globalAffiliateId = 0;

            $stmt = $this->db->prepare("
                INSERT INTO 1ai_offer_assignments
                (offer_id, affiliate_id, am_user_id, assignment_type, is_active,
                 affiliate_margin_pct, affiliate_payout, cap_daily_override, cap_monthly_override,
                 notes, assigned_by, created_at, updated_at)
                VALUES (?, ?, ?, 'global', 1, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    am_user_id = VALUES(am_user_id),
                    is_active = VALUES(is_active),
                    affiliate_margin_pct = VALUES(affiliate_margin_pct),
                    affiliate_payout = VALUES(affiliate_payout),
                    cap_daily_override = VALUES(cap_daily_override),
                    cap_monthly_override = VALUES(cap_monthly_override),
                    notes = VALUES(notes),
                    updated_at = NOW()
            ");

            $stmt->execute([
                $offerId,
                $globalAffiliateId,
                $amUserId,
                $marginOverride,
                $protectedPayout['max_payout'],
                $options['cap_daily_override'] ?? null,
                $options['cap_monthly_override'] ?? null,
                $options['notes'] ?? null,
                $amUserId,
            ]);

            $assignmentId = (int) $this->db->lastInsertId();
            if ($assignmentId === 0) {
                $stmt = $this->db->prepare("
                    SELECT id FROM 1ai_offer_assignments
                    WHERE offer_id = ? AND affiliate_id = 0 AND assignment_type = 'global'
                ");
                $stmt->execute([$offerId]);
                $assignmentId = (int) $stmt->fetchColumn();
            }

            $this->logAssignment($assignmentId, $amUserId, 'global_assigned', $options['notes'] ?? null);

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'assignment_id' => $assignmentId,
                'offer_id' => $offerId,
                'assignment_type' => 'global',
                'affiliate_payout' => $protectedPayout['max_payout'],
                'margin_pct' => $protectedPayout['margin_pct'],
                'message' => 'Offer assigned globally'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to assign offer globally: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Remove offer assignment
     *
     * @param int $amUserId AM user ID
     * @param int $assignmentId Assignment ID
     * @return array Removal result
     */
    public function removeAssignment(int $amUserId, int $assignmentId): array
    {
        $inTransaction = $this->db->inTransaction();
        if (!$inTransaction) {
            $this->db->beginTransaction();
        }

        try {
            $stmt = $this->db->prepare("
                SELECT * FROM 1ai_offer_assignments WHERE id = ?
            ");
            $stmt->execute([$assignmentId]);
            $assignment = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$assignment) {
                throw new InvalidArgumentException('Assignment not found');
            }

            if ((int) $assignment['am_user_id'] !== $amUserId) {
                throw new InvalidArgumentException('Not authorized to remove this assignment');
            }

            $stmt = $this->db->prepare("
                UPDATE 1ai_offer_assignments
                SET is_active = 0, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$assignmentId]);

            $this->logAssignment($assignmentId, $amUserId, 'removed');

            if (!$inTransaction) {
                $this->db->commit();
            }

            return [
                'success' => true,
                'assignment_id' => $assignmentId,
                'message' => 'Assignment removed'
            ];
        } catch (PDOException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw new RuntimeException("Failed to remove assignment: " . $e->getMessage());
        } catch (InvalidArgumentException $e) {
            if (!$inTransaction) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Get assignments for an offer
     *
     * @param int $offerId Offer ID
     * @return array Assignments
     */
    public function getOfferAssignments(int $offerId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT oa.*,
                       a.affiliate_code,
                       u.user_name as affiliate_name,
                       u.user_email as affiliate_email,
                       am.user_name as am_name
                FROM 1ai_offer_assignments oa
                LEFT JOIN 1ai_affiliates a ON a.id = oa.affiliate_id
                LEFT JOIN 1ai_users u ON a.user_id = u.user_id
                LEFT JOIN 1ai_users am ON am.user_id = oa.am_user_id
                WHERE oa.offer_id = ?
                ORDER BY oa.created_at DESC
            ");
            $stmt->execute([$offerId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException("Failed to get assignments: " . $e->getMessage());
        }
    }

    /**
     * Get offers assigned to affiliate
     *
     * @param int $affiliateId Affiliate ID
     * @return array Assigned offers
     */
    public function getAffiliateOffers(int $affiliateId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT o.*,
                       oa.assignment_type,
                       oa.affiliate_payout,
                       oa.affiliate_margin_pct,
                       oa.cap_daily_override,
                       oa.cap_monthly_override,
                       oa.expires_at,
                       am.user_name as am_name
                FROM 1ai_offer_assignments oa
                JOIN 1ai_offers o ON o.id = oa.offer_id
                LEFT JOIN 1ai_users am ON am.user_id = oa.am_user_id
                WHERE (oa.affiliate_id = ? OR oa.affiliate_id = 0)
                AND oa.is_active = 1
                AND o.status = 'active'
                AND o.approval_status = 'approved'
                AND (oa.expires_at IS NULL OR oa.expires_at > NOW())
                ORDER BY o.created_at DESC
            ");
            $stmt->execute([$affiliateId]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException("Failed to get affiliate offers: " . $e->getMessage());
        }
    }

    /**
     * Check if offer is assigned to affiliate with details
     *
     * @param int $offerId Offer ID
     * @param int $affiliateId Affiliate ID
     * @return array|null Assignment details or null
     */
    public function getAssignmentForAffiliate(int $offerId, int $affiliateId): ?array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM 1ai_offer_assignments
                WHERE offer_id = ?
                AND (affiliate_id = ? OR affiliate_id = 0)
                AND is_active = 1
                AND (expires_at IS NULL OR expires_at > NOW())
                ORDER BY assignment_type DESC
                LIMIT 1
            ");
            $stmt->execute([$offerId, $affiliateId]);

            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException("Failed to check assignment: " . $e->getMessage());
        }
    }

    /**
     * Validate margin override
     *
     * @param array $offer Offer data
     * @param float $marginOverridePct Margin override percentage
     * @throws InvalidArgumentException If invalid
     */
    private function validateMarginOverride(array $offer, float $marginOverridePct): void
    {
        if ($marginOverridePct < 0 || $marginOverridePct > 100) {
            throw new InvalidArgumentException('Margin override must be between 0 and 100');
        }

        $floor = (float) ($offer['margin_floor_pct'] ?? 5.00);

        if ($marginOverridePct < $floor) {
            throw new InvalidArgumentException(
                "Margin override {$marginOverridePct}% is below offer safety floor {$floor}%"
            );
        }

        $revenue = (float) ($offer['network_payout'] ?? 0);
        $payout = (float) ($offer['payout'] ?? 0);

        if ($revenue > 0) {
            $offerMargin = (($revenue - $payout) / $revenue) * 100;
            if ($marginOverridePct > $offerMargin) {
                throw new InvalidArgumentException(
                    "Margin override cannot exceed offer margin of {$offerMargin}%"
                );
            }
        }
    }

    /**
     * Calculate assignment payout with margin protection
     *
     * @param array $offer Offer data
     * @param float|null $marginOverridePct Optional margin override
     * @return array Payout calculation
     */
    private function calculateAssignmentPayout(array $offer, ?float $marginOverridePct): array
    {
        $revenue = (float) ($offer['network_payout'] ?? 0);
        $basePayout = (float) ($offer['payout'] ?? 0);
        $floor = (float) ($offer['margin_floor_pct'] ?? 5.00);

        if ($marginOverridePct !== null) {
            $effectiveMargin = max($marginOverridePct, $floor);
            $maxPayout = $revenue * (1 - ($effectiveMargin / 100));
            return [
                'max_payout' => round($maxPayout, 2),
                'margin_pct' => round($effectiveMargin, 2),
                'base_payout' => $basePayout,
            ];
        }

        return [
            'max_payout' => $basePayout,
            'margin_pct' => $revenue > 0
                ? round((($revenue - $basePayout) / $revenue) * 100, 2)
                : 0,
            'base_payout' => $basePayout,
        ];
    }

    /**
     * Check if affiliate is active
     *
     * @param int $affiliateId Affiliate ID
     * @return bool True if active
     */
    private function isAffiliateActive(int $affiliateId): bool
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*)
            FROM 1ai_affiliates a
            JOIN 1ai_users u ON u.user_id = a.user_id
            WHERE a.id = ? AND u.user_active = 1 AND u.user_deleted = 0
        ");
        $stmt->execute([$affiliateId]);

        return (bool) $stmt->fetchColumn();
    }

    /**
     * Get offer by ID
     *
     * @param int $offerId Offer ID
     * @return array Offer data
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
     * Log assignment action
     *
     * @param int $assignmentId Assignment ID
     * @param int $userId User ID
     * @param string $action Action
     * @param string|null $notes Optional notes
     */
    private function logAssignment(int $assignmentId, int $userId, string $action, ?string $notes = null): void
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO 1ai_assignment_history
                (assignment_id, user_id, action, notes, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$assignmentId, $userId, $action, $notes]);
        } catch (PDOException $e) {
            error_log("Failed to log assignment: " . $e->getMessage());
        }
    }
}