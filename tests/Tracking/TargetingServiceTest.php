<?php

declare(strict_types=1);

namespace Tests\Tracking;

use OneAIAffiliate\Tracking\InMemoryTargetingRepository;
use OneAIAffiliate\Tracking\TargetingRule;
use OneAIAffiliate\Tracking\TargetingService;
use PHPUnit\Framework\TestCase;

final class TargetingServiceTest extends TestCase
{
    // ------------------------------------------------------------------
    // Pass-through: no rules configured
    // ------------------------------------------------------------------

    public function testPassesThroughWhenNoRulesConfigured(): void
    {
        $service = new TargetingService(new InMemoryTargetingRepository());

        $this->assertTrue($service->matches(1, 'US', 'desktop'));
        $this->assertTrue($service->matches(1, 'XX', 'smart-tv', 'BogusNet'));
    }

    // ------------------------------------------------------------------
    // Country allowlist
    // ------------------------------------------------------------------

    public function testAllowlistPermitsMatchingCountry(): void
    {
        $repo = new InMemoryTargetingRepository([
            1 => new TargetingRule(
                countryCodes: ['US', 'CA'],
                deviceTypes: [],
                ispPatterns: [],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertTrue($service->matches(1, 'US', 'desktop'));
        $this->assertTrue($service->matches(1, 'CA', 'mobile'));
    }

    public function testAllowlistRejectsNonMatchingCountry(): void
    {
        $repo = new InMemoryTargetingRepository([
            1 => new TargetingRule(
                countryCodes: ['US', 'CA'],
                deviceTypes: [],
                ispPatterns: [],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertFalse($service->matches(1, 'DE', 'desktop'));
    }

    // ------------------------------------------------------------------
    // Country blocklist
    // ------------------------------------------------------------------

    public function testBlocklistRejectsMatchingCountry(): void
    {
        $repo = new InMemoryTargetingRepository([
            2 => new TargetingRule(
                countryCodes: ['CN', 'RU'],
                deviceTypes: [],
                ispPatterns: [],
                mode: TargetingRule::MODE_BLOCKLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertFalse($service->matches(2, 'CN', 'desktop'));
        $this->assertFalse($service->matches(2, 'RU', 'mobile'));
    }

    public function testBlocklistPermitsNonMatchingCountry(): void
    {
        $repo = new InMemoryTargetingRepository([
            2 => new TargetingRule(
                countryCodes: ['CN', 'RU'],
                deviceTypes: [],
                ispPatterns: [],
                mode: TargetingRule::MODE_BLOCKLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertTrue($service->matches(2, 'US', 'desktop'));
    }

    // ------------------------------------------------------------------
    // Device filtering
    // ------------------------------------------------------------------

    public function testAllowlistFiltersByDeviceType(): void
    {
        $repo = new InMemoryTargetingRepository([
            3 => new TargetingRule(
                countryCodes: [],
                deviceTypes: ['mobile', 'tablet'],
                ispPatterns: [],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertTrue($service->matches(3, 'US', 'mobile'));
        $this->assertTrue($service->matches(3, 'US', 'Tablet')); // case-insensitive
        $this->assertFalse($service->matches(3, 'US', 'desktop'));
    }

    public function testBlocklistFiltersByDeviceType(): void
    {
        $repo = new InMemoryTargetingRepository([
            4 => new TargetingRule(
                countryCodes: [],
                deviceTypes: ['smart-tv'],
                ispPatterns: [],
                mode: TargetingRule::MODE_BLOCKLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertFalse($service->matches(4, 'US', 'smart-tv'));
        $this->assertTrue($service->matches(4, 'US', 'mobile'));
    }

    // ------------------------------------------------------------------
    // ISP pattern filtering
    // ------------------------------------------------------------------

    public function testAllowlistMatchesIspSubstring(): void
    {
        $repo = new InMemoryTargetingRepository([
            5 => new TargetingRule(
                countryCodes: [],
                deviceTypes: [],
                ispPatterns: ['comcast', 'verizon'],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertTrue($service->matches(5, 'US', 'desktop', 'Comcast Cable'));
        $this->assertTrue($service->matches(5, 'US', 'desktop', 'verizon wireless'));
        $this->assertFalse($service->matches(5, 'US', 'desktop', 'AT&T'));
    }

    public function testAllowlistRejectsWhenIspUnknownAndPatternsConfigured(): void
    {
        $repo = new InMemoryTargetingRepository([
            5 => new TargetingRule(
                countryCodes: [],
                deviceTypes: [],
                ispPatterns: ['comcast'],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        // ISP is null but patterns are configured → allowlist rejects
        $this->assertFalse($service->matches(5, 'US', 'desktop', null));
    }

    // ------------------------------------------------------------------
    // Combined dimensions
    // ------------------------------------------------------------------

    public function testAllowlistRequiresAllDimensionsToMatch(): void
    {
        $repo = new InMemoryTargetingRepository([
            6 => new TargetingRule(
                countryCodes: ['US'],
                deviceTypes: ['mobile'],
                ispPatterns: ['t-mobile'],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        // All match → pass
        $this->assertTrue($service->matches(6, 'US', 'mobile', 'T-Mobile USA'));

        // Country wrong → fail
        $this->assertFalse($service->matches(6, 'GB', 'mobile', 'T-Mobile USA'));

        // Device wrong → fail
        $this->assertFalse($service->matches(6, 'US', 'desktop', 'T-Mobile USA'));

        // ISP wrong → fail
        $this->assertFalse($service->matches(6, 'US', 'mobile', 'AT&T'));
    }

    public function testBlocklistRejectsWhenAnyDimensionMatches(): void
    {
        $repo = new InMemoryTargetingRepository([
            7 => new TargetingRule(
                countryCodes: ['CN'],
                deviceTypes: ['desktop'],
                ispPatterns: ['bogusnet'],
                mode: TargetingRule::MODE_BLOCKLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        // Nothing matches → pass
        $this->assertTrue($service->matches(7, 'US', 'mobile', 'Comcast'));

        // Country blocked → fail
        $this->assertFalse($service->matches(7, 'CN', 'mobile', 'Comcast'));

        // Device blocked → fail
        $this->assertFalse($service->matches(7, 'US', 'desktop', 'Comcast'));

        // ISP blocked → fail
        $this->assertFalse($service->matches(7, 'US', 'mobile', 'BogusNet Corp'));
    }

    // ------------------------------------------------------------------
    // Case normalisation
    // ------------------------------------------------------------------

    public function testCountryCodeComparisonIsCaseInsensitive(): void
    {
        $repo = new InMemoryTargetingRepository([
            8 => new TargetingRule(
                countryCodes: ['US'],
                deviceTypes: [],
                ispPatterns: [],
                mode: TargetingRule::MODE_ALLOWLIST,
            ),
        ]);
        $service = new TargetingService($repo);

        $this->assertTrue($service->matches(8, 'us', 'desktop'));
        $this->assertTrue($service->matches(8, 'Us', 'desktop'));
    }
}
