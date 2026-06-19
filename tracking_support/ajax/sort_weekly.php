<?php

declare(strict_types=1);
include_once(substr(__DIR__, 0, -17) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(substr(__DIR__, 0, -17) . '/config/class-dataengine.php');

AUTH::require_user();

//set the timezone for the user, for entering their dates.
AUTH::set_timezone($_SESSION['user_timezone']);

//get user preferences for cpv setting
$mysql['user_id'] = $conn->escape((string)$_SESSION['user_id']);
$user_sql = "SELECT user_cpc_or_cpv FROM users_pref WHERE user_id=" . $mysql['user_id'];
$user_result = $conn->query($user_sql);
$user_row = $user_result->fetch_assoc();

if ($user_row['user_cpc_or_cpv'] == 'cpv') $cpv = true;
else                                        $cpv = false;

//grab user time range preference
$time = grab_timeframe();
$mysql['to'] = $conn->escape((string)$time['to']);
$mysql['from'] = $conn->escape((string)$time['from']);
$de = new DataEngine();
$data = ($de->getReportData('weekly', $mysql['from'], $mysql['to'], $cpv));

$dr = new DisplayData();
$dr->displayReport('weekly', $data);

?>

<script type="text/javascript">
	new Tablesort(document.getElementById('stats-table'), {
		descending: true
	});
</script>