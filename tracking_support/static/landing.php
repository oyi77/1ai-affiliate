<?php
declare(strict_types=1);
use UAParser\Parser;
header('Content-type: application/javascript');
header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
header('Expires: Sun, 03 Feb 2008 05:00:00 GMT'); // Date in the past
header("Pragma: no-cache");
include_once(substr(__DIR__, 0,-19) . '/config/connect2.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
if ( isset( $_SERVER["HTTPS"] ) && strtolower( (string) $_SERVER["HTTPS"] ) == "on" ) {
$strProtocol = 'https';
} else {
$strProtocol = 'http';
}

// Process geo/UA data once (previously duplicated in both _.t1aiData and t1aiData)
$data = getGeoData($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
if($data['country']==='Unknown country')
    $data['country']='';
if($data['country_code']==='non')
   $data['country_code']='';
if($data['region']==='Unknown region')
    $data['region']='';
if($data['city']==='Unknown city')
    $data['city']='';
if($data['postal_code']==='Unknown postal code')
    $data['postal_code']='';

$parser = Parser::create();
$detect = new DeviceDetect();
$ua = $detect->getUserAgent();
$result = $parser->parse($ua);

$IspData = getIspData($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
if($IspData==="Unknown ISP/Carrier")
    $data['isp']='';
else
    $data['isp']=$IspData;

// Build the geo data object safely using json_encode to prevent XSS
$t1aiServerData = [
    't1aiCountry' => $data['country'],
    't1aiCountryCode' => $data['country_code'],
    't1aiRegion' => $data['region'],
    't1aiCity' => $data['city'],
    't1aiPostal' => $data['postal_code'],
    't1aiBrowser' => $result->ua->family,
    't1aiOS' => $result->os->family,
    't1aiDevice' => $result->device->family,
    't1aiISP' => $data['isp'],
];

// Mapping of URL parameter names to their t1aiDataObj keys for client-side values.
// Server-side keys (geo/UA) are already in $t1aiServerData above.
$t1aiClientParamMap = [
    't1aikw' => 't1aikw',
    'c1' => 't1aic1',
    'c2' => 't1aic2',
    'c3' => 't1aic3',
    'c4' => 't1aic4',
    'utm_source' => 't1aiutm_source',
    'utm_medium' => 't1aiutm_medium',
    'utm_term' => 't1aiutm_term',
    'utm_content' => 't1aiutm_content',
    'utm_campaign' => 't1aiutm_campaign',
];

// Resolve custom variables server-side to eliminate an extra HTTP round-trip.
// Try t1aiid first; fall back to lpip → tracker lookup for pages without t1aiid.
$t1aiCustomVars = [];
$t1aiid = $_GET['t1aiid'] ?? '';
$lpip = $_GET['lpip'] ?? '';
$cv_sql = '';
if ($t1aiid !== '') {
    $mysql_t1aiid = $conn->escape((string)$t1aiid);
    $cv_sql = "SELECT 2cv.parameters
        FROM trackers
        LEFT JOIN ppc_accounts USING (ppc_account_id)
        LEFT JOIN (SELECT ppc_network_id, GROUP_CONCAT(parameter) AS parameters FROM ppc_network_variables GROUP BY ppc_network_id) AS 2cv USING (ppc_network_id)
        WHERE tracker_id_public = '".$mysql_t1aiid."'";
} elseif ($lpip !== '') {
    $mysql_lpip = $conn->escape((string)$lpip);
    $cv_sql = "SELECT 2cv.parameters
        FROM landing_pages AS lp
        JOIN trackers AS tr ON tr.aff_campaign_id = lp.aff_campaign_id
        LEFT JOIN ppc_accounts USING (ppc_account_id)
        LEFT JOIN (SELECT ppc_network_id, GROUP_CONCAT(parameter) AS parameters FROM ppc_network_variables GROUP BY ppc_network_id) AS 2cv USING (ppc_network_id)
        WHERE lp.landing_page_id_public = '".$mysql_lpip."'
        LIMIT 1";
}
if ($cv_sql !== '') {
    $cv_result = $conn->query($cv_sql);
    if ($cv_result && $cv_result->num_rows > 0) {
        $cv_row = $cv_result->fetch_assoc();
        if (!empty($cv_row['parameters'])) {
            $t1aiCustomVars = explode(',', $cv_row['parameters']);
        }
    }
}

$baseUrl = $strProtocol . '://' . getTrackingDomain() . get_absolute_url();
$lpip_js = json_encode((string) ($_GET['lpip'] ?? ''));
?>

(function() {
var _params = new URLSearchParams(window.location.search);

function t1aiGetVar(name) {
	var values = _params.getAll(name);
	return values.join(', ');
}

function t1aiEnc(e) {
	return encodeURIComponent(e);
}

function createCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}

// Expose cookie/param functions globally for record_simple.php, record_adv.php,
// and outbound JS redirect snippets that depend on them
window.t1aiGetVar = t1aiGetVar;
window.t1aiEnc = t1aiEnc;
window.createCookie = createCookie;
window.readCookie = readCookie;
window.eraseCookie = eraseCookie;

// Read URL params once — shared between tracking init and dynamic content
var t1aikw = readCookie('t1aiforcedkw') || t1aiGetVar('t1aikw');
var c1 = t1aiGetVar('c1');
var c2 = t1aiGetVar('c2');
var c3 = t1aiGetVar('c3');
var c4 = t1aiGetVar('c4');
var utm_source = t1aiGetVar('utm_source');
var utm_medium = t1aiGetVar('utm_medium');
var utm_term = t1aiGetVar('utm_term');
var utm_content = t1aiGetVar('utm_content');
var utm_campaign = t1aiGetVar('utm_campaign');

// --- Tracking beacon ---
(function() {
	var lpip = <?php echo $lpip_js; ?>;
	var t1aiid = t1aiGetVar('t1aiid');
	var t1airef = t1aiGetVar('t1airef');
	var t1aib = t1aiGetVar('t1aib');
	var referer = document.referrer;
	var resolution = screen.width + 'x' + screen.height;
	var language = (navigator.language || '').substring(0, 2);

	// Custom variables resolved server-side — no extra HTTP request needed
	var customVarNames = <?php echo json_encode($t1aiCustomVars); ?>;
	var customVarValues = [];
	for (var i = 0; i < customVarNames.length; i++) {
		customVarValues.push(t1aiGetVar(customVarNames[i]));
	}

	// Build tracking URL using array join (faster than 20+ string concatenations)
	var parts = [
		"<?php echo $baseUrl; ?>tracking_support/static/record.php?lpip=" + t1aiEnc(lpip),
		"t1aiid=" + t1aiEnc(t1aiid),
		"t1aikw=" + t1aiEnc(t1aikw),
		"t1airef=" + t1aiEnc(t1airef),
		"OVRAW=" + t1aiEnc(t1aiGetVar('OVRAW')),
		"OVKEY=" + t1aiEnc(t1aiGetVar('OVKEY')),
		"OVMTC=" + t1aiEnc(t1aiGetVar('OVMTC')),
		"c1=" + t1aiEnc(c1),
		"c2=" + t1aiEnc(c2),
		"c3=" + t1aiEnc(c3),
		"c4=" + t1aiEnc(c4),
		"t1aib=" + t1aiEnc(t1aib),
		"gclid=" + t1aiEnc(t1aiGetVar('gclid')),
		"target_passthrough=" + t1aiEnc(t1aiGetVar('target_passthrough')),
		"keyword=" + t1aiEnc(t1aiGetVar('keyword')),
		"utm_source=" + t1aiEnc(utm_source),
		"utm_medium=" + t1aiEnc(utm_medium),
		"utm_term=" + t1aiEnc(utm_term),
		"utm_content=" + t1aiEnc(utm_content),
		"utm_campaign=" + t1aiEnc(utm_campaign),
		"referer=" + t1aiEnc(referer),
		"resolution=" + t1aiEnc(resolution),
		"language=" + t1aiEnc(language)
	];
	for (var i = 0; i < customVarNames.length; i++) {
		parts.push(customVarNames[i] + "=" + t1aiEnc(customVarValues[i]));
	}

	// Inject record.php as script — its response calls createCookie() to set tracking cookies
	// Guard prevents double-firing when landing.php is embedded more than once (SPA, duplicate snippet)
	if (!document.getElementById('recjs')) {
		var js202a = document.createElement("script");
		js202a.src = parts.join("&");
		js202a.async = true;
		js202a.id = "recjs";
		(document.head || document.getElementsByTagName("script")[0].parentNode).appendChild(js202a);
	}
})();

// --- Dynamic content replacement ---
(function() {
	// Build data object: server-side geo/UA + client-side URL params (read once above)
	var t1aiDataObj = <?php echo json_encode($t1aiServerData, JSON_UNESCAPED_UNICODE); ?>;
	var clientParamMap = <?php echo json_encode($t1aiClientParamMap); ?>;
	var clientValues = {t1aikw: t1aikw, c1: c1, c2: c2, c3: c3, c4: c4, utm_source: utm_source, utm_medium: utm_medium, utm_term: utm_term, utm_content: utm_content, utm_campaign: utm_campaign};
	for (var urlParam in clientParamMap) {
		if (clientParamMap.hasOwnProperty(urlParam)) {
			t1aiDataObj[clientParamMap[urlParam]] = clientValues[urlParam];
		}
	}

	// Single DOM query instead of 19 separate getElementsByName calls
	var selector = Object.keys(t1aiDataObj).map(function(k) { return '[name="' + k + '"]'; }).join(',');
	var matchedElements = document.querySelectorAll(selector);
	for (var i = 0; i < matchedElements.length; i++) {
		var el = matchedElements[i];
		var name = el.getAttribute('name');
		var val = t1aiDataObj[name];
		el.textContent = (val !== undefined && val !== null && val !== '') ? val : (el.getAttribute('t1aiDefault') || '');
	}
})();

})();
