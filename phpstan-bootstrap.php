<?php
/**
 * PHPStan bootstrap — loads globals (config.php -> $db, $dbro, DB class) so static
 * analysis can resolve them. Production code uses these globals as well; this just
 * makes the symbols known to PHPStan.
 */
declare(strict_types=1);

// The DB class is a global singleton defined in config.php. Mock it for static analysis.
if (!class_exists('DB', false)) {
    eval('class DB { public static function getInstance(): self { return new self(); } public function getConnection(): mixed { return null; } public function getConnectionro(): mixed { return null; } }');
}

// The OneAIAffiliate\OneAIAffiliate compatibility class is used by older code paths.
if (!class_exists('OneAIAffiliate\\OneAIAffiliate', false)) {
    eval('namespace OneAIAffiliate; class OneAIAffiliate { public static function oneai_affiliate_version(): string { return "1.0"; } public static function php_version(): string { return "8.4"; } public static function php_version_static(): string { return "8.4"; } }');
}

if (!class_exists('UPGRADE', false)) {
    eval('class UPGRADE { public static function upgrade_databases(): bool { return true; } }');
}

if (!class_exists('INDEXES', false)) {
    eval('class INDEXES { public static function get_country_id(mixed $a, ?int $b = null): int { return 0; } public static function get_city_id(mixed $a, ?int $b = null): int { return 0; } public static function get_isp_id(mixed $a, ?int $b = null): int { return 0; } public static function get_keyword_id(mixed $a, ?int $b = null): int { return 0; } public static function get_c1_id(mixed $a, ?int $b = null): int { return 0; } public static function get_c2_id(mixed $a, ?int $b = null): int { return 0; } public static function get_c3_id(mixed $a, ?int $b = null): int { return 0; } public static function get_c4_id(mixed $a, ?int $b = null): int { return 0; } public static function get_variable_id(mixed $a, ?int $b = null): int { return 0; } public static function get_variable_set_id(mixed $a, ?int $b = null): int { return 0; } public static function get_custom_var_id(mixed $a, ?int $b = null): int { return 0; } public static function get_utm_id(mixed $a, ?int $b = null): int { return 0; } public static function get_ip_id(mixed $a, ?int $b = null): int { return 0; } public static function get_site_url_id(mixed $a, ?int $b = null): int { return 0; } public function get_country_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_city_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_isp_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_keyword_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_c1_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_c2_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_c3_id_inst(mixed $a, ?int $b = null): int { return 0; } public function get_c4_id_inst(mixed $a, ?int $b = null): int { return 0; } }');
}

// Constants for legacy dashboard classes
if (!defined('DASHBOARD_API_URL')) define('DASHBOARD_API_URL', '');
if (!defined('DASHBOARD_CACHE_TTL')) define('DASHBOARD_CACHE_TTL', 0);

// Constants for WordPress compat layer (l10n.php)
if (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');
if (!defined('LANGDIR')) define('LANGDIR', 'languages');
if (!defined('PLUGINDIR')) define('PLUGINDIR', 'wp-content/plugins');
if (!function_exists('get_template_directory')) {
    function get_template_directory(): string { return __DIR__; }
}

// WordPress i18n classes used by l10n.php
if (!class_exists('CachedFileReader', false)) {
    eval('class CachedFileReader { public function __construct(mixed $filename) {} }');
}
if (!class_exists('gettext_reader', false)) {
    eval('class gettext_reader { public function __construct(mixed $reader) {} public function translate(string $text): string { return $text; } }');
}

// Constants for standalone migration script
if (!defined('MYSQL_HOST')) define('MYSQL_HOST', '');
if (!defined('MYSQL_DATABASE')) define('MYSQL_DATABASE', '');
if (!defined('MYSQL_USER')) define('MYSQL_USER', '');
if (!defined('MYSQL_PASS')) define('MYSQL_PASS', '');

// Constants for legacy template
if (!defined('TRACKING1ai_ADS_URL')) define('TRACKING1ai_ADS_URL', '');

// Stub classes for excluded files referenced from non-excluded files
if (!class_exists('DataEngine', false)) {
    eval('class DataEngine { public function __construct(mixed ...$args) {} public function setDirtyHour(mixed ...$args): void {} }');
}
if (!class_exists('FilterEngine', false)) {
    eval('class FilterEngine { public function __construct(mixed ...$args) {} public function getFilter(mixed ...$args): mixed { return null; } public function getFilterNames(mixed ...$args): array { return []; } }');
}
if (!class_exists('ReportBasicForm', false)) {
    eval('class ReportBasicForm { public const DETAIL_LEVEL_NONE = 0; public static function getDetailArray(mixed ...$args): array { return []; } public static function translateDetailLevelById(mixed ...$args): string { return ""; } }');
}
if (!class_exists('ReportSummaryForm', false)) {
    eval('class ReportSummaryForm { public static function getDetailArray(mixed ...$args): array { return []; } }');
}
