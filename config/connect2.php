<?php

use UAParser\Parser;
use GeoIp2\Database\Reader;

// Load centralized version configuration
if (!file_exists(__DIR__ . '/version.php')) {
    die('Critical: Version file missing');
}
require_once(__DIR__ . '/version.php');

$_GET = array_change_key_case($_GET, CASE_LOWER);
//fix for nginx with no server name set
if ($_SERVER['SERVER_NAME'] == '_') {
    $_SERVER['SERVER_NAME'] = $_SERVER['HTTP_HOST'];
}

DEFINE('ROOT_PATH', substr(__DIR__, 0, -7));
DEFINE('CONFIG_PATH', __DIR__);
//@ini_set('register_globals', 0);
@ini_set('display_errors', 'Off');
@ini_set('error_reporting', 6135);

mysqli_report(MYSQLI_REPORT_STRICT);
include_once(ROOT_PATH . '/config.php');

// Get database instance
$database = DB::getInstance();
$db = $database->getConnection();

$whatCache = false;

// try to connect to memcache server
$memcacheInstalled = false;
global $memcacheWorking;
$memcacheWorking = false;
/** @var \Memcache|\Memcached|null $memcache */
$memcache = null; // Initialize $memcache
$mchost = $mchost ?? '127.0.0.1';

if (extension_loaded('memcache') && class_exists('Memcache')) {
    $whatCache = 'memcache';
    $memcacheInstalled = true;
    /** @var \Memcache $memcache */
    $memcache = new \Memcache();
    if (@$memcache->connect($mchost, 11211)) {
        $memcacheWorking = true;
    } else {
        $memcacheWorking = false;
    }
} elseif (extension_loaded('memcached') && class_exists('Memcached')) {
    $whatCache = 'memcached';
    $memcacheInstalled = true;
    /** @var \Memcached $memcache */
    $memcache = new \Memcached();
    // Note: Corrected method name from addserver to addServer
    if (@$memcache->addServer($mchost, 11211)) {
        $memcacheWorking = true;
    } else {
        $memcacheWorking = false;
    }
} else {
    // Neither extension is loaded or class doesn't exist
    $memcacheInstalled = false;
    $memcacheWorking = false;
}


function setCache($key, $value, $exp = null)
{
    global $whatCache, $memcache;
    // Default expiration time if not provided
    if ($exp === null) {
        $exp = 2592000; // 30 days in seconds
    }
    switch ($whatCache) {
        case 'memcache':
            return $memcache->set($key, $value, false, $exp);

        case 'memcached':
            return $memcache->set($key, $value, $exp);
    }
}

function getCache(string $key, $default = false)
{
    global $memcache;
    if ($memcache instanceof \Memcached || $memcache instanceof \Memcache) {
        return call_user_func([$memcache, 'get'], $key);
    }
    return $default;
}


include_once(CONFIG_PATH . '/functions-auth.php');
if (!function_exists('array_any')) {
    function array_any(array $items, callable $callback): bool
    {
        foreach ($items as $key => $value) {
            if ($callback($value, $key)) {
                return true;
            }
        }
        return false;
    }
}
include_once(CONFIG_PATH . '/DeviceDetect.php');
include_once(CONFIG_PATH . '/FraudDetectionIPQS.class.php');
require ROOT_PATH . 'vendor/autoload.php';

// Initialize $tid and $db variables to prevent undefined variable errors
if (!isset($tid)) {
    // If $t1aiid is set (from dl.php), use that for $tid
    if (isset($t1aiid) && is_numeric($t1aiid)) {
        $tid = $t1aiid;
    } else {
        $tid = 1; // Default to user_id 1 if not set
    }
}

// Initialize database connection using the DB class from config.php
if (!isset($db)) {
    try {
        $database = DB::getInstance();
        $db = $database->getConnection();
    } catch (Exception $e) {
        // Log error but don't interrupt execution
        error_log('Database connection error in connect2.php: ' . $e->getMessage());
        $db = null; // dl.php checks if $db is falsey
    }
}

//determine privacy mode
if ($memcacheWorking) {
    // Try to determine tracker/user ID from various possible sources
    $tid = '';
    if (isset($_GET['t1aiid'])) {
        $tid = $_GET['t1aiid'];
    } elseif (isset($_GET['pci'])) {
        $tid = $_GET['pci'];
    } elseif (isset($_GET['lpip'])) {
        $tid = $_GET['lpip'];
    } elseif (isset($_SESSION['user_id'])) {
        $tid = $_SESSION['user_id'];
    } else {
        // Default to user 1 if no ID is found
        $tid = '1';
    }
    $_SESSION['privacy'] = getCache(md5('user_pref_privacy_' . $tid . systemHash()));
}

//set sql mode - only if db connection is available
if ($db) {
    // Use strict mode when P1AI_SQL_STRICT is defined and truthy in config;
    // defaults to permissive mode for backward compatibility with existing installs.
    if (defined('P1AI_SQL_STRICT') && P1AI_SQL_STRICT) {
        $user_sql = "SET session sql_mode= 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'";
    } else {
        $user_sql = "SET session sql_mode= ''";
    }
    try {
        $user_results = $db->query($user_sql);
    } catch (Exception $e) {
        error_log('Error setting SQL mode in connect2.php: ' . $e->getMessage());
    }
}


if (!isset($_SESSION['privacy'])) {

    $user_sql = "	SELECT 	user_pref_privacy
				 FROM   	`users_pref`
				 WHERE  	`users_pref`.`user_id`='1'";

    $privacy = memcache_mysql_fetch_assoc($user_sql);
    if (isset($privacy['user_pref_privacy'])) {
        $_SESSION['privacy'] = $privacy['user_pref_privacy'];
    } else {
        $_SESSION['privacy'] = 'disabled'; //default to disabled
    }
}


// get the real ip
$_SERVER['HTTP_X_FORWARDED_FOR'] = match (true) {
    !empty($_SERVER['HTTP_CF_CONNECTING_IP']) => $_SERVER['HTTP_CF_CONNECTING_IP'],
    !empty($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']) => $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'],
    !empty($_SERVER['HTTP_X_SUCURI_CLIENTIP']) => $_SERVER['HTTP_X_SUCURI_CLIENTIP'],
    !empty($_SERVER['HTTP_X_REAL_IP']) => $_SERVER['HTTP_X_REAL_IP'],
    !empty($_SERVER['HTTP_CLIENT_IP']) => $_SERVER['HTTP_CLIENT_IP'],
    !empty($_SERVER['HTTP_X_FORWARDED_FOR']) && ($_SERVER['SERVER_ADDR'] != $_SERVER['HTTP_X_FORWARDED_FOR']) => $_SERVER['HTTP_X_FORWARDED_FOR'],
    default => $_SERVER['REMOTE_ADDR'],
};

$tempip = explode(",", (string) $_SERVER['HTTP_X_FORWARDED_FOR']);
$_SERVER['HTTP_X_FORWARDED_FOR'] = trim($tempip[0]);
$ip_address = ipAddress($_SERVER['HTTP_X_FORWARDED_FOR']);

function trackingEnabled(): bool
{
    $trackingEnabled = true;

    if ($_SESSION['privacy'] === 'all' || ($_SESSION['privacy'] === 'eu' && $_SESSION['is_european_union'])) {
        $trackingEnabled = false;
    }

    return $trackingEnabled;
}

function _mysqli_query($dbOrSql, $sql = null)
{
    if ($sql === null) {
        $sql = (string) $dbOrSql;
        $db = $GLOBALS['db'] ?? null;
    } else {
        $db = $dbOrSql;
    }

    if (!$db instanceof \mysqli) {
        $database = \DB::getInstance();
        $db = $database->getConnection();
    }

    if (!$db instanceof \mysqli) {
        record_mysql_error((string) $sql);
    }

    $result = $db->query((string) $sql) or record_mysql_error($db, (string) $sql); //or die($db->error . '<br/><br/>' . $sql);
    return $result;
}

// our own die, that will display the them around the error message
function _die($message, ...$legacyArgs): never
{
    echo $message;
    die();
}

// this funciton delays an SQL statement, puts in in a mysql table, to be cron jobbed out every 5 minutes
function delay_sql($db, $delayed_sql): void
{
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $mysql['delayed_sql'] = $conn->escape($delayed_sql);
    $mysql['delayed_time'] = time();

    $delayed_sql = "INSERT INTO  delayed_sqls 

					(
						delayed_sql ,
						delayed_time
					)

					VALUES 
					(
						'" . $mysql['delayed_sql'] . "',
						'" . $mysql['delayed_time'] . "'
					);";

    $delayed_result = $conn->query($delayed_sql); // ($delayed_sql);
}

class FILTER
{

    public static function startFilter($db, $click_id, $ip_id, $ip_address, $user_id)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);

        // we only do the other checks, if the first ones have failed.
        // we will return the variable filter, if the $filter returns TRUE, when the click is inserted and recorded we will insert the new click already inserted,
        // what was lagign this query is before it would insert a click, then scan it and then update the click, the updating later on was lagging, now we will just insert and it will not stop the clicks from being redirected becuase of a slow update.

        // check the user
        $filter = FILTER::checkUserIP($db, $click_id, $ip_id, $user_id);
        if ($filter == false) {

            // check the netrange
            $filter = FILTER::checkNetrange($click_id, $ip_address);
            if ($filter == false) {

                $filter = FILTER::checkLastIps($db, $user_id, $ip_id);
            }
        }

        if ($filter == true) {
            return 1;
        } else {
            return 0;
        }
    }

    public static function checkUserIP($db, $click_id, $ip_id, $user_id)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        // $user_id no longer needed

        $mysql['ip_id'] = $conn->escape($ip_id);
        $mysql['user_id'] = $conn->escape($user_id);

        $count_sql = "SELECT    user_id
					  FROM      users 
					  WHERE     user_last_login_ip_id='" . $mysql['ip_id'] . "'";
        $count_result = $conn->query($count_sql); // ($count_sql);

        // if the click_id's ip address, is the same ip adddress of the click_id's owner's last logged in ip, filter this. 
        if ($count_result->num_rows > 0) {

            return true;
        }
        return false;
    }

    public static function checkNetrange($click_id, $ip)
    {
        $ip_address = ip2long(is_string($ip) ? $ip : $ip->address);

        // check each netrange
        /* google1 */
        if (($ip_address >= 1208926208) and ($ip_address <= 1208942591)) {
            return true;
        }
        /* google2 */
        if (($ip_address >= 3512041472) and ($ip_address <= 3512074239)) {
            return true;
        }
        /* google3 */
        if (($ip_address >= 1123631104) and ($ip_address <= 1123639295)) {
            return true;
        }
        /* Google4 */
        if (($ip_address >= 1089052672) and ($ip_address <= 1089060863)) {
            return true;
        }
        /* google5 */
        if (($ip_address >= -782925824) and ($ip_address <= -782893057)) {
            return true;
        }

        /* level 3 communications */
        if (($ip_address >= 1094189056) and ($ip_address <= 1094451199)) {
            return true;
        }

        /* yahoo1 */
        if (($ip_address >= 3515031552) and ($ip_address <= 3515039743)) {
            return true;
        }
        /* Yahoo2 */
        if (($ip_address >= 3633393664) and ($ip_address <= 3633397759)) {
            return true;
        }
        /* Yahoo3 */
        if (($ip_address >= 3640418304) and ($ip_address <= 3640426495)) {
            return true;
        }
        /* Yahoo4 */
        if (($ip_address >= 1209925632) and ($ip_address <= 1209991167)) {
            return true;
        }
        /* Yahoo5 */
        if (($ip_address >= 1241907200) and ($ip_address <= 1241972735)) {
            return true;
        }

        /* Performance Systems International Inc. */
        if (($ip_address >= 637534208) and ($ip_address <= 654311423)) {
            return true;
        }
        /* Microsoft */
        if (($ip_address >= 3475898368) and ($ip_address <= 3475963903)) {
            return true;
        }
        /* MSN */
        if (($ip_address >= 1093926912) and ($ip_address <= 1094189055)) {
            return true;
        }

        // if it was none of theses, return false
        return false;
    }

    // this will filter out a click if it the IP WAS RECORDED, for a particular user within the last 24 hours, if it existed before, filter out this click.
    public static function checkLastIps($db, $user_id, $ip_id)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);


        $mysql['user_id'] = $conn->escape($user_id);
        $mysql['ip_id'] = $conn->escape($ip_id);

        $check_sql = "SELECT * FROM last_ips WHERE user_id='" . $mysql['user_id'] . "' AND ip_id='" . $mysql['ip_id'] . "'";
        $check_result = $conn->query($check_sql); // ($check_sql);
        $check_row = $check_result->fetch_assoc();
        $count = $check_result->num_rows;

        if ($count > 0) {
            // if this ip has been seen within the last 24 hours, filter it out.
            return true;
        } else {

            // else if this ip has not been recorded, record it now
            $mysql['time'] = time();
            $insert_sql = "INSERT INTO last_ips SET user_id='" . $mysql['user_id'] . "', ip_id='" . $mysql['ip_id'] . "', time='" . $mysql['time'] . "'";
            $insert_result = $conn->query($insert_sql); // ($insert_sql);
            return false;
        }
    }
}

function rotateTrackerUrl($db, $tracker_row)
{
    $conn = new \OneAIAffiliate\Database\Connection($db);


    if (! $tracker_row['aff_campaign_rotate'])
        return $tracker_row['aff_campaign_url'];

    $mysql['aff_campaign_id'] = $conn->escape($tracker_row['aff_campaign_id']);
    $urls = [];
    array_push($urls, $tracker_row['aff_campaign_url']);

    if ($tracker_row['aff_campaign_url_2'])
        array_push($urls, $tracker_row['aff_campaign_url_2']);
    if ($tracker_row['aff_campaign_url_3'])
        array_push($urls, $tracker_row['aff_campaign_url_3']);
    if ($tracker_row['aff_campaign_url_4'])
        array_push($urls, $tracker_row['aff_campaign_url_4']);
    if ($tracker_row['aff_campaign_url_5'])
        array_push($urls, $tracker_row['aff_campaign_url_5']);

    $count = count($urls);

    // Atomic upsert to avoid TOCTOU race condition on concurrent requests
    $mysql['count'] = $conn->escape((string) $count);
    $sql5 = "INSERT INTO rotations SET aff_campaign_id='" . $mysql['aff_campaign_id'] . "', rotation_num=0
             ON DUPLICATE KEY UPDATE rotation_num = IF(rotation_num >= " . ((int)$count - 1) . ", 0, rotation_num + 1)";
    $conn->query($sql5);
    // Read back the current value
    $sql5 = "SELECT rotation_num FROM rotations WHERE aff_campaign_id='" . $mysql['aff_campaign_id'] . "'";
    $result5 = $conn->query($sql5);
    $row5 = $result5->fetch_assoc();
    $num = $row5 ? (int) $row5['rotation_num'] : 0;

    $url = $urls[$num];
    return $url;
}

function replaceTrackerPlaceholdersOpt($db, $url, $click_id, $mysql = [])
{
    $conn = new \OneAIAffiliate\Database\Connection($db);

    // get the tracker placeholder values
    $mysql['click_id'] = $conn->escape($click_id);
    //$url = preg_replace('/\[\[subid\]\]/i', $mysql['click_id'], $url);
    $tokens = [
        "subid" => $mysql['click_id'],
        "t1aikw" => $mysql['keyword'],
        "t1aipubid" => $mysql['t1aipubid'],
        "c1" => $mysql['c1'],
        "c2" => $mysql['c2'],
        "c3" => $mysql['c3'],
        "c4" => $mysql['c4'],
        "gclid" => $mysql['gclid'],
        "msclkid" => $mysql['msclkid'],
        "fbclid" => $mysql['fbclid'],
        "utm_source" => $mysql['utm_source'],
        "utm_medium" => $mysql['utm_medium'],
        "utm_campaign" => $mysql['utm_campaign'],
        "utm_term" => $mysql['utm_term'],
        "utm_content" => $mysql['utm_content'],
        "country" => $mysql['country'],
        "country_code" => $mysql['country_code'],
        "region" => $mysql['region'],
        "city" => $mysql['city'],
        "cpc" => round((float) $mysql['click_cpc'], 2),
        "cpc2" => $mysql['click_cpc'],
        "timestamp" => time(),
        "payout" => $mysql['click_payout'],
        "random" => mt_rand(1000000, 9999999),
        "referer" => $mysql['referer'],
        "sourceid" => $mysql['ppc_account']
    ];

    $url = (replaceTokens($url, $tokens));


    return $url;
}

