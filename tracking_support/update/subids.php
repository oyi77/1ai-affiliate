<?php

declare(strict_types=1);
include_once(substr(__DIR__, 0, -19) . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(substr(__DIR__, 0, -19) . '/config/class-dataengine-slim.php');

use OneAIAffiliate\Attribution\AttributionServiceFactory;
AUTH::require_user();

if (!$userObj->hasPermission("access_to_update_section")) {
	header('location: ' . get_absolute_url() . 'tracking_support/');
	die();
}

// Initialize variables to prevent undefined variable warnings
$success = false;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

	$mysql['user_id'] = $conn->escape((string)$_SESSION['user_id']);
	$mysql['click_update_type'] = 'upload';
	$mysql['click_update_time'] = time();

	$subids = $_POST['subids'] ?? '';
	$subids = trim((string) $subids);
	$subids = explode("\r", $subids);
	$subids = str_replace("\n", '', $subids);

	foreach ($subids as $click_id) {
		$mysql['click_id'] = $conn->escape($click_id);

		$click_sql = "
			SELECT 2c.click_id, 2c.click_lead, 2c.aff_campaign_id, 2c.click_time, 2c.click_payout
			FROM
				clicks AS 2c
			WHERE
				2c.click_id ='" . $mysql['click_id'] . "'
				AND 2c.user_id='" . $mysql['user_id'] . "'
		";
		$click_result = $conn->query($click_sql) or record_mysql_error($click_sql);
		$click_row = $click_result->fetch_assoc();

		// Check if click_row exists and click_id is not null before processing
		if ($click_row && isset($click_row['click_id']) && $click_row['click_id'] !== null) {
			$mysql['click_id'] = $conn->escape((string)$click_row['click_id']);
		} else {
			// Skip this iteration if no valid click found
			continue;
		}

		if (is_numeric($mysql['click_id'])) {
			$update_sql = "
				UPDATE
					clicks
				SET
					click_lead='1',
					`click_filtered`='0'
				WHERE
					click_id='" . $mysql['click_id'] . "'
					AND user_id='" . $mysql['user_id'] . "'
			";
			try {
				$update_result = $conn->query($update_sql);
			} catch (Exception $e) {
				error_log("Database query failed: " . $e->getMessage());
				throw new RuntimeException("An error occurred while updating the database.");
			}

			$update_sql = "
				UPDATE
					clicks_spy
				SET
					click_lead='1',
					`click_filtered`='0'
				WHERE
					click_id='" . $mysql['click_id'] . "'
					AND user_id='" . $mysql['user_id'] . "'
			";
			$update_result = $conn->query($update_sql) or die($conn->writeConnection()->error);

			// Insert into conversion_logs for attribution tracking (skip if already logged)
			$check_sql = "SELECT conv_id FROM conversion_logs WHERE click_id = '" . $mysql['click_id'] . "' AND user_id = '" . $mysql['user_id'] . "' AND deleted = 0 LIMIT 1";
			$check_result = $conn->query($check_sql);
			if ($check_result && $check_result->num_rows === 0) {
				$conv_time = time();
				$click_time = (int) $click_row['click_time'];
				$click_time_to_date = new DateTime(date('Y-m-d H:i:s', $click_time));
				$conv_time_to_date = new DateTime(date('Y-m-d H:i:s', $conv_time));
				$diff = $click_time_to_date->diff($conv_time_to_date);
				$time_difference = $conn->escape($diff->d . ' days, ' . $diff->h . ' hours, ' . $diff->i . ' min and ' . $diff->s . ' sec');
				$campaign_id = $conn->escape((string) $click_row['aff_campaign_id']);
				$click_payout = $conn->escape((string) $click_row['click_payout']);

				$log_sql = "INSERT INTO conversion_logs
					SET conv_id = DEFAULT,
						click_id = '" . $mysql['click_id'] . "',
						campaign_id = '" . $campaign_id . "',
						click_payout = '" . $click_payout . "',
						user_id = '" . $mysql['user_id'] . "',
						click_time = '" . $click_time . "',
						conv_time = '" . $conv_time . "',
						time_difference = '" . $time_difference . "',
						ip = '',
						pixel_type = '0',
						user_agent = 'subid-upload'";
				$conn->query($log_sql);
			}

			$de = new DataEngine();
			$de->setDirtyHour($mysql['click_id']);
		}
	}

	// Rebuild attribution snapshots so the attribution page reflects changes immediately
	try {
		$jobRunner = AttributionServiceFactory::createJobRunner();
		$userId = (int) $_SESSION['user_id'];
		$endTime = time();
		$startTime = $endTime - 86400;
		$jobRunner->runForUser($userId, $startTime, $endTime);
	} catch (Throwable $e) {
		error_log('Attribution rebuild after subid upload failed: ' . $e->getMessage());
	}

	$success = true;
}

//show the template
template_top('Update Subids'); ?>
<div class="row" style="margin-bottom: 15px;">
	<div class="col-xs-12">
		<div class="row">
			<div class="col-xs-4">
				<h6>Update Your Subids</h6>
			</div>
			<div class="col-xs-8">
				<div class="success pull-right" style="margin-top: 20px;">
					<small>
						<?php if ($success == true) { ?>
							<span class="fui-check-inverted"></span> Your submission was successful. Your account income now reflects the subids just uploaded.
						<?php } ?>
					</small>
				</div>
			</div>
		</div>
	</div>
	<div class="col-xs-12">
		<small>Here is where you can update your income for 1ai-Affiliate, by importing your subids from your affiliate marketing reports.</small>
	</div>
</div>

<div class="row form_seperator">
	<div class="col-xs-12"></div>
</div>

<div class="row">
	<div class="col-xs-12">
		<form method="post" action="" class="form-horizontal" role="form">
			<div class="form-group" style="margin:0px 0px 15px 0px;">
				<label for="subids">Subids</label>
				<textarea rows="5" name="subids" id="subids" placeholder="Add your subids..." class="form-control"></textarea>
			</div>
			<button class="btn btn-sm btn-p1ai btn-block" type="submit">Update Subids</button>
		</form>
	</div>
</div>

<?php template_bottom();
