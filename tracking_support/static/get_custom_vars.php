<?php
declare(strict_types=1);
header('Content-Type: application/json');
include_once(substr(__DIR__, 0,-19) . '/config/connect2.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
$data = [];
$tracker_id_public = $conn->escape((string)($_GET['t1aiid'] ?? ''));
$sql = "SELECT
		2cv.parameters
		FROM trackers
		LEFT JOIN ppc_accounts USING (ppc_account_id)
		LEFT JOIN (SELECT ppc_network_id, GROUP_CONCAT(parameter) AS parameters FROM ppc_network_variables GROUP BY ppc_network_id) AS 2cv USING (ppc_network_id)
		WHERE tracker_id_public = '".$tracker_id_public."'";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
	$row = $result->fetch_assoc();
	$parameters = explode(',', (string) $row['parameters']);

	foreach ($parameters as $parameter) {
		$data[] = $parameter;
	}
}

echo json_encode($data, JSON_UNESCAPED_UNICODE);