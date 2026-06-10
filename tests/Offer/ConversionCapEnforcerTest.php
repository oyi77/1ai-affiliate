<?php

declare(strict_types=1);

namespace Tests\Offer;

use OneAIAffiliate\Offer\CapCheckResult;
use OneAIAffiliate\Offer\ConversionCapEnforcer;
use OneAIAffiliate\Offer\InMemoryCapRepository;
use OneAIAffiliate\Offer\OfferCaps;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class ConversionCapEnforcerTest extends TestCase
{
    public function testAllowsWhenNoCapsConfigured(): void
    {
        $enforcer = new ConversionCapEnforcer(
            new InMemoryCapRepository(),
        );
        $result = $enforcer->check(1);
        $this->assertInstanceOf(CapCheckResult::class, $result);
        $this->assertTrue($result->allowed);
        $this->assertSame('no_caps_configured', $result->reason);
    }

    public function testAllowsWhenUnderDailyCap(): void
    {
        $repo = new InMemoryCapRepository(
            capsById: [1 => new OfferCaps(1, capDaily: 100, capMonthly: null)],
            countsByOffer: [1 => 50],
        );
        $enforcer = new ConversionCapEnforcer($repo);
        $result = $enforcer->check(1);
        $this->assertTrue($result->allowed);
        $this->assertSame('within_caps', $result->reason);
    }

    public function testRejectsWhenAtOrOverDailyCap(): void
    {
        $repo = new InMemoryCapRepository(
            capsById: [1 => new OfferCaps(1, capDaily: 100, capMonthly: null)],
            countsByOffer: [1 => 100], // at the cap
        );
        $enforcer = new ConversionCapEnforcer($repo);
        $result = $enforcer->check(1);
        $this->assertFalse($result->allowed);
        $this->assertStringContainsString('cap_reached:daily(100/100)', $result->reason);
    }

    public function testRejectsWhenOverMonthlyCap(): void
    {
        $repo = new InMemoryCapRepository(
            capsById: [2 => new OfferCaps(2, capDaily: null, capMonthly: 1000)],
            countsByOffer: [2 => 1500],
        );
        $enforcer = new ConversionCapEnforcer($repo);
        $result = $enforcer->check(2);
        $this->assertFalse($result->allowed);
        $this->assertStringContainsString('monthly', $result->reason);
    }

    public function testEnforceOrThrowDoesNotThrowWhenAllowed(): void
    {
        $enforcer = new ConversionCapEnforcer(
            new InMemoryCapRepository(),
        );
        $enforcer->enforceOrThrow(99);
        $this->addToAssertionCount(1);
    }

    public function testEnforceOrThrowThrowsWhenAtCap(): void
    {
        $repo = new InMemoryCapRepository(
            capsById: [1 => new OfferCaps(1, capDaily: 10, capMonthly: null)],
            countsByOffer: [1 => 10],
        );
        $enforcer = new ConversionCapEnforcer($repo);
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Offer 1 rejected: cap_reached:daily(10/10)');
        $enforcer->enforceOrThrow(1);
    }
}
