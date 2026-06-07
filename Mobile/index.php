<?php
declare(strict_types=1);
//if the config.php doesn't exist, we need to build one
if ( !file_exists(substr(__DIR__, 0,-11) . '/config.php') ) {
	
	require_once(substr(__DIR__, 0,-11) . '/config/functions.php');
	
        //check to make sure this user has the required PHP version
        if (!php_version_supported()) {
                _die("1ai-Affiliate requires PHP " . ONEAI_AFFILIATE_MIN_PHP_VERSION . " or greater to run.  Your server does not meet the <a href='http://prosper.tracking1ai.com/apps/about/requirements/'>minimum requirements to run 1ai-Affiliate</a>.  Please either have your hosting provider upgrade to PHP " . ONEAI_AFFILIATE_MIN_PHP_VERSION . " or simply sign up with one of our <a href='http://prosper.tracking1ai.com/apps/hosting/'>recommended hosting providers</a>.");
        }
	
	//require the config.php file
	_die("There doesn't seem to be a <code>config.php</code> file. I need this before we can get started. Need more help? <a href=\"http://oneai_affiliate.com/apps/about/contact/\">Contact Us</a>. You can <a href='" . get_absolute_url() . "config/setup-config.php'>create a <code>config.php</code> file through a web interface</a>, but this doesn't work for all server setups. The safest way is to manually create the file.");


} else {

	require_once(substr(__DIR__, 0,-11) . '/config/connect.php');

	if (  is_installed() == false) {
		
		header('location: '.get_absolute_url().'config/install.php');
	 
	} else {
		
		if ( upgrade_needed() == true) {
			
			header('location: '.get_absolute_url().'config/upgrade.php');
			
		} else {
	
			header('location: '.get_absolute_url().'login.php');
		
		}
	}
	
}