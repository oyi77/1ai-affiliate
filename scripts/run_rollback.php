#!/usr/bin/env php
<?php
/**
 * run_rollback.php — apply migration rollback scripts in reverse order.
 *
 * Usage:
 *   php scripts/run_rollback.php [--from=NNN] [--to=NNN] [--dry-run]
 *
 * Options:
 *   --from=NNN   Only roll back migrations >= NNN (default: all)
 *   --to=NNN     Only roll back migrations <= NNN (default: all)
 *   --dry-run    Print SQL without executing
 *
 * The script applies _down.sql files in DESCENDING numeric order so that
 * higher-numbered migrations are reversed first (dependency-safe).
 *
 * ALWAYS take a database backup before running rollbacks in production.
 */

require_once __DIR__ . '/../config/connect2.php';  // provides $pdo or $db

// ------------------------------------------------------------------
// Argument parsing
// ------------------------------------------------------------------
$opts     = getopt('', ['from:', 'to:', 'dry-run']);
$fromNum  = isset($opts['from']) ? (int)$opts['from'] : 0;
$toNum    = isset($opts['to'])   ? (int)$opts['to']   : PHP_INT_MAX;
$dryRun   = array_key_exists('dry-run', $opts);

// ------------------------------------------------------------------
// Discover rollback scripts
// ------------------------------------------------------------------
$rollbackDir = __DIR__ . '/rollback';
$files = glob($rollbackDir . '/*.sql');
if (empty($files)) {
    fwrite(STDERR, "No rollback scripts found in {$rollbackDir}\n");
    exit(1);
}

// Parse numeric prefix from filename (e.g. "014_adtech_schema_final_down.sql" → 14)
$migrations = [];
foreach ($files as $path) {
    $base = basename($path);
    if (preg_match('/^(\d+)_/', $base, $m)) {
        $num = (int)$m[1];
        if ($num >= $fromNum && $num <= $toNum) {
            $migrations[$num][] = $path;
        }
    }
}

if (empty($migrations)) {
    echo "No rollback scripts match the requested range.\n";
    exit(0);
}

// Apply in descending order (highest migration first)
krsort($migrations);

// ------------------------------------------------------------------
// Resolve DB connection — support both PDO ($pdo) and legacy ($db)
// ------------------------------------------------------------------
$conn = null;
if (isset($pdo) && $pdo instanceof PDO) {
    $conn = $pdo;
} elseif (isset($db) && $db instanceof PDO) {
    $conn = $db;
} else {
    fwrite(STDERR, "ERROR: No PDO connection available from connect2.php\n");
    exit(1);
}

// ------------------------------------------------------------------
// Execute
// ------------------------------------------------------------------
$total = 0;
$applied = 0;

foreach ($migrations as $num => $paths) {
    foreach ($paths as $path) {
        $base = basename($path);
        echo ($dryRun ? "[DRY-RUN] " : "") . "Applying rollback: {$base}\n";
        $sql = file_get_contents($path);

        // Split on semicolons, skip blank/comment-only chunks
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            static fn(string $s): bool =>
                $s !== '' && !preg_match('/^\s*--/m', $s) || preg_match('/\S/', preg_replace('/--[^\n]*\n?/', '', $s))
        );

        foreach ($statements as $stmt) {
            $stmt = trim(preg_replace('/--[^\n]*/', '', $stmt));
            if ($stmt === '') {
                continue;
            }
            $total++;
            if ($dryRun) {
                echo "  SQL: " . substr($stmt, 0, 120) . (strlen($stmt) > 120 ? '...' : '') . "\n";
                $applied++;
                continue;
            }
            try {
                $conn->exec($stmt);
                $applied++;
            } catch (PDOException $e) {
                fwrite(STDERR, "  ERROR in {$base}: " . $e->getMessage() . "\n");
                fwrite(STDERR, "  Statement: " . substr($stmt, 0, 200) . "\n");
                fwrite(STDERR, "Rollback aborted at {$base}. Database may be in a partial state.\n");
                exit(1);
            }
        }
        echo "  Done ({$applied}/{$total} statements executed).\n";
    }
}

echo "\nRollback complete: {$applied} statement(s) applied.\n";
exit(0);
