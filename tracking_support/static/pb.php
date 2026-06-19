<?php
declare(strict_types=1);
include_once(substr(__DIR__, 0,-19) . '/config/connect2.php');
include_once(substr(__DIR__, 0,-19) . '/config/class-dataengine-slim.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(substr(__DIR__, 0,-19) . '/config/static-endpoint-helpers.php');
//get the aff_camapaign_id
$mysql['aff_campaign_id_public'] = $conn->escape((string)$_GET['acip']);

$aff_campaign_sql = "SELECT aff_campaign_id FROM aff_campaigns WHERE aff_campaign_id_public='".$mysql['aff_campaign_id_public']."'";
$aff_campaign_row =  memcache_mysql_fetch_assoc($db, $aff_campaign_sql);

if (!$aff_campaign_row) { die(); }

$mysql['aff_campaign_id'] = $conn->escape($aff_campaign_row['aff_campaign_id']);

if (!$_GET['subid']) { die(); }

$mysql['click_id'] = $conn->escape((string)$_GET['subid']);

$cpa_sql = "SELECT cpa_trackers.tracker_id_public, trackers.click_cpa FROM cpa_trackers LEFT JOIN trackers USING (tracker_id_public) WHERE click_id = '".$mysql['click_id']."'";
$cpa_result = $conn->query($cpa_sql);
$cpa_row = ($cpa_result !== false) ? $cpa_result->fetch_assoc() : null;

$mysql['click_cpa'] = $conn->escape($cpa_row['click_cpa'] ?? '');
	
p1aiApplyConversionUpdate(
	$db,
	(string) $mysql['click_id'],
	(string) $mysql['click_cpa'],
	false,
	'',
	(string) $mysql['aff_campaign_id']
);
