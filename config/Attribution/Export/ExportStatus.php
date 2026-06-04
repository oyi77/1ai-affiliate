<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Export;

enum ExportStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
}
