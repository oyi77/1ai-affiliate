<?php

declare(strict_types=1);

// Include the base connect file
include_once(dirname(__DIR__, 2) . '/config/connect.php');

// Include the controller
require_once __DIR__ . '/AttributionController.php';

// Create and run the controller
try {
    $controller = new \OneAIAffiliate\Setup\AttributionController();
    $controller->handleRequest();
} catch (\Exception $e) {
    // Log the error and show a user-friendly message
    error_log('Attribution Models Error: ' . $e->getMessage());
    
    // Redirect to setup section with error
    header('location: ' . get_absolute_url() . 'tracking_support/setup/?error=attribution_error');
    exit;
}