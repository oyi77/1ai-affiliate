/**
 * Attribution Analytics - Utility Functions
 * Provides formatting, parsing, and helper functions for the attribution dashboard.
 */

(function (window) {
    'use strict';

    var TIMEFRAME_PRESETS = {
        '24': 24,
        '72': 72,
        '168': 168,
        '720': 720
    };
    var MAX_COMPARISON_MODELS = 5;

    function formatCurrency(value) {
        var amount = Number(value) || 0;
        if (window.Intl && typeof window.Intl.NumberFormat === 'function') {
            return new window.Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2
            }).format(amount);
        }
        return '$' + amount.toFixed(2);
    }

    function formatNumber(value) {
        var number = Number(value) || 0;
        if (window.Intl && typeof window.Intl.NumberFormat === 'function') {
            return new window.Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0
            }).format(number);
        }
        return String(Math.round(number));
    }

    function formatDecimal(value, digits) {
        if (window.Intl && typeof window.Intl.NumberFormat === 'function') {
            return new window.Intl.NumberFormat(undefined, {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            }).format(value || 0);
        }
        return (value || 0).toFixed(digits);
    }

    function formatPercent(value) {
        if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
            return '–';
        }
        return value.toFixed(1) + '%';
    }

    function formatRoi(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            return '–';
        }
        return value.toFixed(2) + '%';
    }

    function nowSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    function hoursAgo(hours) {
        return nowSeconds() - (hours * 3600);
    }

    function getUnixHourRange(hours) {
        var end = Math.floor(Date.now() / 1000);
        var start = end - (hours * 3600);
        return { start: start, end: end };
    }

    function parseInteger(value) {
        var parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }

    function parseHeaders(text) {
        if (!text) {
            return {};
        }
        var headers = {};
        text.split(/\r?\n/).forEach(function (line) {
            var trimmed = line.trim();
            if (!trimmed) {
                return;
            }
            var idx = trimmed.indexOf(':');
            if (idx === -1) {
                return;
            }
            var key = trimmed.slice(0, idx).trim();
            var value = trimmed.slice(idx + 1).trim();
            if (key) {
                headers[key] = value;
            }
        });
        return headers;
    }

    function getFocusableElements(container) {
        if (!container) {
            return [];
        }
        return Array.prototype.slice.call(
            container.querySelectorAll(
                'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
            )
        );
    }

    function toUnixTimestamp(dateString, endOfDay) {
        if (!dateString) {
            return null;
        }
        var date = new Date(dateString + 'T00:00:00');
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        if (endOfDay) {
            date.setHours(23, 59, 59, 999);
        }
        return Math.floor(date.getTime() / 1000);
    }

    function computeTotals(snapshots) {
        var totals = {
            clicks: 0,
            conversions: 0,
            revenue: 0,
            cost: 0,
            roi: null
        };
        (snapshots || []).forEach(function (snapshot) {
            totals.clicks += Number(snapshot.attributed_clicks) || 0;
            totals.conversions += Number(snapshot.attributed_conversions) || 0;
            totals.revenue += Number(snapshot.attributed_revenue) || 0;
            totals.cost += Number(snapshot.attributed_cost) || 0;
        });
        if (totals.cost > 0) {
            totals.roi = ((totals.revenue - totals.cost) / totals.cost) * 100;
        }
        return totals;
    }

    function groupSnapshots(snapshots, interval) {
        if (interval === 'hour') {
            return snapshots;
        }
        var grouped = {};
        (snapshots || []).forEach(function (snapshot) {
            var date = new Date(snapshot.date_hour * 1000);
            date.setHours(0, 0, 0, 0);
            var bucket = Math.floor(date.getTime() / 1000);
            if (!grouped[bucket]) {
                grouped[bucket] = {
                    date_hour: bucket,
                    attributed_revenue: 0,
                    attributed_conversions: 0,
                    attributed_clicks: 0,
                    attributed_cost: 0,
                };
            }
            grouped[bucket].attributed_revenue += snapshot.attributed_revenue || 0;
            grouped[bucket].attributed_conversions += snapshot.attributed_conversions || 0;
            grouped[bucket].attributed_clicks += snapshot.attributed_clicks || 0;
            grouped[bucket].attributed_cost += snapshot.attributed_cost || 0;
        });
        return Object.keys(grouped)
            .map(function (key) { return Number(key); })
            .sort(function (a, b) { return a - b; })
            .map(function (key) { return grouped[key]; });
    }

    function buildChartSeries(snapshots, interval) {
        var resolved = groupSnapshots(snapshots, interval);
        var revenue = [];
        var conversions = [];
        var profit = [];
        resolved.forEach(function (snapshot) {
            var timestamp = (snapshot.date_hour || 0) * 1000;
            var revenueValue = snapshot.attributed_revenue || 0;
            var costValue = snapshot.attributed_cost || 0;
            var profitValue = revenueValue - costValue;
            revenue.push([timestamp, revenueValue]);
            conversions.push([timestamp, snapshot.attributed_conversions || 0]);
            profit.push([timestamp, profitValue]);
        });
        return {
            revenue: revenue,
            conversions: conversions,
            profit: profit,
        };
    }

    function createCacheKey(modelId, range, scope, scopeId) {
        return [
            modelId,
            scope,
            scopeId === null || scopeId === undefined || scopeId === '' ? 'global' : scopeId,
            range.start,
            range.end
        ].join(':');
    }

    function showAlert(element, message) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.style.display = 'block';
    }

    function hideAlert(element) {
        if (!element) {
            return;
        }
        element.style.display = 'none';
    }

    function fetchJson(url, options) {
        var opts = options || {};
        opts.headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {});
        opts.credentials = 'same-origin';
        return fetch(url, opts).then(function (response) {
            if (!response.ok) {
                var error = new Error('Request failed with status ' + response.status);
                error.status = response.status;
                throw error;
            }
            if (response.status === 204) {
                return {};
            }
            return response.json();
        });
    }

    function sendJson(url, method, payload) {
        return fetchJson(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload || {}),
        });
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    // Expose utilities on window.Attribution namespace
    window.Attribution = window.Attribution || {};
    window.Attribution.TIMEFRAME_PRESETS = TIMEFRAME_PRESETS;
    window.Attribution.MAX_COMPARISON_MODELS = MAX_COMPARISON_MODELS;
    window.Attribution.formatCurrency = formatCurrency;
    window.Attribution.formatNumber = formatNumber;
    window.Attribution.formatDecimal = formatDecimal;
    window.Attribution.formatPercent = formatPercent;
    window.Attribution.formatRoi = formatRoi;
    window.Attribution.nowSeconds = nowSeconds;
    window.Attribution.hoursAgo = hoursAgo;
    window.Attribution.getUnixHourRange = getUnixHourRange;
    window.Attribution.parseInteger = parseInteger;
    window.Attribution.parseHeaders = parseHeaders;
    window.Attribution.getFocusableElements = getFocusableElements;
    window.Attribution.toUnixTimestamp = toUnixTimestamp;
    window.Attribution.computeTotals = computeTotals;
    window.Attribution.groupSnapshots = groupSnapshots;
    window.Attribution.buildChartSeries = buildChartSeries;
    window.Attribution.createCacheKey = createCacheKey;
    window.Attribution.showAlert = showAlert;
    window.Attribution.hideAlert = hideAlert;
    window.Attribution.fetchJson = fetchJson;
    window.Attribution.sendJson = sendJson;
    window.Attribution.safeArray = safeArray;
})(window);