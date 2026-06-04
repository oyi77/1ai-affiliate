<?php

declare(strict_types=1);

namespace OneAIAffiliate\Click;

final class NullClickRepository implements ClickRepositoryInterface
{
    public function allocateClickId(): int
    {
        return 0;
    }

    public function recordClick(ClickRecord $click): int
    {
        return 0;
    }
}
