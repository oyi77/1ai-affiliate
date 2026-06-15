<?php
/**
 * Role-Based Access Control (RBAC) Service
 * 
 * Implements strict role-based permissions for AdTech platform:
 * - Admin: Full system access
 * - Account Manager (AM): Margin safety, affiliate assignments
 * - Offer Manager (OM): Offer vetting and approval
 * - Advertiser: Offer creation, own resource management
 * - Publisher: Smartlink generation, traffic driving
 * 
 * @package AdTech\RBAC
 * @version 2.0.0
 */

declare(strict_types=1);

namespace OneAIAffiliate\RBAC;

use PDO;
use PDOException;
use InvalidArgumentException;

class RBACService
{
    private const ROLE_HIERARCHY = [
        'admin' => 100,
        'am' => 70,
        'om' => 60,
        'advertiser' => 40,
        'publisher' => 20,
        'affiliate' => 20,
    ];

    private const PERMISSIONS = [
        'admin' => [
            'offers' => ['create', 'read', 'update', 'delete', 'approve', 'assign'],
            'affiliates' => ['create', 'read', 'update', 'delete', 'assign'],
            'conversions' => ['read', 'update', 'delete'],
            'margin' => ['read', 'update', 'override'],
            'reports' => ['read', 'export', 'all_affiliates'],
            'settings' => ['read', 'update'],
            'fraud' => ['read', 'configure', 'blacklist'],
        ],
        'am' => [
            'offers' => ['read', 'assign'],
            'affiliates' => ['read', 'assign'],
            'conversions' => ['read'],
            'margin' => ['read', 'override'],
            'reports' => ['read', 'assigned_affiliates'],
            'fraud' => ['read'],
        ],
        'om' => [
            'offers' => ['read', 'approve', 'reject'],
            'affiliates' => [],
            'conversions' => [],
            'margin' => ['read'],
            'reports' => ['pending_offers'],
            'fraud' => [],
        ],
        'advertiser' => [
            'offers' => ['create', 'read_own', 'update_own'],
            'affiliates' => [],
            'conversions' => ['read_own'],
            'margin' => [],
            'reports' => ['own_offers'],
            'fraud' => [],
        ],
        'publisher' => [
            'offers' => ['read_assigned'],
            'affiliates' => ['read_own'],
            'conversions' => ['read_own'],
            'margin' => [],
            'reports' => ['own_performance'],
            'fraud' => [],
            'smartlinks' => ['create', 'read_own'],
        ],
    ];

    private PDO $db;
    private array $cache = [];
    private int $cacheTTL = 300; // 5 minutes

    public function __construct(PDO $database)
    {
        $this->db = $database;
    }

    /**
     * Check if user has permission for action on resource
     * 
     * @param int $userId User ID
     * @param string $resource Resource name (offers, affiliates, etc.)
     * @param string $action Action name (create, read, update, etc.)
     * @param int|null $resourceOwnerId Optional resource owner ID for ownership checks
     * @return bool True if authorized
     * @throws InvalidArgumentException If invalid parameters
     */
    public function can(int $userId, string $resource, string $action, ?int $resourceOwnerId = null): bool
    {
        if (empty($resource) || empty($action)) {
            throw new InvalidArgumentException('Resource and action are required');
        }

        // Get user role from cache or database
        $role = $this->getUserRole($userId);
        if ($role === null) {
            return false;
        }

        // Check if role has the permission
        $permissions = self::PERMISSIONS[$role] ?? [];
        $resourcePermissions = $permissions[$resource] ?? [];

        // Direct permission check
        if (in_array($action, $resourcePermissions, true)) {
            return true;
        }

        // Ownership-based permission check (e.g., read_own, update_own)
        $ownAction = $action . '_own';
        if (in_array($ownAction, $resourcePermissions, true)) {
            // User must be the owner of the resource
            if ($resourceOwnerId !== null && $resourceOwnerId === $userId) {
                return true;
            }
        }

        // Assigned resource check (e.g., read_assigned)
        $assignedAction = $action . '_assigned';
        if (in_array($assignedAction, $resourcePermissions, true)) {
            return $this->isResourceAssigned($userId, $resource, $resourceOwnerId);
        }

        return false;
    }

    /**
     * Check if user role meets minimum role requirement
     * 
     * @param int $userId User ID
     * @param string $minimumRole Minimum required role
     * @return bool True if user role is at or above minimum
     */
    public function hasRole(int $userId, string $minimumRole): bool
    {
        $userRole = $this->getUserRole($userId);
        if ($userRole === null) {
            return false;
        }

        $userLevel = self::ROLE_HIERARCHY[$userRole] ?? 0;
        $minLevel = self::ROLE_HIERARCHY[$minimumRole] ?? 0;

        return $userLevel >= $minLevel;
    }

    /**
     * Get all permissions for a user
     * 
     * @param int $userId User ID
     * @return array Permissions array
     */
    public function getPermissions(int $userId): array
    {
        $role = $this->getUserRole($userId);
        if ($role === null) {
            return [];
        }

        return self::PERMISSIONS[$role] ?? [];
    }

