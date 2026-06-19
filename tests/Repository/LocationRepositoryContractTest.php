<?php

declare(strict_types=1);

namespace Tests\Repository;

use PHPUnit\Framework\TestCase;
use OneAIAffiliate\Repository\LocationRepositoryInterface;

abstract class LocationRepositoryContractTest extends TestCase
{
    protected LocationRepositoryInterface $repo;

    abstract protected function createRepository(): LocationRepositoryInterface;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repo = $this->createRepository();
    }

    public function testFindOrCreateCountryReturnsStableId(): void
    {
        $id1 = $this->repo->findOrCreateCountry('United States', 'US');
        $id2 = $this->repo->findOrCreateCountry('United States', 'US');

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testDifferentCountriesGetDifferentIds(): void
    {
        $us = $this->repo->findOrCreateCountry('United States', 'US');
        $uk = $this->repo->findOrCreateCountry('United Kingdom', 'GB');

        self::assertNotSame($us, $uk);
    }

    public function testFindOrCreateCityReturnsStableId(): void
    {
        $countryId = $this->repo->findOrCreateCountry('United States', 'US');
        $id1 = $this->repo->findOrCreateCity('New York', $countryId);
        $id2 = $this->repo->findOrCreateCity('New York', $countryId);

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testSameCityDifferentCountryGetsDifferentId(): void
    {
        $us = $this->repo->findOrCreateCountry('United States', 'US');
        $uk = $this->repo->findOrCreateCountry('United Kingdom', 'GB');

        $cityUs = $this->repo->findOrCreateCity('Portland', $us);
        $cityUk = $this->repo->findOrCreateCity('Portland', $uk);

        self::assertNotSame($cityUs, $cityUk);
    }

    public function testFindOrCreateRegionReturnsStableId(): void
    {
        $countryId = $this->repo->findOrCreateCountry('United States', 'US');
        $id1 = $this->repo->findOrCreateRegion('California', $countryId);
        $id2 = $this->repo->findOrCreateRegion('California', $countryId);

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testFindOrCreateIspReturnsStableId(): void
    {
        $id1 = $this->repo->findOrCreateIsp('Comcast');
        $id2 = $this->repo->findOrCreateIsp('Comcast');

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testFindOrCreateIpReturnsStableId(): void
    {
        $id1 = $this->repo->findOrCreateIp('192.168.1.1');
        $id2 = $this->repo->findOrCreateIp('192.168.1.1');

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testFindOrCreateIpReturnsZeroForEmpty(): void
    {
        self::assertSame(0, $this->repo->findOrCreateIp(''));
    }

    public function testFindOrCreateSiteDomainReturnsStableId(): void
    {
        $id1 = $this->repo->findOrCreateSiteDomain('https://www.example.com/page');
        $id2 = $this->repo->findOrCreateSiteDomain('https://www.example.com/other');

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2, 'Same domain should return same ID');
    }

    public function testFindOrCreateSiteUrlReturnsStableId(): void
    {
        $id1 = $this->repo->findOrCreateSiteUrl('https://example.com/page');
        $id2 = $this->repo->findOrCreateSiteUrl('https://example.com/page');

        self::assertGreaterThan(0, $id1);
        self::assertSame($id1, $id2);
    }

    public function testFindOrCreateSiteUrlReturnsZeroForEmpty(): void
    {
        self::assertSame(0, $this->repo->findOrCreateSiteUrl(''));
    }
}