function replaceTrackerPlaceholders($db, $url, $click_id = '', $mysql = [])
{
    $conn = new \OneAIAffiliate\Database\Connection($db);

    // get the tracker placeholder values

    //$url = preg_replace('/\[\[subid\]\]/i', $mysql['click_id'], $url);

    if (isset($mysql) && $mysql != '') {
        $mysql['click_id'] = $conn->escape((string)$click_id);
        $tokens = @[
            "subid" => $mysql['click_id'],
            "t1aikw" => $mysql['keyword'],
            "t1aipubid" => $mysql['public_pub_id'],
            "c1" => $mysql['c1'],
            "c2" => $mysql['c2'],
            "c3" => $mysql['c3'],
            "c4" => $mysql['c4'],
            "gclid" => $mysql['gclid'],
            "msclkid" => $mysql['msclkid'],
            "fbclid" => $mysql['fbclid'],
            "utm_source" => $mysql['utm_source'],
            "utm_medium" => $mysql['utm_medium'],
            "utm_campaign" => $mysql['utm_campaign'],
            "utm_term" => $mysql['utm_term'],
            "utm_content" => $mysql['utm_content'],
            "country" => $mysql['country'],
            "country_code" => $mysql['country_code'],
            "region" => $mysql['region'],
            "city" => $mysql['city'],
            "cpc" => round((float) $mysql['click_cpc'], 2),
            "cpc2" => $mysql['click_cpc'],
            'cpa' => round((float) $mysql['click_cpa'], 2),
            "timestamp" => time(),
            "payout" => $mysql['click_payout'],
            "random" => mt_rand(1000000, 9999999),
            "referer" => $mysql['referer'],
            "sourceid" => $mysql['ppc_account']
        ];
        $url = (replaceTokens($url, $tokens));
    }


    if (preg_match('/\[\[(.*)\]\]/', (string) $url)) {
        $click_sql = "
			SELECT 2c.click_id, 
                2tc1.c1, 
                2tc2.c2, 
                2tc3.c3, 
                2tc4.c4,	
                2kw.keyword,
            	2c.click_payout,
            	2c.click_cpc,
            	2trk.click_cpa,
                2c.ppc_account_id,
            	2g.gclid,
                2b.msclkid,
                2f.fbclid,
            	2us.utm_source,
            	2um.utm_medium,
            	2uca.utm_campaign,
            	2ut.utm_term,
            	2uco.utm_content,
		        2lc.country_name,
		        2lc.country_code,
		        2lr.region_name,
                2u.user_public_publisher_id,
		        2lc2.city_name FROM clicks AS 2c 
            	LEFT JOIN `clicks_advance` AS 2ca USING (`click_id`) 
            	LEFT OUTER JOIN clicks_tracking AS 2ct ON (2ct.click_id = 2c.click_id) 
            	LEFT OUTER JOIN tracking_c1 AS 2tc1 ON (2ct.c1_id = 2tc1.c1_id) 
            	LEFT OUTER JOIN tracking_c2 AS 2tc2 ON (2ct.c2_id = 2tc2.c2_id) 
            	LEFT OUTER JOIN tracking_c3 AS 2tc3 ON (2ct.c3_id = 2tc3.c3_id) 
            	LEFT OUTER JOIN tracking_c4 AS 2tc4 ON (2ct.c4_id = 2tc4.c4_id) 
                LEFT OUTER JOIN cpa_trackers AS 2cpa ON (2cpa.click_id = 2c.click_id)
                LEFT OUTER JOIN trackers AS 2trk ON (2trk.tracker_id_public = 2cpa.tracker_id_public)
            	LEFT JOIN `google` AS 2g on (2g.click_id=2c.click_id)
                LEFT JOIN `bing` AS 2b on (2b.click_id=2c.click_id)
                LEFT JOIN `facebook` AS 2f on (2f.click_id=2c.click_id) 
                LEFT JOIN `utm_source` AS 2us ON (2g.utm_source_id = 2us.utm_source_id)
                LEFT JOIN `utm_medium` AS 2um ON (2g.utm_medium_id = 2um.utm_medium_id)
                LEFT JOIN `utm_campaign` AS 2uca ON (2g.utm_campaign_id = 2uca.utm_campaign_id) 
                LEFT JOIN `utm_term` AS 2ut ON (2g.utm_term_id = 2ut.utm_term_id)
                LEFT JOIN `utm_content` AS 2uco ON (2g.utm_content_id = 2uco.utm_content_id)
                LEFT JOIN `keywords` AS 2kw ON (2ca.`keyword_id` = 2kw.`keyword_id`) 
		        LEFT JOIN `locations_country` AS 2lc ON (2ca.`country_id` = 2lc.`country_id`)
		        LEFT JOIN `locations_region` AS 2lr ON (2ca.`region_id` = 2lr.`region_id`)    
		        LEFT JOIN `locations_city` AS 2lc2 ON (2ca.`city_id` = 2lc2.`city_id`)
                LEFT JOIN `users` AS 2u ON (2u.`user_id` = 2c.`user_id`)
		    WHERE
				2c.click_id='" . $mysql['click_id'] . "'
		";

        $click_result = $conn->query($click_sql);
        $click_row = $click_result->fetch_assoc();

        // Check if click_row exists before processing
        if ($click_row) {
            $mysql['t1aikw'] = $conn->escape((string)($click_row['keyword'] ?? ''));
            $mysql['t1aipubid'] = $conn->escape((string)($click_row['user_public_publisher_id'] ?? ''));
            $mysql['c1'] = $conn->escape((string)($click_row['c1'] ?? ''));
            $mysql['c2'] = $conn->escape((string)($click_row['c2'] ?? ''));
            $mysql['c3'] = $conn->escape((string)($click_row['c3'] ?? ''));
            $mysql['c4'] = $conn->escape((string)($click_row['c4'] ?? ''));
            $mysql['gclid'] = $conn->escape((string)($click_row['gclid'] ?? ''));
            $mysql['msclkid'] = $conn->escape((string)($click_row['msclkid'] ?? ''));
            $mysql['fbclid'] = $conn->escape((string)($click_row['fbclid'] ?? ''));
            $mysql['utm_source'] = $conn->escape((string)($click_row['utm_source'] ?? ''));
            $mysql['utm_medium'] = $conn->escape((string)($click_row['utm_medium'] ?? ''));
            $mysql['utm_campaign'] = $conn->escape((string)($click_row['utm_campaign'] ?? ''));
            $mysql['utm_term'] = $conn->escape((string)($click_row['utm_term'] ?? ''));
            $mysql['utm_content'] = $conn->escape((string)($click_row['utm_content'] ?? ''));
            $mysql['payout'] = $conn->escape((string)($click_row['click_payout'] ?? ''));
            $mysql['cpc'] = $conn->escape((string)($click_row['click_cpc'] ?? ''));
            $mysql['cpa'] = $conn->escape((string)($click_row['click_cpa'] ?? ''));
            $mysql['click_cpc'] = $conn->escape((string)($click_row['click_cpc'] ?? ''));
            $mysql['country'] = $conn->escape((string)($click_row['country_name'] ?? ''));
            $mysql['country_code'] = $conn->escape((string)($click_row['country_code'] ?? ''));
            $mysql['region'] = $conn->escape((string)($click_row['region_name'] ?? ''));
            $mysql['city'] = $conn->escape((string)($click_row['city_name'] ?? ''));
        } else {
            // Initialize all fields with empty strings if no click data found
            $mysql['t1aikw'] = '';
            $mysql['t1aipubid'] = '';
            $mysql['c1'] = '';
            $mysql['c2'] = '';
            $mysql['c3'] = '';
            $mysql['c4'] = '';
            $mysql['gclid'] = '';
            $mysql['msclkid'] = '';
            $mysql['fbclid'] = '';
            $mysql['utm_source'] = '';
            $mysql['utm_medium'] = '';
            $mysql['utm_campaign'] = '';
            $mysql['utm_term'] = '';
            $mysql['utm_content'] = '';
            $mysql['payout'] = '';
            $mysql['cpc'] = '';
            $mysql['cpa'] = '';
            $mysql['click_cpc'] = '';
            $mysql['country'] = '';
            $mysql['country_code'] = '';
            $mysql['region'] = '';
            $mysql['city'] = '';
        }
        $mysql['referer'] = urlencode((string) $conn->escape($_SERVER['HTTP_REFERER'] ?? ''));
        if ($conn->escape($click_row['ppc_account_id']) == '0') {
            $mysql['ppc_account'] = '';
        } else {
            $mysql['ppc_account'] = $conn->escape($click_row['ppc_account_id']);
        }

        //prepare $mysql to make sure none of the keys are unset

        $_202keys = ['click_id', 't1aikw', 't1aipubid', 'c1', 'c2', 'c3', 'c4', 'gclid', 'msclkid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'country', 'country_code', 'region', 'city', 'cpc', 'cpc', 'cpa', 'click_payout', 'referer', 'ppc_account'];

        foreach ($_202keys as $key) {
            if (!isset($mysql[$key])) {
                $mysql[$key] = '';
            }
        }

        $tokens = [
            "subid" => $mysql['click_id'],
            "t1aikw" => $mysql['t1aikw'],
            "t1aipubid" => $mysql['t1aipubid'],
            "c1" => $mysql['c1'],
            "c2" => $mysql['c2'],
            "c3" => $mysql['c3'],
            "c4" => $mysql['c4'],
            "gclid" => $mysql['gclid'],
            "msclkid" => $mysql['msclkid'],
            "fbclid" => $mysql['fbclid'],
            "utm_source" => $mysql['utm_source'],
            "utm_medium" => $mysql['utm_medium'],
            "utm_campaign" => $mysql['utm_campaign'],
            "utm_term" => $mysql['utm_term'],
            "utm_content" => $mysql['utm_content'],
            "country" => $mysql['country'],
            "country_code" => $mysql['country_code'],
            "region" => $mysql['region'],
            "city" => $mysql['city'],
            "cpc" => round($mysql['cpc'], 2),
            "cpc2" => $mysql['cpc'],
            "cpa" => round($mysql['cpa'], 2),
            // "timestamp" => time(), don't change the time it was already set
            "payout" => $mysql['click_payout'],
            "random" => mt_rand(1000000, 9999999),
            "referer" => $mysql['referer'],
            "sourceid" => $mysql['ppc_account']
        ];

        $url = (replaceTokens($url, $tokens, 1)); //call replace tokens and allow it to fill all unset tokens with blanks
    }
    return $url;
}

function setClickIdCookie($click_id, $campaign_id = 0)
{
    if (trackingEnabled()) {
        //set the cookie for the PIXEL to fire, expire in 30 days
        $expire = time() + (60 *  60 * 24 * 30);
        $expire_header = 60 *  60 * 24 * 30;
        $path = '/';
        $domain = $_SERVER['HTTP_HOST'];
        $secure = TRUE;
        $httponly = FALSE; // JS createCookie()/readCookie() must access these cookies

        //legacy cookies

        setcookie('tracking1aisubid-legacy', (string) $click_id, ['expires' => $expire, 'path' => '/', 'domain' => (string) $domain]);
        setcookie('tracking1aisubid_a_' . $campaign_id . '-legacy', (string) $click_id, ['expires' => $expire, 'path' => '/', 'domain' => (string) $domain]);

        setcookie('tracking1aisubid', (string) $click_id,  ['expires' => $expire, 'path' => '/', 'domain' => $domain, 'secure' => $secure, 'httponly' => $httponly, 'samesite' => 'None']);
        setcookie('tracking1aisubid_a_' . $campaign_id, (string) $click_id,   ['expires' => $expire, 'path' => '/', 'domain' => $domain, 'secure' => $secure, 'httponly' => $httponly, 'samesite' => 'None']);
    }
}

function setClickIdCookieForLp($click_id_public, $lp_public_id)
{
    if (trackingEnabled()) {
        //set the cookie for the PIXEL to fire, expire in 30 days
        $expire = time() + (60 *  60 * 24 * 30);
        $expire_header = 60 *  60 * 24 * 30;
        $path = '/';
        $domain = $_SERVER['HTTP_HOST'];
        $secure = TRUE;
        $httponly = TRUE;


        //legacy cookies
        setcookie('tracking1airlp_' . $lp_public_id . '-legacy', (string) $click_id_public, ['expires' => $expire, 'path' => '/', 'domain' => (string) $domain]);

        setcookie('tracking1airlp_' . $lp_public_id, (string) $click_id_public, ['expires' => $expire, 'path' => '/', 'domain' => $domain, 'secure' => $secure, 'httponly' => $httponly, 'samesite' => 'None']);
    }
}

class PLATFORMS
{

    public static function get_device_info($db, $detect, $ua_string = '')
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;
        if (!$detect instanceof DeviceDetect) {
            $detect = new DeviceDetect();
        }

        if ($ua_string != '') {
            $detect->setUserAgent($ua_string);
        }
        $ua = $detect->getUserAgent();

        // If Cache working
        if ($memcacheWorking) {

            $device_info = $memcache->get(md5("user-agent" . $ua . systemHash()));

            if (! $device_info) {

                $parse_info = PLATFORMS::parseUserAgentInfo($db, $detect);
                setCache(md5("user-agent" . $ua . systemHash()), $parse_info);
                return $parse_info;
            } else {
                return $device_info;
            }
        }

        // If Cache is not working
        else {

            return PLATFORMS::parseUserAgentInfo($db, $detect);
        }
    }

    public static function parseUserAgentInfo($db, $detect)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $ip_address;

        // Ensure ip_address is available for botCheck
        if (!isset($ip_address)) {
            $ip_address_string = $_SERVER['REMOTE_ADDR'] ?? '';
            if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ip_address_string = $_SERVER['HTTP_X_FORWARDED_FOR'];
            }
            $ip_address = $ip_address_string;
        }

        $parser = Parser::create();
        $userAgent = $detect->getUserAgent() ?: '';
        $result = $parser->parse($userAgent);

        // Initialize type with default value
        $type = "1"; // Default to Desktop
        
        // If is not mobile or tablet
        if (! $detect->isMobile() && ! $detect->isTablet()) {

            switch ($result->device->family) {
                // Is Bot
                case 'Bot':
                    $type = "4";
                    $result->device->family = "Bot";
                    break;
                // Is Desktop
                case 'Other':
                    $type = "1";
                    $result->device->family = "Desktop";
                    break;
                // Default case for any other desktop device
                default:
                    $type = "1";
                    $result->device->family = "Desktop";
                    break;
            }
        } else {
            // If tablet
            if ($detect->isTablet()) {
                $type = "3";
                // If mobile
            } else {
                $type = "2";
            }
        }

        if ($ip_address && PLATFORMS::botCheck($ip_address)) {
            $type = "4";
            $result->device->family = "Bot";
        }

        // Select from DB and return ID's
        $mysql['browser'] = $conn->escape((string)$result->ua->family);
        $mysql['platform'] = $conn->escape((string)$result->os->family);
        $mysql['device'] = $conn->escape((string)$result->device->family);
        $mysql['device_type'] = $conn->escape((string)$type);



        // Get browser ID
        $browser_sql = "SELECT browser_id FROM browsers WHERE browser_name='" . $mysql['browser'] . "'";
        $browser_result = $conn->query($browser_sql);
        $browser_row = $browser_result->fetch_assoc();
        if ($browser_row) {
            $browser_id = $browser_row['browser_id'];
        } else {
            $browser_sql = "INSERT INTO browsers SET browser_name='" . $mysql['browser'] . "'";
            $browser_result = $conn->query($browser_sql);
            $browser_id = $db->insert_id;
        }

        // Get platform ID
        $platform_sql = "SELECT platform_id FROM platforms WHERE platform_name='" . $mysql['platform'] . "'";
        $platform_result = $conn->query($platform_sql);
        $platform_row = $platform_result->fetch_assoc();
        if ($platform_row) {
            $platform_id = $platform_row['platform_id'];
        } else {
            $platform_sql = "INSERT INTO platforms SET platform_name='" . $mysql['platform'] . "'";
            $platform_result = $conn->query($platform_sql);
            $platform_id = $db->insert_id;
        }

        // Get device model ID
        $device_sql = "SELECT device_id, device_type FROM device_models WHERE device_name='" . $mysql['device'] . "'";
        $device_result = $conn->query($device_sql);
        $device_row = $device_result->fetch_assoc();
        if ($device_row) {
            $device_id = $device_row['device_id'];
            $device_type = $device_row['device_type'];
        } else {
            $device_sql = "INSERT INTO device_models SET device_name='" . $mysql['device'] . "', device_type='" . $mysql['device_type'] . "'";
            $device_result = $conn->query($device_sql);
            $device_id = $db->insert_id;
            $device_type = $type;
        }

        $data = [
            'browser' => $browser_id,
            'platform' => $platform_id,
            'device' => $device_id,
            'type' => $device_type
        ];

        return $data;
    }

    public static function botCheck($ip)
    {
        global $memcacheWorking, $memcache;

        if ($memcacheWorking && $ip && isset($ip->address)) {
            $getFromCache = $memcache->get(md5("ip-bot" . $ip->address . systemHash()));
        } else {
            $getFromCache = false;
        }

        if (!$getFromCache) {

            $ranges = [
                '199.60.28.0/24',
                '199.103.122.0/24',
                '192.197.157.0/24',
                '207.68.128.0/18',
                '157.54.0.0/15',
                '157.56.0.0/14',
                '157.60.0.0/16',
                '70.32.128.0/19',
                '172.253.0.0/16',
                '173.194.0.0/16',
                '209.85.128.0/17',
                '72.14.192.0/18',
                '66.249.64.0/19',
                '108.177.0.0/17',
                '64.233.160.0/19',
                '66.102.0.0/20',
                '216.239.32.0/19',
                '203.208.60.0/24',
                '66.249.64.0/19',
                '72.14.199.0/24',
                '209.85.238.0/24',
                '204.236.235.245',
                '75.101.186.145',
                '31.13.97.0/24',
                '31.13.99.0/24',
                '31.13.100.0/24',
                '66.220.144.0/20',
                '69.63.189.0/24',
                '69.63.190.0/24',
                '69.171.224.0/20',
                '69.171.240.0/21',
                '69.171.248.0/24',
                '173.252.73.0/24',
                '173.252.74.0/24',
                '173.252.77.0/24',
                '173.252.100.0/22',
                '173.252.104.0/21',
                '173.252.112.0/24',
                '17.0.0.0/8',
                '157.55.39.0/24'
            ];

            foreach ($ranges as $value) {
                if (PLATFORMS::check_ip_range($ip, $value)) {
                    if ($memcacheWorking) {
                        setCache(md5("ip-bot" . $ip->address . systemHash()), true);
                    }

                    return true;
                }
            }

            return false;
        }

        return true;
    }

    public static function check_ip_range($ip, $range)
    {
        // Check if IP object and address property exist
        if (!$ip || !isset($ip->address) || empty($ip->address)) {
            return false;
        }
        
        if (!str_contains((string) $range, '/')) {
            $range .= '/32';
        }
        [$range, $netmask] = explode('/', (string) $range, 2);
        $range_decimal = ip2long($range);
        $ip_decimal = ip2long($ip->address);
        $wildcard_decimal = 2 ** (32 - (int)$netmask) - 1;
        $netmask_decimal = ~$wildcard_decimal;
        return (($ip_decimal & $netmask_decimal) == ($range_decimal & $netmask_decimal));
    }
}

