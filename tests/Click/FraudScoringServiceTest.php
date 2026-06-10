<?php

declare(strict_types=1);

namespace Tests\Click;

use OneAIAffiliate\Click\FraudScore;
use OneAIAffiliate\Click\FraudScoringService;
use OneAIAffiliate\Click\InMemoryFraudScoringRepository;
use PHPUnit\Framework\TestCase;

final class FraudScoringServiceTest extends TestCase
{
    /**
     * Helper: build a minimal click-data array with sensible defaults.
     *
     * @return array{click_id: int, ip: string, offer_id: int, timestamp: int, geo: string}
     */
    private static function click(
        int $clickId = 1,
        string $ip = '10.0.0.1',
        int $offerId = 1,
        int $timestamp = 1_700_000_000,
        string $geo = 'US',
    ): array {
        return [
            'click_id'  => $clickId,
            'ip'        => $ip,
            'offer_id'  => $offerId,
            'timestamp' => $timestamp,
            'geo'       => $geo,
        ];
    }

    // ── Clean click ───────────────────────────────────────────────────

    public function testCleanClickScoresZero(): void
    {
        $service = new FraudScoringService(new InMemoryFraudScoringRepository());

        $result = $service->score(self::click());

        $this->assertInstanceOf(FraudScore::class, $result);
        $this->assertSame(0.0, $result->score);
        $this->assertSame([], $result->reasons);
        $this->assertSame(1, $result->clickId);
    }

    // ── IP velocity ───────────────────────────────────────────────────

    public function testIpVelocityAboveThresholdAddsPointThree(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            clickHistory: ['10.0.0.1' => 25],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click());

        $this->assertSame(0.3, $result->score);
        $this->assertCount(1, $result->reasons);
        $this->assertSame('ip_velocity:25clicks/hour', $result->reasons[0]);
    }

    public function testIpVelocityAtExactThresholdDoesNotTrigger(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            clickHistory: ['10.0.0.1' => 20],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click());

        $this->assertSame(0.0, $result->score);
        $this->assertSame([], $result->reasons);
    }

    // ── Conversion-rate anomaly ───────────────────────────────────────

    public function testHighConversionRateAddsPointTwo(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            conversionRates: [1 => 0.45],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click());

        $this->assertSame(0.2, $result->score);
        $this->assertContains('cvr_anomaly:45.0%', $result->reasons);
    }

    public function testConversionRateAtThresholdDoesNotTrigger(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            conversionRates: [1 => 0.30],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click());

        $this->assertSame(0.0, $result->score);
    }

    // ── Time clustering ───────────────────────────────────────────────

    public function testTimeClusteringAddsPointFour(): void
    {
        $ts = 1_700_000_000;
        $repo = new InMemoryFraudScoringRepository(
            clickTimestamps: ['10.0.0.1' => [$ts - 1]],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(timestamp: $ts));

        $this->assertSame(0.4, $result->score);
        $this->assertContains('time_clustering:clicks_within_2s', $result->reasons);
    }

    public function testTimeClusteringNotTriggeredWhenGapExceedsThreshold(): void
    {
        $ts = 1_700_000_000;
        $repo = new InMemoryFraudScoringRepository(
            clickTimestamps: ['10.0.0.1' => [$ts - 10]],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(timestamp: $ts));

        $this->assertSame(0.0, $result->score);
    }

    // ── Geo mismatch ──────────────────────────────────────────────────

    public function testGeoMismatchAddsPointTwo(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            offerGeos: [1 => 'US'],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(geo: 'CN'));

        $this->assertSame(0.2, $result->score);
        $this->assertContains('geo_mismatch:expected=US,actual=CN', $result->reasons);
    }

    public function testGeoMatchDoesNotTrigger(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            offerGeos: [1 => 'US'],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(geo: 'US'));

        $this->assertSame(0.0, $result->score);
    }

    public function testNullOfferGeoDoesNotTrigger(): void
    {
        $repo = new InMemoryFraudScoringRepository(
            offerGeos: [1 => null],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(geo: 'CN'));

        $this->assertSame(0.0, $result->score);
    }

    // ── Score capping ─────────────────────────────────────────────────

    public function testScoreCappedAtOne(): void
    {
        // All four signals fire: 0.3 + 0.2 + 0.4 + 0.2 = 1.1, must cap to 1.0
        $ts = 1_700_000_000;
        $repo = new InMemoryFraudScoringRepository(
            clickHistory:     ['10.0.0.1' => 50],
            conversionRates:  [1 => 0.80],
            clickTimestamps:  ['10.0.0.1' => [$ts - 1]],
            offerGeos:        [1 => 'US'],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(timestamp: $ts, geo: 'BR'));

        $this->assertSame(1.0, $result->score);
        $this->assertCount(4, $result->reasons);
    }

    // ── Custom rules ──────────────────────────────────────────────────

    public function testCustomRulesOverrideDefaults(): void
    {
        // Raise velocity threshold to 100 so 50 clicks does NOT trigger
        $repo = new InMemoryFraudScoringRepository(
            rules: ['ip_velocity_threshold' => 100],
            clickHistory: ['10.0.0.1' => 50],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click());

        $this->assertSame(0.0, $result->score);
    }

    // ── Accumulation ──────────────────────────────────────────────────

    public function testPartialSignalsAccumulateCorrectly(): void
    {
        // Two signals: velocity (0.3) + geo mismatch (0.2) = 0.5
        $repo = new InMemoryFraudScoringRepository(
            clickHistory:    ['10.0.0.1' => 30],
            offerGeos:       [1 => 'DE'],
        );
        $service = new FraudScoringService($repo);

        $result = $service->score(self::click(geo: 'FR'));

        $this->assertSame(0.5, $result->score);
        $this->assertCount(2, $result->reasons);
        $this->assertSame('ip_velocity:30clicks/hour', $result->reasons[0]);
        $this->assertSame('geo_mismatch:expected=DE,actual=FR', $result->reasons[1]);
    }

    public function testClickIdAndTimestampPropagated(): void
    {
        $service = new FraudScoringService(new InMemoryFraudScoringRepository());

        $result = $service->score(self::click(clickId: 42, timestamp: 1_800_000_000));

        $this->assertSame(42, $result->clickId);
        $this->assertSame(1_800_000_000, $result->timestamp);
    }
}
