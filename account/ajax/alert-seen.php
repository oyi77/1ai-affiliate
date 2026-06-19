<?php
declare(strict_types=1);
include_once(str_repeat("../", 2).'config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);

AUTH::require_user();

// Require a valid session token for this state-changing request.
if (!hash_equals((string) ($_SESSION['token'] ?? ''), (string) ($_POST['token'] ?? ''))) {
    die();
}

$mysql['alert_id'] = $conn->escape((string)$_POST['alert_id']);
$alert_sql = "INSERT INTO alerts SET alert_seen='1', alert_id='{$mysql['alert_id']}'";
$alert_result = $conn->query($alert_sql, $db);