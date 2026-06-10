<?php

declare(strict_types=1);

namespace OneAIAffiliate\Click;

/**
 * Immutable fraud score for a single click.
 *
 * Score ranges 0.0 (clean) to 1.0 (certainly fraudulent).
 * Each reason is a human-readable tag like "ip_velocity:25clicks/hour".
 */
final readonly class FraudScore
{
    /**
     * @param float $score  Clamped 0.0–1.0
     * @param list<string> $reasons  Why the score was raised
     */
    public function __construct(
        public int $clickId,
        public float $score,
        public array $reasons,
        public int $timestamp,
    ) {
    }
}

/**
 * Data source for the fraud scoring engine.
 *
 * Production: MysqlFraudScoringRepository.
 * Tests: InMemoryFraudScoringRepository.
 */
interface FraudScoringRepository
{
    /**
     * Return threshold / tuning parameters.
     *
     * Keys used by FraudScoringService:
     *   ip_velocity_threshold   => int   (clicks per window, default 20)
     *   ip_velocity_window      => int   (seconds, default 3600)
     *   cvr_anomaly_threshold   => float (decimal, default 0.30)
     *   cvr_window              => int   (seconds, default 3600)
     *   cluster_gap_seconds     => int   (seconds, default 2)
     *
     * @return array<string, int|float>
     */
    public function getRules(): array;

    /**
     * Count of clicks from $ip within the last $windowSeconds.
     */
    public function getClickHistory(string $ip, int $windowSeconds): int;

    /**
     * Conversion rate (conversions / clicks) for $offerId within $windowSeconds.
     * Returns 0.0 when there are no clicks.
     */
    public function getConversionRate(int $offerId, int $windowSeconds): float;

    /**
     * Unix timestamps of recent clicks from $ip within $windowSeconds.
     *
     * @return list<int>
     */
    public function getClickTimestamps(string $ip, int $windowSeconds): array;

    /**
     * The allowed geo (country code) for $offerId, or null if unrestricted.
     */
    public function getOfferGeo(int $offerId): ?string;
}

/**
 * In-memory FraudScoringRepository for tests.
 *
 * Every field is set through the constructor so each test case can
 * provide exactly the data it needs.
 */
final class InMemoryFraudScoringRepository implements FraudScoringRepository
{
    /**
     * @param array<string, int|float> $rules
     * @param array<string, int> $clickHistory  ip => count
     * @param array<int, float> $conversionRates  offer_id => CVR
     * @param array<string, list<int>> $clickTimestamps  ip => sorted timestamps
     * @param array<int, string|null> $offerGeos  offer_id => country code
     */
    public function __construct(
        private readonly array $rules = [],
        private readonly array $clickHistory = [],
        private readonly array $conversionRates = [],
        private readonly array $clickTimestamps = [],
        private readonly array $offerGeos = [],
    ) {
    }

    public function getRules(): array
    {
        return $this->rules;
    }

    public function getClickHistory(string $ip, int $windowSeconds): int
    {
        return $this->clickHistory[$ip] ?? 0;
    }

    public function getConversionRate(int $offerId, int $windowSeconds): float
    {
        return $this->conversionRates[$offerId] ?? 0.0;
    }

    public function getClickTimestamps(string $ip, int $windowSeconds): array
    {
        return $this->clickTimestamps[$ip] ?? [];
    }

    public function getOfferGeo(int $offerId): ?string
    {
        return $this->offerGeos[$offerId] ?? null;
    }
}

/**
 * Rule-based fraud scorer.
 *
 * Evaluates a click against four heuristic signals and returns an
 * accumulated FraudScore capped at 1.0:
 *
 *   Signal                          Threshold         Weight
 *   ──────────────────────────────  ────────────────  ──────
 *   IP click velocity               > 20 clicks/hr    +0.3
 *   Conversion-rate anomaly         > 30 % CVR        +0.2
 *   Time-of-click clustering        < 2 s gap         +0.4
 *   Geo mismatch (IP vs offer)      any mismatch      +0.2
 *
 * All thresholds are overridable through the repository's getRules().
 */
final class FraudScoringService
{
    private readonly int $velocityThreshold;
    private readonly int $velocityWindow;
    private readonly float $cvrThreshold;
    private readonly int $cvrWindow;
    private readonly int $clusterGap;

    public function __construct(
        private readonly FraudScoringRepository $repository,
    ) {
        $rules = $this->repository->getRules();
        $this->velocityThreshold = (int) ($rules['ip_velocity_threshold'] ?? 20);
        $this->velocityWindow    = (int) ($rules['ip_velocity_window'] ?? 3600);
        $this->cvrThreshold      = (float) ($rules['cvr_anomaly_threshold'] ?? 0.30);
        $this->cvrWindow         = (int) ($rules['cvr_window'] ?? 3600);
        $this->clusterGap        = (int) ($rules['cluster_gap_seconds'] ?? 2);
    }

    /**
     * Score a click for fraud likelihood.
     *
     * @param array{click_id: int, ip: string, offer_id: int, timestamp: int, geo: string} $clickData
     */
    public function score(array $clickData): FraudScore
    {
        /** @var list<string> $reasons */
        $reasons = [];
        $score = 0.0;

        // ── 1. IP click velocity ──────────────────────────────────────
        $clickCount = $this->repository->getClickHistory(
            $clickData['ip'],
            $this->velocityWindow,
        );
        if ($clickCount > $this->velocityThreshold) {
            $score += 0.3;
            $reasons[] = "ip_velocity:{$clickCount}clicks/hour";
        }

        // ── 2. Conversion-rate anomaly ────────────────────────────────
        $cvr = $this->repository->getConversionRate(
            $clickData['offer_id'],
            $this->cvrWindow,
        );
        if ($cvr > $this->cvrThreshold) {
            $score += 0.2;
            $reasons[] = sprintf('cvr_anomaly:%.1f%%', $cvr * 100);
        }

        // ── 3. Time-of-click clustering ───────────────────────────────
        $timestamps = $this->repository->getClickTimestamps(
            $clickData['ip'],
            $this->velocityWindow,
        );
        if ($this->hasTimeCluster($timestamps, $clickData['timestamp'])) {
            $score += 0.4;
            $reasons[] = 'time_clustering:clicks_within_' . $this->clusterGap . 's';
        }

        // ── 4. Geo mismatch ──────────────────────────────────────────
        $offerGeo = $this->repository->getOfferGeo($clickData['offer_id']);
        $clickGeo = $clickData['geo'] ?? '';
        if ($offerGeo !== null && $clickGeo !== '' && $clickGeo !== $offerGeo) {
            $score += 0.2;
            $reasons[] = "geo_mismatch:expected={$offerGeo},actual={$clickGeo}";
        }

        return new FraudScore(
            clickId: $clickData['click_id'],
            score: min(1.0, $score),
            reasons: $reasons,
            timestamp: $clickData['timestamp'],
        );
    }

    /**
     * Detect whether any two timestamps (including $currentTimestamp)
     * are within $this->clusterGap seconds of each other.
     *
     * @param list<int> $timestamps  Historical click timestamps
     */
    private function hasTimeCluster(array $timestamps, int $currentTimestamp): bool
    {
        $all = $timestamps;
        $all[] = $currentTimestamp;
        sort($all);

        for ($i = 1, $len = count($all); $i < $len; $i++) {
            if (($all[$i] - $all[$i - 1]) < $this->clusterGap) {
                return true;
            }
        }

        return false;
    }
}
