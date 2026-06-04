<?php

declare(strict_types=1);

namespace OneAIAffiliate\Tracker;

final class InMemoryTrackerRepository implements TrackerRepositoryInterface
{
    /** @var array<string, array<string, mixed>> Keyed by public ID */
    private array $trackers = [];

    /**
     * @param array<string, mixed> $row
     */
    public function addTracker(string $publicId, array $row): void
    {
        $this->trackers[$publicId] = $row;
    }

    public function findByPublicId(string $publicId): ?array
    {
        return $this->trackers[$publicId] ?? null;
    }
}
