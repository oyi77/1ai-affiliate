#!/usr/bin/env php
<?php
declare(strict_types=1);
/**
 * 1ai-Affiliate migration runner.
 * Runs migration scripts in order. All scripts are idempotent (IF NOT EXISTS).
 *
 * Usage: php scripts/run_migrations.php
 */

require_once dirname(__DIR__) . '/config.php';

$migrations = [
    '001_affiliate_tables.sql',
    '002_margin_engine.sql',
    '003_offers.sql',
    '004_commission_ledger.sql',
    '005_payment_table.sql',
];

foreach ($migrations as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path)) {
        echo "SKIP $file (not found)\n";
        continue;
    }

    $sql = file_get_contents($path);
    if ($sql === false || trim($sql) === '') {
        echo "SKIP $file (empty)\n";
        continue;
    }

    try {
        $db->multi_query($sql);
        do {
            if ($result = $db->store_result()) {
                $result->free();
            }
        } while ($db->more_results() && $db->next_result());

        if ($db->errno) {
            echo "ERROR $file: " . $db->error . "\n";
            exit(1);
        }

        echo "OK    $file\n";
    } catch (\Throwable $e) {
        echo "ERROR $file: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo "All migrations complete.\n";
