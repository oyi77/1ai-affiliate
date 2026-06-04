<?php
declare(strict_types=1);

/**
 * 1ai-Affiliate Database Installation Functions
 *
 * This file provides backward-compatible installation methods that delegate
 * to the new modular schema installation classes.
 *
 * @see \OneAIAffiliate\Database\SchemaInstaller
 * @see \OneAIAffiliate\Database\PartitionInstaller
 * @see \OneAIAffiliate\Database\DataSeeder
 */

set_time_limit(0);

include_once(__DIR__ . '/functions-upgrade.php');

// Autoload the new Database classes
// Note: These are also available via Composer autoload if vendor/autoload.php is loaded
spl_autoload_register(function (string $class): void {
    // Handle 1ai-Affiliate\Database namespace
    if (str_starts_with($class, '1ai-Affiliate\\Database\\')) {
        $relativePath = str_replace('1ai-Affiliate\\Database\\', '', $class);
        $relativePath = str_replace('\\', DIRECTORY_SEPARATOR, $relativePath);
        $filePath = __DIR__ . DIRECTORY_SEPARATOR . 'Database' . DIRECTORY_SEPARATOR . $relativePath . '.php';

        if (file_exists($filePath)) {
            require_once $filePath;
        }
    }
});

use OneAIAffiliate\Database\SchemaInstaller;
use OneAIAffiliate\Database\PartitionInstaller;
use OneAIAffiliate\Database\DataSeeder;

/**
 * Legacy installation class maintained for backward compatibility.
 *
 * This class delegates to the new modular installation classes:
 * - SchemaInstaller: Creates all database tables
 * - DataSeeder: Seeds initial data
 * - PartitionInstaller: Creates table partitions
 */
class INSTALL
{
    /**
     * Install all database tables and seed initial data.
     *
     * This method creates all 70+ database tables required by 1ai-Affiliate
     * and populates them with initial seed data (roles, permissions, etc.).
     *
     * @throws RuntimeException If database connection fails
     */
    public function install_databases(): void
    {
        $database = DB::getInstance();
        $db = $database->getConnection();

        if ($db === null || !($db instanceof mysqli)) {
            throw new RuntimeException('Database connection failed');
        }

        // Get PHP version for version table
        $php_version = PROSPER202::php_version_static();

        // Install all schema tables using the new modular installer
        $installer = new SchemaInstaller($db);
        $result = $installer->install();

        // Log any errors (but don't fail - matches original behavior)
        if ($result->hasErrors()) {
            foreach ($result->errors as $error) {
                error_log('INSTALL::install_databases() - ' . $error);
            }
        }

        // Seed initial data
        $seeder = new DataSeeder($db);
        $seeder->seed();
        $seeder->seedVersion($php_version);

        // Add publisher IDs to all existing users
        createPublisherIds();
    }

    /**
     * Install database partitions for high-volume tables.
     *
     * Partitions are created for tables that may grow very large:
     * - Click tracking tables (partitioned by click_id)
     * - Time-series tables (partitioned by click_time)
     *
     * If MySQL partitioning is not supported, this method silently skips.
     */
    public function install_database_partitions(): void
    {
        $database = DB::getInstance();
        $db = $database->getConnection();

        if ($db === null || !($db instanceof mysqli)) {
            throw new RuntimeException('Database connection failed');
        }

        $partitioner = new PartitionInstaller($db);
        $partitioner->install();
    }
}
