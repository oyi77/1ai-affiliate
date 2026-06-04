<?php
$rootPath = dirname(__DIR__, 2);
include_once $rootPath . '/config/connect.php';
include_once $rootPath . '/config/functions-ui-calendar.php';

AUTH::require_user();

//set the timezone for the user, for entering their dates.
AUTH::set_timezone($_SESSION['user_timezone']);

//show the template
template_top('Analyze Platforms'); ?>
<div class="row" style="margin-bottom: 15px;">
	<div class="col-xs-12">
		<h6>Analyze Incoming Platforms</h6>
	</div>
</div>

<?php display_calendar(get_absolute_url() . 'tracking_support/ajax/sort_platforms.php', true, true, true, true, true, true); ?>

<script type="text/javascript">
	loadContent('<?php echo get_absolute_url(); ?>tracking_support/ajax/sort_platforms.php', null);
</script>

<?php template_bottom();