class INDEXES
{

    // this returns the location_country_id, when a Country Code is given
    public static function get_country_id($db, $country_name, $country_code)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        $mysql['country_name'] = $conn->escape($country_name);
        $mysql['country_code'] = $conn->escape($country_code);

        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getID = $memcache->get(md5("country-id" . $country_name . systemHash()));

            if ($getID) {
                $country_id = $getID;
                return $country_id;
            } else {

                $country_sql = "SELECT country_id FROM locations_country WHERE country_code='" . $mysql['country_code'] . "'";
                $country_result = $conn->query($country_sql);
                $country_row = $country_result->fetch_assoc();
                if ($country_row) {
                    // if this ip_id already exists, return the ip_id for it.
                    $country_id = $country_row['country_id'];
                    // add to memcached
                    $setID = setCache(md5("country-id" . $country_name . systemHash()), $country_id, $time);
                    return $country_id;
                } else {
                    // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                    $country_sql = "INSERT INTO locations_country SET country_code='" . $mysql['country_code'] . "', country_name='" . $mysql['country_name'] . "'";
                    $country_result = $conn->query($country_sql); // ($ip_sql);
                    $country_id = $db->insert_id;
                    // add to memcached
                    $setID = setCache(md5("country-id" . $country_name . systemHash()), $country_id, $time);
                    return $country_id;
                }
            }
        } else {

            $country_sql = "SELECT country_id FROM locations_country WHERE country_code='" . $mysql['country_code'] . "'";

            $country_result = $conn->query($country_sql);
            $country_row = $country_result->fetch_assoc();
            if ($country_row) {
                // if this country already exists, return the location_country_id for it.
                $country_id = $country_row['country_id'];

                return $country_id;
            } else {
                // else if this doesn't exist, insert the new countryrow, and return the_id for this new row we found
                $country_sql = "INSERT INTO locations_country SET country_code='" . $mysql['country_code'] . "', country_name='" . $mysql['country_name'] . "'";
                $country_result = $conn->query($country_sql); // ($ip_sql);
                $country_id = $db->insert_id;

                return $country_id;
            }
        }
    }

    // this returns the location_city_id, when a City name is given
    public static function get_city_id($db, $city_name, $country_id)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        $mysql['city_name'] = $conn->escape($city_name);
        $mysql['country_id'] = $conn->escape($country_id);

        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getID = $memcache->get(md5("city-id" . $city_name . $country_id . systemHash()));

            if ($getID) {
                $city_id = $getID;
                return $city_id;
            } else {

                $city_sql = "SELECT city_id FROM locations_city WHERE city_name='" . $mysql['city_name'] . "' AND main_country_id='" . $mysql['country_id'] . "'";
                $city_result = $conn->query($city_sql);
                $city_row = $city_result->fetch_assoc();
                if ($city_row) {
                    // if this ip_id already exists, return the ip_id for it.
                    $city_id = $city_row['city_id'];
                    // add to memcached
                    $setID = setCache(md5("city-id" . $city_name . $country_id . systemHash()), $city_id, $time);
                    return $city_id;
                } else {
                    // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                    $city_sql = "INSERT INTO locations_city SET city_name='" . $mysql['city_name'] . "', main_country_id='" . $mysql['country_id'] . "'";
                    $city_result = $conn->query($city_sql); // ($ip_sql);
                    $city_id = $db->insert_id;
                    // add to memcached
                    $setID = setCache(md5("city-id" . $city_name . $country_id . systemHash()), $city_id, $time);
                    return $city_id;
                }
            }
        } else {

            $city_sql = "SELECT city_id FROM locations_city WHERE city_name='" . $mysql['city_name'] . "' AND main_country_id='" . $mysql['country_id'] . "'";
            $city_result = $conn->query($city_sql);
            $city_row = $city_result->fetch_assoc();
            if ($city_row) {
                // if this country already exists, return the location_country_id for it.
                $city_id = $city_row['city_id'];

                return $city_id;
            } else {
                // else if this doesn't exist, insert the new cityrow, and return the_id for this new row we found
                $city_sql = "INSERT INTO locations_city SET city_name='" . $mysql['city_name'] . "', main_country_id='" . $mysql['country_id'] . "'";
                $city_result = $conn->query($city_sql); // ($ip_sql);
                $city_id = $db->insert_id;

                return $city_id;
            }
        }
    }

    // this returns the location_region_id, when a Region name is given
    public static function get_region_id($db, $region_name, $country_id)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        $mysql['region_name'] = $conn->escape($region_name);
        $mysql['country_id'] = $conn->escape($country_id);

        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getID = $memcache->get(md5("region-id" . $region_name . $country_id . systemHash()));

            if ($getID) {
                $region_id = $getID;
                return $region_id;
            } else {

                $region_sql = "SELECT region_id FROM locations_region WHERE region_name='" . $mysql['region_name'] . "' AND main_country_id='" . $mysql['country_id'] . "'";
                $region_result = $conn->query($region_sql);
                $region_row = $region_result->fetch_assoc();
                if ($region_row) {
                    // if this ip_id already exists, return the ip_id for it.
                    $region_id = $region_row['region_id'];
                    // add to memcached
                    $setID = setCache(md5("region-id" . $region_name . $country_id . systemHash()), $region_id, $time);
                    return $region_id;
                } else {
                    // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                    $region_sql = "INSERT INTO locations_region SET region_name='" . $mysql['region_name'] . "', main_country_id='" . $mysql['country_id'] . "'";
                    $region_result = $conn->query($region_sql); // ($ip_sql);
                    $region_id = $db->insert_id;
                    // add to memcached
                    $setID = setCache(md5("region-id" . $region_name . $country_id . systemHash()), $region_id, $time);
                    return $region_id;
                }
            }
        } else {

            $region_sql = "SELECT region_id FROM locations_region WHERE region_name='" . $mysql['region_name'] . "' AND main_country_id='" . $mysql['country_id'] . "'";
            $region_result = $conn->query($region_sql);
            $region_row = $region_result->fetch_assoc();
            if ($region_row) {
                // if this country already exists, return the location_country_id for it.
                $region_id = $region_row['region_id'];

                return $region_id;
            } else {
                // else if this doesn't exist, insert the new cityrow, and return the_id for this new row we found
                $region_sql = "INSERT INTO locations_region SET region_name='" . $mysql['region_name'] . "', main_country_id='" . $mysql['country_id'] . "'";
                $region_result = $conn->query($region_sql); // ($ip_sql);
                $region_id = $db->insert_id;

                return $region_id;
            }
        }
    }

    // this returns the isp_id, when a isp name is given
    public static function get_isp_id($db, $isp)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        $mysql['isp'] = $conn->escape($isp);

        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getID = $memcache->get(md5("isp-id" . $isp . systemHash()));

            if ($getID) {
                $isp_id = $getID;
                return $isp_id;
            } else {

                $isp_sql = "SELECT isp_id FROM locations_isp WHERE isp_name='" . $mysql['isp'] . "'";
                $isp_result = $conn->query($isp_sql);
                $isp_row = $isp_result->fetch_assoc();
                if ($isp_row) {
                    // if this ip_id already exists, return the ip_id for it.
                    $isp_id = $isp_row['isp_id'];
                    // add to memcached
                    $setID = setCache(md5("isp-id" . $isp . systemHash()), $isp_id, $time);
                    return $isp_id;
                } else {
                    // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                    $isp_sql = "INSERT INTO locations_isp SET isp_name='" . $mysql['isp'] . "'";
                    $isp_result = $conn->query($isp_sql); // ($isp_sql);
                    $isp_id = $db->insert_id;
                    // add to memcached
                    $setID = setCache(md5("isp-id" . $isp . systemHash()), $isp_id, $time);
                    return $isp_id;
                }
            }
        } else {

            $isp_sql = "SELECT isp_id FROM locations_isp WHERE isp_name='" . $mysql['isp'] . "'";
            $isp_result = $conn->query($isp_sql);
            $isp_row = $isp_result->fetch_assoc();
            if ($isp_row) {
                // if this isp already exists, return the isp_id for it.
                $isp_id = $isp_row['isp_id'];

                return $isp_id;
            } else {
                // else if this doesn't exist, insert the new isp row, and return the_id for this new row we found
                $isp_sql = "INSERT INTO locations_isp SET isp_name='" . $mysql['isp'] . "'";
                $isp_result = $conn->query($isp_sql); // ($isp_sql);
                $isp_id = $db->insert_id;

                return $isp_id;
            }
        }
    }

    // this returns the ip_id, when a ip_address is given
    public static function get_ip_id($arg1, $arg2 = null)
    {
        global $memcacheWorking, $memcache;

        if ($arg1 instanceof mysqli) {
            $db = $arg1;
            $ip = $arg2;
        } else {
            global $db;
            $ip = $arg1;
        }

        if (!$db) {
            return null;
        }

        $conn = new \OneAIAffiliate\Database\Connection($db);

        // Handle both string and object input
        if (is_string($ip)) {
            $ip_address = $ip;
            $ip_type = (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) ? 'ipv6' : 'ipv4';
            $ip_object = new stdClass();
            $ip_object->address = $ip_address;
            $ip_object->type = $ip_type;
        } else {
            $ip_address = $ip->address ?? '';
            $ip_type = $ip->type ?? 'ipv4';
            $ip_object = $ip;
        }

        $mysql['ip_address'] = $conn->escape($ip_address);

        if ($ip_type == 'ipv6') {
            $mysql['ip_address'] = $conn->escape(inet6_aton($mysql['ip_address'])); //encode ipv6 for db insert
        }

        if ($ip_type === 'ipv6') {
            $ip_sql = 'SELECT ips.ip_id FROM ips_v6  INNER JOIN ips on (ips_v6.ip_id = ips.ip_address COLLATE utf8mb4_general_ci) WHERE ips_v6.ip_address=("' . $mysql['ip_address'] . '") order by ips.ip_id DESC limit 1';
        } else {
            $ip_sql = "SELECT ip_id FROM ips WHERE ip_address='" . $mysql['ip_address'] . "'";
        }

        if ($memcacheWorking) {
            $time = 2592000; // 7 days in sec
            // get from memcached
            $getID = $memcache->get(md5("ip-id" . $mysql['ip_address'] . systemHash()));

            if ($getID) {
                $ip_id = $getID;
            } else {

                $ip_result = $conn->query($ip_sql);
                $ip_row = $ip_result->fetch_assoc();
                if ($ip_row) {
                    // if this ip_id already exists, return the ip_id for it.
                    $ip_id = $ip_row['ip_id'];
                    // add to memcached
                    $setID = setCache(md5("ip-id" . $mysql['ip_address'] . systemHash()), $ip_id, $time);
                } else {
                    //insert ip
                    $ip_id = get_ip_id($ip_object);
                    // add to memcached
                    $setID = setCache(md5("ip-id" . $mysql['ip_address'] . systemHash()), $ip_id, $time);
                }
            }
        } else {
            $ip_result = $conn->query($ip_sql);
            $ip_row = $ip_result->fetch_assoc();
            if ($ip_row !== null && $ip_row['ip_id']) {
                // if this ip already exists, return the ip_id for it.
                $ip_id = $ip_row['ip_id'];
            } else {
                $ip_id = get_ip_id($ip_object);
            }
        }

        //return the ip_id
        return $ip_id;
    }

    public static function insert_ip($db, $ip)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);

        $mysql['ip_address'] = $conn->escape($ip->address);

        //e
        if ($ip->type == 'ipv6') {
            $mysql['ip_address'] = inet6_aton($mysql['ip_address']); //encode ipv6 for db insert
        }

        if ($ip->type === 'ipv6') {
            //insert the ipv6 ip address and get the ipv6_id
            $ip_sql = 'INSERT INTO ips_v6 SET ip_address=("' . $mysql['ip_address'] . '")';
            // $ip_sql = 'INSERT INTO ips_v6 SET ip_address='.$inet6_aton.'("'.$mysql['ip_address'].'")';
            $ip_result = $conn->query($ip_sql); // ($ip_sql);
            $ipv6_id = $db->insert_id;

            //insert the ipv6_id as the ipv4 address for referencing later on
            $ip_sql = "INSERT INTO ips SET ip_address='" . $ipv6_id . "', location_id='0'";
            $ip_result = $conn->query($ip_sql); // ($ip_sql);
            $ip_id = $db->insert_id;
            return $ip_id;
        } else {
            $ip_sql = "INSERT INTO ips SET ip_address='" . $mysql['ip_address'] . "', location_id='0'";
            $ip_result = $conn->query($ip_sql); // ($ip_sql);
            $ip_id = $db->insert_id;
            return $ip_id;
        }
    }
    // this returns the site_domain_id, when a site_url_address is given
    public static function get_site_domain_id($db, $site_url_address)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        // Handle null or empty site_url_address
        if ($site_url_address === null || $site_url_address === '') {
            $site_url_address = '';
        }

        $parsed_url = @parse_url(trim((string) $conn->escape((string)$site_url_address)));

        if (isset($parsed_url)) {
            if (isset($parsed_url['host'])) {
                $site_domain_host = trim($parsed_url['host']);
            } else {
                $site_domain_host = explode('/', $parsed_url['path'], 2);
                $site_domain_host = trim(array_shift($site_domain_host));
                //$site_domain_host = trim();
            }
            $site_domain_host = str_replace('www.', '', $site_domain_host);
        } else {
            $site_domain_host = '';
            $site_domain_host = '';
        }

        $mysql['site_domain_host'] = $conn->escape($site_domain_host);

        // if a cached key is found for this lpip, redirect to that url
        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getID = $memcache->get(md5("domain-id" . $site_domain_host . systemHash()));

            if ($getID) {
                $site_domain_id = $getID;
                return $site_domain_id;
            } else {

                $site_domain_sql = "SELECT site_domain_id FROM site_domains WHERE site_domain_host='" . $mysql['site_domain_host'] . "'";
                $site_domain_result = $conn->query($site_domain_sql);
                $site_domain_row = $site_domain_result->fetch_assoc();
                if ($site_domain_row) {
                    // if this site_domain_id already exists, return the site_domain_id for it.
                    $site_domain_id = $site_domain_row['site_domain_id'];
                    // add to memcached
                    $setID = setCache(md5("domain-id" . $site_domain_host . systemHash()), $site_domain_id, $time);
                    return $site_domain_id;
                } else {
                    // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                    $site_domain_sql = "INSERT INTO site_domains SET site_domain_host='" . $mysql['site_domain_host'] . "'";
                    $site_domain_result = $conn->query($site_domain_sql); // ($site_domain_sql);
                    $site_domain_id = $db->insert_id;
                    // add to memcached
                    $setID = setCache(md5("domain-id" . $site_domain_host . systemHash()), $site_domain_id, $time);
                    return $site_domain_id;
                }
            }
        } else {

            $site_domain_sql = "SELECT site_domain_id FROM site_domains WHERE site_domain_host='" . $mysql['site_domain_host'] . "'";
            $site_domain_result = $conn->query($site_domain_sql);
            $site_domain_row = $site_domain_result->fetch_assoc();
            if ($site_domain_row) {
                // if this site_domain_id already exists, return the site_domain_id for it.
                $site_domain_id = $site_domain_row['site_domain_id'];
                // add to memcached
                return $site_domain_id;
            } else {
                // else if this doesn't exist, insert the new iprow, and return the_id for this new row we found
                $site_domain_sql = "INSERT INTO site_domains SET site_domain_host='" . $mysql['site_domain_host'] . "'";
                $site_domain_result = $conn->query($site_domain_sql); // ($site_domain_sql);
                $site_domain_id = $db->insert_id;
                return $site_domain_id;
            }
        }
    }

    // this returns the site_url_id, when a site_url_address is given
    public static function get_site_url_id($dbOrSiteUrl, $site_url_address = null)
    {
        global $memcacheWorking, $memcache;
        $time = 2592000; // 30 days in sec

        if ($site_url_address === null) {
            $site_url_address = $dbOrSiteUrl;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrSiteUrl;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);
        
        // Handle null or empty site_url_address
        if ($site_url_address === null || $site_url_address === '') {
            $site_url_address = '';
        }
        
        $site_domain_id = get_site_domain_id($site_url_address);

        $mysql['site_url_address'] = $conn->escape((string)$site_url_address);
        $mysql['site_domain_id'] = $conn->escape((string)$site_domain_id);

        if ($memcacheWorking) {
            $time = 604800; // 7 days in sec
            // get from memcached
            $getURL = $memcache->get(md5("url-id" . $site_url_address . systemHash()));
            if ($getURL) {
                return $getURL;
            } else {

                $site_url_sql = "SELECT site_url_id FROM site_urls WHERE site_domain_id='" . $mysql['site_domain_id'] . "' and site_url_address='" . $mysql['site_url_address'] . "' limit 1";
                $site_url_result = $conn->query($site_url_sql);
                $site_url_row = $site_url_result->fetch_assoc();
                if ($site_url_row) {
                    // if this site_url_id already exists, return the site_url_id for it.
                    $site_url_id = $site_url_row['site_url_id'];
                    $setID = setCache(md5("url-id" . $site_url_address . systemHash()), $site_url_id, $time);
                    return $site_url_id;
                } else {

                    $site_url_sql = "INSERT INTO site_urls SET site_domain_id='" . $mysql['site_domain_id'] . "', site_url_address='" . $mysql['site_url_address'] . "'";
                    $site_url_result = $conn->query($site_url_sql); // ($site_url_sql);
                    $site_url_id = $db->insert_id;
                    $setID = setCache(md5("url-id" . $site_url_address . systemHash()), $site_url_id, $time);
                    return $site_url_id;
                }
            }
        } else {

            $site_url_sql = "SELECT site_url_id FROM site_urls WHERE site_domain_id='" . $mysql['site_domain_id'] . "' and site_url_address='" . $mysql['site_url_address'] . "' limit 1";
            $site_url_result = $conn->query($site_url_sql);
            $site_url_row = $site_url_result->fetch_assoc();

            if ($site_url_row) {
                // if this site_url_id already exists, return the site_url_id for it.
                $site_url_id = $site_url_row['site_url_id'];
                return $site_url_id;
            } else {

                $site_url_sql = "INSERT INTO site_urls SET site_domain_id='" . $mysql['site_domain_id'] . "', site_url_address='" . $mysql['site_url_address'] . "'";
                $site_url_result = $conn->query($site_url_sql); // ($site_url_sql);
                $site_url_id = $db->insert_id;
                return $site_url_id;
            }
        }
    }

    // this returns the keyword_id
    public static function get_utm_id($dbOrUtmVar, $utm_var_or_type, $utm_type = null)
    {
        global $memcacheWorking, $memcache;
        $time = 2592000; // 30 days in sec - Define $time

        if ($utm_type === null) {
            $utm_var = $dbOrUtmVar;
            $utm_type = $utm_var_or_type;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrUtmVar;
            $utm_var = $utm_var_or_type;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);

        // only grab the first 350 characters of the utm variable
        $utm_var = substr((string) $utm_var, 0, 350);

        $mysql['utm_var'] = $conn->escape($utm_var);
        $mysql['utm_type'] = $conn->escape($utm_type);

        if ($memcacheWorking) {
            $time = 2592000; // 30 days in sec
            // get from memcached
            $getUtm = $memcache->get(md5($mysql['utm_type'] . "_id" . $utm_var . systemHash()));
            if ($getUtm) {
                return $getUtm;
            } else {

                $utm_sql = "SELECT " . $mysql['utm_type'] . "_id FROM 1ai_" . $mysql['utm_type'] . " WHERE " . $mysql['utm_type'] . "='" . $mysql['utm_var'] . "'";
                $utm_result = $conn->query($utm_sql);
                $utm_row = $utm_result->fetch_assoc();
                if ($utm_row) {
                    // if this already exists, return the id for it
                    $utm_id_name = $mysql['utm_type'] . "_id";
                    $utm_id = $utm_row[$utm_id_name];
                    $setID = setCache(md5($mysql['utm_type'] . "_id" . $utm_var . systemHash()), $utm_id, $time);
                    return $utm_id;
                } else {

                    $utm_sql = "INSERT INTO 1ai_" . $mysql['utm_type'] . " SET " . $mysql['utm_type'] . "='" . $mysql['utm_var'] . "'";
                    $utm_result = $conn->query($utm_sql);
                    $utm_id = $db->insert_id;
                    $setID = setCache(md5($mysql['utm_type'] . "_id" . $utm_var . systemHash()), $utm_id, $time);
                    return $utm_id;
                }
            }
        } else {

            $utm_sql = "SELECT " . $mysql['utm_type'] . "_id FROM 1ai_" . $mysql['utm_type'] . " WHERE " . $mysql['utm_type'] . "='" . $mysql['utm_var'] . "'";
            $utm_result = $conn->query($utm_sql);
            $utm_row = $utm_result->fetch_assoc();
            if ($utm_row) {
                // if this already exists, return the id for it
                $utm_id_name = $mysql['utm_type'] . "_id";
                $utm_id = $utm_row[$utm_id_name];
                return $utm_id;
            } else {

                $utm_sql = "INSERT INTO 1ai_" . $mysql['utm_type'] . " SET " . $mysql['utm_type'] . "='" . $mysql['utm_var'] . "'";
                $utm_result = $conn->query($utm_sql);
                $utm_id = $db->insert_id;
                return $utm_id;
            }
        }
    }

    public static function get_variable_id($dbOrVariable, $variableOrPpcVariableId, $ppc_variable_id = null)
    {
        global $memcacheWorking, $memcache;
        $time = 2592000; // 30 days in sec - Define $time

        if ($ppc_variable_id === null) {
            $variable = $dbOrVariable;
            $ppc_variable_id = $variableOrPpcVariableId;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrVariable;
            $variable = $variableOrPpcVariableId;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);

        // only grab the first 350 characters of the variable
        $variable = substr((string) $variable, 0, 350);

        $mysql['var'] = $conn->escape($variable);
        $mysql['ppc_variable_id'] = $conn->escape($ppc_variable_id);

        if ($memcacheWorking) {
            // get from memcached
            $var_id = $memcache->get(md5($mysql['ppc_variable_id'] . $mysql['var'] . systemHash()));
            if (!$var_id) {

                $var_sql = "SELECT custom_variable_id FROM custom_variables WHERE ppc_variable_id = '" . $mysql['ppc_variable_id'] . "' AND variable = '" . $mysql['var'] . "'";
                $var_result = $conn->query($var_sql);
                $var_row = $var_result->fetch_assoc();
                if ($var_row) {
                    // if this already exists, return the id for it
                    $var_id = $var_row['custom_variable_id'];
                    $setID = setCache(md5($ppc_variable_id . $variable . systemHash()), $var_id, $time);
                } else {

                    $var_sql = "INSERT INTO custom_variables SET ppc_variable_id = '" . $mysql['ppc_variable_id'] . "', variable = '" . $mysql['var'] . "'";
                    $var_result = $conn->query($var_sql);
                    $var_id = $db->insert_id;
                    $setID = setCache(md5($ppc_variable_id . $variable . systemHash()), $var_id, $time);
                }
            }
        } else {

            $var_sql = "SELECT custom_variable_id FROM custom_variables WHERE ppc_variable_id = '" . $mysql['ppc_variable_id'] . "' AND variable = '" . $mysql['var'] . "'";
            $var_result = $conn->query($var_sql);
            $var_row = $var_result->fetch_assoc();

            if ($var_row) {
                // if this already exists, return the id for it
                $var_id = $var_row['custom_variable_id'];
            } else {

                $var_sql = "INSERT INTO custom_variables SET ppc_variable_id = '" . $mysql['ppc_variable_id'] . "', variable = '" . $mysql['var'] . "'";
                $var_result = $conn->query($var_sql);
                $var_id = $db->insert_id;
            }
        }

        return $var_id;
    }

    public static function get_variable_set_id($dbOrVariables, $variables = null)
    {
        global $memcacheWorking, $memcache;
        $time = 2592000; // 30 days in sec - Define $time

        if ($variables === null) {
            $variables = $dbOrVariables;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrVariables;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);

        $mysql['variables'] = $conn->escape($variables);

        if ($memcacheWorking) {
            // get from memcached
            $getSet = $memcache->get(md5('variable_set' . $variables . systemHash()));
            if ($getSet) {
                return $getSet;
            } else {
                $var_sql = "SELECT variable_set_id FROM variable_sets WHERE variables = '" . $mysql['variables'] . "'";
                $var_result = $conn->query($var_sql);
                $var_row = $var_result->fetch_assoc();
                if ($var_row) {
                    // if this already exists, return the id for it
                    $var_id = $var_row['variable_set_id'];
                    $setID = setCache(md5('variable_set' . $variables . systemHash()), $var_id, $time);
                    return $var_id;
                } else {

                    $var_sql = "INSERT INTO variable_sets SET variables = '" . $mysql['variables'] . "'";
                    $var_result = $conn->query($var_sql);
                    $var_id = $db->insert_id;
                    $setID = setCache(md5('variable_set' . $variables . systemHash()), $var_id, $time);

                    $var_sets = explode(",", (string) $mysql['variables']);
                    $row = ''; // Initialize $row
                    foreach ($var_sets as $var) {
                        $row .= "(" .  $var_id . "," . $var . "),";
                    }
                    $row = "insert into `variable_sets2` (`variable_set_id`, `variables`) values " . rtrim($row, ',') . ";";

                    $conn->query($row);
                    return $var_id;
                }
            }
        } else {
            $var_sql = "SELECT variable_set_id FROM variable_sets WHERE variables = '" . $mysql['variables'] . "'";
            $var_result = $conn->query($var_sql);
            $var_row = $var_result->fetch_assoc();

            if ($var_row) {

                // if this already exists, return the id for it
                $var_id = $var_row['variable_set_id'];
                return $var_id;
            } else {
                $var_sql = "INSERT INTO variable_sets SET variables = '" . $mysql['variables'] . "'";
                $var_result = $conn->query($var_sql);
                $var_id = $db->insert_id;
                $var_sets = explode(",", (string) $mysql['variables']);
                $row = ''; // Initialize $row
                foreach ($var_sets as $var) {
                    $row .= "(" .  $var_id . "," . $var . "),";
                }

                $row = "insert into `variable_sets2` (`variable_set_id`, `variables`) values " . rtrim($row, ',') . ";";

                $conn->query($row);
                return $var_id;
            }
        }
    }

    // this returns the keyword_id
    public static function get_keyword_id($dbOrKeyword, $keyword = null)
    {
        global $memcacheWorking, $memcache;
        $time = 2592000; // 30 days in sec

        if ($keyword === null) {
            $keyword = $dbOrKeyword;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrKeyword;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);
        // only grab the first 255 characters of keyword
        // $keyword = substr($keyword, 0, 255);

        $mysql['keyword'] = $conn->escape($keyword);

        if ($memcacheWorking) {
            // get from memcached
            $getKeyword = $memcache->get(md5("keyword-id" . $keyword . systemHash()));
            if ($getKeyword) {
                return $getKeyword;
            } else {

                $keyword_sql = "SELECT keyword_id FROM keywords WHERE keyword='" . $mysql['keyword'] . "'";
                $keyword_result = $conn->query($keyword_sql);
                $keyword_row = $keyword_result->fetch_assoc();
                if ($keyword_row) {
                    // if this already exists, return the id for it
                    $keyword_id = $keyword_row['keyword_id'];
                    $setID = setCache(md5("keyword-id" . $keyword . systemHash()), $keyword_id, $time);
                    return $keyword_id;
                } else {

                    $keyword_sql = "INSERT INTO keywords SET keyword='" . $mysql['keyword'] . "'";
                    $keyword_result = $conn->query($keyword_sql); // ($keyword_sql);
                    $keyword_id = $db->insert_id;
                    $setID = setCache(md5("keyword-id" . $keyword . systemHash()), $keyword_id, $time);
                    return $keyword_id;
                }
            }
        } else {

            $keyword_sql = "SELECT keyword_id FROM keywords WHERE keyword='" . $mysql['keyword'] . "'";
            $keyword_result = $conn->query($keyword_sql);
            $keyword_row = $keyword_result->fetch_assoc();
            if ($keyword_row) {
                // if this already exists, return the id for it
                $keyword_id = $keyword_row['keyword_id'];
                return $keyword_id;
            } else {
                // else if this ip doesn't exist, insert the row and grab the id for it
                $keyword_sql = "INSERT INTO keywords SET keyword='" . $mysql['keyword'] . "'";
                $keyword_result = $conn->query($keyword_sql); // ($keyword_sql);
                $keyword_id = $db->insert_id;
                return $keyword_id;
            }
        }
    }

    // this returns the c1 id
    public static function get_custom_var_id($dbOrCustomVarName, $custom_var_name_or_data, $custom_var_data = null)
    {
        global $memcacheWorking, $memcache;

        if ($custom_var_data === null) {
            $custom_var_name = $dbOrCustomVarName;
            $custom_var_data = $custom_var_name_or_data;
            $database = DB::getInstance();
            $db = $database->getConnection();
        } else {
            $db = $dbOrCustomVarName;
            $custom_var_name = $custom_var_name_or_data;
        }

        if (!$db instanceof \mysqli) {
            return 0;
        }
        $conn = new \OneAIAffiliate\Database\Connection($db);

        // only grab the first 350 charactesr of custom_var
        $custom_var_data = substr((string) $custom_var_data, 0, 350);
        $mysql[$custom_var_name] = $conn->escape($custom_var_data);

        if ($memcacheWorking) {
            // get from memcached
            $getcustomvar = $memcache->get(md5($custom_var_name . "-id" . $custom_var_data . systemHash()));
            if ($getcustomvar) {
                return $getcustomvar;
            } else {

                $custom_sql = "SELECT " . $custom_var_name . "_id FROM tracking_" . $custom_var_name . " WHERE " . $custom_var_name . "='" . $mysql[$custom_var_name] . "'";
                $custom_result = $conn->query($custom_sql);
                $custom_row = $custom_result->fetch_assoc();
                if ($custom_row) {
                    // if this already exists, return the id for it
                    $custom_id = $custom_row[$custom_var_name . "_id"];
                    $setID = setCache(md5($custom_var_name . "-id" . $custom_var_data . systemHash()), $custom_id);
                    return $custom_id;
                } else {

                    $custom_sql = "INSERT INTO tracking_" . $custom_var_name . " SET " . $custom_var_name . "='" . $mysql[$custom_var_name] . "'";
                    $custom_result = $conn->query($custom_sql); // ($c1_sql);
                    $custom_id = $db->insert_id;
                    $setID = setCache(md5($custom_var_name . "-id" . $custom_var_data . systemHash()), $custom_id);
                    return $custom_id;
                }
            }
        } else {

            $custom_sql = "SELECT " . $custom_var_name . "_id FROM tracking_" . $custom_var_name . " WHERE " . $custom_var_name . "='" . $mysql[$custom_var_name] . "'";

            $custom_result = $conn->query($custom_sql);
            $custom_row = $custom_result->fetch_assoc();

            if ($custom_row) {
                // if this already exists, return the id for it
                $custom_id = $custom_row[$custom_var_name . "_id"];
                return $custom_id;
            } else {
                // else if this id doesn't exist, insert the row and grab the id for it
                $custom_sql = "INSERT INTO tracking_" . $custom_var_name . " SET " . $custom_var_name . "='" . $mysql[$custom_var_name] . "'";
                $custom_result = $conn->query($custom_sql);
                $custom_id = $db->insert_id;
                return $custom_id;
            }
        }
    }

    // this returns the c1 id
    public static function get_c1_id($db, $c1)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        // only grab the first 350 charactesr of c1
        $c1 = substr((string) $c1, 0, 350);

        $mysql['c1'] = $conn->escape($c1);

        if ($memcacheWorking) {
            // get from memcached
            $getc1 = $memcache->get(md5("c1-id" . $c1 . systemHash()));
            if ($getc1) {
                return $getc1;
            } else {

                $c1_sql = "SELECT c1_id FROM tracking_c1 WHERE c1='" . $mysql['c1'] . "'";
                $c1_result = $conn->query($c1_sql);
                $c1_row = $c1_result->fetch_assoc();
                if ($c1_row) {
                    // if this already exists, return the id for it
                    $c1_id = $c1_row['c1_id'];
                    $setID = setCache(md5("c1-id" . $c1 . systemHash()), $c1_id);
                    return $c1_id;
                } else {

                    $c1_sql = "INSERT INTO tracking_c1 SET c1='" . $mysql['c1'] . "'";
                    $c1_result = $conn->query($c1_sql); // ($c1_sql);
                    $c1_id = $db->insert_id;
                    $setID = setCache(md5("c1-id" . $c1 . systemHash()), $c1_id);
                    return $c1_id;
                }
            }
        } else {

            $c1_sql = "SELECT c1_id FROM tracking_c1 WHERE c1='" . $mysql['c1'] . "'";
            $c1_result = $conn->query($c1_sql);
            $c1_row = $c1_result->fetch_assoc();
            if ($c1_row) {
                // if this already exists, return the id for it
                $c1_id = $c1_row['c1_id'];
                return $c1_id;
            } else {
                // else if this ip doesn't exist, insert the row and grab the id for it
                $c1_sql = "INSERT INTO tracking_c1 SET c1='" . $mysql['c1'] . "'";
                $c1_result = $conn->query($c1_sql); // ($c1_sql);
                $c1_id = $db->insert_id;
                return $c1_id;
            }
        }
    }

    // this returns the c2 id
    public static function get_c2_id($db, $c2)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        // only grab the first 350 charactesr of c2
        $c2 = substr((string) $c2, 0, 350);

        $mysql['c2'] = $conn->escape($c2);

        if ($memcacheWorking) {
            // get from memcached
            $getc2 = $memcache->get(md5("c2-id" . $c2 . systemHash()));
            if ($getc2) {
                return $getc2;
            } else {

                $c2_sql = "SELECT c2_id FROM tracking_c2 WHERE c2='" . $mysql['c2'] . "'";
                $c2_result = $conn->query($c2_sql);
                $c2_row = $c2_result->fetch_assoc();
                if ($c2_row) {
                    // if this already exists, return the id for it
                    $c2_id = $c2_row['c2_id'];
                    $setID = setCache(md5("c2-id" . $c2 . systemHash()), $c2_id);
                    return $c2_id;
                } else {

                    $c2_sql = "INSERT INTO tracking_c2 SET c2='" . $mysql['c2'] . "'";
                    $c2_result = $conn->query($c2_sql); // ($c2_sql);
                    $c2_id = $db->insert_id;
                    $setID = setCache(md5("c2-id" . $c2 . systemHash()), $c2_id);
                    return $c2_id;
                }
            }
        } else {

            $c2_sql = "SELECT c2_id FROM tracking_c2 WHERE c2='" . $mysql['c2'] . "'";
            $c2_result = $conn->query($c2_sql);
            $c2_row = $c2_result->fetch_assoc();
            if ($c2_row) {
                // if this already exists, return the id for it
                $c2_id = $c2_row['c2_id'];
                return $c2_id;
            } else {
                // else if this ip doesn't exist, insert the row and grab the id for it
                $c2_sql = "INSERT INTO tracking_c2 SET c2='" . $mysql['c2'] . "'";
                $c2_result = $conn->query($c2_sql); // ($c2_sql);
                $c2_id = $db->insert_id;
                return $c2_id;
            }
        }
    }

    // this returns the c3 id
    public static function get_c3_id($db, $c3)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        // only grab the first 350 charactesr of c3
        $c3 = substr((string) $c3, 0, 350);

        $mysql['c3'] = $conn->escape($c3);

        if ($memcacheWorking) {
            // get from memcached
            $getc3 = $memcache->get(md5("c3-id" . $c3 . systemHash()));
            if ($getc3) {
                return $getc3;
            } else {

                $c3_sql = "SELECT c3_id FROM tracking_c3 WHERE c3='" . $mysql['c3'] . "'";
                $c3_result = $conn->query($c3_sql);
                $c3_row = $c3_result->fetch_assoc();
                if ($c3_row) {
                    // if this already exists, return the id for it
                    $c3_id = $c3_row['c3_id'];
                    $setID = setCache(md5("c3-id" . $c3 . systemHash()), $c3_id);
                    return $c3_id;
                } else {

                    $c3_sql = "INSERT INTO tracking_c3 SET c3='" . $mysql['c3'] . "'";
                    $c3_result = $conn->query($c3_sql); // ($c3_sql);
                    $c3_id = $db->insert_id;
                    $setID = setCache(md5("c3-id" . $c3 . systemHash()), $c3_id);
                    return $c3_id;
                }
            }
        } else {

            $c3_sql = "SELECT c3_id FROM tracking_c3 WHERE c3='" . $mysql['c3'] . "'";
            $c3_result = $conn->query($c3_sql);
            $c3_row = $c3_result->fetch_assoc();
            if ($c3_row) {
                // if this already exists, return the id for it
                $c3_id = $c3_row['c3_id'];
                return $c3_id;
            } else {
                // else if this ip doesn't exist, insert the row and grab the id for it
                $c3_sql = "INSERT INTO tracking_c3 SET c3='" . $mysql['c3'] . "'";
                $c3_result = $conn->query($c3_sql); // ($c3_sql);
                $c3_id = $db->insert_id;
                return $c3_id;
            }
        }
    }

    // this returns the c4 id
    public static function get_c4_id($db, $c4)
    {
    $conn = new \OneAIAffiliate\Database\Connection($db);
        global $memcacheWorking, $memcache;

        // only grab the first 350 charactesr of c4
        $c4 = substr((string) $c4, 0, 350);

        $mysql['c4'] = $conn->escape($c4);

        if ($memcacheWorking) {
            // get from memcached
            $getc4 = $memcache->get(md5("c4-id" . $c4 . systemHash()));
            if ($getc4) {
                return $getc4;
            } else {

                $c4_sql = "SELECT c4_id FROM tracking_c4 WHERE c4='" . $mysql['c4'] . "'";
                $c4_result = $conn->query($c4_sql);
                $c4_row = $c4_result->fetch_assoc();
                if ($c4_row) {
                    // if this already exists, return the id for it
                    $c4_id = $c4_row['c4_id'];
                    $setID = setCache(md5("c4-id" . $c4 . systemHash()), $c4_id);
                    return $c4_id;
                } else {

                    $c4_sql = "INSERT INTO tracking_c4 SET c4='" . $mysql['c4'] . "'";
                    $c4_result = $conn->query($c4_sql); // ($c4_sql);
                    $c4_id = $db->insert_id;
                    $setID = setCache(md5("c4-id" . $c4 . systemHash()), $c4_id);
                    return $c4_id;
                }
            }
        } else {

            $c4_sql = "SELECT c4_id FROM tracking_c4 WHERE c4='" . $mysql['c4'] . "'";
            $c4_result = $conn->query($c4_sql);
            $c4_row = $c4_result->fetch_assoc();
            if ($c4_row) {
                // if this already exists, return the id for it
                $c4_id = $c4_row['c4_id'];
                return $c4_id;
            } else {
                // else if this ip doesn't exist, insert the row and grab the id for it
                $c4_sql = "INSERT INTO tracking_c4 SET c4='" . $mysql['c4'] . "'";
                $c4_result = $conn->query($c4_sql); // ($c4_sql);
                $c4_id = $db->insert_id;
                return $c4_id;
            }
        }
    }
}

