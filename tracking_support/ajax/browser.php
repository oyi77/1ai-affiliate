<?php
declare(strict_types=1);
include_once(substr(__DIR__, 0,-17) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);

AUTH::require_user();

?>

<select class="form-control input-sm" name="browser_id" id="browser_id">
    <option value="0"> -- </option>
	<?php 		$browser_sql = "SELECT *
                        FROM    browsers
                        GROUP BY `browser_name` ORDER BY `browser_name` ASC";
        $browser_result = $conn->query($browser_sql) or record_mysql_error($browser_sql);

        while ($browser_row = $browser_result->fetch_array(MYSQLI_ASSOC)) {

            $html['browser_name'] = htmlentities((string)($browser_row['browser_name'] ?? ''), ENT_QUOTES, 'UTF-8');
            $html['browser_id'] = htmlentities((string)($browser_row['browser_id'] ?? ''), ENT_QUOTES, 'UTF-8');
            
            if (isset($_POST['browser_id']) && $_POST['browser_id'] == $browser_row['browser_id']) {
                $selected = 'selected=""';   
            } else {
                $selected = '';  
            }   
            
            printf('<option %s value="%s">%s</option>', $selected, $html['browser_id'],$html['browser_name']);

        } ?>
</select>