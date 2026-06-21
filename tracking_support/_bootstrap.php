<?php
/**
 * Bootstrap: defines ROOT_PATH for all tracking scripts.
 * Include this instead of using substr(__DIR__, ...) hacks.
 */
if (!defined('ROOT_PATH')) {
    define('ROOT_PATH', dirname(__DIR__, 2));
}
