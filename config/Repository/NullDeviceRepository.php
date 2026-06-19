<?php

declare(strict_types=1);

namespace OneAIAffiliate\Repository;

final class NullDeviceRepository implements DeviceRepositoryInterface
{
    /** @var array<string, int> */
    private array $browsers = [];

    /** @var array<string, int> */
    private array $platforms = [];

    /** @var array<string, int> */
    private array $devices = [];

    private int $nextId = 1;

    public function findOrCreateBrowser(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        return $this->browsers[$name] ??= $this->nextId++;
    }

    public function findOrCreatePlatform(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        return $this->platforms[$name] ??= $this->nextId++;
    }

    public function findOrCreateDevice(string $name): int
    {
        if ($name === '') {
            return 0;
        }

        return $this->devices[$name] ??= $this->nextId++;
    }
}
