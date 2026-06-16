<?php
declare(strict_types=1);

use OneAIAffiliate\Redirect\RedirectHelper;

$vars = explode(' ', base64_decode((string) RedirectHelper::getStringParam('202v')));

if(isset($vars[1])){
$_GET['pci']=$vars[1];
$expire = time() + 2592000;
@setcookie('tracking1aisubid',$vars[0], ['expires' => $expire, 'path' => '/', 'domain' => (string) $_SERVER['SERVER_NAME']]);
@setcookie('tracking1aisubid_a_' . $vars[2],$vars[0], ['expires' => $expire, 'path' => '', 'domain' => (string) $_SERVER['SERVER_NAME']]);
@setcookie('tracking1aipci',$vars[1], ['expires' => $expire, 'path' => '/', 'domain' => (string) $_SERVER['SERVER_NAME']]);
}
$redirect_site_url='';


// Simple LP redirect
if (isset($_GET['lpip']) && is_numeric($_GET['lpip'])) {
    if (isset($_COOKIE['tracking1aioutbound'])) {
        $tracking1aioutbound = $_COOKIE['tracking1aioutbound'];
    } else {
        require_once substr(__DIR__, 0, -21) . '/tracking_support/redirect/lp.php';
    }

    RedirectHelper::redirect($tracking1aioutbound);
}

// Advanced LP redirect
if (isset($_GET['acip']) && is_numeric($_GET['acip'])) {
    include_once substr(__DIR__, 0, -21) . '/tracking_support/redirect/off.php';
}

// Rotator redirect on ALP
if (isset($_GET['rpi']) && is_numeric($_GET['rpi'])) {
    include_once substr(__DIR__, 0, -21) . '/tracking_support/redirect/offrtr.php';
}

  die("Missing LPIP, ACIP or RPI variable!");
  