function memcache_mysql_fetch_assoc($arg1, $arg2 = null, $allowCaching = 1, $minutes = 3)
{
    global $memcacheWorking, $memcache, $db;

    // Support legacy invocation styles:
    //  - memcache_mysql_fetch_assoc($sql)
    //  - memcache_mysql_fetch_assoc($db, $sql)
    //  - memcache_mysql_fetch_assoc($sql, $allowCaching, $minutes)
    //  - memcache_mysql_fetch_assoc($mysqliResult)
    if ($arg1 instanceof mysqli_result) {
        return $arg1->fetch_assoc();
    }

    $connection = null;
    $sql = null;

    if ($arg1 instanceof mysqli) {
        $connection = $arg1;
        if (is_string($arg2)) {
            $sql = $arg2;
            if (func_num_args() > 2) {
                $allowCaching = (int) func_get_arg(2);
            }
            if (func_num_args() > 3) {
                $minutes = (int) func_get_arg(3);
            }
        } else {
            throw new InvalidArgumentException('SQL query string required when providing mysqli connection to memcache_mysql_fetch_assoc.');
        }
    } else {
        $connection = $db;
        $sql = (string) $arg1;
        if ($arg2 !== null) {
            $allowCaching = (int) $arg2;
        }
        if (func_num_args() > 2) {
            $minutes = (int) func_get_arg(2);
        }
    }

    if (!$connection || $sql === '') {
        return false;
    }

    if ($memcacheWorking == false) {
        $result = _mysqli_query($connection, $sql);
        if ($result === false) {
            return false;
        }
        $row = $result->fetch_assoc();
        return $row;
    } else {

        if ($allowCaching == 0) {
            $result = _mysqli_query($connection, $sql);
            if ($result === false) {
                return false;
            }
            $row = $result->fetch_assoc();
            return $row;
        } else {
            // Check if its set
            $getCache = $memcache->get(md5($sql . systemHash()));

            if ($getCache === false) {
                // cache this data
                $result = _mysqli_query($connection, $sql);
                if ($result === false) {
                    return false;
                }
                $fetchArray = $result->fetch_assoc();
                $setCache = setCache(md5($sql . systemHash()), serialize($fetchArray), 60 * $minutes);

                // store all this users memcache keys, so we can delete them fast later on


                return $fetchArray;
            } else {

                // Data Cached — restrict to arrays only, no object instantiation
                return unserialize($getCache, ['allowed_classes' => false]);
            }
        }
    }
}

