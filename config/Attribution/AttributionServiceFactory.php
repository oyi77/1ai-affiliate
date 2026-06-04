<?php

declare(strict_types=1);

namespace OneAIAffiliate\Attribution;

use OneAIAffiliate\Attribution\Repository\ModelRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\AuditRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\JourneyMaintenanceRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\Mysql\ConversionJourneyRepository;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlAuditRepository;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlConversionRepository;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlModelRepository;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlSnapshotRepository;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlTouchpointRepository;
use OneAIAffiliate\Attribution\Repository\NullConversionRepository;
use OneAIAffiliate\Attribution\Repository\NullModelRepository;
use OneAIAffiliate\Attribution\Repository\NullSettingsRepository;
use OneAIAffiliate\Attribution\Repository\NullSnapshotRepository;
use OneAIAffiliate\Attribution\Repository\NullTouchpointRepository;
use OneAIAffiliate\Attribution\Repository\NullAuditRepository;
use OneAIAffiliate\Attribution\Repository\NullExportJobRepository;
use OneAIAffiliate\Attribution\Repository\SettingsRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlSettingRepository;
use OneAIAffiliate\Attribution\Service\AttributionSettingsService as SettingsService;
use OneAIAffiliate\Attribution\Repository\SnapshotRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\TouchpointRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\ConversionRepositoryInterface;
use OneAIAffiliate\Attribution\AttributionJobRunner;
use OneAIAffiliate\Attribution\Repository\ExportJobRepositoryInterface;
use OneAIAffiliate\Attribution\Repository\Mysql\MysqlExportJobRepository;
use OneAIAffiliate\Database\Connection;

/**
 * Simple factory used to wire default attribution services.
 */
final class AttributionServiceFactory
{
    public static function create(
        ?ModelRepositoryInterface $modelRepository = null,
        ?SnapshotRepositoryInterface $snapshotRepository = null,
        ?TouchpointRepositoryInterface $touchpointRepository = null,
        ?AuditRepositoryInterface $auditRepository = null,
        ?ExportJobRepositoryInterface $exportRepository = null
    ): AttributionService {
        if ($modelRepository === null || $snapshotRepository === null || $touchpointRepository === null || $auditRepository === null || $exportRepository === null) {
            $conn = self::buildConnection();

            if ($conn !== null) {
                $modelRepository ??= new MysqlModelRepository($conn);
                $snapshotRepository ??= new MysqlSnapshotRepository($conn);
                $touchpointRepository ??= new MysqlTouchpointRepository($conn);
                $auditRepository ??= new MysqlAuditRepository($conn);
                $exportRepository ??= new MysqlExportJobRepository($conn);
            }
        }

        return new AttributionService(
            $modelRepository ?? new NullModelRepository(),
            $snapshotRepository ?? new NullSnapshotRepository(),
            $touchpointRepository ?? new NullTouchpointRepository(),
            $auditRepository ?? new NullAuditRepository(),
            $exportRepository ?? new NullExportJobRepository()
        );
    }

    public static function createJobRunner(
        ?ModelRepositoryInterface $modelRepository = null,
        ?SnapshotRepositoryInterface $snapshotRepository = null,
        ?TouchpointRepositoryInterface $touchpointRepository = null,
        ?ConversionRepositoryInterface $conversionRepository = null,
        ?AuditRepositoryInterface $auditRepository = null
    ): AttributionJobRunner {
        $conn = self::buildConnection();

        if ($conn !== null) {
            $modelRepository ??= new MysqlModelRepository($conn);
            $snapshotRepository ??= new MysqlSnapshotRepository($conn);
            $touchpointRepository ??= new MysqlTouchpointRepository($conn);
            $conversionRepository ??= new MysqlConversionRepository($conn);
            $auditRepository ??= new MysqlAuditRepository($conn);
        }

        return new AttributionJobRunner(
            $modelRepository ?? new NullModelRepository(),
            $snapshotRepository ?? new NullSnapshotRepository(),
            $touchpointRepository ?? new NullTouchpointRepository(),
            $conversionRepository ?? new NullConversionRepository(),
            $auditRepository ?? new NullAuditRepository()
        );
    }

    public static function createSettingsService(
        ?SettingsRepositoryInterface $settingsRepository = null,
        ?ModelRepositoryInterface $modelRepository = null,
        ?JourneyMaintenanceRepositoryInterface $journeyRepository = null
    ): SettingsService {
        if ($settingsRepository === null || $modelRepository === null || $journeyRepository === null) {
            $conn = self::buildConnection();

            if ($conn !== null) {
                $settingsRepository ??= new MysqlSettingRepository($conn);
                $modelRepository ??= new MysqlModelRepository($conn);
                $journeyRepository ??= new ConversionJourneyRepository($conn);
            }
        }

        return new SettingsService(
            $settingsRepository ?? new NullSettingsRepository(),
            $modelRepository ?? new NullModelRepository(),
            $journeyRepository
        );
    }

    private static function buildConnection(): ?Connection
    {
        $db = \DB::getInstance();
        $writeConnection = $db->getConnection();
        $readConnection = $db->getConnectionro();

        if (!$writeConnection instanceof \mysqli) {
            return null;
        }

        return new Connection($writeConnection, $readConnection);
    }
}
