<?php
declare(strict_types=1);
include_once(dirname(__DIR__, 2) . '/config/connect.php');

AUTH::require_user();
?>

<select class="form-control input-sm" name="region_id" id="region_id">
    <option value="0"> -- </option>
	<?php 		$region_sql = "SELECT *
                        FROM    locations_region
                        GROUP BY `region_name` ORDER BY `region_name` ASC";
        $region_result = $db->query($region_sql) or record_mysql_error($region_sql);

        while ($region_row = $region_result->fetch_array(MYSQLI_ASSOC)) {
            
            $html['region_name'] = htmlentities((string)($region_row['region_name'] ?? ''), ENT_QUOTES, 'UTF-8');
            $html['region_id'] = htmlentities((string)($region_row['region_id'] ?? ''), ENT_QUOTES, 'UTF-8');
            
            if (($_POST['region_id'] ?? '') == $region_row['region_id']) {
                $selected = 'selected=""';   
            } else {
                $selected = '';  
            }   
            
            printf('<option %s value="%s">%s</option>', $selected, $html['region_id'],$html['region_name']);

        } ?>
</select>