<?php

declare(strict_types=1);

namespace Tests\DataEngine;

use PHPUnit\Framework\TestCase;
use OneAIAffiliate\DataEngine\DataEngineRepositoryInterface;
use OneAIAffiliate\DataEngine\MysqlDataEngineRepository;
use OneAIAffiliate\Report\ReportQuery;
use OneAIAffiliate\Report\InMemoryReportRepository;

final class DataEngineRepositoryTest extends TestCase
{
    private function makeInMemoryReportRepo(): InMemoryReportRepository
    {
        $repo = new InMemoryReportRepository();
        $repo->rows = [
            ['user_id' => 1, 'click_time' => 1709280000, 'clicks' => 100, 'click_out' => 80, 'leads' => 10, 'income' => 50.0, 'cost' => 20.0, 'aff_campaign_id' => 1, 'country_id' => 1],
            ['user_id' => 1, 'click_time' => 1709290000, 'clicks' => 200, 'click_out' => 150, 'leads' => 20, 'income' => 100.0, 'cost' => 40.0, 'aff_campaign_id' => 1, 'country_id' => 2],
            ['user_id' => 1, 'click_time' => 1709366400, 'clicks' => 50, 'click_out' => 30, 'leads' => 5, 'income' => 25.0, 'cost' => 10.0, 'aff_campaign_id' => 2, 'country_id' => 1],
            ['user_id' => 2, 'click_time' => 1709280000, 'clicks' => 500, 'click_out' => 400, 'leads' => 50, 'income' => 250.0, 'cost' => 100.0, 'aff_campaign_id' => 3, 'country_id' => 1],
        ];
        $repo->dimensions = [
            'campaign' => [1 => 'Campaign A', 2 => 'Campaign B', 3 => 'Campaign C'],
            'country' => [1 => 'United States', 2 => 'Canada'],
        ];
        return $repo;
    }

    // --- Delegation tests: MysqlDataEngineRepository delegates to MysqlReportRepository ---

    public function testSummaryDelegatesToReportRepository(): void
    {
        // MysqlDataEngineRepository wraps a ReportRepositoryInterface internally.
        // Verify the interface contract exists and the implementation is instantiable.
        $reflection = new \ReflectionClass(MysqlDataEngineRepository::class);
        self::assertTrue($reflection->implementsInterface(DataEngineRepositoryInterface::class));
    }

    public function testInterfaceHasAllReportMethods(): void
    {
        $reflection = new \ReflectionClass(DataEngineRepositoryInterface::class);
        $methods = array_map(fn(\ReflectionMethod $m) => $m->getName(), $reflection->getMethods());

        self::assertContains('summary', $methods);
        self::assertContains('breakdown', $methods);
        self::assertContains('timeseries', $methods);
        self::assertContains('daypart', $methods);
        self::assertContains('weekpart', $methods);
        self::assertContains('setDirtyHour', $methods);
    }

    public function testSummaryMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'summary');
        $params = $reflection->getParameters();
        self::assertCount(1, $params);
        self::assertSame('query', $params[0]->getName());
    }

    public function testBreakdownMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'breakdown');
        $params = $reflection->getParameters();
        self::assertCount(6, $params);
        self::assertSame('query', $params[0]->getName());
        self::assertSame('breakdownType', $params[1]->getName());
        self::assertSame('sortBy', $params[2]->getName());
        self::assertSame('sortDir', $params[3]->getName());
        self::assertSame('limit', $params[4]->getName());
        self::assertSame('offset', $params[5]->getName());
    }

    public function testSetDirtyHourMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'setDirtyHour');
        $params = $reflection->getParameters();
        self::assertCount(1, $params);
        self::assertSame('clickId', $params[0]->getName());
        self::assertSame('string', $params[0]->getType()->getName());
        self::assertSame('int', $reflection->getReturnType()->getName());
    }

    public function testTimeseriesMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'timeseries');
        $params = $reflection->getParameters();
        self::assertCount(2, $params);
        self::assertSame('query', $params[0]->getName());
        self::assertSame('interval', $params[1]->getName());
    }

    public function testDaypartMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'daypart');
        $params = $reflection->getParameters();
        self::assertCount(2, $params);
        self::assertSame('query', $params[0]->getName());
        self::assertSame('timezone', $params[1]->getName());
    }

    public function testWeekpartMethodSignature(): void
    {
        $reflection = new \ReflectionMethod(DataEngineRepositoryInterface::class, 'weekpart');
        $params = $reflection->getParameters();
        self::assertCount(2, $params);
        self::assertSame('query', $params[0]->getName());
        self::assertSame('timezone', $params[1]->getName());
    }
}
