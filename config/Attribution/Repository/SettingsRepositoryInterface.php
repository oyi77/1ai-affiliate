<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Repository;

use OneAIAffiliate\Attribution\ScopeType;
use OneAIAffiliate\Attribution\Settings\Setting;

interface SettingsRepositoryInterface
{
    public function findByScope(int $userId, ScopeType $scopeType, ?int $scopeId): ?Setting;

    /**
     * @param list<array{type: ScopeType, id: ?int}> $scopes
     * @return array<string, Setting>
     */
    public function findForScopes(int $userId, array $scopes): array;

    public function save(Setting $setting): Setting;

    /**
     * @return Setting[]
     */
    public function findDisabledSettings(): array;
}
