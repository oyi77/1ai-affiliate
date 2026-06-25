'use strict';

/**
 * Smart Redirect Engine — Advanced link cloaking & visitor classification.
 * 
 * Multi-layer visitor classification pipeline:
 *   Layer 1: IP Intelligence (GeoIP, ASN, datacenter, VPN, proxy, crawler IPs)
 *   Layer 2: User Agent Analysis (bot, headless, known reviewer UAs)
 *   Layer 3: Referer Analysis (platform review domains, direct, social media)
 *   Layer 4: JavaScript Fingerprinting (canary check, headless detection)
 *   Layer 5: Behavioral Signals (mouse movement, scroll, time on page)
 * 
 * Redirect strategies:
 *   safe_page   → Show safe page (Google, Facebook, news) to crawlers/reviewers
 *   offer_page  → Show actual offer to verified real users
 *   clean_lp    → Show clean landing page to suspicious visitors
 *   block       → Return 403 to known bad bots
 */

const { lookupIp } = require('../routes/geoip');
const { getDeviceFingerprint } = require('./deviceTracker');

// ── Known Crawler/Reviewer IP Ranges ──────────────────────────────────────
// These are IP ranges commonly used by platform reviewers

const CRAWLER_UAS = [
  // Search engine bots
  'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'duckduckbot', 'slurp',
  'applebot', 'facebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'pinterestbot', 'slackbot', 'discordbot', 'telegrambot', 'whatsapp',
  // Platform review bots
  'mediapartners', 'adsbot', 'google-read-aloud', 'duplexweb',
  'googleother', 'storebot', 'apis-google',
  // SEO tools
  'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'rogerbot',
  'blexbot', 'deepcrawl', 'screaming frog', 'sitebulb',
  // Generic bots
  'bot', 'crawler', 'spider', 'scraper', 'fetcher', 'checker',
  'monitor', 'validator', 'archiver', 'harvest',
];

const HEADLESS_SIGNATURES = [
  'headless', 'phantom', 'puppeteer', 'playwright', 'selenium',
  'webdriver', 'nightmare', 'casper', 'slimer', 'zombie',
  'cypress', 'testcafe', 'nightwatch', 'protractor',
];

// Known platform reviewer referer patterns
const PLATFORM_REFERERS = {
  facebook: ['facebook.com', 'fb.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com'],
  google: ['google.com', 'googleapis.com', 'googlebot.com', 'googleusercontent.com', 'gstatic.com'],
  tiktok: ['tiktok.com', 'bytedance.com', 'byteoversea.com', 'tiktokcdn.com'],
  twitter: ['twitter.com', 'x.com', 't.co', 'twimg.com'],
  bing: ['bing.com', 'msn.com', 'live.com'],
  baidu: ['baidu.com', 'bdstatic.com', 'bdimg.com'],
};

// Safe redirect URLs (what platform reviewers should see)
const SAFE_URLS = {
  google: 'https://www.google.com/search?q=your+search+query',
  facebook: 'https://www.facebook.com',
  news: 'https://news.google.com',
  blog: 'https://medium.com',
  ecommerce: 'https://www.amazon.com',
  wiki: 'https://en.wikipedia.org',
};

// ── Visitor Classification ────────────────────────────────────────────────

/**
 * Classify a visitor through multi-layer analysis.
 * 
 * @param {Object} req - Express request object
 * @param {Object} offerConfig - Per-offer cloaking configuration
 * @returns {Object} Classification result
 */
