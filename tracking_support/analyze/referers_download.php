<?php

declare(strict_types=1);
header("Content-type: application/octet-stream");

# replace excelfile.xls with whatever you want the filename to default to
header("Content-Disposition: attachment; filename=Treferers_" . time() . ".xls");
header("Pragma: no-cache");
header("Expires: -1");

include_once(substr(__DIR__, 0, -20) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(substr(__DIR__, 0, -20) . '/config/class-dataengine.php');

AUTH::require_user();

$time = grab_timeframe();
$mysql['to'] = $conn->escape((string)$time['to']);
$mysql['from'] = $conn->escape((string)$time['from']);


$mysql['user_id'] = $conn->escape((string)$_SESSION['user_id']);
$user_sql = "SELECT user_pref_breakdown, user_pref_show, user_cpc_or_cpv FROM users_pref WHERE user_id=" . $mysql['user_id'];
$user_result = $conn->query($user_sql);
if (!$user_result) { record_mysql_error($user_sql); }
$user_row = $user_result->fetch_assoc();
$breakdown = $user_row['user_pref_breakdown'];
$cpv = ($user_row['user_cpc_or_cpv'] == 'cpv');

$de = new DataEngine();
$de->setDownload(); //enable downloads query modification. removes the LIMIT filter

$data = ($de->getReportData('referer', $mysql['from'], $mysql['to'], $cpv));

$dr = new DisplayData();
$dr->downloadReport('referer', $data, $de->foundRows());

$de->setDisplay(); //disable downloads query modification
