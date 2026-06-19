<?php

declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '1');

include_once(str_repeat("../", 1) . 'config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(str_repeat("../", 1) . 'config/class-dataengine.php');

set_time_limit(0);

// Accept --user-id CLI argument; default to all active users.
$cliOptions = getopt('', ['user-id::']);
$userIdArg = isset($cliOptions['user-id']) ? (int)$cliOptions['user-id'] : null;

if ($userIdArg !== null) {
    $userIds = [$userIdArg];
} else {
    $userResult = $conn->queryResult("SELECT user_id FROM users ORDER BY user_id ASC");
    $userIds = [];
    while ($uRow = $userResult->fetch_assoc()) {
        $userIds[] = (int)$uRow['user_id'];
    }
    $userResult->free();
}

try {

    /*
 RollingCurl code Authored by Josh Fraser (www.joshfraser.com)
*/

    $query = "SELECT * FROM dataengine_job WHERE processed = '0' and processing != '1'";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();

    if ($result->num_rows) {
        if (! $row['processing']) {
            $mysql['click_time_from'] = $conn->escape((string)$row['time_from']);
            $mysql['click_time_to'] = $conn->escape((string)$row['time_to']);
            $sql = "UPDATE dataengine_job SET processing = '1' WHERE time_from ='" . $mysql['click_time_from'] . "' AND time_to = '" . $mysql['click_time_to'] . "'";
            $conn->query($sql);

            $urls = [];
            foreach ($userIds as $userId) {
                for ($i = $mysql['click_time_from']; $i < $mysql['click_time_to']; $i += 3599) {
                    $nextval = $i + 3599;
                    $urls[] = 'http://' . getTrackingDomain() . get_absolute_url() . 'cronjobs/dej.php?s=' . $i . '&e=' . $nextval . '&u=' . $userId;
                }
            }



            $callback = null;
            $custom_options = null;

            // make sure the rolling window isn't greater than the # of urls
            $rolling_window = 7;
            $rolling_window = (count($urls) < $rolling_window) ? count($urls) : $rolling_window;

            $master = curl_multi_init();
            $curl_arr = [];

            // add additional curl options here
            $std_options = [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5
            ];
            $options = ($custom_options) ? ($std_options + $custom_options) : $std_options;

            // start the first batch of requests
            for ($i = 0; $i < $rolling_window; $i++) {
                $ch = curl_init();
                $options[CURLOPT_URL] = $urls[$i];
                curl_setopt_array($ch, $options);
                curl_multi_add_handle($master, $ch);
            }

            do {
                while (($execrun = curl_multi_exec($master, $running)) == CURLM_CALL_MULTI_PERFORM);
                if ($execrun != CURLM_OK)
                    break;
                // a request was just completed -- find out which one
                while ($done = curl_multi_info_read($master)) {
                    $info = curl_getinfo($done['handle']);
                    if ($info['http_code'] == 200) {
                        $output = curl_multi_getcontent($done['handle']);

                        // request successful.  process output using the callback function.
                        //  $callback($output);

                        // start a new request (it's important to do this before removing the old one)
                        $ch = curl_init();
                        $options[CURLOPT_URL] = $urls[$i++];  // increment i
                        curl_setopt_array($ch, $options);
                        curl_multi_add_handle($master, $ch);

                        // remove the curl handle that just completed
                        curl_multi_remove_handle($master, $done['handle']);
                    } else {
                        // request failed.  add error handling.
                    }
                }
            } while ($running);

            curl_multi_close($master);




            $sql = "UPDATE dataengine_job SET processing = '0', processed = '1' WHERE time_from = '" . $mysql['click_time_from'] . "' AND time_to = '" . $mysql['click_time_to'] . "'";
            $conn->query($sql);
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    error_log("DataEngine Job Error: " . $e->getMessage());
}
