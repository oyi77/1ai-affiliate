<?php
declare(strict_types=1);
include_once(__DIR__ . '/config/connect.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
include_once(__DIR__ . '/config/functions-tracking1ai.php');

if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
	$strProtocol = 'https://';
} else {
	$strProtocol = 'http://';
}

// Check if API key already exists in database
$existing_key_check = $conn->query("SELECT pcustomer_api_key FROM users WHERE user_id='1' AND pcustomer_api_key IS NOT NULL AND pcustomer_api_key != ''");
$has_existing_key = false;
$existing_api_key = '';
if ($existing_key_check && $existing_key_check->num_rows > 0) {
	$existing_key = $existing_key_check->fetch_assoc();
	if (!empty($existing_key['pcustomer_api_key'])) {
		$has_existing_key = true;
		$existing_api_key = $existing_key['pcustomer_api_key'];
		
	}
}

// Process API key submission
$error = '';
$success = false;
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['api_key'])) {
	$api_key = trim((string) $_POST['api_key']);
	if (!empty($api_key)) {
		// Validate the API key
		$validation_result = api_key_validate($api_key);
		$validation_data = json_decode((string) $validation_result, true);
		
		if (isset($validation_data['msg']) && $validation_data['msg'] === 'Key valid') {
			// Save the API key
			$mysql['pcustomer_api_key'] = $conn->escape($api_key);
			
			// Always update user_id=1 as that's what AUTH checks
			$mysql['user_id'] = '1';
			
			// Check if user exists
			$user_check = $conn->query("SELECT user_id FROM users WHERE user_id='1'");
			if ($user_check && $user_check->num_rows > 0) {
				$conn->query("UPDATE users SET pcustomer_api_key = '".$mysql['pcustomer_api_key']."' WHERE user_id = '".$mysql['user_id']."'");
				$success = true;
				// Set session variable to indicate valid key
				$_SESSION['valid_key'] = true;
				// Show success message instead of immediate redirect
			} else {
				$error = 'No user found. Please complete the installation process first.';
			}
		} else {
			$error = 'Invalid API key. Please check your key and try again.';
		}
	} else {
		$error = 'Please enter your API key.';
	}
}

info_top(); ?>
	<div class="row" style="position:absolute;left:1em;">
	<div class="main col-xs-4" style="left:5em;width:400px;box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.1), 0 10px 30px 0 rgba(0, 0, 0, 0.2);">
	  <center><img src="img/oneai_affiliate.png"></center>
	  
	  <?php if ($success): ?>
		<br><center><p>API Key Successfully Saved!</p></center><br>
		<div class="alert alert-success">
		  <strong>Success!</strong> Your API key has been validated and saved to the database.
		</div>
		<br>
		<a href="/login.php" class="btn btn-lg btn-p1ai btn-block">Proceed to Login</a>
		<br>
		<small class="text-muted">Note: If you're redirected back here, use the bypass link on the warning message.</small>
	  <?php else: ?>
		<br><center><p>Your 1ai-Affiliate ClickServer API License Key Is Missing or Expired</p></center><br>
		
		<?php if ($has_existing_key): ?>
		  <div class="alert alert-warning">
			<strong>Note:</strong> An API key is already saved in the database, but validation is failing. This could be due to network issues or an expired key. 
			<br><br>Current key: <code><?php echo substr((string) $existing_api_key, 0, 8) . '...' . substr((string) $existing_api_key, -4); ?></code>
			<br><br>You can enter a new API key below to replace the existing one.
		  </div>
		<?php endif; ?>
		
		<?php if ($error): ?>
		  <div class="alert alert-danger">
			<strong>Error:</strong> <?php echo htmlspecialchars($error); ?>
		  </div>
		<?php endif; ?>
		
		<form method="post" action="" class="form-horizontal" role="form">
		  <div class="form-group">
			<div class="col-xs-12">
			  <input type="text" class="form-control" id="api_key" name="api_key" placeholder="Enter your API key here" required>
			</div>
		  </div>
		  <button class="btn btn-lg btn-p1ai btn-block" type="submit">Save API Key</button>
		</form>
		
		<hr style="margin: 20px 0;">
		<center><small>Don't have an API key yet?</small></center>
		<a class='btn btn-lg btn-default btn-block' href='https://my.tracking1ai.com/api/customers/login?redirect=get-api' target="_blank">Get Your API Key</a>
	  <?php endif; ?>
	  
	  <br><br>
<?php 
			
echo "
       <img src='https://my.tracking1ai.com/api/v2/dni/deeplink/cookie/set/".base64_encode($strProtocol .  $_SERVER['SERVER_NAME'] . get_absolute_url())."'>	
       ";?>
       
    </div>
    </div>

<?php   

info_bottom(); ?>