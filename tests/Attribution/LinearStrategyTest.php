<?php

declare(strict_types=1);

namespace Tests\Attribution;

use PHPUnit\Framework\TestCase;
use OneAIAffiliate\Attribution\Calculation\ConversionBatch;
use OneAIAffiliate\Attribution\Calculation\ConversionRecord;
use OneAIAffiliate\Attribution\Calculation\ConversionTouchpoint;
use OneAIAffiliate\Attribution\Calculation\LinearStrategy;
use OneAIAffiliate\Attribution\ModelDefinition;
use OneAIAffiliate\Attribution\ModelType;

final class LinearStrategyTest extends TestCase
{
    private function makeModel(): ModelDefinition
    {
        $ts = strtotime('2024-01-01 12:00:00');
        return new ModelDefinition(
            modelId:         30,
            userId:          1,
            name:            'Linear',
            slug:            'linear',
            type:            ModelType::LINEAR,
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
        $result = (new LinearStrategy())->calculate($this->makeModel(), $batch);
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
                    conversionId: 501,
                    clickId:      5001,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts,
                    clickTime:    $ts - 300,
                    clickPayout:  30.00,
                    clickCost:    6.00
                ),
            ]
        );

        $result = (new LinearStrategy())->calculate($this->makeModel(), $batch);
        $bucket = (int) ($ts - ($ts % 3600));
        $snap   = $result->snapshotsByHour[$bucket];

        self::assertSame(1, $snap->attributedConversions);
        self::assertEquals(30.00, $snap->attributedRevenue);
        self::assertEquals(6.00,  $snap->attributedCost);

        self::assertCount(1, $result->touchpointsByHour[$bucket]);
        self::assertEquals(1.0, $result->touchpointsByHour[$bucket][0]->credit);
    }

    public function test_three_touch_journey_splits_credit_equally(): void
    {
        $ts = strtotime('2024-01-01 14:00:00');
        $journey = [
            new ConversionTouchpoint(clickId: 6001, clickTime: $ts - 7200),
            new ConversionTouchpoint(clickId: 6002, clickTime: $ts - 3600),
            new ConversionTouchpoint(clickId: 6003, clickTime: $ts -  600),
        ];
        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts - 10000,
            endTime:     $ts + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 601,
                    clickId:      6003,
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

        $result = (new LinearStrategy())->calculate($this->makeModel(), $batch);
        $bucket = (int) ($ts - ($ts % 3600));
        $snap   = $result->snapshotsByHour[$bucket];

        self::assertSame(3, $snap->attributedClicks);
        self::assertSame(1, $snap->attributedConversions);
        self::assertEquals(30.00, $snap->attributedRevenue);
        self::assertEquals(9.00,  $snap->attributedCost);

        self::assertCount(3, $result->touchpointsByHour[$bucket]);
        foreach ($result->touchpointsByHour[$bucket] as $touch) {
            self::assertEqualsWithDelta(1 / 3, $touch->credit, 0.0001);
        }
    }

    public function test_two_touch_journey_splits_credit_50_50(): void
    {
        $ts = strtotime('2024-01-01 09:00:00');
        $journey = [
            new ConversionTouchpoint(clickId: 7001, clickTime: $ts - 3600),
            new ConversionTouchpoint(clickId: 7002, clickTime: $ts -  300),
        ];
        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts - 7200,
            endTime:     $ts + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 701,
                    clickId:      7002,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts,
                    clickTime:    $ts - 300,
                    clickPayout:  20.00,
                    clickCost:    4.00,
                    journey:      $journey
                ),
            ]
        );

        $result = (new LinearStrategy())->calculate($this->makeModel(), $batch);
        $bucket = (int) ($ts - ($ts % 3600));
        $snap   = $result->snapshotsByHour[$bucket];

        self::assertSame(2, $snap->attributedClicks);
        self::assertEquals(20.00, $snap->attributedRevenue);
        self::assertEquals(4.00,  $snap->attributedCost);

        self::assertCount(2, $result->touchpointsByHour[$bucket]);
        foreach ($result->touchpointsByHour[$bucket] as $touch) {
            self::assertEquals(0.5, $touch->credit);
        }
    }

    public function test_aggregates_revenue_across_hourly_buckets(): void
    {
        $ts1 = strtotime('2024-01-01 10:30:00');
        $ts2 = strtotime('2024-01-01 11:30:00');

        $batch = new ConversionBatch(
            userId:      1,
            startTime:   $ts1 - 3600,
            endTime:     $ts2 + 3600,
            conversions: [
                new ConversionRecord(
                    conversionId: 801,
                    clickId:      8001,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts1,
                    clickTime:    $ts1 - 300,
                    clickPayout:  12.00,
                    clickCost:    3.00
                ),
                new ConversionRecord(
                    conversionId: 802,
                    clickId:      8002,
                    userId:       1,
                    campaignId:   10,
                    ppcAccountId: 5,
                    convTime:     $ts2,
                    clickTime:    $ts2 - 300,
                    clickPayout:  18.00,
                    clickCost:    4.50
                ),
            ]
        );

        $result = (new LinearStrategy())->calculate($this->makeModel(), $batch);
        $b1 = (int) ($ts1 - ($ts1 % 3600));
        $b2 = (int) ($ts2 - ($ts2 % 3600));

        self::assertCount(2, $result->snapshotsByHour);
        self::assertEquals(12.00, $result->snapshotsByHour[$b1]->attributedRevenue);
        self::assertEquals(18.00, $result->snapshotsByHour[$b2]->attributedRevenue);
    }
}
