<?php
declare(strict_types=1);
include_once(dirname(__DIR__, 2) . '/config/connect.php');

AUTH::require_user();

//set the timezone for the user, for entering their dates.
AUTH::set_timezone($_SESSION['user_timezone']);

//show the template
template_top('Analyze Incoming ISP/Carrier'); ?>

<div class="row" style="margin-bottom: 15px;">
	<div class="col-xs-12">
		<h6>Analyze Incoming ISP/Carrier</h6>
	</div>
</div>

<?php display_calendar(get_absolute_url().'tracking_support/ajax/sort_isp.php', true, true, true, true, true, true); ?> 
    
<script type="text/javascript">
   loadContent('<?php echo get_absolute_url();?>tracking_support/ajax/sort_isp.php',null);
</script>

<?php  template_bottom();
    