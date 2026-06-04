<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Calculation;

use OneAIAffiliate\Attribution\ModelDefinition;
use OneAIAffiliate\Attribution\Snapshot;
use OneAIAffiliate\Attribution\Touchpoint;

/**
 * Calculates attribution metrics for a cohort of conversions.
 */
interface AttributionStrategyInterface
{
    /**
     * @param ModelDefinition $model    The attribution model being executed.
     * @param ConversionBatch $batch    Conversions to process for a specific timeframe.
     *
     * @return CalculationResult        Aggregated snapshot data plus touchpoint records.
     */
    public function calculate(ModelDefinition $model, ConversionBatch $batch): CalculationResult;
}
