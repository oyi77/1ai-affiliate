<?php

declare(strict_types=1);
if (!isset($_SESSION['user_timezone'])) {
    date_default_timezone_set('GMT');
} else {
    date_default_timezone_set($_SESSION['user_timezone']);
}

if (!class_exists('DataEngine')) {
    class DataEngine
    {
        private static $db;

        function __construct()
        {
            try {
                $database = DB::getInstance();
                self::$db = $database->getConnection();
                $conn = new \OneAIAffiliate\Database\Connection(self::$db);
            } catch (Exception) {
                self::$db = false;
            }
            // $this->mysql['user_id'] = self::$conn->escape((string)$_SESSION['user_id']);
            //make sure mysql uses the timezone chosen by the user

            $timezone = new DateTimeZone(date_default_timezone_get()); // Get default system timezone to create a new DateTimeZone object
            $offset = $timezone->getOffset(new DateTime()); // Offset in seconds to UTC
            $offsetHours = round(($offset) / 3600);

            $tzSql = "SET time_zone = '" . $offsetHours . ":00'";
            if ($offsetHours != 0 && self::$db !== false) {
                $click_result = self::$conn->query($tzSql);
            }
        }

        // dirty hours by clicks id: This function marks the hour range that the click happened in for updating reports
        function setDirtyHour($click_id)
        {
            global $ip_address, $db, $dbGlobalLink, $inet6_ntoa, $inet6_aton;

            // Initialize IPv6 function variables if not set
            if (!isset($inet6_ntoa)) {
                $inet6_ntoa = '';
                $inet6_aton = 'INET6_ATON';
            }

            if (!isset($click_id) || $click_id == '') {  //if not find the list clicks id of the ip within a 30 day range
                $mysql['user_id'] = 1;
                //if there is no native ipv6 support use php version
                if ($inet6_ntoa == '' && isset($ip_address) && $ip_address->type == 'ipv6') {
                    //encode ip address
                    $mysql['ip_address'] = inet6_aton($conn->escape($ip_address->address)); //use encoded var to compare
                } else {
                    //do nothing. The built in mysql function will be used
                    $mysql['ip_address'] = $conn->escape($ip_address->address);
                }

                $daysago = time() - 86400; // 24 hours

                // Optimized query: start from IP table for better index usage
                // Try IPv4 first (most common case)
                $click_sql1 = 'SELECT c.click_id
                           FROM            ips i
                           INNER JOIN      clicks_advance ca ON (ca.ip_id = i.ip_id)
                           INNER JOIN      clicks c ON (c.click_id = ca.click_id)
                           WHERE           i.ip_address = "' . $mysql['ip_address'] . '"
                           AND             c.user_id = "' . $mysql['user_id'] . '"
                           AND             c.click_time >= "' . $daysago . '"
                           ORDER BY        c.click_id DESC
                           LIMIT           1';

                $click_result1 = $conn->query($click_sql1) or record_mysql_error($db);
                $click_row1 = $click_result1->fetch_assoc();
                //empy  $mysql array

                unset($mysql);

                // Check if click_row1 exists and click_id is not null before processing
                if ($click_row1 && isset($click_row1['click_id'])) {
                    $mysql['click_id'] = $conn->escape((string)$click_row1['click_id']);
                    $click_id = $mysql['click_id'];
                } else {
                    $click_id = '';
                }
                // $mysql['ppc_account_id'] = $conn->escape($click_row1['ppc_account_id']);
            }

            if (!isset($click_id) || $click_id == '') {
                return false;
            }

            $dsql = " insert into dataengine(user_id,
click_id,
click_time,
ppc_network_id,
ppc_account_id,
aff_network_id,
aff_campaign_id,
landing_page_id,
keyword_id,
utm_source_id,
utm_medium_id,
utm_campaign_id,
utm_term_id,
utm_content_id,
text_ad_id,
click_referer_site_url_id,
country_id,
region_id,
city_id,
isp_id,
browser_id,
device_id,
platform_id,
ip_id,
c1_id,
c2_id,
c3_id,
c4_id,
variable_set_id,
rotator_id,
rule_id,
rule_redirect_id,
click_lead,
click_filtered,
click_bot,
click_alp,
clicks,
click_out,
leads,
payout,
income,
cost)  
    SELECT 
2c.user_id,
2c.click_id,
2c.click_time,
2pn.ppc_network_id, 
2c.ppc_account_id,
2an.aff_network_id,
2ac.aff_campaign_id,
2c.landing_page_id,
2k.keyword_id,
2gg.utm_source_id,
2gg.utm_medium_id,
2gg.utm_campaign_id,
2gg.utm_term_id,
2gg.utm_content_id,
2ta.text_ad_id,
2cs.click_referer_site_url_id,
2cy.country_id,
2rg.region_id,
2ci.city_id,
2is.isp_id,
2b.browser_id,
2dm.device_id,
2p.platform_id,
2ca.ip_id,
2tc1.c1_id,
2tc2.c2_id,
2tc3.c3_id,
2tc4.c4_id,
2cv.variable_set_id,
2rc.rotator_id,
2rc.rule_id,
2rc.rule_redirect_id,
2c.`click_lead`,
2c.`click_filtered`,
2c.`click_bot`,
2c.`click_alp`, 
1 AS clicks, 
2cr.click_out AS click_out, 
2c.click_lead AS leads, 
2c.click_payout AS payout, 
IF (2c.click_lead>0,2c.click_payout,0) AS income, 
2c.click_cpc AS cost 
FROM clicks AS 2c 
LEFT OUTER JOIN clicks_record AS 2cr ON (2c.click_id = 2cr.click_id) 
LEFT OUTER JOIN aff_campaigns AS 2ac ON (2c.aff_campaign_id = 2ac.aff_campaign_id) 
LEFT OUTER JOIN clicks_advance AS 2ca ON (2c.click_id = 2ca.click_id) 
LEFT OUTER JOIN browsers AS 2b ON (2ca.browser_id = 2b.browser_id) 
LEFT OUTER JOIN platforms AS 2p ON (2ca.platform_id = 2p.platform_id) 
LEFT OUTER JOIN aff_networks AS 2an ON (2ac.aff_network_id = 2an.aff_network_id) 
LEFT OUTER JOIN ppc_accounts AS 2pa ON (2c.ppc_account_id = 2pa.ppc_account_id) 
LEFT OUTER JOIN ppc_networks AS 2pn ON (2pa.ppc_network_id = 2pn.ppc_network_id)
LEFT OUTER JOIN keywords AS 2k ON (2ca.keyword_id = 2k.keyword_id)
LEFT OUTER JOIN google AS 2gg ON (2c.click_id = 2gg.click_id)
LEFT OUTER JOIN landing_pages AS 2lp ON (2c.landing_page_id = 2lp.landing_page_id)
LEFT OUTER JOIN text_ads AS 2ta ON (2ca.text_ad_id = 2ta.text_ad_id)
LEFT OUTER JOIN clicks_site AS 2cs ON (2c.click_id = 2cs.click_id)
LEFT OUTER JOIN clicks_tracking AS 2ct ON (2c.click_id = 2ct.click_id)
LEFT OUTER JOIN site_urls AS 2suf ON (2cs.click_referer_site_url_id = 2suf.site_url_id) 
LEFT OUTER JOIN locations_country AS 2cy ON (2ca.country_id = 2cy.country_id) 
LEFT OUTER JOIN locations_region AS 2rg ON (2ca.region_id = 2rg.region_id) 
LEFT OUTER JOIN locations_city AS 2ci ON (2ca.city_id = 2ci.city_id)
LEFT OUTER JOIN locations_isp AS 2is ON (2ca.isp_id = 2is.isp_id) 
LEFT OUTER JOIN device_models AS 2dm ON (2ca.device_id = 2dm.device_id)
LEFT OUTER JOIN ips AS 2i ON (2ca.ip_id = 2i.ip_id)
LEFT OUTER JOIN tracking_c1 AS 2tc1 ON (2ct.c1_id = 2tc1.c1_id) 
LEFT OUTER JOIN tracking_c2 AS 2tc2 ON (2ct.c2_id = 2tc2.c2_id) 
LEFT OUTER JOIN tracking_c3 AS 2tc3 ON (2ct.c3_id = 2tc3.c3_id) 
LEFT OUTER JOIN tracking_c4 AS 2tc4 ON (2ct.c4_id = 2tc4.c4_id)
LEFT OUTER JOIN clicks_variable AS 2cv ON (2c.click_id = 2cv.click_id)
LEFT OUTER JOIN clicks_rotator AS 2rc ON (2c.click_id = 2rc.click_id)
WHERE 2c.click_id=" . $click_id . "
on duplicate key update 
click_lead=values(click_lead),
click_bot=values(click_bot),
click_out=values(click_out),
click_filtered=values(click_filtered), 
landing_page_id=values(landing_page_id),    
leads=values(leads),
payout=values(payout),
income=values(income),
cost=values(cost),
rotator_id=values(rotator_id),
rule_id=values(rule_id),
rule_redirect_id=values(rule_redirect_id),
            aff_campaign_id=values(aff_campaign_id),
aff_network_id=values(aff_network_id)";
            $result = $conn->query($dsql);
        }

        /**
         * Compatibility shim for endpoints that call the full DataEngine API.
         */
        public function getSummary($start, $end, $params, $user_id = 1, $upgrade = false, $new = false)
        {
            return '';
        }
    }
} // End class_exists check
