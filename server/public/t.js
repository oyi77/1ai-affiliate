/**
 * 1ai-Affiliate First-Party Tracking Script
 * Drop this on any landing page for server-side click tracking.
 *
 * ponytail: minimal JS, no dependencies, works with or without cookies.
 *
 * Usage:
 *   <script src="https://your-domain.com/t.js" data-campaign="abc123" data-affiliate="1"></script>
 */
(function() {
  'use strict';

  var script = document.currentScript;
  var campaignId = script.getAttribute('data-campaign') || '';
  var affiliateId = script.getAttribute('data-affiliate') || '';
  var serverUrl = script.src.replace(/\/t\.js.*$/, '');

  // Generate a visitor fingerprint (no cookies needed)
  function fingerprint() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('1ai', 2, 2);
    var canvasData = canvas.toDataURL().slice(-50);

    var nav = navigator.userAgent + navigator.language + screen.width + 'x' + screen.height + screen.colorDepth;
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // Simple hash
    var str = nav + tz + canvasData;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'fp_' + Math.abs(hash).toString(36);
  }

  // Read first-party cookie
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  // Set first-party cookie
  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  // Record click
  function trackClick() {
    var clickId = getCookie('_1ai_click');
    var params = [
      'c=' + encodeURIComponent(campaignId),
      'a=' + encodeURIComponent(affiliateId),
      'fp=' + encodeURIComponent(fingerprint()),
      'ref=' + encodeURIComponent(document.referrer),
      'url=' + encodeURIComponent(location.href),
      'sw=' + screen.width,
      'sh=' + screen.height,
    ];
    if (clickId) params.push('cid=' + encodeURIComponent(clickId));

    var url = serverUrl + '/api/t/click?' + params.join('&');

    // Use sendBeacon if available (doesn't block page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      var img = new Image();
      img.src = url;
    }
  }

  // Set click cookie from server response (via callback or header)
  function onTrack(response) {
    if (response && response.click_id) {
      setCookie('_1ai_click', response.click_id, 30);
    }
  }

  // Execute
  trackClick();
})();