async function classifyVisitor(req, offerConfig = {}) {
  const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
  const ua = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || req.headers['referrer'] || '';
  const uaLower = ua.toLowerCase();
  const refererLower = referer.toLowerCase();

  const result = {
    ip,
    user_agent: ua,
    referer,
    layers: {},
    signals: [],
    risk_score: 0,
    visitor_type: 'unknown',
    redirect_strategy: 'offer_page',
    safe_url: null,
  };

  // ── Layer 1: IP Intelligence ──────────────────────────────────────────
  const geo = await lookupIp(ip);
  result.layers.ip = {
    country: geo.country_code,
    city: geo.city,
    connection_type: geo.connection_type,
    is_datacenter: geo.is_datacenter,
    is_vpn: geo.is_vpn,
    is_proxy: geo.is_proxy,
    isp: geo.isp,
    asn: geo.asn_number,
  };

  if (geo.is_datacenter) {
    result.signals.push('datacenter_ip');
    result.risk_score += 0.35;
  }
  if (geo.is_vpn) {
    result.signals.push('vpn_ip');
    result.risk_score += 0.25;
  }
  if (geo.is_proxy) {
    result.signals.push('proxy_ip');
    result.risk_score += 0.2;
  }

  // ── Layer 2: User Agent Analysis ──────────────────────────────────────
  const device = getDeviceFingerprint(ua);
  result.layers.ua = {
    os: device.os,
    browser: device.browser,
    device_type: device.device_type,
    is_bot: device.is_bot,
    is_mobile: device.is_mobile,
    engine: device.engine,
  };

  // Bot detection
  if (device.is_bot) {
    result.signals.push('bot_ua');
    result.risk_score += 0.5;
  }

  // Headless browser detection
  const isHeadless = HEADLESS_SIGNATURES.some(s => uaLower.includes(s));
  if (isHeadless) {
    result.signals.push('headless_browser');
    result.risk_score += 0.4;
  }

  // Known platform crawler UAs
  const platformCrawler = CRAWLER_UAS.find(c => uaLower.includes(c));
  if (platformCrawler) {
    result.signals.push(`crawler_${platformCrawler}`);
    result.risk_score += 0.45;
  }

  // Empty or suspicious UA
  if (!ua || ua.length < 10) {
    result.signals.push('empty_ua');
    result.risk_score += 0.3;
  }

  // ── Layer 3: Referer Analysis ─────────────────────────────────────────
  result.layers.referer = {
    raw: referer,
    domain: null,
    platform: null,
    is_platform_review: false,
    is_empty: !referer || referer === '-' || referer === 'null',
  };

  if (!result.layers.referer.is_empty) {
    // Extract domain from referer
    try {
      const refererUrl = new URL(referer);
      result.layers.referer.domain = refererUrl.hostname;

      // Check if referer is from a platform review system
      for (const [platform, domains] of Object.entries(PLATFORM_REFERERS)) {
        if (domains.some(d => refererUrl.hostname.includes(d))) {
          result.layers.referer.platform = platform;
          result.layers.referer.is_platform_review = true;
          result.signals.push(`platform_referer_${platform}`);
          result.risk_score += 0.3;
          break;
        }
      }
    } catch {}
  } else {
    result.signals.push('empty_referer');
    result.risk_score += 0.1;
  }

  // ── Layer 4: JavaScript Fingerprint (from query params) ───────────────
  // The frontend JS can send fingerprint data via query params on redirect
  const jsFingerprint = req.query._fp || req.headers['x-fingerprint'] || null;
  result.layers.js_fingerprint = {
    present: !!jsFingerprint,
    data: jsFingerprint,
  };

  if (!jsFingerprint && offerConfig.require_js_fingerprint) {
    result.signals.push('no_js_fingerprint');
    result.risk_score += 0.15;
  }

  // ── Layer 5: Behavioral Signals (from query params) ───────────────────
  const hasMouseMovement = req.query._mm === '1';
  const hasScroll = req.query._sc === '1';
  const timeOnPage = parseInt(req.query._tp) || 0;

  result.layers.behavior = {
    has_mouse_movement: hasMouseMovement,
    has_scroll: hasScroll,
    time_on_page_ms: timeOnPage,
  };

  // ── Classification ────────────────────────────────────────────────────
  result.risk_score = Math.min(1.0, result.risk_score);

  // Determine visitor type and redirect strategy
  if (result.risk_score >= 0.7 || device.is_bot || isHeadless) {
    result.visitor_type = 'crawler';
    result.redirect_strategy = 'safe_page';
    result.safe_url = offerConfig.safe_url || SAFE_URLS.google;
  } else if (result.risk_score >= 0.4) {
    result.visitor_type = 'suspicious';
    result.redirect_strategy = offerConfig.suspicious_strategy || 'clean_lp';
    result.safe_url = offerConfig.clean_lp_url || null;
  } else {
    result.visitor_type = 'real_user';
    result.redirect_strategy = 'offer_page';
  }

  // Override: If geo doesn't match offer geo targets, redirect to safe page
  if (offerConfig.geo_targets && offerConfig.geo_targets.length > 0) {
    if (geo.country_code && !offerConfig.geo_targets.includes(geo.country_code)) {
      result.visitor_type = 'wrong_geo';
      result.redirect_strategy = 'safe_page';
      result.safe_url = offerConfig.geo_redirect_url || SAFE_URLS.google;
      result.signals.push('geo_mismatch');
    }
  }

  return result;
}

// ── Smart Redirect Middleware ──────────────────────────────────────────────

/**
 * Express middleware for smart redirect.
 * Attaches classification result to req.visitorClassification.
 */
