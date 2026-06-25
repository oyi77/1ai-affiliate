'use strict';

/**
 * Device Tracker — Parse user agent strings into structured device data.
 * No external dependencies — pure regex parsing.
 */

// ── OS Detection ──────────────────────────────────────────────────────────

function parseOS(ua) {
  if (!ua) return { name: 'Unknown', version: null };

  // Windows
  const winMatch = ua.match(/Windows NT (\d+\.\d+)/);
  if (winMatch) {
    const versions = { '10.0': '10', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
    return { name: 'Windows', version: versions[winMatch[1]] || winMatch[1] };
  }

  // macOS
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/);
  if (macMatch) return { name: 'macOS', version: macMatch[1].replace(/_/g, '.') };

  // iOS
  const iosMatch = ua.match(/(?:iPhone|iPad|iPod).*OS (\d+[._]\d+(?:[._]\d+)?)/);
  if (iosMatch) return { name: 'iOS', version: iosMatch[1].replace(/_/g, '.') };

  // Android
  const androidMatch = ua.match(/Android (\d+(?:\.\d+)?)/);
  if (androidMatch) return { name: 'Android', version: androidMatch[1] };

  // Chrome OS
  if (ua.includes('CrOS')) return { name: 'Chrome OS', version: null };

  // Linux
  if (ua.includes('Linux')) return { name: 'Linux', version: null };

  // FreeBSD
  if (ua.includes('FreeBSD')) return { name: 'FreeBSD', version: null };

  return { name: 'Unknown', version: null };
}

// ── Browser Detection ─────────────────────────────────────────────────────

function parseBrowser(ua) {
  if (!ua) return { name: 'Unknown', version: null, engine: 'unknown' };

  // Edge (Chromium-based)
  const edgeMatch = ua.match(/Edg(?:e|A)?\/(\d+\.\d+)/);
  if (edgeMatch) return { name: 'Edge', version: edgeMatch[1], engine: 'Blink' };

  // Opera
  const operaMatch = ua.match(/(?:OPR|Opera)\/(\d+\.\d+)/);
  if (operaMatch) return { name: 'Opera', version: operaMatch[1], engine: 'Blink' };

  // Samsung Browser
  const samsungMatch = ua.match(/SamsungBrowser\/(\d+\.\d+)/);
  if (samsungMatch) return { name: 'Samsung Internet', version: samsungMatch[1], engine: 'Blink' };

  // Vivaldi
  const vivaldiMatch = ua.match(/Vivaldi\/(\d+\.\d+)/);
  if (vivaldiMatch) return { name: 'Vivaldi', version: vivaldiMatch[1], engine: 'Blink' };

  // Brave (no version in UA, but has Brave)
  if (ua.includes('Brave')) return { name: 'Brave', version: null, engine: 'Blink' };

  // Yandex Browser
  const yandexMatch = ua.match(/YaBrowser\/(\d+\.\d+)/);
  if (yandexMatch) return { name: 'Yandex', version: yandexMatch[1], engine: 'Blink' };

  // Chrome (must check after Edge/Opera/Samsung)
  const chromeMatch = ua.match(/(?:Chrome|CriOS)\/(\d+\.\d+)/);
  if (chromeMatch && !ua.includes('Edg')) return { name: 'Chrome', version: chromeMatch[1], engine: 'Blink' };

  // Firefox
  const firefoxMatch = ua.match(/(?:Firefox|FxiOS)\/(\d+\.\d+)/);
  if (firefoxMatch) return { name: 'Firefox', version: firefoxMatch[1], engine: 'Gecko' };

  // Safari (must check last — Safari UA contains "like Gecko")
  const safariMatch = ua.match(/Version\/(\d+\.\d+).*Safari/);
  if (safariMatch && !ua.includes('Chrome') && !ua.includes('Chromium')) {
    return { name: 'Safari', version: safariMatch[1], engine: 'WebKit' };
  }

  // IE
  const ieMatch = ua.match(/MSIE (\d+\.\d+)/) || ua.match(/Trident\/.*rv:(\d+\.\d+)/);
  if (ieMatch) return { name: 'Internet Explorer', version: ieMatch[1], engine: 'Trident' };

  return { name: 'Unknown', version: null, engine: 'unknown' };
}

// ── Device Type Detection ─────────────────────────────────────────────────

function parseDeviceType(ua) {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();

  // Bots
  if (/(?:bot|crawler|spider|scraper|headless|phantom|puppeteer|playwright|selenium|webdriver)/i.test(ua)) {
    return 'bot';
  }

  // Tablets
  if (/(?:ipad|tablet|kindle|silk|playbook)/i.test(ua)) return 'tablet';
  if (lower.includes('android') && !lower.includes('mobile')) return 'tablet';

  // Mobile
  if (/(?:mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi)/i.test(ua)) return 'mobile';

  // Smart TV
  if (/(?:smart-tv|smarttv|googletv|appletv|firetv|hbbtv|roku)/i.test(ua)) return 'tv';

  // Console
  if (/(?:playstation|xbox|nintendo|wii)/i.test(ua)) return 'console';

  // Desktop
  return 'desktop';
}

// ── Full Device Fingerprint ───────────────────────────────────────────────

function getDeviceFingerprint(userAgent) {
  const ua = userAgent || '';
  const os = parseOS(ua);
  const browser = parseBrowser(ua);
  const device_type = parseDeviceType(ua);
  const is_mobile = device_type === 'mobile' || device_type === 'tablet';
  const is_bot = device_type === 'bot';

  return {
    os,
    browser,
    device_type,
    is_mobile,
    is_bot,
    engine: browser.engine,
    user_agent: ua.substring(0, 512),
  };
}

// ── Click Quality Score ───────────────────────────────────────────────────

function getClickQualityScore({ device, geo, has_referer, click_velocity_ok }) {
  let score = 0;

  // Real browser (not bot): +30
  if (device && !device.is_bot) score += 30;

  // Non-datacenter IP: +20
  if (geo && !geo.is_datacenter) score += 20;

  // Non-proxy/VPN IP: +15
  if (geo && !geo.is_proxy && !geo.is_vpn) score += 15;

  // Has referer: +10
  if (has_referer) score += 10;

  // Valid device fingerprint: +10
  if (device && device.os.name !== 'Unknown' && device.browser.name !== 'Unknown') score += 10;

  // Normal click velocity: +10
  if (click_velocity_ok !== false) score += 10;

  // Known traffic source referer: +5
  // (would need referer check — skip for now)

  return Math.min(100, score);
}

module.exports = {
  getDeviceFingerprint,
  getClickQualityScore,
  parseOS,
  parseBrowser,
  parseDeviceType,
};