function foreach_memcache_mysql_fetch_assoc($arg1, $arg2 = null, $allowCaching = 1)
{
    global $memcacheWorking, $memcache, $db;

    $connection = null;
    $sql = null;

    if ($arg1 instanceof mysqli) {
        $connection = $arg1;
        if (is_string($arg2)) {
            $sql = $arg2;
            if (func_num_args() > 2) {
                $allowCaching = (int) func_get_arg(2);
            }
        } else {
            throw new InvalidArgumentException('SQL query string required when providing mysqli connection to foreach_memcache_mysql_fetch_assoc.');
        }
    } else {
        $connection = $db;
        $sql = (string) $arg1;
        if ($arg2 !== null) {
            $allowCaching = (int) $arg2;
        }
    }

    if (!$connection || $sql === '') {
        return [];
    }

    if ($memcacheWorking == false) {
        $row = [];
        $result = _mysqli_query($connection, $sql); // ($sql);
        if ($result === false) {
            return [];
        }
        while ($fetch = $result->fetch_assoc()) {
            $row[] = $fetch;
        }
        return $row;
    } else {

        if ($allowCaching == 0) {
            $row = [];
            $result = _mysqli_query($connection, $sql); // ($sql);
            if ($result === false) {
                return [];
            }
            while ($fetch = $result->fetch_assoc()) {
                $row[] = $fetch;
            }
            return $row;
        } else {

            $getCache = $memcache->get(md5($sql . systemHash()));
            if ($getCache === false) {
                // if data is NOT cache, cache this data
                $row = [];
                $result = _mysqli_query($connection, $sql); // ($sql);
                if ($result === false) {
                    return [];
                }
                while ($fetch = $result->fetch_assoc()) {
                    $row[] = $fetch;
                }

                $setCache = setCache(md5($sql . systemHash()), serialize($row), 60 * 1);


                return $row;
            } else {
                // if data is cached, returned the cache data Data Cached — restrict to arrays only
                return unserialize($getCache, ['allowed_classes' => false]);
            }
        }
    }
}

function replaceTokens($url, $tokens = [], $fillblanks = 0)
{
    $tokens = array_map(rawurlencode202(...), $tokens);

    if (isset($tokens['c1']) || $fillblanks)
        $url = preg_replace('/\[\[c1\]\]/i', (string) $tokens['c1'], (string) $url);
    if (isset($tokens['c2']) || $fillblanks)
        $url = preg_replace('/\[\[c2\]\]/i', (string) $tokens['c2'], (string) $url);
    if (isset($tokens['c3']) || $fillblanks)
        $url = preg_replace('/\[\[c3\]\]/i', (string) $tokens['c3'], (string) $url);
    if (isset($tokens['c4']) || $fillblanks)
        $url = preg_replace('/\[\[c4\]\]/i', (string) $tokens['c4'], (string) $url);
    if (isset($tokens['t1aipubid']) || $fillblanks)
        $url = preg_replace('/\[\[t1aipubid\]\]/i', (string) $tokens['t1aipubid'], (string) $url);
    if (isset($tokens['gclid']) || $fillblanks)
        $url = preg_replace('/\[\[gclid\]\]/i', (string) $tokens['gclid'], (string) $url);
    if (isset($tokens['msclkid']) || $fillblanks)
        $url = preg_replace('/\[\[msclkid\]\]/i', (string) $tokens['msclkid'], (string) $url);
    if (isset($tokens['fbclid']) || $fillblanks)
        $url = preg_replace('/\[\[fbclid\]\]/i', (string) $tokens['fbclid'], (string) $url);
    if (isset($tokens['utm_source']) || $fillblanks)
        $url = preg_replace('/\[\[utm_source\]\]/i', (string) $tokens['utm_source'], (string) $url);
    if (isset($tokens['utm_medium']) || $fillblanks)
        $url = preg_replace('/\[\[utm_medium\]\]/i', (string) $tokens['utm_medium'], (string) $url);
    if (isset($tokens['utm_campaign']) || $fillblanks)
        $url = preg_replace('/\[\[utm_campaign\]\]/i', (string) $tokens['utm_campaign'], (string) $url);
    if (isset($tokens['utm_term']) || $fillblanks)
        $url = preg_replace('/\[\[utm_term\]\]/i', (string) $tokens['utm_term'], (string) $url);
    if (isset($tokens['utm_content']) || $fillblanks)
        $url = preg_replace('/\[\[utm_content\]\]/i', (string) $tokens['utm_content'], (string) $url);
    if (isset($tokens['subid']) || $fillblanks)
        $url = preg_replace('/\[\[subid\]\]/i', (string) $tokens['subid'], (string) $url);
    if (isset($tokens['t1aikw']) || $fillblanks)
        $url = preg_replace('/\[\[t1aikw\]\]/i', (string) $tokens['t1aikw'], (string) $url);
    if (isset($tokens['payout']) || $fillblanks)
        $url = preg_replace('/\[\[payout\]\]/i', (string) $tokens['payout'], (string) $url);
    if (isset($tokens['random']) || $fillblanks)
        $url = preg_replace('/\[\[random\]\]/i', (string) $tokens['random'], (string) $url);
    if (isset($tokens['cpc']) || $fillblanks)
        $url = preg_replace('/\[\[cpc\]\]/i', (string) $tokens['cpc'], (string) $url);
    if (isset($tokens['cpc2']) || $fillblanks)
        $url = preg_replace('/\[\[cpc2\]\]/i', (string) $tokens['cpc2'], (string) $url);
    if (isset($tokens['cpa']) || $fillblanks)
        $url = preg_replace('/\[\[cpa\]\]/i', (string) $tokens['cpa'], (string) $url);
    if (isset($tokens['timestamp']) || $fillblanks)
        $url = preg_replace('/\[\[timestamp\]\]/i', (string) $tokens['timestamp'], (string) $url);
    if (isset($tokens['country']) || $fillblanks)
        $url = preg_replace('/\[\[country\]\]/i', (string) $tokens['country'], (string) $url);
    if (isset($tokens['country_code']) || $fillblanks)
        $url = preg_replace('/\[\[country_code\]\]/i', (string) $tokens['country_code'], (string) $url);
    if (isset($tokens['region']) || $fillblanks)
        $url = preg_replace('/\[\[region\]\]/i', (string) $tokens['region'], (string) $url);
    if (isset($tokens['city']) || $fillblanks)
        $url = preg_replace('/\[\[city\]\]/i', (string) $tokens['city'], (string) $url);
    if (isset($tokens['referer']) || $fillblanks) {
        $url = preg_replace('/\[\[referer\]\]/i', (string) $tokens['referer'], (string) $url);
        $url = preg_replace('/\[\[referrer\]\]/i', (string) $tokens['referer'], (string) $url);
    }
    if (isset($tokens['sourceid']) || $fillblanks)
        $url = preg_replace('/\[\[sourceid\]\]/i', (string) $tokens['sourceid'], (string) $url);
    if (isset($tokens['transactionid']) || $fillblanks)
        $url = preg_replace('/\[\[(transactionid|t1aitxid)\]\]/i', (string) $tokens['transactionid'], (string) $url);
    return $url;
}

function rawurlencode202($token)
{
    if (isset($token)) {
        $token = str_replace('%40', '@', rawurlencode((string)$token));
        return $token;
    } else {
        return NULL;
    }
}

function getGeoData($ip)
{
    // Handle both string and object input
    if (is_string($ip)) {
        $ip_address = $ip;
    } else {
        $ip_address = $ip->address ?? '';
    }

    // Loyalsoldier/geoip — Country.mmdb (free, auto-updated weekly)
    // https://github.com/Loyalsoldier/geoip
    $country_db = CONFIG_PATH . '/geo/Country.mmdb';
    $asn_db = CONFIG_PATH . '/geo/GeoLite2-ASN.mmdb';

    if (!class_exists(\GeoIp2\Database\Reader::class)) {
        return [
            'country' => '',
            'country_code' => '',
            'is_european_union' => false,
            'continent' => '',
            'city' => '',
            'region' => '',
            'region_code' => '',
            'postal' => ''
        ];
    }

    // Try Country.mmdb first (Loyalsoldier/geoip, free weekly updates)
    if (file_exists($country_db)) {
        try {
            $reader = new Reader($country_db);
            $record = $reader->country($ip_address);
            $country = $record->country->name;
            $country_code = $record->country->isoCode;
            $is_european_union = $record->country->isInEuropeanUnion;
            $continent = $record->continent->name;
            $reader->close();
        } catch (\Exception) {
            $country = '';
            $country_code = '';
            $is_european_union = false;
            $continent = '';
        }
    } else {
        $country = '';
        $country_code = '';
        $is_european_union = false;
        $continent = '';
    }

    // Try ASN database for ISP info
    $isp = '';
    if (file_exists($asn_db)) {
        try {
            $reader = new Reader($asn_db);
            $record = $reader->asn($ip_address);
            $isp = $record->autonomousSystemOrganization;
            $reader->close();
        } catch (\Exception) {
            $isp = '';
        }
    }

    if ($country_code === null || $country_code === '') {
        $country = 'Unknown country';
        $country_code = 'non';
    }

    if (!$is_european_union) {
        $is_european_union = false;
    }

    if ($continent === null || $continent === '') {
        $continent = 'Unknown continent';
    }

    // City/region/postal unavailable in Country-level database — use sensible defaults
    $city = 'Unknown city';
    $region = 'Unknown region';
    $region_code = 'non';
    $postal = 'Unknown postal code';

    return [
        'country' => $country,
        'country_code' => $country_code,
        'is_european_union' => $is_european_union,
        'continent' => $continent,
        'region' => $region,
        'region_code' => $region_code,
        'city' => $city,
        'postal_code' => $postal,
        'isp' => $isp
    ];
}

function getIspData($ip)
{
    $ip_address = is_string($ip) ? $ip : ($ip->address ?? '');

    if ($ip_address === '') {
        return "Unknown ISP/Carrier";
    }

    // Loyalsoldier/geoip ASN database (free, auto-updated weekly)
    $asn_db = CONFIG_PATH . '/geo/GeoLite2-ASN.mmdb';
    if (!class_exists(\GeoIp2\Database\Reader::class)) {
        return "Unknown ISP/Carrier";
    }

    if (file_exists($asn_db)) {
        try {
            $reader = new Reader($asn_db);
            $record = $reader->asn($ip_address);
            $isp = $record->autonomousSystemOrganization;
            $reader->close();
            return $isp ?: 'Unknown ISP/Carrier';
        } catch (\Exception) {
            // Fall through
        }
    }

    return "Unknown ISP/Carrier";
}

function systemHash(): string
{
    $hash = hash('ripemd160', $_SERVER['HTTP_HOST'] . $_SERVER['SERVER_ADDR']);
    return $hash;
}

function setPCIdCookie($click_id_public)
{
    if (trackingEnabled()) {
        //set the cookie for the PIXEL to fire, expire in 30 days
        $expire = 0;
        $expire_header = 0;
        $path = '/';
        $domain = $_SERVER['HTTP_HOST'];
        $secure = TRUE;
        $httponly = FALSE; // JS createCookie() sets this cookie in record_adv.php

        //legacy cookies
        setcookie('tracking1aipci-legacy', (string) $click_id_public, ['expires' => $expire, 'path' => '/', 'domain' => (string) $domain]);

        setcookie('tracking1aipci', (string) $click_id_public, ['expires' => $expire, 'path' => '/', 'domain' => $domain, 'secure' => $secure, 'httponly' => $httponly, 'samesite' => 'None']);
    }
}