function smartRedirectMiddleware(offerConfig = {}) {
  return async (req, res, next) => {
    try {
      const classification = await classifyVisitor(req, offerConfig);
      req.visitorClassification = classification;

      // Log classification for analytics
      try {
        const pool = require('../db/mysql');
        await pool.query(
          `INSERT INTO 1ai_fraud_log (ip, risk_score, verdict, flags, details, created_at)
           VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
          [
            classification.ip,
            classification.risk_score,
            classification.visitor_type === 'crawler' ? 'block' : classification.visitor_type === 'suspicious' ? 'review' : 'allow',
            JSON.stringify(classification.signals),
            JSON.stringify(classification.layers),
          ]
        );
      } catch {}

      next();
    } catch (err) {
      console.error('smartRedirectMiddleware error:', err.message);
      next();
    }
  };
}

// ── Canary Page Generator ─────────────────────────────────────────────────

/**
 * Generate a canary/safe landing page that looks legitimate to crawlers.
 * Returns HTML that looks like a normal blog/article page.
 */
function generateCanaryPage(title, content, offerUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    header { background: #fff; border-bottom: 1px solid #e9ecef; padding: 20px 0; margin-bottom: 30px; }
    h1 { font-size: 2em; margin-bottom: 10px; }
    h2 { font-size: 1.5em; margin: 20px 0 10px; color: #495057; }
    p { margin-bottom: 15px; }
    .article-meta { color: #6c757d; font-size: 0.9em; margin-bottom: 20px; }
    .cta { display: inline-block; background: #007bff; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
    .cta:hover { background: #0056b3; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 0.85em; }
    nav { display: flex; gap: 20px; }
    nav a { color: #007bff; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <nav><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a><a href="#">Privacy Policy</a></nav>
    </div>
  </header>
  <div class="container">
    <article>
      <h1>${title}</h1>
      <div class="article-meta">Published on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      ${content}
      <a href="${offerUrl}" class="cta">Learn More</a>
    </article>
    <footer>
      <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
      <p><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Contact Us</a></p>
    </footer>
  </div>
</body>
</html>`;
}

// ── JavaScript Canary Check ───────────────────────────────────────────────

/**
 * Generate JavaScript that performs a canary check before redirecting.
 * This script checks if the browser supports JS, has real user behavior,
 * and then redirects to the actual offer URL with fingerprint data.
 */
function generateCanaryScript(offerUrl, clickId) {
  return `
(function() {
  var fp = {};
  try {
    // Canvas fingerprint
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('canary', 2, 2);
    fp.canvas = canvas.toDataURL().length;
    
    // WebGL check
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    fp.webgl = gl ? gl.getParameter(gl.RENDERER) : 'none';
    
    // Screen info
    fp.screen = screen.width + 'x' + screen.height;
    fp.colorDepth = screen.colorDepth;
    fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fp.language = navigator.language;
    fp.platform = navigator.platform;
    fp.cookies = navigator.cookieEnabled;
    fp.touchPoints = navigator.maxTouchPoints || 0;
    
    // Mouse movement tracking
    var hasMouse = false;
    var hasScroll = false;
    var startTime = Date.now();
    
    document.addEventListener('mousemove', function() { hasMouse = true; }, { once: true });
    document.addEventListener('scroll', function() { hasScroll = true; }, { once: true });
    
    // Redirect after behavior check
    setTimeout(function() {
      var params = new URLSearchParams();
      params.set('_fp', btoa(JSON.stringify(fp)));
      params.set('_mm', hasMouse ? '1' : '0');
      params.set('_sc', hasScroll ? '1' : '0');
      params.set('_tp', String(Date.now() - startTime));
      params.set('_cid', '${clickId}');
      
      var sep = '${offerUrl}'.includes('?') ? '&' : '?';
      window.location.replace('${offerUrl}' + sep + params.toString());
    }, 1500 + Math.random() * 1000);
  } catch(e) {
    // If anything fails, just redirect
    window.location.replace('${offerUrl}');
  }
})();`;
}

// ── Configuration Presets ─────────────────────────────────────────────────

const PROTECTION_PRESETS = {
  // Maximum protection for sensitive offers (adult, gambling, crypto)
  maximum: {
    risk_threshold_safe: 0.3,
    risk_threshold_clean: 0.15,
    require_js_fingerprint: true,
    block_datacenter: true,
    block_vpn: true,
    block_proxy: true,
    block_empty_referer: true,
    canary_delay_ms: 1500,
    safe_url: SAFE_URLS.google,
    suspicious_strategy: 'clean_lp',
  },
  // Standard protection for mainstream offers
  standard: {
    risk_threshold_safe: 0.5,
    risk_threshold_clean: 0.3,
    require_js_fingerprint: false,
    block_datacenter: false,
    block_vpn: false,
    block_proxy: true,
    block_empty_referer: false,
    canary_delay_ms: 1000,
    safe_url: SAFE_URLS.news,
    suspicious_strategy: 'clean_lp',
  },
  // Minimal protection (just bot filtering)
  minimal: {
    risk_threshold_safe: 0.7,
    risk_threshold_clean: 0.5,
    require_js_fingerprint: false,
    block_datacenter: false,
    block_vpn: false,
    block_proxy: false,
    block_empty_referer: false,
    canary_delay_ms: 500,
    safe_url: SAFE_URLS.google,
    suspicious_strategy: 'offer_page',
  },
};

module.exports = {
  classifyVisitor,
  smartRedirectMiddleware,
  generateCanaryPage,
  generateCanaryScript,
  PROTECTION_PRESETS,
  SAFE_URLS,
  CRAWLER_UAS,
  HEADLESS_SIGNATURES,
  PLATFORM_REFERERS,
};