    /**
     * Check if affiliate is assigned to AM
     * 
     * @param int $amUserId AM user ID
     * @param int $affiliateId Affiliate ID
     * @return bool True if assigned
     */
    public function isAffiliateAssignedToAM(int $amUserId, int $affiliateId): bool
    {
        $cacheKey = "am_assignment:{$amUserId}:{$affiliateId}";
        
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM 1ai_am_assignments 
                WHERE am_user_id = ? AND affiliate_id = ? 
                AND (assignment_type = 'primary' OR (assignment_type = 'temp' AND expires_at > NOW()))
            ");
            $stmt->execute([$amUserId, $affiliateId]);
            $isAssigned = (bool) $stmt->fetchColumn();

            $this->cache[$cacheKey] = $isAssigned;
            
            return $isAssigned;
        } catch (PDOException $e) {
            error_log("RBAC AM assignment check failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if offer is assigned to publisher
     * 
     * @param int $publisherUserId Publisher user ID
     * @param int $offerId Offer ID
     * @return bool True if assigned
     */
    public function isOfferAssignedToPublisher(int $publisherUserId, int $offerId): bool
    {
        $cacheKey = "offer_assignment:{$publisherUserId}:{$offerId}";
        
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        try {
            // Check if offer is globally assigned (visible to all)
            $stmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM 1ai_offer_assignments 
                WHERE offer_id = ? AND assignment_type = 'global' AND is_active = 1
            ");
            $stmt->execute([$offerId]);
            if ((int) $stmt->fetchColumn() > 0) {
                $this->cache[$cacheKey] = true;
                return true;
            }

            // Check if offer is specifically assigned to this publisher
            $stmt = $this->db->prepare("
                SELECT COUNT(*) 
                FROM 1ai_offer_assignments oa
                JOIN 1ai_affiliates a ON a.id = oa.affiliate_id
                WHERE oa.offer_id = ? AND a.user_id = ? AND oa.is_active = 1
                AND (oa.expires_at IS NULL OR oa.expires_at > NOW())
            ");
            $stmt->execute([$offerId, $publisherUserId]);
            $isAssigned = (bool) $stmt->fetchColumn();

            $this->cache[$cacheKey] = $isAssigned;
            
            return $isAssigned;
        } catch (PDOException $e) {
            error_log("RBAC offer assignment check failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get user role from database
     * 
     * @param int $userId User ID
     * @return string|null Role name or null if not found
     */
    private function getUserRole(int $userId): ?string
    {
        $cacheKey = "user_role:{$userId}";
        
        if (isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        try {
            $stmt = $this->db->prepare(
                "SELECT user_role FROM 1ai_users WHERE user_id = ? AND user_active = 1 AND user_deleted = 0"
            );
            $stmt->execute([$userId]);
            $role = $stmt->fetchColumn();

            if ($role) {
                $this->cache[$cacheKey] = $role;
            }

            return $role ?: null;
        } catch (PDOException $e) {
            error_log("RBAC role lookup failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if resource is assigned to user
     * 
     * @param int $userId User ID
     * @param string $resource Resource type
     * @param int|null $resourceId Resource ID
     * @return bool True if assigned
     */
    private function isResourceAssigned(int $userId, string $resource, ?int $resourceId): bool
    {
        if ($resourceId === null) {
            return false;
        }

        switch ($resource) {
            case 'offers':
                return $this->isOfferAssignedToPublisher($userId, $resourceId);
            case 'affiliates':
                return $this->isAffiliateAssignedToAM($userId, $resourceId);
            default:
                return false;
        }
    }

    /**
     * Clear cache for user
     * 
     * @param int $userId User ID
     */
    public function clearUserCache(int $userId): void
    {
        unset($this->cache["user_role:{$userId}"]);
        // Clear related caches
        foreach (array_keys($this->cache) as $key) {
            if (strpos($key, ":{$userId}:") !== false || strpos($key, "{$userId}:") === 0) {
                unset($this->cache[$key]);
            }
        }
    }

    /**
     * Clear all cache
     */
    public function clearCache(): void
    {
        $this->cache = [];
    }

    /**
     * Validate margin is above safety floor
     * 
     * @param float $marginFloorPct Margin floor percentage
     * @return array ["valid" => bool, "margin_pct" => float, "message" => string]
     */
    public function validateMarginSafety(float $revenue, float $payout, float $marginFloorPct): array
    {
        if ($revenue <= 0) {
            return [
                "valid" => false,
                "margin_pct" => 0,
                "message" => "Revenue must be greater than zero"
            ];
        }

        if ($payout < 0) {
            return [
                "valid" => false,
                "margin_pct" => 0,
                "message" => "Payout cannot be negative"
            ];
        }

        if ($payout > $revenue) {
            return [
                "valid" => false,
                "margin_pct" => round((($revenue - $payout) / $revenue) * 100, 2),
                "message" => "Payout exceeds revenue - negative margin"
            ];
        }

        $marginPct = (($revenue - $payout) / $revenue) * 100;

        if ($marginPct < $marginFloorPct) {
            return [
                "valid" => false,
                "margin_pct" => round($marginPct, 2),
                "message" => "Margin {$marginPct}% is below safety floor of {$marginFloorPct}%"
            ];
        }

        return [
            "valid" => true,
            "margin_pct" => round($marginPct, 2),
            "message" => "Margin is within safety limits"
        ];
    }
    /**
     * Calculate payout with margin protection
     *
     * @param float $revenue Revenue amount
     * @param float $marginFloorPct Minimum margin percentage
     * @param float|null $affiliateMarginOverride Optional affiliate-specific margin
     * @return array ['max_payout' => float, 'margin_pct' => float, 'protected' => bool]
     */
    public function calculateProtectedPayout(float $revenue, float $marginFloorPct, ?float $affiliateMarginOverride = null): array
    {
        $effectiveMarginPct = $affiliateMarginOverride ?? $marginFloorPct;


        // Ensure margin floor doesn't exceed 100%
        $effectiveMarginPct = min($effectiveMarginPct, 99.99);

        $maxPayout = $revenue * (1 - ($effectiveMarginPct / 100));

        return [
            'max_payout' => round($maxPayout, 2),
            'margin_pct' => round($effectiveMarginPct, 2),
            'protected' => true
        ];
    }
}