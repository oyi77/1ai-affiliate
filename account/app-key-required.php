<?php
declare(strict_types=1);
include_once(str_repeat("../", 1).'config/connect.php');

AUTH::require_user();

template_top('API Key Required');  ?> 


<div class="big-alert">

	The application you are trying to use requires a valid Stats202 App Key. <br/>
	You may enter in your Application Key by visiting the <a href="<?php echo get_absolute_url();?>account/account.php">My Account</a> tab in 1ai-Affiliate.

</div>

        
<?php template_bottom();