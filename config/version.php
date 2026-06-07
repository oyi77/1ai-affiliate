<?php
/**
 * 1ai-Affiliate Version Configuration
 * Single source of truth for version management
 */
declare(strict_types=1);

// Validate version format before defining
$version_string = '1.9.59';
if (!preg_match('/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/', $version_string)) {
    throw new Exception('Invalid version format: ' . $version_string);
}

// Primary version constant
if (!defined('ONEAI_AFFILIATE_VERSION')) {
    define('ONEAI_AFFILIATE_VERSION', $version_string);
}

// For backward compatibility - make global
global $version;
$version = ONEAI_AFFILIATE_VERSION;

/**
 * Helper function for version comparisons
 * @param string $operator Comparison operator (<, >, <=, >=, ==, !=)
 * @param string|null $compare_version Version to compare against (defaults to current version)
 * @return bool Result of version comparison
 */
if (!function_exists('oneai_affiliate_version_compare')) {
    function oneai_affiliate_version_compare(string $operator, ?string $compare_version = null): bool {
        $compare_against = $compare_version ?? ONEAI_AFFILIATE_VERSION;
        return version_compare(ONEAI_AFFILIATE_VERSION, $compare_against, $operator);
    }
}

if (!defined('ONEAI_AFFILIATE_MIN_PHP_VERSION')) {
    define('ONEAI_AFFILIATE_MIN_PHP_VERSION', '8.1.0');
}

if (!function_exists('php_version_supported')) {
    function php_version_supported(): bool
    {
        return version_compare(PHP_VERSION, ONEAI_AFFILIATE_MIN_PHP_VERSION, '>=');
    }
}

