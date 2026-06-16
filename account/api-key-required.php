<?php
declare(strict_types=1);
include_once(str_repeat("../", 1).'config/connect.php');

AUTH::require_user();

template_top('API Key Required');  ?> 


<div class="big-alert">

	The application you are trying to use requires a valid 1ai-Affiliate API Key. <br/>
	You may enter in your API Key by visiting the <a href="<?php echo get_absolute_url();?>account/account.php">My Account</a> tab in 1ai-Affiliate.

</div>

        
<?php template_bottom();