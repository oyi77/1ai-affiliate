<?php

/**
 * Global lookup functions — Gen 3 repository pattern.
 *
 * Each function delegates to the appropriate repository (Location, Tracking, or Device)
 * instead of the legacy INDEXES class. This eliminates real_escape_string string
 * concatenation and uses prepared statements via Connection.
 */

require_once __DIR__ . '/Database/Connection.php';
require_once __DIR__ . '/Repository/LocationRepositoryInterface.php';
require_once __DIR__ . '/Repository/TrackingRepositoryInterface.php';
require_once __DIR__ . '/Repository/DeviceRepositoryInterface.php';
require_once __DIR__ . '/Repository/Mysql/MysqlLocationRepository.php';
require_once __DIR__ . '/Repository/Mysql/MysqlTrackingRepository.php';
require_once __DIR__ . '/Repository/Mysql/MysqlDeviceRepository.php';
require_once __DIR__ . '/Repository/IpLookupInput.php';

if (!function_exists('getIndexesInstance')) {
    function getIndexesInstance()
    {
        static $instance = null;
        if ($instance === null) {
            $database = DB::getInstance();
            $conn = new \OneAIAffiliate\Database\Connection($database->getConnection());
            $instance = new class ($conn) {
                public \OneAIAffiliate\Repository\Mysql\MysqlLocationRepository $location;
                public \OneAIAffiliate\Repository\Mysql\MysqlTrackingRepository $tracking;
                public \OneAIAffiliate\Repository\Mysql\MysqlDeviceRepository $device;
                public function __construct(\OneAIAffiliate\Database\Connection $conn)
                {
                    $this->location = new \OneAIAffiliate\Repository\Mysql\MysqlLocationRepository($conn);
                    $this->tracking = new \OneAIAffiliate\Repository\Mysql\MysqlTrackingRepository($conn);
                    $this->device = new \OneAIAffiliate\Repository\Mysql\MysqlDeviceRepository($conn);
                }
            };
        }
        return $instance;
    }
}

// --- Location lookups ---

if (!function_exists('get_country_id')) {
    function get_country_id($country_name, $country_code)
    {
        return getIndexesInstance()->location->findOrCreateCountry($country_name, $country_code);
    }
}

if (!function_exists('get_city_id')) {
    function get_city_id($city_name, $country_id)
    {
        return getIndexesInstance()->location->findOrCreateCity($city_name, (int)$country_id);
    }
}

if (!function_exists('get_isp_id')) {
    function get_isp_id($isp)
    {
        return getIndexesInstance()->location->findOrCreateIsp($isp);
    }
}

if (!function_exists('get_ip_id')) {
    function get_ip_id($ip_address)
    {
        return getIndexesInstance()->location->findOrCreateIp($ip_address);
    }
}

if (!function_exists('get_site_domain_id')) {
    function get_site_domain_id($site_url)
    {
        return getIndexesInstance()->location->findOrCreateSiteDomain((string)$site_url);
    }
}

if (!function_exists('get_site_url_id')) {
    function get_site_url_id($site_url)
    {
        return getIndexesInstance()->location->findOrCreateSiteUrl((string)$site_url);
    }
}

// --- Tracking lookups ---

if (!function_exists('get_keyword_id')) {
    function get_keyword_id($keyword_name)
    {
        return getIndexesInstance()->tracking->findOrCreateKeyword($keyword_name);
    }
}

if (!function_exists('get_c1_id')) {
    function get_c1_id($c1)
    {
        return getIndexesInstance()->tracking->findOrCreateC1($c1);
    }
}

if (!function_exists('get_c2_id')) {
    function get_c2_id($c2)
    {
        return getIndexesInstance()->tracking->findOrCreateC2($c2);
    }
}

if (!function_exists('get_c3_id')) {
    function get_c3_id($c3)
    {
        return getIndexesInstance()->tracking->findOrCreateC3($c3);
    }
}

if (!function_exists('get_c4_id')) {
    function get_c4_id($c4)
    {
        return getIndexesInstance()->tracking->findOrCreateC4($c4);
    }
}

// --- Device lookups ---

if (!function_exists('get_browser_id')) {
    function get_browser_id($browser_name)
    {
        return getIndexesInstance()->device->findOrCreateBrowser($browser_name);
    }
}

if (!function_exists('get_platform_id')) {
    function get_platform_id($platform_name)
    {
        return getIndexesInstance()->device->findOrCreatePlatform($platform_name);
    }
}

if (!function_exists('get_device_id')) {
    function get_device_id($device_name)
    {
        return getIndexesInstance()->device->findOrCreateDevice($device_name);
    }
}

if (!function_exists('get_variable_id')) {
    function get_variable_id($variable, $ppc_variable_id)
    {
        return getIndexesInstance()->tracking->findOrCreateVariable($variable, (int)$ppc_variable_id);
    }
}

if (!function_exists('get_variable_set_id')) {
    function get_variable_set_id($variables)
    {
        return getIndexesInstance()->tracking->findOrCreateVariableSet($variables);
    }
}

if (!function_exists('get_custom_var_id')) {
    function get_custom_var_id($custom_var_name, $custom_var_data)
    {
        return getIndexesInstance()->tracking->findOrCreateCustomVar($custom_var_name, $custom_var_data);
    }
}

if (!function_exists('get_utm_id')) {
    function get_utm_id($utm_var, $utm_type)
    {
        return getIndexesInstance()->tracking->findOrCreateUtm($utm_var, $utm_type);
    }
}

if (!function_exists('get_region_id')) {
    function get_region_id($region_name, $country_id)
    {
        return getIndexesInstance()->location->findOrCreateRegion($region_name, (int)$country_id);
    }
}

