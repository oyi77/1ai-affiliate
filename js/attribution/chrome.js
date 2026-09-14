/**
 * Attribution Analytics - Page Chrome
 * Intro banner dismissal + Bootstrap tooltip/popover init.
 * Loaded by dashboard.js consumers via template script tags; no shared state.
 */

(function (document) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
            // Attribution Help System - Intro Banner
            var INTRO_KEY = 'attribution_intro_dismissed';
            var introBanner = document.querySelector('[data-role="intro-banner"]');
            var dismissIntro = document.querySelector('[data-role="dismiss-intro"]');
    
            if (introBanner && !localStorage.getItem(INTRO_KEY)) {
                introBanner.style.display = 'block';
            }
    
            if (dismissIntro) {
                dismissIntro.addEventListener('click', function() {
                    localStorage.setItem(INTRO_KEY, '1');
                    if (introBanner) {
                        introBanner.style.display = 'none';
                    }
                });
            }
    
            // Initialize Bootstrap tooltips and popovers (use jQuery ready to ensure Bootstrap is loaded)
            if (typeof $ !== 'undefined') {
                $(function() {
                    if ($.fn.tooltip) {
                        $('[data-toggle="tooltip"]').tooltip();
                    }
                    if ($.fn.popover) {
                        $('.help-icon[data-toggle="popover"]').popover({
                            container: 'body',
                            html: true,
                            trigger: 'hover focus'
                        });
                    }
                });
            }
    });
})(document);
