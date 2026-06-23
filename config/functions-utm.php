<?php
declare(strict_types=1);

/**
 * Shared UTM parameter processing.
 * Used by record_simple.php and record_adv.php.
 */

/**
 * Process UTM parameters from GET and store in tracking DB.
 *
 * @param object $trackingRepo  Tracking repository (findOrCreateUtm)
 * @param mysqli $db            Database connection
 * @return array MySQL-bound UTM ID fields
 */
function processUtmParameters(object $trackingRepo, mysqli $db): array
{
    $result = [];
    foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $param) {
        $value = $db->real_escape_string((string) ($_GET[$param] ?? ''));
        if ($value !== '') {
            $value = str_replace('%20', ' ', $value);
            $id = $trackingRepo->findOrCreateUtm($value, $param);
        } else {
            $id = 0;
        }
        $result[$param . '_id'] = $db->real_escape_string((string) $id);
    }
    return $result;
}

/**
 * Process c1-c4 custom tracking variables.
 *
 * @param object $trackingRepo  Tracking repository
 * @param mysqli $db            Database connection
 * @return array MySQL-bound c1_id..c4_id fields
 */
function processCustomVariables(object $trackingRepo, mysqli $db): array
{
    $result = [];
    foreach (['c1', 'c2', 'c3', 'c4'] as $var) {
        $value = $db->real_escape_string((string) ($_GET[$var] ?? ''));
        $value = str_replace('%20', ' ', $value);
        $id = $trackingRepo->{'findOrCreate' . strtoupper($var)}($value);
        $result[$var . '_id'] = $db->real_escape_string((string) $id);
    }
    return $result;
}
