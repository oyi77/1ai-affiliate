<?php
declare(strict_types=1);
include_once(substr(__DIR__, 0,-17) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);

AUTH::require_user();

$mysql['ppc_network_id'] = isset($_POST['ppc_network_id']) ? $conn->escape((string)$_POST['ppc_network_id']) : '0';      
		$mysql['user_id'] = $conn->escape((string)$_SESSION['user_id']);
		$ppc_account_sql = "SELECT * FROM `ppc_accounts` WHERE `user_id`='".$mysql['user_id']."' AND `ppc_network_id`='".$mysql['ppc_network_id']."' AND `ppc_account_deleted`='0' ORDER BY `ppc_account_name` ASC";
		$ppc_account_result = $conn->query($ppc_account_sql) or record_mysql_error($ppc_account_sql);

		if ($ppc_account_result->num_rows == 0) {
		
			echo '<select class="form-control input-sm" id="ppc_account_id" disabled="">
			            <option>--</option>
			      </select>';
		
		} else { ?>
		
		<select class="form-control input-sm" name="ppc_account_id" id="ppc_account_id">			
			<option value=""> -- </option> <?php 		
			while ($ppc_account_row = $ppc_account_result->fetch_array(MYSQLI_ASSOC)) {
	
				$html['ppc_account_id'] = htmlentities((string)($ppc_account_row['ppc_account_id'] ?? ''), ENT_QUOTES, 'UTF-8');
				$html['ppc_account_name'] = htmlentities((string)($ppc_account_row['ppc_account_name'] ?? ''), ENT_QUOTES, 'UTF-8');
				
                if (isset($_POST['ppc_account_id']) && $_POST['ppc_account_id'] == $ppc_account_row['ppc_account_id']) {
					$selected = 'selected=""';   
				} else {
					$selected = '';  
				}
                
				printf('<option %s value="%s">%s</option>', $selected, $html['ppc_account_id'], $html['ppc_account_name']);  
	
			} ?>
		</select>
	<?php }
 