function setOutboundCookie($outbound_site_url)
{
    if (trackingEnabled()) {
        //set the cookie for the PIXEL to fire, expire in 30 days
        $expire = 0;
        $expire_header = 0;
        $path = '/';
        $domain = $_SERVER['HTTP_HOST'];
        $secure = TRUE;
        $httponly = FALSE; // JS createCookie() sets this cookie in record_simple.php

        //legacy cookies
        setcookie('tracking1aioutbound-legacy', (string) $outbound_site_url, ['expires' => $expire, 'path' => '/', 'domain' => (string) $domain]);

        setcookie('tracking1aioutbound', (string) $outbound_site_url, ['expires' => $expire, 'path' => '/', 'domain' => $domain, 'secure' => $secure, 'httponly' => $httponly, 'samesite' => 'None']);
    }
}

function getPrePopVars($vars)
{
    $urlvars = '';
    $stoplist = [
        'subid',
        'c1',
        'c2',
        'c3',
        'c4',
        't1aikw',
        't1aiid',
        't1aib',
        't1airef',
        't1aipubid',
        'acip',
        '202v',
        '202vars',
        'lpip',
        'pci',
        'gclid',
        'msclkid',
        'fbclid',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content'
    ];

    foreach ($vars as $key => $value) {
        if (! in_array($key, $stoplist)) {
            $urlvars .= $key . "=" . $value . "&";
        }
    }

    return $urlvars;
}

function setPrePopVars($urlvars, $redirect_site_url, $b64 = false)
{
    if (isset($urlvars) && $urlvars != '') {

        // remove & at the end of the string
        $urlvars = rtrim((string) $urlvars, '&');
        if ($b64) {
            $urlvars = "202vars=" . base64_encode($urlvars);
        }
        if (! parse_url((string) $redirect_site_url, PHP_URL_QUERY)) {

            // if there is no query url the add a ? to thecVars but before doing that remove case where there may be a ? at the end of the url and nothing else
            $redirect_site_url = rtrim((string) $redirect_site_url, '?');

            // remove the & from thecVars and put a ? in fron t of it

            $redirect_site_url .= "?" . $urlvars;
        } else {

            $redirect_site_url .= "&" . $urlvars;
        }
    }

    return $redirect_site_url;
}

function record_mysql_error($dbOrSql, $sql = null): never
{
    global $server_row, $ip_address; // Add global $ip_address

    if ($sql === null) {
        $sql = (string) $dbOrSql;
        $db = $GLOBALS['db'] ?? null;
    } else {
        $db = $dbOrSql;
    }

    if (!$db instanceof \mysqli) {
        $database = \DB::getInstance();
        $db = $database->getConnection();
    }

    if (!$db instanceof \mysqli) {
        error_log('Database connection unavailable - SQL: ' . $sql);
        echo 'Database error. The webmaster has been notified.';
        die();
    }
    $conn = new \OneAIAffiliate\Database\Connection($db);

    // record the mysql error
    $clean['mysql_error_text'] = mysqli_error($db);

    // log the error server-side only
    error_log('MySQL error: ' . $clean['mysql_error_text'] . ' | SQL: ' . $sql);


    $ipForError = $ip_address ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''));
    $ip_id = get_ip_id($ipForError);
    $mysql['ip_id'] = $conn->escape($ip_id);

    $site_url = 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
    $site_id = get_site_url_id($site_url);
    $mysql['site_id'] = $conn->escape($site_id);

    $mysql['user_id'] = $conn->escape(strip_tags((string) $_SESSION['user_id']));
    $mysql['mysql_error_text'] = $conn->escape($clean['mysql_error_text']);
    $mysql['mysql_error_sql'] = $conn->escape($sql);
    $mysql['script_url'] = $conn->escape(strip_tags((string) $_SERVER['SCRIPT_URL']));
    $mysql['server_name'] = $conn->escape(strip_tags((string) $_SERVER['SERVER_NAME']));
    $mysql['mysql_error_time'] = time();

    $report_sql = "INSERT     INTO  mysql_errors
								SET     mysql_error_text='" . $mysql['mysql_error_text'] . "',
										mysql_error_sql='" . $mysql['mysql_error_sql'] . "',
										user_id='" . $mysql['user_id'] . "',
										ip_id='" . $mysql['ip_id'] . "',
										site_id='" . $mysql['site_id'] . "',
										mysql_error_time='" . $mysql['mysql_error_time'] . "'";
    $report_query = $conn->query($report_sql);

    // email administration of the error
    $to = $_SERVER['SERVER_ADMIN'];
    $subject = 'mysql error reported - ' . $site_url;
    $message = '<b>A mysql error has been reported</b><br/><br/>
		
					time: ' . date('r', time()) . '<br/>
					server_name: ' . $_SERVER['SERVER_NAME'] . '<br/><br/>
					
					user_id: ' . $_SESSION['user_id'] . '<br/>
					script_url: ' . $site_url . '<br/>
					$_SERVER: ' . serialize($_SERVER) . '<br/><br/>
					
					. . . . . . . . <br/><br/>
												 
					_mysqli_query: ' . $sql . '<br/><br/>
					 
					mysql_error: ' . $clean['mysql_error_text'];
    $from = $_SERVER['SERVER_ADMIN'];
    $type = 3; // type 3 is mysql_error

    // send_email($to,$subject,$message,$from,$type);

    // report error to user and end page    
?>
    <div class="warning" style="margin: 40px auto; width: 450px;">
        <div>
            <h3>A database error has occured, the webmaster has been notified</h3>
            <p>If this error persists, you may email us directly: <?php printf('<a href="mailto:%s">%s</a>', $_SERVER['SERVER_ADMIN'], $_SERVER['SERVER_ADMIN']); ?></p>
        </div>
    </div>


<?php
    $memcacheWorking = false;
    $memcache = null;
    die();
}

function getSplitTestValue(array $values)
{
    $sum = 0;

    foreach ($values as $key => $value) {
        if ($value['weight'] == 0) {
            unset($values[$key]);
        } else {
            $sum += $value['weight'];
        }
    }

    $rand = @mt_rand(1, (int) $sum);

    foreach ($values as $key => $value) {
        $rand -= $value['weight'];
        if ($rand <= 0) {
            return $key;
        }
    }
}

function get_absolute_url(): string
{
    return substr(substr(__DIR__, 0, -10), strlen(realpath($_SERVER['DOCUMENT_ROOT'])));
}

function getTrackingDomain(): string
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    $raw_server_name = $_SERVER['SERVER_NAME'] ?? '';
    // Sanitize to prevent host header injection — allow only valid hostname characters
    $tracking_domain = preg_replace('/[^a-zA-Z0-9.\-:]/', '', $raw_server_name);

    // Add port if non-standard (not 80/443)
    $port = $_SERVER['SERVER_PORT'] ?? 80;
    if ($port != 80 && $port != 443) {
        $tracking_domain .= ':' . $port;
    }

    $tracking_domain_sql = "
		SELECT
			`user_tracking_domain`
		FROM
			`users_pref`
		WHERE
			`user_id`='1'
	";
    $tracking_domain_result = $conn->query($tracking_domain_sql); //($user_sql);
    $tracking_domain_row = $tracking_domain_result->fetch_assoc();
    if (isset($tracking_domain_row['user_tracking_domain']) && strlen((string) $tracking_domain_row['user_tracking_domain']) > 0) {
        $tracking_domain = $tracking_domain_row['user_tracking_domain'];
    }
    return $tracking_domain;
}

function updateLpClickDataForRotator($redirect_id, $click_id, $rotator_id, $rule_id)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $stmt = $db->prepare("REPLACE INTO clicks_rotator SET click_id=?, rotator_id=?, rule_id=?, rule_redirect_id=?");
    $stmt->bind_param('iiii', $click_id, $rotator_id, $rule_id, $redirect_id);
    if (!$stmt->execute()) {
        $stmt->close();
        throw new \RuntimeException('Failed to update rotator click data: ' . $db->error);
    }
    $stmt->close();
}

function parseUaForRotatorCriteria($detect, $parser, $ua)
{
    $result = $parser->parse($ua);

    if (!$detect->isMobile() && !$detect->isTablet()) {

        switch ($result->device->family) {
            //Is Bot
            case 'Bot':
                $result->device->family = "Bot";
                break;
            //Is Desktop
            case 'Other':
                $result->device->family = "Desktop";
                break;
        }
    } else {
        if ($detect->isTablet()) {
            $result->device->family = "Tablet";
            //If mobile 
        } else {
            $result->device->family = "Mobile";
        }
    }

    return $result;
}

function ip_in_range($ip, $range)
{
    if (str_contains((string) $range, '/')) {
        [$range, $netmask] = explode('/', (string) $range, 2);
        if (str_contains($netmask, '.')) {
            $netmask = str_replace('*', '0', $netmask);
            $netmask_dec = ip2long($netmask);
            return ((ip2long($ip) & $netmask_dec) == (ip2long($range) & $netmask_dec));
        } else {
            $x = explode('.', $range);
            while (count($x) < 4) $x[] = '0';
            [$a, $b, $c, $d] = $x;
            $range = sprintf("%u.%u.%u.%u", empty($a) ? '0' : $a, empty($b) ? '0' : $b, empty($c) ? '0' : $c, empty($d) ? '0' : $d);
            $range_dec = ip2long($range);
            $ip_dec = ip2long($ip);

            $wildcard_dec = 2 ** (32 - (int)$netmask) - 1;
            $netmask_dec = ~$wildcard_dec;

            return (($ip_dec & $netmask_dec) == ($range_dec & $netmask_dec));
        }
    } else {
        if (str_contains((string) $range, '*')) {
            $lower = str_replace('*', '0', $range);
            $upper = str_replace('*', '255', $range);
            $range = "$lower-$upper";
        }

        if (str_contains((string) $range, '-')) { // A-B format
            [$lower, $upper] = explode('-', (string) $range, 2);
            $lower_dec = (float)sprintf("%u", ip2long($lower));
            $upper_dec = (float)sprintf("%u", ip2long($upper));
            $ip_dec = (float)sprintf("%u", ip2long($ip));
            return (($ip_dec >= $lower_dec) && ($ip_dec <= $upper_dec));
        }

        return false;
    }
}

function getData($url)
{
    if (function_exists('curl_version')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    } else {
        return false;
    }
}

function getPublisher($pubid)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    $publisher_id_sql = "
		SELECT
			`user_id`
		FROM
			`users`
		WHERE
			`user_public_publisher_id`='" . $pubid . "'";

    // @phpstan-ignore-next-line -- $db+sql overload defined in connect2.php
    $pubid_row = memcache_mysql_fetch_assoc($db, $publisher_id_sql);
    if ($pubid_row) {
        return $conn->escape($pubid_row['user_id']);
    } else {
        return 1;
    }
}

function getTokens($mysql)
{
    $tokens = [
        "subid" => $mysql['click_id'],
        "t1aikw" => $mysql['t1aikw'],
        "c1" => $mysql['c1'],
        "c2" => $mysql['c2'],
        "c3" => $mysql['c3'],
        "c4" => $mysql['c4'],
        "gclid" => $mysql['gclid'],
        "msclkid" => $mysql['msclkid'],
        "fbclid" => $mysql['fbclid'],
        "utm_source" => $mysql['utm_source'],
        "utm_medium" => $mysql['utm_medium'],
        "utm_campaign" => $mysql['utm_campaign'],
        "utm_term" => $mysql['utm_term'],
        "utm_content" => $mysql['utm_content'],
        "cpc" => round($mysql['cpc'], 2),
        "cpc2" => $mysql['cpc'],
        "timestamp" => time(),
        "payout" => $mysql['payout'],
        "random" => mt_rand(1000000, 9999999),
        "referer" => $mysql['referer'],
        "sourceid" => $mysql['ppc_account_id'],
        "transactionid" => $mysql['txid']
    ];

    return $tokens;
}

function ipAddress($ip_address)
{

    $ip = new stdClass;

    if (filter_var($ip_address, FILTER_VALIDATE_IP)) {
        $ip->address = $ip_address;
        if (filter_var($ip_address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ip->type = 'ipv4';
        } else {
            $ip->type = 'ipv6';
        }
    } else {
        $ip->type = 'invalid';
        $ip->address = '0.0.0.0';
    }

    if (!trackingEnabled()) {
        $ip = maskIpAddress($ip);
    }

    $formatted = @inet_ntop(@inet_pton($ip->address));
    if ($formatted !== false) {
        $ip->address = $formatted; //format ip address in standard form
    }
    return $ip;
}

function maskIpAddress($ip)
{

    if ($ip->type == 'ipv4') {
        $bits = explode('.', (string) $ip->address);
        $masked = implode(".", array_slice($bits, 0, 3)) . ".0";
    } else if ($ip->type == 'ipv6') {
        $bits = explode(':', (string) $ip->address);
        $masked = implode(":", array_slice($bits, 0, 3)) . ":0000:0000:0000:0000:0000";
    }
    if (isset($masked)) {
        $ip->address = $masked;
    }

    return $ip;
}

function inet6_ntoa($ip)
{
    return @inet_ntop($ip);
}

function inet6_aton($ip)
{
    return @inet_pton($ip);
}

function sanitizeIn($data) {
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    if (!is_string($data)) {
        return '';
    }
    return $conn->escape($data);
}

function getTrackerDetail(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $tracker_sql = "SELECT trackers.user_id,
						trackers.aff_campaign_id,
						text_ad_id,
						ppc_account_id,
						click_cpc,
						click_cpa,
						click_cloaking,
						aff_campaign_rotate,
						aff_campaign_url,
						aff_campaign_url_2,
						aff_campaign_url_3,
						aff_campaign_url_4,
						aff_campaign_url_5,
						aff_campaign_payout,
						aff_campaign_cloaking,
						2cv.ppc_variable_ids,
						2cv.parameters,
                        user_timezone,
		                user_keyword_searched_or_bidded,
                        user_pref_referer_data,
                        user_pref_dynamic_bid,
		                maxmind_isp
                        FROM trackers
                        LEFT JOIN users_pref USING (user_id)
                LEFT JOIN users USING (user_id)
    			LEFT JOIN aff_campaigns USING (aff_campaign_id)
				LEFT JOIN ppc_accounts USING (ppc_account_id)
				LEFT JOIN (SELECT ppc_network_id, GROUP_CONCAT(ppc_variable_id) AS ppc_variable_ids, GROUP_CONCAT(parameter) AS parameters FROM ppc_network_variables GROUP BY ppc_network_id) AS 2cv USING (ppc_network_id)
				WHERE tracker_id_public='" . $mysql['tracker_id_public'] . "'";


    // @phpstan-ignore-next-line -- $db+sql overload defined in connect2.php
    $tracker_row = memcache_mysql_fetch_assoc($db, $tracker_sql);

    //set all mysql vars
    $mysql['aff_campaign_id'] = $conn->escape($tracker_row['aff_campaign_id']);
    $mysql['ppc_account_id'] = $conn->escape($tracker_row['ppc_account_id']);
    $mysql['user_pref_dynamic_bid'] = $conn->escape($tracker_row['user_pref_dynamic_bid']);
    $mysql['user_pref_referer_data'] = $conn->escape($tracker_row['user_pref_referer_data']);
    // set cpc use dynamic variable if set or the default if not
    if (isset($_GET['t1aib']) && $mysql['user_pref_dynamic_bid'] == '1') {
        $_GET['t1aib'] = ltrim((string) $_GET['t1aib'], '$');
        if (is_numeric($_GET['t1aib'])) {
            $bid = number_format((float) $_GET['t1aib'], 5, '.', '');
            $mysql['click_cpc'] = $conn->escape($bid);
        } else {
            $mysql['click_cpc'] = $conn->escape($tracker_row['click_cpc']);
        }
    } else
        $mysql['click_cpc'] = $conn->escape($tracker_row['click_cpc']);

    $mysql['click_cpa'] = $conn->escape($tracker_row['click_cpa']);
    $mysql['click_payout'] = $conn->escape($tracker_row['aff_campaign_payout']);

    $mysql['text_ad_id'] = $conn->escape($tracker_row['text_ad_id']);

    $mysql['user_keyword_searched_or_bidded'] = $conn->escape($tracker_row['user_keyword_searched_or_bidded']);

    $mysql['user_id'] = $conn->escape($tracker_row['user_id']);
    $mysql['user_timezone'] = $conn->escape($tracker_row['user_timezone']);

    $mysql['aff_campaign_url'] = $conn->escape($tracker_row['aff_campaign_url']);

    return $tracker_row;
}

function getTrackerDetailPT(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $tracker_sql = "SELECT trackers.user_id,
						trackers.aff_campaign_id,
						text_ad_id,
						ppc_account_id,
						click_cpc,
						click_cpa,
						click_cloaking,
						aff_campaign_rotate,
                        landing_page_url,
						aff_campaign_url,
						aff_campaign_url_2,
						aff_campaign_url_3,
						aff_campaign_url_4,
						aff_campaign_url_5,
						aff_campaign_payout,
						aff_campaign_cloaking,
						2cv.ppc_variable_ids,
						2cv.parameters,
                        user_timezone,
		                user_keyword_searched_or_bidded,
                        user_pref_referer_data,
                        user_pref_dynamic_bid,
		                maxmind_isp
                        FROM trackers
                        LEFT JOIN users_pref USING (user_id)
                LEFT JOIN users USING (user_id)
    			LEFT JOIN aff_campaigns USING (aff_campaign_id)
				LEFT JOIN ppc_accounts USING (ppc_account_id)
                LEFT JOIN landing_pages USING (landing_page_id)
				LEFT JOIN (SELECT ppc_network_id, GROUP_CONCAT(ppc_variable_id) AS ppc_variable_ids, GROUP_CONCAT(parameter) AS parameters FROM ppc_network_variables GROUP BY ppc_network_id) AS 2cv USING (ppc_network_id)
				WHERE tracker_id_public='" . $mysql['tracker_id_public'] . "'";


    // @phpstan-ignore-next-line -- $db+sql overload defined in connect2.php
    $tracker_row = memcache_mysql_fetch_assoc($db, $tracker_sql);

    //set all mysql vars
    $mysql['aff_campaign_id'] = $conn->escape($tracker_row['aff_campaign_id']);
    $mysql['ppc_account_id'] = $conn->escape($tracker_row['ppc_account_id']);
    $mysql['user_pref_dynamic_bid'] = $conn->escape($tracker_row['user_pref_dynamic_bid']);
    $mysql['user_pref_referer_data'] = $conn->escape($tracker_row['user_pref_referer_data']);
    // set cpc use dynamic variable if set or the default if not
    if (isset($_GET['t1aib']) && $mysql['user_pref_dynamic_bid'] == '1') {
        $_GET['t1aib'] = ltrim((string) $_GET['t1aib'], '$');
        if (is_numeric($_GET['t1aib'])) {
            $bid = number_format((float) $_GET['t1aib'], 5, '.', '');
            $mysql['click_cpc'] = $conn->escape($bid);
        } else {
            $mysql['click_cpc'] = $conn->escape($tracker_row['click_cpc']);
        }
    } else
        $mysql['click_cpc'] = $conn->escape($tracker_row['click_cpc']);

    $mysql['click_cpa'] = $conn->escape($tracker_row['click_cpa']);
    $mysql['click_payout'] = $conn->escape($tracker_row['aff_campaign_payout']);

    $mysql['text_ad_id'] = $conn->escape($tracker_row['text_ad_id']);

    $mysql['user_keyword_searched_or_bidded'] = $conn->escape($tracker_row['user_keyword_searched_or_bidded']);

    $mysql['user_id'] = $conn->escape($tracker_row['user_id']);
    $mysql['user_timezone'] = $conn->escape($tracker_row['user_timezone']);

    $mysql['aff_campaign_url'] = $conn->escape($tracker_row['aff_campaign_url']);

    return $tracker_row;
}

function getClickId(): string
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    $click_sql = "INSERT INTO  clicks_counter SET click_id=DEFAULT";
    $click_result = $db->query($click_sql) or record_mysql_error($db);

    //now gather the info for the advance click insert
    $click_id = $db->insert_id;
    return $conn->escape($click_id);
}

