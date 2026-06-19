<?php

declare(strict_types=1);
include_once(substr(__DIR__, 0, -17) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(substr(__DIR__, 0, -17) . '/config/class-dataengine.php');

AUTH::require_user();

//set the timezone for the user, for entering their dates.
AUTH::set_timezone($_SESSION['user_timezone']);

//show real or filtered clicks
$mysql['user_id'] = $conn->escape((string)$_SESSION['user_id']);
$user_sql = "SELECT user_pref_breakdown, user_pref_show, user_cpc_or_cpv FROM users_pref WHERE user_id=" . $mysql['user_id'];
$user_result = $conn->query($user_sql); //($user_sql);
$user_row = $user_result->fetch_assoc();
$breakdown = $user_row['user_pref_breakdown'];

if ($user_row['user_pref_show'] == 'all') {
	$click_filtered = '';
}
if ($user_row['user_pref_show'] == 'real') {
	$click_filtered = " AND click_filtered='0' ";
}
if ($user_row['user_pref_show'] == 'filtered') {
	$click_filtered = " AND click_filtered='1' ";
}
if ($user_row['user_pref_show'] == 'filtered_bot') {
	$click_filtered = " AND click_bot='1' ";
}
if ($user_row['user_pref_show'] == 'leads') {
	$click_filtered = " AND click_lead='1' ";
}

if ($user_row['user_cpc_or_cpv'] == 'cpv')  $cpv = true;
else 										$cpv = false;

//grab the users date range preferences
$time = grab_timeframe();
$mysql['to'] = $conn->escape((string)$time['to']);
$mysql['from'] = $conn->escape((string)$time['from']);

$de = new DataEngine();
$data = ($de->getReportData('hourly', $mysql['from'], $mysql['to'], $cpv));

$dr = new DisplayData();
$dr->displayReport('hourly', $data, $de->foundRows());

?>

<script type="text/javascript">
	new Tablesort(document.getElementById('stats-table'), {
		descending: true
	});
</script>