<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracker;

final class InMemoryTrackerRepository implements TrackerRepositoryInterface
{
    /** @var array<string, array<string, mixed>> Keyed by public ID */
    private array $trackers = [];

    /** @var array<int, array<string, mixed>> Keyed by internal tracker ID */
    private array $trackersById = [];

    /** @var array<int, string> Keyed by user ID */
    private array $trackingDomains = [];

    /**
     * @param array<string, mixed> $row
     */
    public function addTracker(string $publicId, array $row): void
    {
        $this->trackers[$publicId] = $row;
    }

    /**
     * @param array<string, mixed> $row
     */
    public function addTrackerById(int $trackerId, string $publicId, int $userId, array $row = []): void
    {
        $row['tracker_id'] = $trackerId;
        $row['tracker_id_public'] = $publicId;
        $row['user_id'] = $userId;
        $this->trackersById[$trackerId] = $row;
        $this->trackers[$publicId] = $row;
    }

    public function setTrackingDomain(int $userId, string $domain): void
    {
        $this->trackingDomains[$userId] = $domain;
    }

    public function findByPublicId(string $publicId): ?array
    {
        return $this->trackers[$publicId] ?? null;
    }

    public function findById(int $trackerId, int $userId): ?array
    {
        $row = $this->trackersById[$trackerId] ?? null;
        if ($row === null || ($row['user_id'] ?? null) !== $userId) {
            return null;
        }

        return $row;
    }

    public function findTrackingDomain(int $userId): ?string
    {
        $domain = $this->trackingDomains[$userId] ?? null;
        if (!is_string($domain) || $domain === '') {
            return null;
        }

        return $domain;
    }
}