function getClickIdPublic($click_id)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    return $conn->escape(random_int(1, 9) . $click_id . random_int(1, 9));
}

function insertClicks($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $click_sql = '';

    if (!$mysql['ppc_account_id']) {
        $mysql['ppc_account_id'] = '0';
    }

    if (!$mysql['click_cpc']) {
        $mysql['click_cpc'] = '0';
    }

    switch ($mysql['lp_type']) {
        case 'dl':
        case 'rtr':
            $click_sql = "INSERT IGNORE INTO clicks
			  SET           	click_id='" . $mysql['click_id'] . "',
							user_id = '" . $mysql['user_id'] . "',
							aff_campaign_id = '" . $mysql['aff_campaign_id'] . "',
							ppc_account_id = '" . $mysql['ppc_account_id'] . "',
							click_cpc = '" . $mysql['click_cpc'] . "',
							click_payout = '" . $mysql['click_payout'] . "',
							click_alp = '" . $mysql['click_alp'] . "',
							click_filtered = '" . $mysql['click_filtered'] . "',
							click_bot = '" . $mysql['click_bot'] . "',
							click_time = '" . $mysql['click_time'] . "'";
            break;
        case 'slp':
            $click_sql = "INSERT INTO   clicks
			  SET           click_id='" . $mysql['click_id'] . "',
							user_id = '" . $mysql['user_id'] . "',
							aff_campaign_id = '" . $mysql['aff_campaign_id'] . "',
							landing_page_id='" . $mysql['landing_page_id'] . "',
							ppc_account_id = '" . $mysql['ppc_account_id'] . "',
							click_cpc = '" . $mysql['click_cpc'] . "',
							click_payout = '" . $mysql['click_payout'] . "',
							click_filtered = '" . $mysql['click_filtered'] . "',
							click_bot = '" . $mysql['click_bot'] . "',
							click_alp = '" . $mysql['click_alp'] . "',
							click_time = '" . $mysql['click_time'] . "'
							ON DUPLICATE KEY UPDATE
							 click_alp = '" . $mysql['click_alp'] . "'";
            break;
        case 'alp':
            $click_sql = "INSERT INTO   clicks
			  SET           	click_id='" . $mysql['click_id'] . "',
							user_id = '" . $mysql['user_id'] . "',
							landing_page_id='" . $mysql['landing_page_id'] . "',
							ppc_account_id = '" . $mysql['ppc_account_id'] . "',
							click_cpc = '" . $mysql['click_cpc'] . "',
							click_filtered = '" . $mysql['click_filtered'] . "',
							click_bot = '" . $mysql['click_bot'] . "',
							click_alp = '" . $mysql['click_alp'] . "',
							click_time = '" . $mysql['click_time'] . "'
							ON DUPLICATE KEY UPDATE
							 click_alp = '" . $mysql['click_alp'] . "'";
            break;
    }

    return $click_result = $db->query($click_sql) or record_mysql_error($db);
}

function insertGclid($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // insert gclid and utm vars
    if ($mysql['gclid'] || $mysql['utm_source_id'] || $mysql['utm_medium_id'] || $mysql['utm_campaign_id'] || $mysql['utm_term_id'] || $mysql['utm_content_id']) {
        $click_sql = "REPLACE INTO google
			  SET           click_id='" . $mysql['click_id'] . "',
							gclid = '" . $mysql['gclid'] . "',
                            utm_source_id = '" . $mysql['utm_source_id'] . "',
                            utm_medium_id = '" . $mysql['utm_medium_id'] . "',
                            utm_campaign_id = '" . $mysql['utm_campaign_id'] . "',
                            utm_term_id = '" . $mysql['utm_term_id'] . "',
                            utm_content_id = '" . $mysql['utm_content_id'] . "'";
        return $click_result = $db->query($click_sql) or record_mysql_error($db);
    }
}

function getGclid($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // get click id
    if (isset($mysql['gclid'])) {

        $click_sql = "SELECT google.click_id, click_id_public , click_time, c1,c2,c3,c4, keyword AS t1aikw, `utm_campaign`, `utm_source`, `utm_source`, `utm_medium`, `utm_term`, `utm_content` FROM google
    LEFT JOIN clicks_advance USING(click_id)
    LEFT JOIN keywords USING(keyword_id)
    LEFT JOIN clicks_tracking USING(click_id)
    LEFT JOIN tracking_c1 USING(c1_id)
    LEFT JOIN tracking_c2 USING(c2_id)
    LEFT JOIN tracking_c3 USING(c3_id)
    LEFT JOIN tracking_c4 USING(c4_id)
    LEFT JOIN utm_campaign USING(utm_campaign_id)
    LEFT JOIN utm_source USING(utm_source_id)
    LEFT JOIN utm_medium USING(utm_medium_id)
    LEFT JOIN utm_term USING(utm_term_id)
    LEFT JOIN utm_content USING(utm_content_id)
    LEFT JOIN clicks_record USING(click_id)
    LEFT JOIN clicks USING(click_id)
    WHERE  gclid =  '" . $mysql['gclid'] . "'";
        // $click_row = memcache_mysql_fetch_assoc($db,$click_sql);    
        $click_result = $db->query($click_sql);
        $click_row = $click_result->fetch_assoc();
    } else {
        $click_row = null;
    }
    return $click_row;
}

function getClickData($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // get click id
    if (isset($mysql['click_id'])) {

        $click_sql = "SELECT click_id,click_id_public, click_time, c1,c2,c3,c4, keyword AS t1aikw,`utm_campaign`, `utm_source`, `utm_source`, `utm_medium`, `utm_term`, `utm_content` FROM clicks
	LEFT JOIN clicks_tracking USING(click_id)
	LEFT JOIN clicks_record USING(click_id)
    LEFT JOIN clicks_advance USING(click_id)
    LEFT JOIN google USING(click_id)
    LEFT JOIN keywords USING(keyword_id)
    LEFT JOIN tracking_c1 USING(c1_id)
    LEFT JOIN tracking_c2 USING(c2_id)
    LEFT JOIN tracking_c3 USING(c3_id)
    LEFT JOIN tracking_c4 USING(c4_id)
    LEFT JOIN utm_campaign USING(utm_campaign_id)
    LEFT JOIN utm_source USING(utm_source_id)
    LEFT JOIN utm_medium USING(utm_medium_id)
    LEFT JOIN utm_term USING(utm_term_id)
    LEFT JOIN utm_content USING(utm_content_id)
    WHERE  clicks.click_id =  '" . $mysql['click_id'] . "'
    LIMIT 1";

        // echo $click_sql;
        // $click_row = memcache_mysql_fetch_assoc($db,$click_sql);    
        $click_result = $db->query($click_sql);
        $click_row = $click_result->fetch_assoc();
    } else {
        $click_row = null;
    }
    return $click_row;
}

function insertMsclkid($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // insert msclkid and utm vars
    if ($mysql['msclkid'] || $mysql['utm_source_id'] || $mysql['utm_medium_id'] || $mysql['utm_campaign_id'] || $mysql['utm_term_id'] || $mysql['utm_content_id']) {
        $click_sql = "REPLACE INTO   bing
			  SET           click_id='" . $mysql['click_id'] . "',
							msclkid = '" . $mysql['msclkid'] . "',
                            utm_source_id = '" . $mysql['utm_source_id'] . "',
                            utm_medium_id = '" . $mysql['utm_medium_id'] . "',
                            utm_campaign_id = '" . $mysql['utm_campaign_id'] . "',
                            utm_term_id = '" . $mysql['utm_term_id'] . "',
                            utm_content_id = '" . $mysql['utm_content_id'] . "'";
        return $click_result = $db->query($click_sql) or record_mysql_error($db);
    }
}

function insertFbclid($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // insert fbclid and utm vars
    if ($mysql['fbclid'] || $mysql['utm_source_id'] || $mysql['utm_medium_id'] || $mysql['utm_campaign_id'] || $mysql['utm_term_id'] || $mysql['utm_content_id']) {
        $click_sql = "REPLACE INTO facebook
			  SET           click_id='" . $mysql['click_id'] . "',
							fbclid = '" . $mysql['fbclid'] . "',
                            utm_source_id = '" . $mysql['utm_source_id'] . "',
                            utm_medium_id = '" . $mysql['utm_medium_id'] . "',
                            utm_campaign_id = '" . $mysql['utm_campaign_id'] . "',
                            utm_term_id = '" . $mysql['utm_term_id'] . "',
                            utm_content_id = '" . $mysql['utm_content_id'] . "'";
        return $click_result = $db->query($click_sql) or record_mysql_error($db);
    }
}

function insertClicksVariable($mysql, $tracker_row)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $custom_var_ids = [];

    $ppc_variable_ids = explode(',', (string) $tracker_row['ppc_variable_ids']);
    $parameters = explode(',', (string) $tracker_row['parameters']);

    foreach ($parameters as $key => $value) {
        if (isset($_GET[$value])) {
            $variable = $conn->escape($_GET[$value]);
            if ($variable != '') {
                $variable = str_replace('%20', ' ', $variable);
                $variable_id = get_variable_id($variable, $ppc_variable_ids[$key]);
                $custom_var_ids[] = $variable_id;
            }
        }
        /* this was causing a bug
        else{
            $custom_var_ids[] = '';
        }*/
    }

    $total_vars = count($custom_var_ids);

    if ($total_vars > 0) {

        $variables = implode(",", $custom_var_ids);
        $variable_set_id = get_variable_set_id($variables);

        $mysql['variable_set_id'] = $conn->escape($variable_set_id);

        $var_sql = "INSERT IGNORE INTO clicks_variable (click_id, variable_set_id) VALUES ('" . $mysql['click_id'] . "', '" . $mysql['variable_set_id'] . "')";
        return $var_result = $db->query($var_sql) or record_mysql_error($db);
    }
}

function insertClicksSite($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $click_sql = '';

    switch ($mysql['lp_type']) {
        case 'dl':
        case 'rtr':
            $click_sql = "INSERT IGNORE INTO clicks_site
			  SET           click_id='" . $mysql['click_id'] . "',
							click_referer_site_url_id='" . $mysql['click_referer_site_url_id'] . "',
							click_outbound_site_url_id='" . $mysql['click_outbound_site_url_id'] . "',
							click_redirect_site_url_id='" . $mysql['click_redirect_site_url_id'] . "'";
            break;
        case 'slp':
            $click_sql = "REPLACE INTO  clicks_site
			  SET           click_id='" . $mysql['click_id'] . "',
							click_referer_site_url_id='" . $mysql['click_referer_site_url_id'] . "',
							click_landing_site_url_id='" . $mysql['click_landing_site_url_id'] . "',
							click_outbound_site_url_id='" . $mysql['click_outbound_site_url_id'] . "',
							click_cloaking_site_url_id='" . $mysql['click_cloaking_site_url_id'] . "',
							click_redirect_site_url_id='" . $mysql['click_redirect_site_url_id'] . "'";
            break;
        case 'alp':
            $click_sql = "INSERT IGNORE INTO   clicks_site
			  SET           	click_id='" . $mysql['click_id'] . "',
							click_referer_site_url_id='" . $mysql['click_referer_site_url_id'] . "',
							click_landing_site_url_id='" . $mysql['click_landing_site_url_id'] . "',
							click_outbound_site_url_id='0',
							click_cloaking_site_url_id='0',
							click_redirect_site_url_id='0'
							ON DUPLICATE KEY UPDATE
							click_referer_site_url_id = '" . $mysql['click_referer_site_url_id'] . "',
							click_landing_site_url_id='" . $mysql['click_landing_site_url_id'] . "'";
            break;
    }


    return $click_result = $db->query($click_sql) or record_mysql_error($db);
}

function insertClicksRecord($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $click_sql = "INSERT IGNORE INTO   clicks_record
			  SET           click_id='" . $mysql['click_id'] . "',
							click_id_public='" . $mysql['click_id_public'] . "',
							click_cloaking='" . $mysql['click_cloaking'] . "',
							click_in='" . $mysql['click_in'] . "',
							click_out='" . $mysql['click_out'] . "'";
    return $click_result = $db->query($click_sql) or record_mysql_error($db);
}

function insertClicksAdvance($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $click_sql = "INSERT IGNORE INTO  clicks_advance
			  SET           	click_id='" . $mysql['click_id'] . "',
							text_ad_id='" . $mysql['text_ad_id'] . "',
							keyword_id='" . $mysql['keyword_id'] . "',
							ip_id='" . $mysql['ip_id'] . "',
							country_id='" . $mysql['country_id'] . "',
							region_id='" . $mysql['region_id'] . "',
							isp_id='" . $mysql['isp_id'] . "',
							city_id='" . $mysql['city_id'] . "',
							platform_id='" . $mysql['platform_id'] . "',
							browser_id='" . $mysql['browser_id'] . "',
                            device_id='" . $mysql['device_id'] . "'";
    return $click_result = $db->query($click_sql) or record_mysql_error($db);
}

function insertClicksTracking($mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $click_sql = "INSERT IGNORE INTO
		clicks_tracking
	SET
		click_id='" . $mysql['click_id'] . "',
		c1_id = '" . $mysql['c1_id'] . "',
		c2_id = '" . $mysql['c2_id'] . "',
		c3_id = '" . $mysql['c3_id'] . "',
		c4_id = '" . $mysql['c4_id'] . "'";
    $click_result = $db->query($click_sql) or record_mysql_error($db);
    return $click_result;
}


