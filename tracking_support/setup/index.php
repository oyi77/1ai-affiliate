<?php
declare(strict_types=1);
include_once(substr(__DIR__, 0,-18) . '/config/connect.php'); 

AUTH::require_user();

header('location: '.get_absolute_url().'tracking_support/setup/ppc_accounts.php');