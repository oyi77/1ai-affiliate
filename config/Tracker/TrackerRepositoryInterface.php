<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracker;

interface TrackerRepositoryInterface
{
    /**
     * Fetch full tracker detail by public ID (for click redirect hot path).
     *
     * Joins: trackers, users_pref, users, aff_campaigns,
     *        ppc_accounts, ppc_network_variables.
     *
     * @return array<string, mixed>|null Tracker row or null if not found
     */
    public function findByPublicId(string $publicId): ?array;

    /**
     * Fetch a tracker by internal ID scoped to a user.
     *
     * @return array<string, mixed>|null Tracker row or null if not found/unowned
     */
    public function findById(int $trackerId, int $userId): ?array;

    /**
     * Fetch the configured tracking domain for a user.
     *
     * @return string|null Domain or null if not configured
     */
    public function findTrackingDomain(int $userId): ?string;
}