function processCacheRedirect(): void
{
    global $db, $memcacheWorking, $memcache;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $usedCachedRedirect = false;
    if (!$db) $usedCachedRedirect = true;

    #the mysql server is down, use the cached redirect
    if ($usedCachedRedirect == true) {

        $t1aiid = $_GET['t1aiid'];

        //if a cached key is found for this t1aiid, redirect to that url
        if ($memcacheWorking) {
            $getUrl = getCache(md5('url_' . $t1aiid . systemHash()));
            if ($getUrl) {

                $new_url = str_replace("[[subid]]", "p1ai", $getUrl);

                // t1aipubid string replace for cached redirect
                if (isset($_GET['t1aipubid']) && $_GET['t1aipubid'] != '') {
                    $new_url = str_replace("[[t1aipubid]]", $_GET['t1aipubid'], $new_url);
                } else {
                    $new_url = str_replace("[[t1aipubid]]", "t1aipubid", $new_url);
                }

                //c1 string replace for cached redirect
                if (isset($_GET['c1']) && $_GET['c1'] != '') {
                    $new_url = str_replace("[[c1]]", $_GET['c1'], $new_url);
                } else {
                    $new_url = str_replace("[[c1]]", "p1aic1", $new_url);
                }

                //c2 string replace for cached redirect
                if (isset($_GET['c2']) && $_GET['c2'] != '') {
                    $new_url = str_replace("[[c2]]", $_GET['c2'], $new_url);
                } else {
                    $new_url = str_replace("[[c2]]", "p1aic2", $new_url);
                }

                //c3 string replace for cached redirect
                if (isset($_GET['c3']) && $_GET['c3'] != '') {
                    $new_url = str_replace("[[c3]]", $_GET['c3'], $new_url);
                } else {
                    $new_url = str_replace("[[c3]]", "p1aic3", $new_url);
                }

                //c4 string replace for cached redirect
                if (isset($_GET['c4']) && $_GET['c4'] != '') {
                    $new_url = str_replace("[[c4]]", $_GET['c4'], $new_url);
                } else {
                    $new_url = str_replace("[[c4]]", "p1aic4", $new_url);
                }

                //gclid string replace for cached redirect
                if (isset($_GET['gclid']) && $_GET['gclid'] != '') {
                    $new_url = str_replace("[[gclid]]", $_GET['gclid'], $new_url);
                } else {
                    $new_url = str_replace("[[gclid]]", "p1aigclid", $new_url);
                }

                //msclkid string replace for cached redirect
                if (isset($_GET['msclkid']) && $_GET['msclkid'] != '') {
                    $new_url = str_replace("[[msclkid]]", $_GET['msclkid'], $new_url);
                } else {
                    $new_url = str_replace("[[msclkid]]", "p1aimsclkid", $new_url);
                }

                //fbclid string replace for cached redirect
                if (isset($_GET['fbclid']) && $_GET['fbclid'] != '') {
                    $new_url = str_replace("[[fbclid]]", $_GET['fbclid'], $new_url);
                } else {
                    $new_url = str_replace("[[fbclid]]", "p1aifbclid", $new_url);
                }

                //utm_source string replace for cached redirect
                if (isset($_GET['utm_source']) && $_GET['utm_source'] != '') {
                    $new_url = str_replace("[[utm_source]]", $_GET['utm_source'], $new_url);
                } else {
                    $new_url = str_replace("[[utm_source]]", "p1aiutm_source", $new_url);
                }

                //utm_medium string replace for cached redirect
                if (isset($_GET['utm_medium']) && $_GET['utm_medium'] != '') {
                    $new_url = str_replace("[[utm_medium]]", $_GET['utm_medium'], $new_url);
                } else {
                    $new_url = str_replace("[[utm_medium]]", "p1aiutm_medium", $new_url);
                }

                //utm_campaign string replace for cached redirect
                if (isset($_GET['utm_campaign']) && $_GET['utm_campaign'] != '') {
                    $new_url = str_replace("[[utm_campaign]]", $_GET['utm_campaign'], $new_url);
                } else {
                    $new_url = str_replace("[[utm_campaign]]", "p1aiutm_campaign", $new_url);
                }

                //utm_term string replace for cached redirect
                if (isset($_GET['utm_term']) && $_GET['utm_term'] != '') {
                    $new_url = str_replace("[[utm_term]]", $_GET['utm_term'], $new_url);
                } else {
                    $new_url = str_replace("[[utm_term]]", "p1aiutm_term", $new_url);
                }

                //utm_content string replace for cached redirect
                if (isset($_GET['utm_content']) && $_GET['utm_content'] != '') {
                    $new_url = str_replace("[[utm_content]]", $_GET['utm_content'], $new_url);
                } else {
                    $new_url = str_replace("[[utm_content]]", "p1aiutm_content", $new_url);
                }

                //show url or redirect to url
                if (isset($_GET['202rdu']) && $_GET['202rdu'] != '') {
                    echo $new_url;
                } else {
                    header('location: ' . $new_url);
                }

                die();
            }
        }
        die();
    }
}

function setDirtyHour($mysql)
{
    $de = new DataEngine();
    $de->setDirtyHour($mysql['click_id']);
}

function isSSL(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || intval($_SERVER['SERVER_PORT']) == intval(getservbyname('https', 'tcp'));
}

function getScheme(): string
{
    if (isSSL()) {
        $scheme = 'https';
    } else {
        $scheme = 'http';
    }

    return $scheme;
}

function is_prefetch(): bool
{
    $prefetch = false;

    if (isset($_SERVER["HTTP_X_PURPOSE"]) && $_SERVER['HTTP_X_PURPOSE'] == "preview") {
        $prefetch = true;
    } elseif (isset($_SERVER["HTTP_PURPOSE"]) && $_SERVER['HTTP_PURPOSE'] == "prefetch") {
        $prefetch = true;
    } elseif (isset($_SERVER["HTTP_X_MOZ"]) && $_SERVER['HTTP_X_MOZ'] == "prefetch") {
        $prefetch = true;
    }

    return $prefetch;
}

function getUTMParams(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    //utm_source
    $utm_source = $conn->escape($_GET['utm_source']);
    if ($utm_source != '') {
        $utm_source = str_replace('%20', ' ', $utm_source);
        $utm_source_id = get_utm_id($utm_source, 'utm_source');
    } else {
        $utm_source_id = 0;
    }
    $mysql['utm_source_id'] = $conn->escape($utm_source_id);
    $mysql['utm_source'] = $conn->escape($utm_source);

    //utm_medium
    $utm_medium = $conn->escape($_GET['utm_medium']);
    if ($utm_medium != '') {
        $utm_medium = str_replace('%20', ' ', $utm_medium);
        $utm_medium_id = get_utm_id($utm_medium, 'utm_medium');
    } else {
        $utm_medium_id = 0;
    }
    $mysql['utm_medium_id'] = $conn->escape($utm_medium_id);
    $mysql['utm_medium'] = $conn->escape($utm_medium);

    //utm_campaign
    $utm_campaign = $conn->escape($_GET['utm_campaign']);
    if ($utm_campaign != '') {
        $utm_campaign = str_replace('%20', ' ', $utm_campaign);
        $utm_campaign_id = get_utm_id($utm_campaign, 'utm_campaign');
    } else {
        $utm_campaign_id = 0;
    }
    $mysql['utm_campaign_id'] = $conn->escape($utm_campaign_id);
    $mysql['utm_campaign'] = $conn->escape($utm_campaign);

    //utm_term
    $utm_term = $conn->escape($_GET['utm_term']);
    if ($utm_term != '') {
        $utm_term = str_replace('%20', ' ', $utm_term);
        $utm_term_id = get_utm_id($utm_term, 'utm_term');
    } else {
        $utm_term_id = 0;
    }
    $mysql['utm_term_id'] = $conn->escape($utm_term_id);
    $mysql['utm_term'] = $conn->escape($utm_term);

    //utm_content
    $utm_content = $conn->escape($_GET['utm_content']);
    if ($utm_content != '') {
        $utm_content = str_replace('%20', ' ', $utm_content);
        $utm_content_id = get_utm_id($utm_content, 'utm_content');
    } else {
        $utm_content_id = 0;
    }
    $mysql['utm_content_id'] = $conn->escape($utm_content_id);
    $mysql['utm_content'] = $conn->escape($utm_content);
}

function updateImpressionPixel(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    if (null !== (getCookie202('pipx'))) {
        $mysql['pipx'] = $conn->escape(getCookie202('pipx'));
        $db->query("UPDATE clicks_impressions SET click_id = '" . $mysql['click_id'] . "' WHERE impression_id = '" . $mysql['pipx'] . "'");
    }
}

function getCVars(&$mysql)
{

    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    $_lGET = array_change_key_case($_GET, CASE_LOWER); //make lowercase copy of get 

    //Get C1-C4 IDs
    for ($i = 1; $i <= 4; $i++) {
        $custom = "c" . $i; //create dynamic variable
        $custom_val = $conn->escape($_lGET[$custom]); // get the value

        if ($custom_val != '') { //if there's a value get an id
            $custom_val = str_replace(' ', '+', $custom_val);
            $custom_id = get_custom_var_id($custom, $custom_val); //get the id
            $mysql[$custom . '_id'] = $conn->escape($custom_id); //save it
            $mysql[$custom] = $conn->escape($custom_val); //save it
        } else {
            $mysql[$custom . '_id'] = '0';
        }
    }
}

function getKeyword(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    $keyword = '';
    /* ok, if $_GET['OVRAW'] that is a yahoo keyword, if on the REFER, there is a $_GET['q], that is a GOOGLE keyword... */
    //so this is going to check the REFERER URL, for a ?q=, which is the ACUTAL KEYWORD searched.
    $referer_url_parsed = @parse_url((string) $_SERVER['HTTP_REFERER']);
    $referer_url_query = $referer_url_parsed['query'] ?? ''; // Use null coalescing operator

    $referer_query = []; // Initialize $referer_query as an empty array
    @parse_str($referer_url_query, $referer_query);

    switch ($mysql['user_keyword_searched_or_bidded']) {

        case "bidded":
            #try to get the bidded keyword first
            if ($_GET['OVKEY']) { //if this is a Y! keyword
                $keyword = $conn->escape($_GET['OVKEY']);
            } elseif ($_GET['t1aikw']) {
                $keyword = $conn->escape($_GET['t1aikw']);
            } elseif ($_GET['target_passthrough']) { //if this is a mediatraffic! keyword
                $keyword = $conn->escape($_GET['target_passthrough']);
            } else { //if this is a zango, or more keyword
                $keyword = $conn->escape($_GET['keyword']);
            }
            break;
        case "searched":
            #try to get the searched keyword
            if ($referer_query['q']) {
                $keyword = $conn->escape($referer_query['q']);
            } elseif ($_GET['OVRAW']) { //if this is a Y! keyword
                $keyword = $conn->escape($_GET['OVRAW']);
            } elseif ($_GET['target_passthrough']) { //if this is a mediatraffic! keyword
                $keyword = $conn->escape($_GET['target_passthrough']);
            } elseif ($_GET['keyword']) { //if this is a zango, or more keyword
                $keyword = $conn->escape($_GET['keyword']);
            } elseif ($_GET['search_word']) { //if this is a eniro, or more keyword
                $keyword = $conn->escape($_GET['search_word']);
            } elseif ($_GET['query']) { //if this is a naver, or more keyword
                $keyword = $conn->escape($_GET['query']);
            } elseif ($_GET['encquery']) { //if this is a aol, or more keyword
                $keyword = $conn->escape($_GET['encquery']);
            } elseif ($_GET['terms']) { //if this is a about.com, or more keyword
                $keyword = $conn->escape($_GET['terms']);
            } elseif ($_GET['rdata']) { //if this is a viola, or more keyword
                $keyword = $conn->escape($_GET['rdata']);
            } elseif ($_GET['qs']) { //if this is a virgilio, or more keyword
                $keyword = $conn->escape($_GET['qs']);
            } elseif ($_GET['wd']) { //if this is a baidu, or more keyword
                $keyword = $conn->escape($_GET['wd']);
            } elseif ($_GET['text']) { //if this is a yandex, or more keyword
                $keyword = $conn->escape($_GET['text']);
            } elseif ($_GET['szukaj']) { //if this is a wp.pl, or more keyword
                $keyword = $conn->escape($_GET['szukaj']);
            } elseif ($_GET['qt']) { //if this is a O*net, or more keyword
                $keyword = $conn->escape($_GET['qt']);
            } elseif ($_GET['k']) { //if this is a yam, or more keyword
                $keyword = $conn->escape($_GET['k']);
            } elseif ($_GET['words']) { //if this is a Rambler, or more keyword
                $keyword = $conn->escape($_GET['words']);
            } else {
                $keyword = $conn->escape($_GET['t1aikw']);
            }
            break;
    }

    if (str_starts_with((string) $keyword, 't1aivar_')) {
        $t1aivar = substr((string) $keyword, strpos((string) $keyword, "_") + 1);

        if (isset($_GET[$t1aivar])) {
            $keyword = $_GET[$t1aivar];
        }
    }

    $keyword = str_replace('%20', ' ', $keyword);
    $keyword_id = get_keyword_id($keyword);
    $mysql['keyword_id'] = $conn->escape($keyword_id);
    $mysql['keyword'] = $conn->escape($keyword);
}

function getReferer(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    // Parse the referer URL query string
    $referer_url_parsed = @parse_url((string) $_SERVER['HTTP_REFERER']);
    $referer_url_query = $referer_url_parsed['query'] ?? ''; // Use null coalescing operator
    $referer_query = []; // Initialize $referer_query as an empty array
    @parse_str($referer_url_query, $referer_query);

    // if user wants to use t1airef from url variable use that first if it's not set try and get it from the ref url
    if ($mysql['user_pref_referer_data'] == 't1airef') {
        if (isset($_GET['t1airef']) && $_GET['t1airef'] != '') { //check for t1airef value
            $mysql['t1airef'] = $conn->escape($_GET['t1airef']);
            $click_referer_site_url_id = get_site_url_id($_GET['t1airef']);
        } else { //if not found revert to what we usually do
            if (isset($referer_query['url'])) {
                $click_referer_site_url_id = get_site_url_id($referer_query['url']);
            } else {
                $click_referer_site_url_id = get_site_url_id($_SERVER['HTTP_REFERER'] ?? '');
            }
        }
    } else { //user wants the real referer first

        // now lets get variables for clicks site
        // so this is going to check the REFERER URL, for a ?url=, which is the ACUTAL URL, instead of the google content, pagead2.google....
        if (isset($referer_query['url'])) {
            $click_referer_site_url_id = get_site_url_id($referer_query['url']);
        } else {
            $click_referer_site_url_id = get_site_url_id($_SERVER['HTTP_REFERER'] ?? '');
        }
    }

    $mysql['click_referer_site_url_id'] = $conn->escape($click_referer_site_url_id);
}

function getForeignPayout($currency, $payout_currency, $payout)
{
    $fields = [
        'currency' => $currency,
        'payout_currency' => $payout_currency,
        'payout' => $payout * 10000   //multiply by 10000 to get more accurate exchange rate
    ];

    $fields = http_build_query($fields);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://my.tracking1ai.com/api/v2/get-foreign-payout');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    $result = curl_exec($ch);

    curl_close($ch);
    $result = json_decode($result, true);

    $result['exchange_payout'] /= 10000;
    return $result;
}

function updateForeignPayout(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);
    // update currency value
    if (isset($_GET['amount']) && is_numeric($_GET['amount'])) {
        $mysql['fpa']  = $_GET['amount'];
    } else {
        $mysql['fpa']  = $_GET['aff_campaign_foreign_payout'];
    }
    if (isset($mysql['aff_campaign_currency']) && isset($mysql['user_account_currency']) && isset($mysql['aff_campaign_id']) && ($mysql['aff_campaign_currency'] != $mysql['user_account_currency'])) {

        $exchangePayout = getForeignPayout($mysql['user_account_currency'], $mysql['aff_campaign_currency'], $mysql['fpa']);

        $mysql['aff_campaign_payout'] = $conn->escape($exchangePayout['exchange_payout']);

        //if a payout was set in the postback or pixel then use that but don't update the default campaign info
        if (isset($_GET['amount']) && is_numeric($_GET['amount'])) {

            $mysql['payout'] = $mysql['click_payout'] * $mysql['aff_campaign_payout'] / $mysql['fpa']; // calculate the value without doing a second api call for exchange rate
            $mysql['aff_campaign_payout'] = $mysql['payout'];
        } else { //
            $mysql['payout'] = $conn->escape($exchangePayout['exchange_payout']);

            $aff_campaign_sql = "UPDATE `aff_campaigns` SET";
            $aff_campaign_sql .= " `aff_campaign_payout`='" . $mysql['aff_campaign_payout'] . "' ";
            $aff_campaign_sql .= "WHERE `aff_campaign_id`='" . $mysql['aff_campaign_id'] . "'";
            $db->query($aff_campaign_sql);
        }

        $click_sql = "UPDATE `clicks` SET";
        $click_sql .= " `click_payout`='" . $mysql['aff_campaign_payout'] . "' ";
        $click_sql .= "WHERE `click_id`='" . $mysql['click_id'] . "'";
        $db->query($click_sql);
    }
}

function getDynamicEPVPixelId(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    if (isset($mysql['ppc_account_id']) && isset($mysql['bfbpa_dynamic_epv']) && $mysql['ppc_account_id'] != '' && $mysql['bfbpa_dynamic_epv'] != '') {
        $dynamic_epv_sql = "SELECT SUM(`income`)/SUM(`click_out`) as dynamic_epv_value, pixel_code AS pixel_id 
                            FROM `dataengine` 
                            LEFT JOIN `ppc_account_pixels` USING (`ppc_account_id`)
                            WHERE `ppc_account_id`= " . $mysql['ppc_account_id'] . " AND `pixel_type_id`= 6 AND `click_time` >= UNIX_TIMESTAMP(TIMESTAMPADD(DAY,-7,NOW()))
        
        ";

        $dynamic_epv_result = $db->query($dynamic_epv_sql);
        $dynamic_epv_row = $dynamic_epv_result->fetch_assoc();

        if ($dynamic_epv_row !== null && $dynamic_epv_row['dynamic_epv_value']) {
            $mysql['dynamic_epv_value'] = number_format($dynamic_epv_row['dynamic_epv_value'], 2);
        } else {
            $mysql['dynamic_epv_value'] = 0;
        }

        if ($dynamic_epv_row !== null && $dynamic_epv_row['pixel_id']) {
            $mysql['pixel_id'] = $dynamic_epv_row['pixel_id'];
        } else {
            $mysql['pixel_id'] = 0;
        }
    }
}

function getPayout(&$mysql)
{
    global $db;
    $conn = new \OneAIAffiliate\Database\Connection($db);

    $sql = "
    SELECT 
        2c.click_payout
    FROM `clicks` AS 2c    
    WHERE 2c.`click_id` = {$mysql['click_id']}
    LIMIT 1";

    $sql_result = $db->query($sql);
    $sql_row = $sql_result->fetch_assoc();

    $mysql['click_payout'] = $sql_row !== null ? $conn->escape($sql_row['click_payout']) : '0';
}

function getUrlVars202(): array
{
    $urlvarslist = [];
    $temp = explode('&', (string) $_SERVER['QUERY_STRING']);

    foreach ($temp as $key => $value) {
        $subkv = explode('=', $value);
        $key = $subkv[0];
        $value = $subkv[1];
        $urlvarslist[$key] = $value;
    }

    $urlvarslist = filter_var_array($urlvarslist, FILTER_SANITIZE_URL);

    return $urlvarslist;
}

function getCookie202($cookieName)
{
    $cookieValue = null;
    $legacyCookie = $cookieName . '-legacy';
    // check new format
    if (isset($_COOKIE[$cookieName])) {
        $cookieValue = $_COOKIE[$cookieName];
    } // if not found check legacy
    else {
        if (isset($_COOKIE[$legacyCookie])) {
            $cookieValue = $_COOKIE[$legacyCookie];
        }
    }
    return $cookieValue;
}
