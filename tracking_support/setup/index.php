<?php
declare(strict_types=1);
include_once(dirname(__DIR__, 2) . '/config/connect.php'); 

AUTH::require_user();

header('location: '.get_absolute_url().'tracking_support/setup/ppc_accounts.php');