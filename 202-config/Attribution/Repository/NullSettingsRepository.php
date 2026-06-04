<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Repository;

use OneAIAffiliate\Attribution\ScopeType;
use OneAIAffiliate\Attribution\Settings\Setting;

final class NullSettingsRepository implements SettingsRepositoryInterface
{
    public function findByScope(int $userId, ScopeType $scopeType, ?int $scopeId): ?Setting
    {
        return null;
    }

    public function findForScopes(int $userId, array $scopes): array
    {
        return [];
    }

    public function save(Setting $setting): Setting
    {
        return $setting;
    }

    public function findDisabledSettings(): array
    {
        return [];
    }
}
