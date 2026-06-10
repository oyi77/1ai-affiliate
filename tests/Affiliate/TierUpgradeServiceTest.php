<?php

declare(strict_types=1);

namespace Tests\Affiliate;

use OneAIAffiliate\Affiliate\InMemoryTierUpgradeRepository;
use OneAIAffiliate\Affiliate\TierThresholds;
use OneAIAffiliate\Affiliate\TierUpgradeService;
use PHPUnit\Framework\TestCase;

final class TierUpgradeServiceTest extends TestCase
{
    public function testNewAffiliateWithZeroConversionsRemainsStandard(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [1 => 'standard'],
            conversions: [1 => 0],
        );
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(1);

        $this->assertSame('standard', $result['current_tier']);
        $this->assertSame('standard', $result['new_tier']);
        $this->assertSame(0, $result['conversions_30d']);
        $this->assertFalse($result['upgraded']);
    }

    public function testAffiliateUpgradesToPremiumWhenMeetingThreshold(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [2 => 'standard'],
            conversions: [2 => 50],
        );
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(2);

        $this->assertSame('standard', $result['current_tier']);
        $this->assertSame('premium', $result['new_tier']);
        $this->assertSame(50, $result['conversions_30d']);
        $this->assertTrue($result['upgraded']);
        $this->assertSame('premium', $repo->getTiers()[2]);
    }

    public function testAffiliateUpgradesToVipWhenExceedingThreshold(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [3 => 'standard'],
            conversions: [3 => 250],
        );
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(3);

        $this->assertSame('standard', $result['current_tier']);
        $this->assertSame('vip', $result['new_tier']);
        $this->assertTrue($result['upgraded']);
    }

    public function testNoDowngradeWhenConversionsDropBelowThreshold(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [4 => 'vip'],
            conversions: [4 => 10],
        );
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(4);

        $this->assertSame('vip', $result['current_tier']);
        $this->assertSame('vip', $result['new_tier']);
        $this->assertFalse($result['upgraded']);
        // Tier in repo should remain unchanged
        $this->assertSame('vip', $repo->getTiers()[4]);
    }

    public function testPremiumAffiliateStaysPremiumWhenNotMeetingVipThreshold(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [5 => 'premium'],
            conversions: [5 => 100],
        );
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(5);

        $this->assertSame('premium', $result['current_tier']);
        $this->assertSame('premium', $result['new_tier']);
        $this->assertFalse($result['upgraded']);
    }

    public function testRunBatchEvaluatesAllAffiliates(): void
    {
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [1 => 'standard', 2 => 'standard', 3 => 'premium'],
            conversions: [1 => 0, 2 => 60, 3 => 150],
        );
        $service = new TierUpgradeService($repo);

        $results = $service->runBatch();

        $this->assertCount(3, $results);

        // Affiliate 1: stays standard
        $this->assertSame(1, $results[0]['affiliate_id']);
        $this->assertSame('standard', $results[0]['new_tier']);
        $this->assertFalse($results[0]['upgraded']);

        // Affiliate 2: upgrades to premium
        $this->assertSame(2, $results[1]['affiliate_id']);
        $this->assertSame('premium', $results[1]['new_tier']);
        $this->assertTrue($results[1]['upgraded']);

        // Affiliate 3: stays premium (150 < 200 vip threshold)
        $this->assertSame(3, $results[2]['affiliate_id']);
        $this->assertSame('premium', $results[2]['new_tier']);
        $this->assertFalse($results[2]['upgraded']);
    }

    public function testCustomThresholdsAreRespected(): void
    {
        $custom = new TierThresholds([
            'bronze' => 0,
            'silver' => 10,
            'gold'   => 25,
        ]);
        $repo = new InMemoryTierUpgradeRepository(
            tiers: [1 => 'bronze'],
            conversions: [1 => 15],
        );
        $service = new TierUpgradeService($repo, $custom);

        $result = $service->evaluate(1);

        $this->assertSame('silver', $result['new_tier']);
        $this->assertTrue($result['upgraded']);
    }

    public function testUnknownAffiliateDefaultsToStandardWithZeroConversions(): void
    {
        $repo = new InMemoryTierUpgradeRepository();
        $service = new TierUpgradeService($repo);

        $result = $service->evaluate(999);

        $this->assertSame('standard', $result['current_tier']);
        $this->assertSame('standard', $result['new_tier']);
        $this->assertSame(0, $result['conversions_30d']);
        $this->assertFalse($result['upgraded']);
    }

    public function testRunBatchWithEmptyRepoReturnsEmptyResults(): void
    {
        $repo = new InMemoryTierUpgradeRepository();
        $service = new TierUpgradeService($repo);

        $this->assertSame([], $service->runBatch());
    }
}
