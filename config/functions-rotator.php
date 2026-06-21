<?php
declare(strict_types=1);

/**
 * Shared rotator rule-matching engine.
 * Used by rtr.php, offrtr.php, and off.php.
 */

/**
 * Evaluate rotator rules against visitor context.
 *
 * @param mysqli  $db         Database connection
 * @param array   $rule_row   Rows from rotator_rules query (each has 'rule_id')
 * @param array   $GeoData    GeoIP data (country, country_code, region, city)
 * @param string  $ip_address Visitor IP
 * @param mixed   $IspData    ISP data or null
 * @param object  $result     Parsed UA result (->os->family, ->device->family, ->ua->family)
 * @return array  ['matched' => bool, 'rule_id' => string|null]
 */
function evaluateRotatorRules($db, array $rule_row, array $GeoData, string $ip_address, $IspData, object $result): array
{
    // Map criteria type → actual value from visitor context
    $typeValueMap = [
        'country'  => $GeoData['country'] . '(' . $GeoData['country_code'] . ')',
        'region'   => $GeoData['region'] . '(' . $GeoData['country_code'] . ')',
        'city'     => $GeoData['city'] . '(' . $GeoData['country_code'] . ')',
        'isp'      => $IspData,
        'ip'       => $ip_address,
        'platform' => $result->os->family,
        'device'   => strtolower($result->device->family),
        'browser'  => $result->ua->family,
    ];

    foreach ($rule_row as $rule) {
        $rotate = [];
        $count = 0;

        $ruleId = $db->real_escape_string((string)$rule['rule_id']);
        $criteria_sql = "SELECT type, statement, value
                         FROM rotator_rules_criteria
                         WHERE rule_id='" . $ruleId . "'";
        $criteria_row = foreach_memcache_mysql_fetch_assoc($db, $criteria_sql);

        foreach ($criteria_row as $criteria) {
            $isPositive = ($criteria['statement'] === 'is');
            $values = explode(',', (string) $criteria['value']);

            if (in_array('ALL', $values, true) || in_array('all', $values, true)) {
                $rotate[] = true;
            } else {
                $actualValue = $typeValueMap[$criteria['type']] ?? null;
                if ($actualValue !== null) {
                    $matched = in_array($actualValue, $values);
                    $rotate[] = $isPositive ? $matched : !$matched;
                }
            }
            $count++;
        }

        if ($count === count($rotate) && $count > 0) {
            return ['matched' => true, 'rule_id' => $ruleId];
        }
    }

    return ['matched' => false, 'rule_id' => null];
}
