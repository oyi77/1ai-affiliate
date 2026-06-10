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
