<?php
declare(strict_types=1);
include_once(dirname(__DIR__, 2) . '/config/connect2.php');
include_once(dirname(__DIR__, 2) . '/config/class-dataengine-slim.php');
include_once(dirname(__DIR__, 2) . '/config/static-endpoint-helpers.php');
	
//get the aff_camapaign_id
$mysql['aff_campaign_id_public'] = $db->real_escape_string((string)$_GET['acip']);
$aff_campaign_sql = "SELECT user_id FROM aff_campaigns WHERE aff_campaign_id_public='".$mysql['aff_campaign_id_public']."'";
$aff_campaign_row =  memcache_mysql_fetch_assoc($aff_campaign_sql);

if (!$aff_campaign_row) { die(); }

$mysql['user_id'] = $db->real_escape_string($aff_campaign_row['user_id']);



//see if it has the cookie, do whatever we can to grab to grab SOMETHING to tie this lead to
if ($_COOKIE['tracking1aisubid']) {  

	$mysql['click_id'] = $db->real_escape_string($_COOKIE['tracking1aisubid']);
	
} else  {

	//ok grab the last click from this ip_id
	$mysql['ip_address'] = $db->real_escape_string($_SERVER['REMOTE_ADDR']);
	$daysago = time() - 2592000; // 30 days ago
	$click_sql1 = "	SELECT 	clicks.click_id 
					FROM 		clicks
					LEFT JOIN	clicks_advance USING (click_id)
					LEFT JOIN 	ips USING (ip_id) 
					WHERE 	ips.ip_address='".$mysql['ip_address']."'
					AND		clicks.user_id='".$mysql['user_id']."'  
					AND		clicks.click_time >= '".$daysago."'
					ORDER BY 	clicks.click_id DESC 
					LIMIT 		1";
	$click_result1 = $db->query($click_sql1) or record_mysql_error($click_sql1);
	$click_row1 = $click_result1->fetch_assoc();
	$mysql['click_id'] = $db->real_escape_string($click_row1['click_id']);

}



if ($mysql['click_id']) { 

	$cpa_sql = "SELECT cpa_trackers.tracker_id_public, trackers.click_cpa FROM cpa_trackers LEFT JOIN trackers USING (tracker_id_public) WHERE click_id = '".$mysql['click_id']."'";
	$cpa_result = $db->query($cpa_sql);
	$cpa_row = ($cpa_result !== false) ? $cpa_result->fetch_assoc() : null;

	$mysql['click_cpa'] = $db->real_escape_string($cpa_row['click_cpa'] ?? '');
	
		p1aiApplyConversionUpdate(
			$db,
			(string) $mysql['click_id'],
			(string) $mysql['click_cpa']
		);
	}
