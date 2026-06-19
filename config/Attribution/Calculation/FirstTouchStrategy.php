<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution\Calculation;

use OneAIAffiliate\Attribution\ModelDefinition;
use OneAIAffiliate\Attribution\ScopeType;
use OneAIAffiliate\Attribution\Snapshot;
use OneAIAffiliate\Attribution\Touchpoint;

/**
 * First-touch attribution: 100% credit goes to the first touchpoint in the journey.
 * If there is no journey (direct conversion), credit goes to the conversion click itself.
 */
final class FirstTouchStrategy implements AttributionStrategyInterface
{
    public function calculate(ModelDefinition $model, ConversionBatch $batch): CalculationResult
    {
        if ($batch->isEmpty()) {
            return new CalculationResult([], []);
        }

        $snapshotsByHour  = [];
        $touchpointsByHour = [];
        $createdAt = time();

        foreach ($batch->conversions as $conversion) {
            $bucket = (int) ($conversion->convTime - ($conversion->convTime % 3600));

            if (!isset($snapshotsByHour[$bucket])) {
                $snapshotsByHour[$bucket] = new Snapshot(
                    snapshotId:           null,
                    modelId:              (int) ($model->modelId ?? 0),
                    userId:               $batch->userId,
                    scopeType:            ScopeType::GLOBAL,
                    scopeId:              null,
                    dateHour:             $bucket,
                    lookbackStart:        $batch->startTime,
                    lookbackEnd:          $batch->endTime,
                    attributedClicks:     0,
                    attributedConversions: 0,
                    attributedRevenue:    0.0,
                    attributedCost:       0.0,
                    createdAt:            $createdAt
                );
                $touchpointsByHour[$bucket] = [];
            }

            $journey    = $conversion->getJourney();
            $touchCount = count($journey);

            if ($touchCount === 0) {
                // Direct conversion — no prior clicks, credit the conversion click
                $attributedClicks  = 1;
                $attributedRevenue = $conversion->clickPayout;
                $attributedCost    = $conversion->clickCost;
                $touchpointsByHour[$bucket][] = new Touchpoint(
                    touchpointId: null,
                    snapshotId:   null,
                    conversionId: $conversion->conversionId,
                    clickId:      $conversion->clickId,
                    position:     0,
                    credit:       1.0,
                    weight:       1.0,
                    createdAt:    $createdAt
                );
            } else {
                $attributedClicks  = 0;
                $attributedRevenue = 0.0;
                $attributedCost    = 0.0;
                // First touch = position 0 gets 100% credit; all others get 0
                foreach ($journey as $position => $touch) {
                    $credit = ($position === 0) ? 1.0 : 0.0;
                    if ($credit <= 0.0) {
                        continue;
                    }
                    $attributedClicks++;
                    $attributedRevenue += $conversion->clickPayout * $credit;
                    $attributedCost    += $conversion->clickCost   * $credit;
                    $touchpointsByHour[$bucket][] = new Touchpoint(
                        touchpointId: null,
                        snapshotId:   null,
                        conversionId: $conversion->conversionId,
                        clickId:      $touch->clickId,
                        position:     $position,
                        credit:       $credit,
                        weight:       $credit,
                        createdAt:    $createdAt
                    );
                }
            }

            $snapshot = $snapshotsByHour[$bucket];
            $snapshotsByHour[$bucket] = new Snapshot(
                snapshotId:           null,
                modelId:              $snapshot->modelId,
                userId:               $snapshot->userId,
                scopeType:            $snapshot->scopeType,
                scopeId:              $snapshot->scopeId,
                dateHour:             $snapshot->dateHour,
                lookbackStart:        $snapshot->lookbackStart,
                lookbackEnd:          $snapshot->lookbackEnd,
                attributedClicks:     $snapshot->attributedClicks     + $attributedClicks,
                attributedConversions: $snapshot->attributedConversions + 1,
                attributedRevenue:    $snapshot->attributedRevenue    + $attributedRevenue,
                attributedCost:       $snapshot->attributedCost       + $attributedCost,
                createdAt:            $snapshot->createdAt
            );
        }

        return new CalculationResult($snapshotsByHour, $touchpointsByHour);
    }
}
