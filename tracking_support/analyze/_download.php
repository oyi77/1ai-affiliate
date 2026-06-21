<?php
declare(strict_types=1);
header("Content-type: application/octet-stream");

// Map filename prefix → DataEngine report type
$reportTypeMap = [
    'browser' => 'browser',
    'cities' => 'city',
    'countries' => 'country',
    'device' => 'device',
    'ips' => 'ip',
    'isps' => 'isp',
    'keywords' => 'keyword',
    'landing_pages' => 'landingpage',
    'platform' => 'platform',
    'referers' => 'referer',
    'regions' => 'region',
    'text_ads' => 'textad',
    'variables' => 'variable',
];

$prefix = basename(__FILE__, '_download.php');
$reportType = $reportTypeMap[$prefix] ?? $prefix;
$filename = 'T' . $prefix . '_' . time() . '.xls';

header("Content-Disposition: attachment; filename=" . $filename);
header("Pragma: no-cache");
header("Expires: -1");

include_once(dirname(__DIR__, 2) . '/config/connect.php');
include_once(dirname(__DIR__, 2) . '/config/class-dataengine.php');

AUTH::require_user();

$time = grab_timeframe();
$mysql['to'] = $db->real_escape_string((string)$time['to']);
$mysql['from'] = $db->real_escape_string((string)$time['from']);

$mysql['user_id'] = $db->real_escape_string((string)$_SESSION['user_id']);
$user_sql = "SELECT user_pref_breakdown, user_pref_show, user_cpc_or_cpv FROM users_pref WHERE user_id=" . $mysql['user_id'];
$user_result = _mysqli_query($user_sql);
$user_row = $user_result->fetch_assoc();
$cpv = ($user_row['user_cpc_or_cpv'] == 'cpv');

$de = new DataEngine();
$de->setDownload();

$data = $de->getReportData($reportType, $mysql['from'], $mysql['to'], $cpv);

$dr = new DisplayData();
$dr->downloadReport($reportType, $data, $de->foundRows());

$de->setDisplay();
