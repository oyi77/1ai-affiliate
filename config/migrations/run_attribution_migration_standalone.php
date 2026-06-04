<?php

declare(strict_types=1);

/**
 * Standalone attribution models migration script
 * Run this after configuring 1ai-Affiliate database settings
 */

echo "1ai-Affiliate Attribution Models Migration\n";
echo "=======================================\n\n";

$rootDir = dirname(__DIR__, 2);

// Check if this is being run in the correct directory
if (!file_exists($rootDir . '/config.php')) {
    echo "Error: This script must be run from the 1ai-Affiliate root directory\n";
    echo "   Expected to find config.php in: " . $rootDir . "\n";
    echo "   Usage: php config/migrations/run_attribution_migration_standalone.php\n";
    exit(1);
}

require_once $rootDir . '/config.php';

// Create database connection manually
$db = new mysqli(MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DATABASE);

if ($db->connect_error) {
    echo "❌ Database connection failed: " . $db->connect_error . "\n";
    echo "   Please check your database configuration in config.php\n";
    echo "   Host: " . MYSQL_HOST . "\n";
    echo "   Database: " . MYSQL_DATABASE . "\n";
    echo "   User: " . MYSQL_USER . "\n";
    exit(1);
}

echo "✅ Database connection successful\n";
echo "   Host: " . MYSQL_HOST . "\n";
echo "   Database: " . MYSQL_DATABASE . "\n\n";

try {
    // Read the SQL file
    $sqlFile = __DIR__ . '/create_attribution_models_table.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: {$sqlFile}");
    }
    
    $sql = file_get_contents($sqlFile);
    
    if ($sql === false) {
        throw new Exception("Failed to read migration file");
    }
    
    // Split SQL into individual statements
    $statements = array_filter(
        array_map(trim(...), explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*--/', (string) $stmt);
        }
    );
    
    echo "Found " . count($statements) . " SQL statements to execute...\n\n";
    
    // Execute each statement
    $db->begin_transaction();
    
    foreach ($statements as $index => $statement) {
        echo "Executing statement " . ($index + 1) . "... ";
        
        $result = $db->query($statement);
        
        if (!$result) {
            throw new Exception("SQL Error in statement " . ($index + 1) . ": " . $db->error);
        }
        
        echo "✅";
        
        // Show affected rows for data manipulation statements
        if ($db->affected_rows > 0) {
            echo " ({$db->affected_rows} rows affected)";
        }
        echo "\n";
    }
    
    $db->commit();
    
    echo "\n🎉 Migration completed successfully!\n";
    echo "Attribution models tables have been created.\n\n";
    
    // Verify table creation
    $tables = ['attribution_models', 'attribution_snapshots', 'attribution_touchpoints', 'attribution_settings'];
    
    echo "Verifying table creation...\n";
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '{$table}'");
        if ($result && $result->num_rows > 0) {
            echo "  ✅ {$table}\n";
        } else {
            echo "  ❌ {$table} - NOT FOUND\n";
        }
    }
    
    // Check if campaigns table was updated
    $result = $db->query("SHOW COLUMNS FROM aff_campaigns LIKE 'attribution_model_id'");
    if ($result && $result->num_rows > 0) {
        echo "  ✅ aff_campaigns.attribution_model_id field added\n";
    } else {
        echo "  ❌ aff_campaigns.attribution_model_id field missing\n";
    }
    
    echo "\nChecking default attribution models...\n";
    $result = $db->query("SELECT COUNT(*) as total FROM attribution_models WHERE is_default = 1");
    
    if ($result) {
        $row = $result->fetch_assoc();
        $defaultModelCount = (int)$row['total'];
        
        if ($defaultModelCount > 0) {
            echo "  ✅ {$defaultModelCount} default attribution model(s) created\n";
            
            // Show first few default models
            $result = $db->query("SELECT user_id, model_name, model_type FROM attribution_models WHERE is_default = 1 ORDER BY user_id LIMIT 5");
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    echo "     User {$row['user_id']}: {$row['model_name']} ({$row['model_type']})\n";
                }
            }
        } else {
            echo "  ⚠️  No default models found - this may be normal if no users exist yet\n";
        }
    }
    
} catch (Exception $e) {
    $db->rollback();
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🚀 Attribution system is ready to use!\n";
echo "Next steps:\n";
echo "1. Access 1ai-Affiliate setup section\n";
echo "2. Navigate to Setup > Attribution Models\n";
echo "3. Create your first attribution model\n";
echo "4. Assign models to campaigns\n\n";
echo "For detailed usage instructions, see ATTRIBUTION_SETUP.md\n";