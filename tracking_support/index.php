<?php
declare(strict_types=1);
include_once(dirname(__DIR__) . '/config/connect.php');

AUTH::require_user();

header('location: '.get_absolute_url().'tracking_support/overview/');