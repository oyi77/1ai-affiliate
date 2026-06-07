$(document).ready(function() {
	$.get("/1ai-account/ajax/alerts.php", function(data) {
		  $( "#tracking1ai_alerts" ).html(data);
		});

		$.get("/1ai-account/ajax/tweets.php", function(data) {
		  $( "#tracking1ai_tweets" ).html(data);
		});

		$.get("/1ai-account/ajax/posts.php", function(data) {
		  $( "#tracking1ai_posts" ).html(data);
		});

		$.get("/1ai-account/ajax/meetups.php", function(data) {
		  $( "#tracking1ai_meetups" ).html(data);
		});

		$.get("/1ai-account/ajax/sponsors.php", function(data) {
		  $( "#tracking1ai_sponsors" ).html(data);
		});
		
		$.ajax({
		  url: "/1ai-account/ajax/system-checks.php",
		});
});