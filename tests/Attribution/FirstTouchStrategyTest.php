<?php

declare(strict_types=1);

namespace Tests\Attribution;

use PHPUnit\Framework\TestCase;
use OneAIAffiliate\Attribution\Calculation\ConversionBatch;
use OneAIAffiliate\Attribution\Calculation\ConversionRecord;
use OneAIAffiliate\Attribution\Calculation\ConversionTouchpoint;
use OneAIAffiliate\Attribution\Calculation\FirstTouchStrategy;
use OneAIAffiliate\Attribution\ModelDefinition;
use OneAIAffiliate\Attribution\ModelType;

final class FirstTouchStrategyTest extends TestCase
{
    private function makeModel(): ModelDefinition
    {
        $ts = strtotime('2024-01-01 12:00:00');
        return new ModelDefinition(
            modelId:         20,
            userId:          1,
            name:            'First Touch',
            slug:            'first-touch',
            type:            ModelType::FIRST_TOUCH,
            weightingConfig: [],
            isActive:        true,
            isDefault:       false,
            createdAt:       $ts,
            updatedAt:       $ts
        );
    }

    public function test_empty_batch_returns_empty_result(): void
    {
        $ts = strtotime('2024-01-01 12:00:00');
        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts - 3600,
            endTime:     $ts,
            conversions: []
        );
        $result = (new FirstTouchStrategy())->calculate($this->makeModel(), $batch);
        self::assertEmpty($result->snapshotsByHour);
        self::assertEmpty($result->touchpointsByHour);
    }

    public function test_direct_conversion_credits_conversion_click(): void
    {
        $ts = strtotime('2024-01-01 12:30:00');
        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts - 3600,
            endTime:     $ts + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 201,
                    clickId:      2001,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts,
                    clickTime:    $ts - 300,
                    clickPayout:  20.00,
                    clickCost:    5.00
                ),
            ]
        );

        $result = (new FirstTouchStrategy())->calculate($this->makeModel(), $batch);
        $bucket = (int) ($ts - ($ts % 3600));

        self::assertArrayHasKey($bucket, $result->snapshotsByHour);
        $snap = $result->snapshotsByHour[$bucket];
        self::assertSame(1, $snap->attributedConversions);
        self::assertSame(1, $snap->attributedClicks);
        self::assertEquals(20.00, $snap->attributedRevenue);
        self::assertEquals(5.00,  $snap->attributedCost);

        self::assertCount(1, $result->touchpointsByHour[$bucket]);
        $touch = $result->touchpointsByHour[$bucket][0];
        self::assertSame(2001,  $touch->clickId);
        self::assertEquals(1.0, $touch->credit);
        self::assertSame(0,     $touch->position);
    }

    public function test_first_touch_gets_full_credit_in_journey(): void
    {
        $ts = strtotime('2024-01-01 14:00:00');
        $journey = [
            new ConversionTouchpoint(clickId: 3001, clickTime: $ts - 7200),
            new ConversionTouchpoint(clickId: 3002, clickTime: $ts - 3600),
            new ConversionTouchpoint(clickId: 3003, clickTime: $ts -  600),
        ];
        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts - 10000,
            endTime:     $ts + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 301,
                    clickId:      3003,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts,
                    clickTime:    $ts - 600,
                    clickPayout:  30.00,
                    clickCost:    9.00,
                    journey:      $journey
                ),
            ]
        );

        $result = (new FirstTouchStrategy())->calculate($this->makeModel(), $batch);
        $bucket = (int) ($ts - ($ts % 3600));
        $snap   = $result->snapshotsByHour[$bucket];

        self::assertSame(1, $snap->attributedClicks);
        self::assertSame(1, $snap->attributedConversions);
        self::assertEquals(30.00, $snap->attributedRevenue);
        self::assertEquals(9.00,  $snap->attributedCost);

        // Only position 0 is recorded
        self::assertCount(1, $result->touchpointsByHour[$bucket]);
        $touch = $result->touchpointsByHour[$bucket][0];
        self::assertSame(3001,  $touch->clickId);
        self::assertEquals(1.0, $touch->credit);
        self::assertSame(0,     $touch->position);
    }

    public function test_aggregates_across_hourly_buckets(): void
    {
        $ts1 = strtotime('2024-01-01 10:30:00');
        $ts2 = strtotime('2024-01-01 11:30:00');

        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts1 - 3600,
            endTime:     $ts2 + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 401,
                    clickId:      4001,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts1,
                    clickTime:    $ts1 - 300,
                    clickPayout:  10.00,
                    clickCost:    2.00
                ),
                new ConversionRecord(
                    conversionId: 402,
                    clickId:      4002,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts2,
                    clickTime:    $ts2 - 300,
                    clickPayout:  15.00,
                    clickCost:    3.00
                ),
            ]
        );

        $result = (new FirstTouchStrategy())->calculate($this->makeModel(), $batch);
        $b1 = (int) ($ts1 - ($ts1 % 3600));
        $b2 = (int) ($ts2 - ($ts2 % 3600));

        self::assertCount(2, $result->snapshotsByHour);
        self::assertEquals(10.00, $result->snapshotsByHour[$b1]->attributedRevenue);
        self::assertEquals(15.00, $result->snapshotsByHour[$b2]->attributedRevenue);
    }
}
