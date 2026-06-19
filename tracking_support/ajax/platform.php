<?php
declare(strict_types=1);
include_once(substr(__DIR__, 0,-17) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);

AUTH::require_user();
?>

<select class="form-control input-sm" name="platform_id" id="platform_id">
    <option value="0"> -- </option>
	<?php 		$platform_sql = "SELECT *
                        FROM    platforms
                        GROUP BY `platform_name` ORDER BY `platform_name` ASC";
        $platform_result = $conn->query($platform_sql) or record_mysql_error($platform_sql);

        while ($platform_row = $platform_result->fetch_array(MYSQLI_ASSOC)) {

            $html['platform_name'] = htmlentities((string)($platform_row['platform_name'] ?? ''), ENT_QUOTES, 'UTF-8');
            $html['platform_id'] = htmlentities((string)($platform_row['platform_id'] ?? ''), ENT_QUOTES, 'UTF-8');
            
            if (($_POST['platform_id'] ?? '') == $platform_row['platform_id']) {
                $selected = 'selected=""';   
            } else {
                $selected = '';  
            }   
            
            printf('<option %s value="%s">%s</option>', $selected, $html['platform_id'],$html['platform_name']);

        } ?>
</select>