<?php

declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '1');
try {
    include_once(str_repeat("../", 1) . 'config/connect.php');
    include_once(str_repeat("../", 1) . 'config/class-dataengine.php');

    set_time_limit(0);

    $snippet = "";
    $start = isset($_GET['s']) ? (int)$_GET['s'] : time() - 3600;
    $userId = isset($_GET['u']) ? (int)$_GET['u'] : 1;

    $de = new DataEngine();
    $de->getSummary($start, $start + 3599, $snippet, $userId, true);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    error_log("DEJ Error: " . $e->getMessage());
}
